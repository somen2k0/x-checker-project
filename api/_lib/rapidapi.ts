// ── RapidAPI key pool — round-robin rotation ──────────────────────────────────
// Reads keys from env vars: RAPIDAPI_KEY, RAPIDAPI_KEY_1 … RAPIDAPI_KEY_N
// Module-level counter persists across warm Vercel invocations in the same
// container, giving true round-robin within a container lifetime.
// Across cold-starts we fall back gracefully — still picks the first available key.

let _counter = 0;

export function getKeys(): string[] {
  const keys: string[] = [];

  // Support a plain RAPIDAPI_KEY as well as RAPIDAPI_KEY_1 … RAPIDAPI_KEY_20
  const plain = process.env["RAPIDAPI_KEY"];
  if (plain?.trim()) keys.push(plain.trim());

  for (let i = 1; i <= 20; i++) {
    const k = process.env[`RAPIDAPI_KEY_${i}`];
    if (k?.trim()) keys.push(k.trim());
  }

  // Deduplicate while preserving order
  return [...new Set(keys)];
}

export function hasKeys(): boolean {
  return getKeys().length > 0;
}

/** Returns the next key in the round-robin pool, or null if no keys are set. */
export function nextKey(): string | null {
  const keys = getKeys();
  if (keys.length === 0) return null;
  const key = keys[_counter % keys.length];
  _counter = (_counter + 1) % keys.length;
  return key ?? null;
}

/**
 * Calls `fn` with successive keys until one succeeds (non-429/non-401) or
 * all keys are exhausted. Returns the last Response regardless.
 */
export async function fetchWithRotation(
  fn: (key: string) => Promise<Response>
): Promise<{ res: Response; exhausted: boolean }> {
  const keys = getKeys();
  if (keys.length === 0) {
    return {
      res: new Response(JSON.stringify({ error: "no_keys" }), { status: 503 }),
      exhausted: true,
    };
  }

  // Start from the current counter position and try each key once
  const startIdx = _counter % keys.length;
  let lastRes: Response | null = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = (startIdx + attempt) % keys.length;
    const key = keys[idx]!;

    // Advance global counter so next call starts from the next key
    _counter = (idx + 1) % keys.length;

    let res: Response;
    try {
      res = await fn(key);
    } catch {
      continue;
    }

    if (res.status !== 429 && res.status !== 401) {
      return { res, exhausted: false };
    }
    lastRes = res;
  }

  return {
    res: lastRes ?? new Response(JSON.stringify({ error: "all_keys_exhausted" }), { status: 429 }),
    exhausted: true,
  };
}

export const RAPIDAPI_HOST = "gmailnator.p.rapidapi.com";
export const BASE_URL = `https://${RAPIDAPI_HOST}`;

export function rapidHeaders(key: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}
