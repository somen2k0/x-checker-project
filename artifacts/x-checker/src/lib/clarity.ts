declare global {
  interface Window {
    clarity: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

const CLARITY_PROJECT_ID = "wrmqhawevf";

let initialized = false;

export function initClarity(): void {
  if (!import.meta.env.PROD) return;
  if (initialized) return;
  if (typeof window === "undefined") return;

  initialized = true;

  window.clarity =
    window.clarity ||
    Object.assign(
      function (...args: unknown[]) {
        (window.clarity.q = window.clarity.q || []).push(args);
      },
      { q: [] as unknown[][] },
    );

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  document.head.appendChild(script);
}

export function clarityTrackPage(path: string): void {
  if (typeof window === "undefined" || typeof window.clarity !== "function") return;
  window.clarity("set", "pageId", path);
}
