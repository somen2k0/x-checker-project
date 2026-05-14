import { useState, useRef, useCallback } from "react";

const LS_KEYS   = "groq_api_keys";
const LS_LEGACY = "groq_api_key";

function readFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(LS_KEYS);
    if (stored) return (JSON.parse(stored) as string[]).filter(Boolean);
    const legacy = localStorage.getItem(LS_LEGACY);
    if (legacy?.trim()) return [legacy.trim()];
  } catch {}
  return [];
}

function writeToStorage(ks: string[]) {
  if (ks.length > 0) {
    localStorage.setItem(LS_KEYS, JSON.stringify(ks));
    localStorage.setItem(LS_LEGACY, ks[0]);
  } else {
    localStorage.removeItem(LS_KEYS);
    localStorage.removeItem(LS_LEGACY);
  }
}

export function useGroqKeys() {
  const [keys, setKeys] = useState<string[]>(readFromStorage);
  const keysRef   = useRef<string[]>(keys);
  const activeRef = useRef(0);

  keysRef.current = keys;

  const addKey = useCallback((key: string) => {
    const k = key.trim();
    if (!k) return false;
    const current = keysRef.current;
    if (current.includes(k)) return false;
    const next = [...current, k];
    writeToStorage(next);
    setKeys(next);
    return true;
  }, []);

  const removeKey = useCallback((idx: number) => {
    const next = keysRef.current.filter((_, i) => i !== idx);
    writeToStorage(next);
    setKeys(next);
    if (activeRef.current >= next.length) activeRef.current = 0;
  }, []);

  const updateKey = useCallback((idx: number, key: string) => {
    const k = key.trim();
    if (!k) return;
    const next = keysRef.current.map((old, i) => (i === idx ? k : old));
    writeToStorage(next);
    setKeys(next);
  }, []);

  type CallResult = {
    res: Response | null;
    exhausted: boolean;
    networkError?: boolean;
  };

  const callWithRotation = useCallback(async (
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<CallResult> => {
    const ks = keysRef.current;
    if (ks.length === 0) return { res: null, exhausted: true };

    const start = activeRef.current % ks.length;
    for (let attempt = 0; attempt < ks.length; attempt++) {
      const idx = (start + attempt) % ks.length;
      let res: Response;
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, apiKey: ks[idx] }),
        });
      } catch {
        return { res: null, exhausted: false, networkError: true };
      }

      if (res.status !== 429) {
        activeRef.current = idx;
        return { res, exhausted: false };
      }
    }

    return { res: null, exhausted: true };
  }, []);

  return {
    keys,
    addKey,
    removeKey,
    updateKey,
    callWithRotation,
    hasKeys: keys.length > 0,
    keyCount: keys.length,
  };
}
