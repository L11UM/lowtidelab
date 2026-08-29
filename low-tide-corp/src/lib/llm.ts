import { z } from "zod";

// Minimal provider abstraction: OpenAI or Anthropic, chosen via LLM_PROVIDER.
// Uses plain fetch (no SDK dependency) and asks for strict JSON output that
// is then validated against a zod schema, with one retry-with-feedback on failure.

type TokenUsage = { tokensIn: number; tokensOut: number };

export class LlmError extends Error {}

function provider() {
  return (process.env.LLM_PROVIDER || "openai").toLowerCase();
}

function hasApiKey() {
  return provider() === "anthropic"
    ? Boolean(process.env.ANTHROPIC_API_KEY)
    : Boolean(process.env.OPENAI_API_KEY);
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

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return text.trim();
}

async function callProvider(system: string, user: string) {
  return provider() === "anthropic" ? callAnthropic(system, user) : callOpenAI(system, user);
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
      `No API key configured for provider "${provider()}". Set OPENAI_API_KEY or ANTHROPIC_API_KEY.`
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
