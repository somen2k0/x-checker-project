const startedAt = Date.now();

interface RouteStats {
  hits: number;
  errors: number;
  lastHitAt: number | null;
}

const routes = new Map<string, RouteStats>();
let totalRequests = 0;
let totalErrors = 0;

const ROUTE_LABELS: Record<string, string> = {
  "/api/accounts":     "X Account Checker",
  "/api/bio":          "AI Bio Generator",
  "/api/ai-detector":  "AI Detector",
  "/api/temp-mail":    "Temp Mail",
  "/api/temp-gmail":   "Temp Gmail",
  "/api/temptf":       "Temp.tf",
  "/api/onesecmail":   "OneSecMail",
  "/api/og-preview":   "OG Preview",
  "/api/contact":      "Contact Form",
  "/api/healthz":      "Health Check",
  "/api/health":       "Health (full)",
  "/api/admin":        "Admin",
};

function normalise(url: string): string {
  const path = url.split("?")[0] ?? "";
  for (const prefix of Object.keys(ROUTE_LABELS)) {
    if (path === prefix || path.startsWith(prefix + "/")) return prefix;
  }
  return path.replace(/\/[0-9a-f-]{8,}/gi, "/:id");
}

export function recordRequest(url: string, statusCode: number): void {
  const key = normalise(url);
  const isError = statusCode >= 400;

  totalRequests++;
  if (isError) totalErrors++;

  const existing = routes.get(key);
  if (existing) {
    existing.hits++;
    if (isError) existing.errors++;
    existing.lastHitAt = Date.now();
  } else {
    routes.set(key, {
      hits: 1,
      errors: isError ? 1 : 0,
      lastHitAt: Date.now(),
    });
  }
}

export function getStats() {
  const uptimeMs = Date.now() - startedAt;
  const uptimeSec = Math.floor(uptimeMs / 1000);
  const uptimeMin = Math.floor(uptimeSec / 60);
  const uptimeHr  = Math.floor(uptimeMin / 60);
  const uptimeLabel =
    uptimeHr  > 0 ? `${uptimeHr}h ${uptimeMin % 60}m` :
    uptimeMin > 0 ? `${uptimeMin}m ${uptimeSec % 60}s` :
                    `${uptimeSec}s`;

  const routeList = Array.from(routes.entries())
    .map(([path, s]) => ({
      path,
      label: ROUTE_LABELS[path] ?? path,
      hits: s.hits,
      errors: s.errors,
      lastHitAt: s.lastHitAt,
    }))
    .sort((a, b) => b.hits - a.hits);

  return {
    uptime: { ms: uptimeMs, label: uptimeLabel },
    totalRequests,
    totalErrors,
    routes: routeList,
    recordedAt: new Date().toISOString(),
  };
}
