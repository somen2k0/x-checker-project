// ── RapidAPI key pool — round-robin rotation ──────────────────────────────────
// Add all your RapidAPI keys below. The system will rotate through them
// automatically after every request. If one hits a rate limit (429) it skips
// to the next key automatically so you never get blocked.
// ─────────────────────────────────────────────────────────────────────────────

const HARDCODED_KEYS: string[] = [
  "bbea6a9443mshdfc8d058f9d97efp1571dajsndb43135538fa", // key 1
  // "paste_your_second_key_here",                       // key 2
  // "paste_your_third_key_here",                        // key 3
  // "paste_your_fourth_key_here",                       // key 4
  // "paste_your_fifth_key_here",                        // key 5
  // "paste_your_sixth_key_here",                        // key 6
  // "paste_your_seventh_key_here",                      // key 7
  // "paste_your_eighth_key_here",                       // key 8
  // "paste_your_ninth_key_here",                        // key 9
  // "paste_your_tenth_key_here",                        // key 10
];

// ─────────────────────────────────────────────────────────────────────────────

export const RAPIDAPI_HOST = "gmailnator.p.rapidapi.com";
export const BASE_URL = `https://${RAPIDAPI_HOST}`;

let _counter = 0;

export function getKeys(): string[] {
  const envKeys = (process.env.RAPIDAPI_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
  const combined = [...envKeys, ...HARDCODED_KEYS].filter((k) => k.trim().length > 0);
  return combined;
}

export function hasKeys(): boolean {
  return getKeys().length > 0;
}

export function rapidHeaders(key: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}

/**
 * Tries each key in round-robin order. If a key returns 429 or 401 it
 * immediately moves to the next one. Returns on first success, or the last
 * failed response if all keys are exhausted.
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

  const startIdx = _counter % keys.length;
  let lastRes: Response | null = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = (startIdx + attempt) % keys.length;
    const key = keys[idx]!;
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
    res: lastRes ?? new Response(
      JSON.stringify({ error: "All RapidAPI keys are rate-limited. Add more keys to the pool." }),
      { status: 429 }
    ),
    exhausted: true,
  };
}
