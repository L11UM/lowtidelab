// Shared AI client used by both the daily blog bot and the weekly experiment bot.
// PROVIDER: "gemini" (default) or "openai".
const PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
const GEMINI_MODEL = process.env.AI_MODEL || "gemini-3.6-flash";
// Fallback chain in case the primary model is overloaded or renamed/deprecated.
const GEMINI_MODEL_FALLBACKS = [GEMINI_MODEL, "gemini-flash-latest", "gemini-2.0-flash"];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
const OPENAI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

export function currentProvider() {
  return PROVIDER;
}

export function hasApiKey() {
  return PROVIDER === "openai" ? Boolean(OPENAI_API_KEY) : Boolean(GEMINI_API_KEY);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries(fn, { attempts = 3, baseDelayMs = 2000 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isRetryable = /\b(429|500|502|503|504)\b/.test(String(err.message));
      if (!isRetryable || i === attempts - 1) throw err;
      const delay = baseDelayMs * 2 ** i;
      console.log(`Attempt ${i + 1} failed (${err.message.slice(0, 80)}...), retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

function extractJson(raw) {
  // Strip markdown code fences some models add despite instructions.
  const cleaned = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

async function discoverGeminiModel() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ListModels failed: ${res.status} ${await res.text()}`);

  const data = await res.json();
  const candidates = (data.models || []).filter(
    (m) =>
      m.supportedGenerationMethods?.includes("generateContent") &&
      !/vision|embedding|aqa|tts|image/i.test(m.name)
  );

  // Prefer a "flash" model (cheaper/faster) over "pro".
  const flash = candidates.find((m) => /flash/i.test(m.name));
  const chosen = flash || candidates[0];
  if (!chosen) throw new Error("No usable Gemini model found via ListModels");

  return chosen.name.replace(/^models\//, "");
}

async function callGemini(model, userPrompt, systemPrompt, maxOutputTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        responseMimeType: "application/json",
        ...(maxOutputTokens ? { maxOutputTokens } : {}),
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini API returned no content");

  return extractJson(raw);
}

async function generateWithGemini(userPrompt, systemPrompt, maxOutputTokens) {
  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY (or AI_API_KEY).");

  let lastErr;
  let sawNotFound = false;

  for (const model of GEMINI_MODEL_FALLBACKS) {
    try {
      return await withRetries(() => callGemini(model, userPrompt, systemPrompt, maxOutputTokens));
    } catch (err) {
      lastErr = err;
      if (/\b404\b/.test(err.message)) sawNotFound = true;
      console.log(`Model "${model}" failed after retries: ${err.message.slice(0, 120)}`);
    }
  }

  // If the hardcoded names are stale, ask Google which models actually exist right now.
  if (sawNotFound) {
    try {
      const discovered = await discoverGeminiModel();
      console.log(`Discovered fallback model via ListModels: ${discovered}`);
      return await withRetries(() => callGemini(discovered, userPrompt, systemPrompt, maxOutputTokens));
    } catch (err) {
      lastErr = err;
      console.log(`Discovered model also failed: ${err.message.slice(0, 120)}`);
    }
  }

  throw lastErr;
}

async function generateWithOpenAI(userPrompt, systemPrompt, maxOutputTokens) {
  if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY (or AI_API_KEY).");

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      response_format: { type: "json_object" },
      ...(maxOutputTokens ? { max_tokens: maxOutputTokens } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenAI API returned no content");

  return extractJson(raw);
}

export async function generateJson(userPrompt, systemPrompt, maxOutputTokens) {
  return PROVIDER === "openai"
    ? generateWithOpenAI(userPrompt, systemPrompt, maxOutputTokens)
    : generateWithGemini(userPrompt, systemPrompt, maxOutputTokens);
}
