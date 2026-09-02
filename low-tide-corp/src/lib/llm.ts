import { z } from "zod";

// Minimal provider abstraction: OpenAI, Anthropic, or Gemini (free tier), chosen via LLM_PROVIDER.
// Uses plain fetch (no SDK dependency) and asks for strict JSON output that
// is then validated against a zod schema, with one retry-with-feedback on failure.

type TokenUsage = { tokensIn: number; tokensOut: number };

export class LlmError extends Error {}

function provider() {
  return (process.env.LLM_PROVIDER || "gemini").toLowerCase();
}

function hasApiKeyForChoice(choice: string) {
  if (choice === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY);
  if (choice === "gemini") return Boolean(process.env.GEMINI_API_KEY);
  return Boolean(process.env.OPENAI_API_KEY);
}

function providerPriority(): string[] {
  const primary = provider();
  const fallback = ["gemini", "openai", "anthropic"].filter((p) => p !== primary);
  return [primary, ...fallback];
}

function hasApiKey() {
  return providerPriority().some((choice) => hasApiKeyForChoice(choice));
}

async function callOpenAI(system: string, user: string): Promise<{ text: string; usage: TokenUsage }> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new LlmError(`OpenAI request failed (${res.status}): ${body.slice(0, 500)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const usage: TokenUsage = {
    tokensIn: data.usage?.prompt_tokens ?? 0,
    tokensOut: data.usage?.completion_tokens ?? 0,
  };
  return { text, usage };
}

async function callAnthropic(system: string, user: string): Promise<{ text: string; usage: TokenUsage }> {
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: `${system}\n\nRespond with ONLY valid JSON, no markdown fences, no commentary.`,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new LlmError(`Anthropic request failed (${res.status}): ${body.slice(0, 500)}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";
  const usage: TokenUsage = {
    tokensIn: data.usage?.input_tokens ?? 0,
    tokensOut: data.usage?.output_tokens ?? 0,
  };
  return { text, usage };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(system: string, user: string): Promise<{ text: string; usage: TokenUsage }> {
  // Gemini model names get deprecated over time; try the configured model first,
  // then fall back through known-good alternatives instead of hard failing.
  const candidates = [
    process.env.GEMINI_MODEL,
    "gemini-3.6-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
  ].filter((m): m is string => Boolean(m));
  const models = [...new Set(candidates)];

  let lastError: LlmError | null = null;
  for (const model of models) {
    // Free-tier rate limits (429) are transient — wait and retry the same model
    // a few times before giving up on it, instead of failing the whole agent.
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: user }] }],
            generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
          }),
        }
      );
      if (!res.ok) {
        const body = await res.text();
        lastError = new LlmError(`Gemini request failed (${res.status}) for model "${model}": ${body.slice(0, 500)}`);
        if (res.status === 429) {
          const retryAfterHeader = Number(res.headers.get("retry-after"));
          const waitMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
            ? retryAfterHeader * 1000
            : 2000 * 2 ** attempt; // 2s, 4s, 8s, 16s
          if (attempt < 3) {
            await sleep(waitMs);
            continue;
          }
          break; // exhausted retries on this model — try the next candidate
        }
        // 404 (model retired) or 503 (overloaded) — try the next candidate model.
        if (res.status === 404 || res.status === 503) break;
        throw lastError;
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const usage: TokenUsage = {
        tokensIn: data.usageMetadata?.promptTokenCount ?? 0,
        tokensOut: data.usageMetadata?.candidatesTokenCount ?? 0,
      };
      return { text, usage };
    }
  }
  throw lastError ?? new LlmError("Gemini request failed: no models available");
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return text.trim();
}

async function callProvider(system: string, user: string) {
  const ordered = providerPriority();
  let lastError: Error | null = null;

  for (const choice of ordered) {
    try {
      if (!hasApiKeyForChoice(choice)) continue;
      if (choice === "anthropic") return await callAnthropic(system, user);
      if (choice === "gemini") return await callGemini(system, user);
      return await callOpenAI(system, user);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (choice === ordered[ordered.length - 1]) break;
    }
  }

  throw lastError ?? new LlmError(`No working LLM provider available for ${provider()}`);
}

/**
 * Calls the configured LLM and validates the JSON response against `schema`,
 * retrying once with the validation error appended if parsing/validation fails.
 */
export async function generateStructured<T extends z.ZodTypeAny>(
  system: string,
  user: string,
  schema: T
): Promise<{ data: z.infer<T>; usage: TokenUsage }> {
  if (!hasApiKey()) {
    throw new LlmError(
      `No API key configured for any supported provider. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.`
    );
  }

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = attempt === 0 ? user : `${user}\n\nYour previous response was invalid: ${lastError}\nReturn corrected JSON only.`;
    const { text, usage } = await callProvider(system, prompt);
    try {
      const parsed = JSON.parse(extractJson(text));
      const result = schema.safeParse(parsed);
      if (result.success) return { data: result.data, usage };
      lastError = result.error.message;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new LlmError(`Model failed to return valid JSON after retry: ${lastError}`);
}
