const RAPIDAPI_KEYS: string[] = [
  "YOUR_RAPIDAPI_KEY_1",
  "YOUR_RAPIDAPI_KEY_2",
  "YOUR_RAPIDAPI_KEY_3",
  "YOUR_RAPIDAPI_KEY_4",
  "YOUR_RAPIDAPI_KEY_5",
  "YOUR_RAPIDAPI_KEY_6",
  "YOUR_RAPIDAPI_KEY_7",
  "YOUR_RAPIDAPI_KEY_8",
  "YOUR_RAPIDAPI_KEY_9",
  "YOUR_RAPIDAPI_KEY_10",
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
