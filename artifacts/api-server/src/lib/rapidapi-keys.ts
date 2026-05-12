// ── RapidAPI key pool — round-robin rotation ──────────────────────────────────
// Reads keys from env: RAPIDAPI_KEY, RAPIDAPI_KEY_1 … RAPIDAPI_KEY_20
// Scans all 20 slots so gaps (e.g. KEY_1, KEY_3 but no KEY_2) are handled.

export function getRapidApiKeys(): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];

  const plain = process.env["RAPIDAPI_KEY"];
  if (plain?.trim() && !seen.has(plain.trim())) {
    seen.add(plain.trim());
    keys.push(plain.trim());
  }

  for (let i = 1; i <= 20; i++) {
    const k = process.env[`RAPIDAPI_KEY_${i}`];
    if (k?.trim() && !seen.has(k.trim())) {
      seen.add(k.trim());
      keys.push(k.trim());
    }
  }

  return keys;
}

export function hasRapidApiKeys(): boolean {
  return getRapidApiKeys().length > 0;
}

let _index = 0;

/** Returns the next key in the round-robin pool, or null if no keys are set. */
export function getNextRapidApiKey(): string | null {
  const keys = getRapidApiKeys();
  if (keys.length === 0) return null;
  const key = keys[_index % keys.length];
  _index = (_index + 1) % keys.length;
  return key ?? null;
}

/**
 * Calls `fn` with successive keys until one succeeds or all are exhausted.
 * Returns { res, exhausted } — if exhausted, all keys returned 429/401.
 */
export async function fetchWithKeyRotation(
  fn: (key: string) => Promise<Response>
): Promise<{ res: Response; exhausted: boolean }> {
  const keys = getRapidApiKeys();
  if (keys.length === 0) {
    return {
      res: new Response(JSON.stringify({ error: "no_keys" }), { status: 503 }),
      exhausted: true,
    };
  }

  const startIdx = _index % keys.length;
  let lastRes: Response | null = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = (startIdx + attempt) % keys.length;
    const key = keys[idx]!;
    _index = (idx + 1) % keys.length;

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
