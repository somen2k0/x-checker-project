const RAPIDAPI_KEYS: string[] = [
  "894c8f0b44msh483bb59b42c084ap15db0bjsne64fe8ccbbd4",
  "e9b0fdba6bmsh970f41e51594567p178216jsn8158f0ea5df7",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let pool: string[] = shuffle(RAPIDAPI_KEYS.filter((k) => k && !k.startsWith("YOUR_RAPIDAPI_KEY")));
let index = 0;

export function getNextRapidApiKey(): string | null {
  const live = RAPIDAPI_KEYS.filter((k) => k && !k.startsWith("YOUR_RAPIDAPI_KEY"));
  if (live.length === 0) return null;

  if (index >= pool.length) {
    pool = shuffle(live);
    index = 0;
  }

  const key = pool[index];
  index++;
  return key;
}

export function hasRapidApiKeys(): boolean {
  return RAPIDAPI_KEYS.some((k) => k && !k.startsWith("YOUR_RAPIDAPI_KEY"));
}
