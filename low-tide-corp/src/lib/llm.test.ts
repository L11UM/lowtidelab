import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";
import { z } from "zod";
import { generateStructured } from "./llm";

describe("generateStructured", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  it("falls back to OpenAI when Gemini is overloaded", async () => {
    process.env.LLM_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "gemini-key";
    process.env.OPENAI_API_KEY = "openai-key";
    process.env.ANTHROPIC_API_KEY = "";

    const calls: string[] = [];

    global.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);

      if (url.includes("generativelanguage.googleapis.com")) {
        return new Response(
          JSON.stringify({
            error: {
              code: 503,
              message: "This model is currently experiencing high demand.",
              status: "UNAVAILABLE",
            },
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"ok":true}' } }],
          usage: { prompt_tokens: 5, completion_tokens: 3 },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    };

    const result = await generateStructured(
      "system",
      "user",
      z.object({ ok: z.boolean() })
    );

    assert.deepEqual(result.data, { ok: true });
    assert.ok(calls.some((url) => url.includes("generativelanguage.googleapis.com")));
    assert.ok(calls.some((url) => url.includes("api.openai.com")));
  });
});
