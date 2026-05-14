/**
 * Local analytics — tracks tool views in localStorage.
 * Used for the "Trending Tools" and "Popular This Week" features.
 * No external data is sent; purely client-side.
 */

const STORAGE_KEY = "xt_tool_views";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface ViewEntry {
  count: number;
  lastSeen: number;
  weeklyCount: number;
  weekStart: number;
}

type ViewStore = Record<string, ViewEntry>;

function getStore(): ViewStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as ViewStore;
  } catch {
    return {};
  }
}

function saveStore(store: ViewStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

export function recordToolView(toolId: string): void {
  const store = getStore();
  const now = Date.now();
  const existing = store[toolId];
  const weekStart = existing?.weekStart ?? now;
  const inSameWeek = now - weekStart < WEEK_MS;

  store[toolId] = {
    count: (existing?.count ?? 0) + 1,
    lastSeen: now,
    weeklyCount: inSameWeek ? (existing?.weeklyCount ?? 0) + 1 : 1,
    weekStart: inSameWeek ? weekStart : now,
  };

  saveStore(store);
}

export function getTopTools(limit = 6): Array<{ toolId: string; count: number; weeklyCount: number }> {
  const store = getStore();
  return Object.entries(store)
    .map(([toolId, entry]) => ({ toolId, count: entry.count, weeklyCount: entry.weeklyCount }))
    .sort((a, b) => b.weeklyCount - a.weeklyCount || b.count - a.count)
    .slice(0, limit);
}

export function getRecentlyViewed(limit = 4): string[] {
  const store = getStore();
  return Object.entries(store)
    .sort(([, a], [, b]) => b.lastSeen - a.lastSeen)
    .map(([id]) => id)
    .slice(0, limit);
}

export function getTotalViews(): number {
  const store = getStore();
  return Object.values(store).reduce((s, e) => s + e.count, 0);
}
