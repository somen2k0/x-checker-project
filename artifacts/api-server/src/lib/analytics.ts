/**
 * Lightweight in-memory page-view analytics.
 * Stores up to MAX_VIEWS events in a rolling 24-hour window.
 * All data is ephemeral — resets on server restart.
 */

const MAX_VIEWS = 50_000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_H_MS = 24 * ONE_HOUR_MS;

interface PageView {
  path: string;
  ts: number;
}

const views: PageView[] = [];
const startedAt = Date.now();

function pathToLabel(path: string): string {
  if (path === "/") return "Home";
  if (path === "/tools") return "All Tools";
  if (path === "/blog") return "Blog";
  if (path === "/about") return "About";
  if (path === "/pricing") return "Pricing";
  if (path === "/admin") return "Admin";
  const segment = path.split("/").pop() ?? path;
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function pathToCategory(path: string): string {
  if (path === "/" || path === "/tools" || path === "/about" || path === "/pricing") return "page";
  if (path.startsWith("/blog")) return "blog";
  if (path.startsWith("/tools/temp-mail") || path.startsWith("/tools/temp-gmail")) return "email";
  if (path.startsWith("/tools/")) return "tool";
  if (path.endsWith("-tools")) return "category";
  return "page";
}

function prune() {
  const cutoff = Date.now() - TWENTY_FOUR_H_MS;
  while (views.length > 0 && views[0]!.ts < cutoff) views.shift();
  if (views.length > MAX_VIEWS) views.splice(0, views.length - MAX_VIEWS);
}

export function recordPageView(path: string): void {
  prune();
  views.push({ path, ts: Date.now() });
}

export interface AnalyticsData {
  totalViews: number;
  windowHours: number;
  recordedSince: string;
  topPages: Array<{ path: string; label: string; category: string; views: number }>;
  byCategory: Record<string, number>;
  hourly: Array<{ label: string; views: number }>;
}

export function getAnalytics(): AnalyticsData {
  prune();

  const now = Date.now();
  const totalViews = views.length;

  // Top pages
  const pageCounts = new Map<string, number>();
  for (const v of views) {
    pageCounts.set(v.path, (pageCounts.get(v.path) ?? 0) + 1);
  }

  const topPages = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([path, count]) => ({
      path,
      label: pathToLabel(path),
      category: pathToCategory(path),
      views: count,
    }));

  // Views by category
  const byCategory: Record<string, number> = {};
  for (const v of views) {
    const cat = pathToCategory(v.path);
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }

  // Hourly distribution — 24 buckets, one per hour, oldest first
  const hourly: Array<{ label: string; views: number }> = [];
  for (let i = 23; i >= 0; i--) {
    const start = now - (i + 1) * ONE_HOUR_MS;
    const end   = now - i * ONE_HOUR_MS;
    const count = views.filter((v) => v.ts >= start && v.ts < end).length;
    const d = new Date(end);
    hourly.push({ label: `${d.getHours().toString().padStart(2, "0")}:00`, views: count });
  }

  const windowHours = Math.min(24, Math.ceil((now - startedAt) / ONE_HOUR_MS));

  return { totalViews, windowHours, recordedSince: new Date(startedAt).toISOString(), topPages, byCategory, hourly };
}
