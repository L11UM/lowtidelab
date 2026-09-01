// Edge/Node-compatible session token helpers (uses Web Crypto, available in both runtimes).
// Single-owner auth: one shared password protects the whole app, no user accounts/DB needed.

const encoder = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** The expected session cookie value when correctly authenticated (stateless, derived from env secrets). */
export async function expectedSessionToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET || "";
  return hmacHex(secret, "low-tide-corp-session");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const SESSION_COOKIE = "ltc_session";
