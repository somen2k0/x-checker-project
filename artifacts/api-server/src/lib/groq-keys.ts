// ── Groq API key pool — round-robin rotation ─────────────────────────────────
// Set GROQ_API_KEY to one key, or comma-separate multiple keys for rotation.
// The pool automatically skips any key that hit a 429 for 60 seconds, then
// retries it. On full exhaustion the last failed response is returned so the
// caller can surface the correct HTTP status to the client.
// ─────────────────────────────────────────────────────────────────────────────

const COOLDOWN_MS = 60_000;

let _index = 0;
const _coolingUntil = new Map<string, number>();

function markCooling(key: string): void {
  _coolingUntil.set(key, Date.now() + COOLDOWN_MS);
}

function isCooling(key: string): boolean {
  const until = _coolingUntil.get(key);
  if (!until) return false;
  if (Date.now() >= until) { _coolingUntil.delete(key); return false; }
  return true;
}

export function getGroqKeys(): string[] {
  return (process.env.GROQ_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export function hasGroqKeys(): boolean {
  return getGroqKeys().length > 0;
}

/**
 * Calls `fn` with each key in round-robin order, skipping keys in cooldown.
 * Returns on first success (2xx). On 429/401 marks the key as cooling and
 * tries the next. Returns the last failed response when all keys are exhausted.
 */
export async function fetchWithGroqKeyRotation(
  fn: (key: string) => Promise<Response>,
): Promise<{ res: Response; exhausted: boolean }> {
  const keys = getGroqKeys();
  if (keys.length === 0) {
    return {
      res: new Response(JSON.stringify({ error: "no_keys" }), { status: 503 }),
      exhausted: true,
    };
  }

  const startIdx = _index % keys.length;
  const ordered: string[] = [];

  // Non-cooling keys first, cooling keys as last resort
  for (let i = 0; i < keys.length; i++) {
    const k = keys[(startIdx + i) % keys.length]!;
    if (!isCooling(k)) ordered.push(k);
  }
  for (let i = 0; i < keys.length; i++) {
    const k = keys[(startIdx + i) % keys.length]!;
    if (isCooling(k)) ordered.push(k);
  }

  let lastRes: Response | null = null;

  for (const key of ordered) {
    _index = (keys.indexOf(key) + 1) % keys.length;

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
      JSON.stringify({ error: "All Groq keys are rate-limited. Try again shortly." }),
      { status: 429 },
    ),
    exhausted: true,
  };
}
