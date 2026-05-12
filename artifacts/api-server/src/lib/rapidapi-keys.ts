// ── RapidAPI key pool — round-robin rotation ──────────────────────────────────
// Add all your RapidAPI keys below. The system will rotate through them
// automatically after every request. If one hits a rate limit (429) it skips
// to the next key automatically so you never get blocked.
// ─────────────────────────────────────────────────────────────────────────────

const HARDCODED_KEYS: string[] = [
  "bbea6a9443mshdfc8d058f9d97efp1571dajsndb43135538fa", // key 1
  "894c8f0b44msh483bb59b42c084ap15db0bjsne64fe8ccbbd4", // key 2
  "e9b0fdba6bmsh970f41e51594567p178216jsn8158f0ea5df7", // key 3
  // "paste_your_fourth_key_here",                       // key 4
  // "paste_your_fifth_key_here",                        // key 5
  // "paste_your_sixth_key_here",                        // key 6
  // "paste_your_seventh_key_here",                      // key 7
  // "paste_your_eighth_key_here",                       // key 8
  // "paste_your_ninth_key_here",                        // key 9
  // "paste_your_tenth_key_here",                        // key 10
];

// ─────────────────────────────────────────────────────────────────────────────

let _index = 0;

export function getRapidApiKeys(): string[] {
  return HARDCODED_KEYS.filter((k) => k.trim().length > 0);
}

export function hasRapidApiKeys(): boolean {
  return getRapidApiKeys().length > 0;
}

/** Returns the next key in round-robin order. */
export function getNextRapidApiKey(): string | null {
  const keys = getRapidApiKeys();
  if (keys.length === 0) return null;
  const key = keys[_index % keys.length];
  _index = (_index + 1) % keys.length;
  return key ?? null;
}

/**
 * Tries each key in round-robin order. Skips to the next key on 429/401.
 * Returns on first success, or the last failed response if all keys exhausted.
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
    res: lastRes ?? new Response(
      JSON.stringify({ error: "All RapidAPI keys are rate-limited. Add more keys to the pool." }),
      { status: 429 }
    ),
    exhausted: true,
  };
}
