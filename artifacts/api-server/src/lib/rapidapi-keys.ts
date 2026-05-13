import { getConfig } from "./config-db";

const COOLDOWN_MS = 60_000;

let _index = 0;

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

export async function getRapidApiKeys(): Promise<string[]> {
  const dbKeys = (await getConfig("rapidapi_keys") ?? "")
    .split(",").map((k) => k.trim()).filter((k) => k.length > 0);
  const envKeys = (process.env.RAPIDAPI_KEYS ?? "")
    .split(",").map((k) => k.trim()).filter((k) => k.length > 0);
  return [...dbKeys, ...envKeys].filter((k) => k.trim().length > 0);
}

export async function hasRapidApiKeys(): Promise<boolean> {
  return (await getRapidApiKeys()).length > 0;
}

export async function fetchWithKeyRotation(
  fn: (key: string) => Promise<Response>,
): Promise<{ res: Response; exhausted: boolean }> {
  const keys = await getRapidApiKeys();
  if (keys.length === 0) {
    return {
      res: new Response(JSON.stringify({ error: "no_keys" }), { status: 503 }),
      exhausted: true,
    };
  }

  const startIdx = _index % keys.length;
  const ordered: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[(startIdx + i) % keys.length]!;
    if (!isCooling(key)) ordered.push(key);
  }
  for (let i = 0; i < keys.length; i++) {
    const key = keys[(startIdx + i) % keys.length]!;
    if (isCooling(key)) ordered.push(key);
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
    res:
      lastRes ??
      new Response(
        JSON.stringify({
          error: "All RapidAPI keys are rate-limited. Add more keys via the Admin panel.",
        }),
        { status: 429 },
      ),
    exhausted: true,
  };
}
