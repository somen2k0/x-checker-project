import { useState, useEffect, useCallback } from "react";
import { StoredState, DEFAULT_STATE } from "../types";

function mergeWithDefaults(stored: Partial<StoredState>): StoredState {
  return { ...DEFAULT_STATE, ...stored };
}

export function useStorage() {
  const [state, setStateLocal] = useState<StoredState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(null, (result) => {
      setStateLocal(mergeWithDefaults(result as Partial<StoredState>));
      setReady(true);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      const updated: Partial<StoredState> = {};
      for (const [key, change] of Object.entries(changes)) {
        (updated as Record<string, unknown>)[key] = change.newValue;
      }
      setStateLocal((prev) => ({ ...prev, ...updated }));
    };

    chrome.storage.local.onChanged.addListener(listener);
    return () => chrome.storage.local.onChanged.removeListener(listener);
  }, []);

  const setState = useCallback((partial: Partial<StoredState>) => {
    setStateLocal((prev) => {
      const next = { ...prev, ...partial };
      chrome.storage.local.set(partial);
      return next;
    });
  }, []);

  const patch = useCallback(<K extends keyof StoredState>(key: K, value: StoredState[K]) => {
    setState({ [key]: value } as Partial<StoredState>);
  }, [setState]);

  return { state, setState, patch, ready };
}
