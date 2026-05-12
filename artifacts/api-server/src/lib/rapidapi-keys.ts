function getRapidApiKeysFromEnv(): string[] {
  const keys: string[] = [];

  const single = process.env["RAPIDAPI_KEY"];
  if (single && single.trim()) {
    keys.push(single.trim());
  }

  let i = 1;
  while (true) {
    const k = process.env[`RAPIDAPI_KEY_${i}`];
    if (!k || !k.trim()) break;
    keys.push(k.trim());
    i++;
  }

  return keys;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let pool: string[] = [];
let index = 0;

export function getNextRapidApiKey(): string | null {
  const live = getRapidApiKeysFromEnv();
  if (live.length === 0) return null;

  if (index >= pool.length || pool.length !== live.length) {
    pool = shuffle(live);
    index = 0;
  }

  const key = pool[index];
  index++;
  return key;
}

export function hasRapidApiKeys(): boolean {
  return getRapidApiKeysFromEnv().length > 0;
}
