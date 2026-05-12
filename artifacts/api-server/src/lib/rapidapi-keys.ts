// ── RapidAPI key pool — round-robin rotation ──────────────────────────────────
// Add all your RapidAPI keys below. The system will rotate through them
// automatically after every request. If one hits a rate limit (429) it skips
// to the next key automatically so you never get blocked.
// ─────────────────────────────────────────────────────────────────────────────

const HARDCODED_KEYS: string[] = [
  "894c8f0b44msh483bb59b42c084ap15db0bjsne64fe8ccbbd4",  key 1
  "e9b0fdba6bmsh970f41e51594567p178216jsn8158f0ea5df7",  key 2
  "bbea6a9443mshdfc8d058f9d97efp1571dajsndb43135538fa",  key 3
  // "paste_your_fourth_key_here",                       // key 4
  // "paste_your_fifth_key_here",                        // key 5
  // "paste_your_sixth_key_here",                        // key 6
  // "paste_your_seventh_key_here",                      // key 7
  // "paste_your_eighth_key_here",                       // key 8
  // "paste_your_ninth_key_here",                        // key 9
  // "paste_your_tenth_key_here",                        // key 10
];

// ─────────────────────────────────────────────────────────────────────────────

const COOLDOWN_MS = 60_000; // 60 s cooldown per key after a 429

let _index = 0;

/** Timestamp (ms) at which each key last received a 429/401. */
const _coolingUntil: Map<string, number> = new Map();

function markCooling(key: string): void {
  _coolingUntil.set(key, Date.now() + COOLDOWN_MS);
}

function isCooling(key: string): boolean {
  const until = _coolingUntil.get(key);
  if (!until) return false;
  if (Date.now() >= until) {
    _coolingUntil.delete(key);
    return false;
  }
  return true;
}

export function getRapidApiKeys(): string[] {
  return HARDCODED_KEYS.filter((k) => k.trim().length > 0);
}

export function hasRapidApiKeys(): boolean {
  return getRapidApiKeys().length > 0;
}

/** Returns the next key in round-robin order, skipping keys that are cooling down. */
export function getNextRapidApiKey(): string | null {
  const keys = getRapidApiKeys();
  if (keys.length === 0) return null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[_index % keys.length]!;
    _index = (_index + 1) % keys.length;
    if (!isCooling(key)) return key;
  }
  // All cooling — return the one whose cooldown expires soonest
  const key = keys[_index % keys.length]!;
  _index = (_index + 1) % keys.length;
  return key ?? null;
}

/**
 * Tries each key in round-robin order, skipping keys still in their
 * 429 cooldown window. Returns on first success, or the last failed
 * response if all available keys are exhausted.
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

  // Build an ordered list starting from _index, skipping cooling keys first
  const startIdx = _index % keys.length;
  const ordered: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[(startIdx + i) % keys.length]!;
    if (!isCooling(key)) ordered.push(key);
  }
  // Append cooling keys at the end as a last resort
  for (let i = 0; i < keys.length; i++) {
    const key = keys[(startIdx + i) % keys.length]!;
    if (isCooling(key)) ordered.push(key);
  }

  let lastRes: Response | null = null;

  for (const key of ordered) {
    _index = ((keys.indexOf(key) + 1) % keys.length);

    let res: Response;
    try {
      res = await fn(key);
    } catch {
      continue;
    }

    if (res.status === 429 || res.status === 401) {
      markCooling(key);
      lastRes = res;
      continue;
    }

    return { res, exhausted: false };
  }

  return {
    res: lastRes ?? new Response(
      JSON.stringify({ error: "All RapidAPI keys are rate-limited. Add more keys to the pool." }),
      { status: 429 }
    ),
    exhausted: true,
  };
}
