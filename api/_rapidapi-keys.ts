export const RAPIDAPI_KEYS: string[] = [
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

export const RAPIDAPI_HOST = "gmailnator.p.rapidapi.com";

export function pickKey(): string | null {
  const live = RAPIDAPI_KEYS.filter((k) => k && !k.startsWith("YOUR_RAPIDAPI_KEY"));
  if (live.length === 0) return null;
  return live[Math.floor(Math.random() * live.length)];
}

export function rapidHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}
