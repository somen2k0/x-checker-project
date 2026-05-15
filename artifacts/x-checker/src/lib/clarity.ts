declare global {
  interface Window {
    clarity: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

export function clarityTrackPage(path: string): void {
  if (typeof window === "undefined" || typeof window.clarity !== "function") return;
  window.clarity("set", "pageId", path);
}
