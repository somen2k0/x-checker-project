import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Lock, Eye, EyeOff, ShieldCheck, Loader2,
  Activity, Wrench, Mail, ExternalLink,
  CheckCircle2, XCircle, RefreshCw, Globe, Zap,
  BarChart3, DollarSign, Search,
  Server, AlertTriangle, Clock, Star, TrendingUp,
  Cpu, Database,
} from "lucide-react";

// ── Live Stats ─────────────────────────────────────────────────────────────

interface RouteRow {
  path: string;
  label: string;
  hits: number;
  errors: number;
  lastHitAt: number | null;
}

interface StatsData {
  uptime: { ms: number; label: string };
  totalRequests: number;
  totalErrors: number;
  routes: RouteRow[];
  recordedAt: string;
}

function LiveStats({ password }: { password: string }) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState("");

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const json = await res.json() as StatsData;
        setData(json);
        setLastRefresh(new Date().toLocaleTimeString());
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [password]);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, 10_000);
    return () => clearInterval(id);
  }, [fetch_]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading stats…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-400 flex gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        Stats endpoint unavailable. Set ADMIN_PASSWORD to enable it.
      </div>
    );
  }

  const errorRate = data.totalRequests > 0
    ? ((data.totalErrors / data.totalRequests) * 100).toFixed(1)
    : "0.0";

  const topRoutes = data.routes.slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Requests</p>
          <p className="text-2xl font-bold">{data.totalRequests.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">since last deploy</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Errors</p>
          <p className="text-2xl font-bold text-red-400">{data.totalErrors.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{errorRate}% error rate</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Uptime</p>
          <p className="text-2xl font-bold text-green-400">{data.uptime.label}</p>
          <p className="text-xs text-muted-foreground">server running</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Active Routes</p>
          <p className="text-2xl font-bold text-blue-400">{data.routes.length}</p>
          <p className="text-xs text-muted-foreground">with traffic</p>
        </div>
      </div>

      {/* Per-route breakdown */}
      {topRoutes.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top Endpoints</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live · refreshes every 10s
              {lastRefresh && <span className="ml-1 opacity-60">(last: {lastRefresh})</span>}
            </div>
          </div>
          <div className="divide-y divide-border/40">
            {topRoutes.map((r) => {
              const pct = data.totalRequests > 0 ? (r.hits / data.totalRequests) * 100 : 0;
              return (
                <div key={r.path} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.label}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{r.path}</p>
                  </div>
                  <div className="w-24 hidden sm:block">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular-nums w-10 text-right">{r.hits}</span>
                  {r.errors > 0 && (
                    <span className="text-[11px] text-red-400 tabular-nums">{r.errors} err</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topRoutes.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No requests recorded yet — use any tool to see live stats appear here.
        </p>
      )}
    </div>
  );
}

// ── Password Gate ──────────────────────────────────────────────────────────

interface PasswordGateProps {
  onAuth: (password: string) => Promise<{ ok: boolean; error?: string }>;
}

function PasswordGate({ onAuth }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    const result = await onAuth(password.trim());
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">xtoolkit.live command center</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 h-11"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full h-11" disabled={loading || !password.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
            Unlock Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Quick Link ─────────────────────────────────────────────────────────────

function QuickLink({ href, label, description, icon: Icon }: {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/40 transition-colors group"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </a>
  );
}

// ── Tool Status ────────────────────────────────────────────────────────────

interface ToolEntry {
  enabled: boolean;
  label: string;
  note: string;
  requires: string | null;
  keyCount?: number;
}

interface HealthData {
  status: string;
  uptime: { ms: number; label: string };
  tools: Record<string, ToolEntry>;
  aiCache: { entries: number; totalHits: number; maxEntries: number };
}

function ToolStatus() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) setData(await res.json() as HealthData);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading tool status…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400 flex gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        Could not reach the health endpoint.
      </div>
    );
  }

  const tools = Object.entries(data.tools);
  const enabledCount = tools.filter(([, t]) => t.enabled).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
        <span>{enabledCount} of {tools.length} tools fully enabled</span>
        <Button variant="ghost" size="sm" onClick={fetch_} className="h-6 w-6 p-0 ml-auto">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
        {tools.map(([key, tool]) => (
          <div key={key} className="flex items-center gap-3 px-4 py-3">
            {tool.enabled
              ? <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
              : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{tool.label}</p>
              <p className="text-xs text-muted-foreground truncate">{tool.note}</p>
            </div>
            {tool.enabled ? (
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] shrink-0">
                {tool.keyCount != null ? `${tool.keyCount} key${tool.keyCount !== 1 ? "s" : ""}` : "Online"}
              </Badge>
            ) : (
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] shrink-0 font-mono">
                {tool.requires ?? "Disabled"}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Cache Panel ─────────────────────────────────────────────────────────

function AiCachePanel({ password }: { password: string }) {
  const [cache, setCache] = useState<{ entries: number; totalHits: number; maxEntries: number } | null>(null);
  const [uptime, setUptime] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const d = await res.json() as HealthData;
        setCache(d.aiCache);
        setUptime(d.uptime.label);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [password]);

  useEffect(() => { fetch_(); const id = setInterval(fetch_, 15_000); return () => clearInterval(id); }, [fetch_]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading cache stats…
      </div>
    );
  }

  if (!cache) return null;

  const fillPct = cache.maxEntries > 0 ? Math.round((cache.entries / cache.maxEntries) * 100) : 0;
  const savedCalls = cache.totalHits;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <Database className="h-3.5 w-3.5 text-purple-400" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cache Entries</p>
        </div>
        <p className="text-2xl font-bold">{cache.entries}<span className="text-sm font-normal text-muted-foreground"> / {cache.maxEntries}</span></p>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <div className="h-full bg-purple-400/70 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{fillPct}% full</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-3.5 w-3.5 text-yellow-400" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">API Calls Saved</p>
        </div>
        <p className="text-2xl font-bold text-yellow-400">{savedCalls.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">cache hits since last deploy</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="h-3.5 w-3.5 text-blue-400" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Server Uptime</p>
        </div>
        <p className="text-2xl font-bold text-blue-400">{uptime || "—"}</p>
        <p className="text-xs text-muted-foreground">since last restart · refreshes every 15s</p>
      </div>
    </div>
  );
}

// ── Health Check ───────────────────────────────────────────────────────────

function HealthStatus({ password }: { password: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [lastChecked, setLastChecked] = useState<string>("");

  const check = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/healthz", {
        headers: { "x-admin-password": password },
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
    setLastChecked(new Date().toLocaleTimeString());
  }, [password]);

  useEffect(() => { check(); }, [check]);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full ${
          status === "ok" ? "bg-green-400 animate-pulse" :
          status === "error" ? "bg-red-400" : "bg-yellow-400 animate-pulse"
        }`} />
        <div>
          <p className="text-sm font-medium">
            {status === "loading" ? "Checking server…" : status === "ok" ? "All systems operational" : "Server error"}
          </p>
          {lastChecked && <p className="text-xs text-muted-foreground">Last checked {lastChecked}</p>}
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={check} className="h-7 w-7 p-0">
        <RefreshCw className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

function AdminDashboard({ password }: { password: string }) {
  const launchDate = new Date("2025-05-08");
  const today = new Date();
  const daysLive = Math.floor((today.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            xtoolkit.live
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Admin Command Center</p>
        </div>
        <Badge className="bg-green-500/15 text-green-400 border-green-500/30 gap-1.5 px-3 py-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Live & Secured
        </Badge>
      </div>

      {/* Server Health */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Server Status</h2>
        <HealthStatus password={password} />
      </section>

      {/* Live Request Stats */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5" />
          Live Request Stats
        </h2>
        <LiveStats password={password} />
      </section>

      {/* Stats Grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Site Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Wrench} label="Tools" value="55" sub="Across 6 categories" color="text-blue-400" />
          <StatCard icon={Clock} label="Days Live" value={daysLive} sub="Built in 7 days 🚀" color="text-purple-400" />
          <StatCard icon={Activity} label="Security" value="0" sub="Vulnerabilities found" color="text-green-400" />
          <StatCard icon={Globe} label="Deployment" value="Vercel" sub="Edge + Static" color="text-orange-400" />
        </div>
      </section>

      {/* Tool Status */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tool Status</h2>
        <ToolStatus />
      </section>

      {/* AI Cache */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">AI Cache & Server</h2>
        <AiCachePanel password={password} />
      </section>

      {/* Quick Links */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <QuickLink
            href="https://vercel.com/dashboard"
            label="Vercel Dashboard"
            description="Deployments, logs, env variables"
            icon={Server}
          />
          <QuickLink
            href="https://analytics.google.com"
            label="Google Analytics (GA4)"
            description="Traffic, users, page views"
            icon={BarChart3}
          />
          <QuickLink
            href="https://web3forms.com/dashboard"
            label="Web3Forms"
            description="Contact form submissions"
            icon={Mail}
          />
          <QuickLink
            href="https://console.groq.com"
            label="Groq Console"
            description="AI API usage & billing"
            icon={Zap}
          />
          <QuickLink
            href="https://search.google.com/search-console"
            label="Google Search Console"
            description="SEO indexing & keywords"
            icon={Search}
          />
          <QuickLink
            href="https://www.google.com/adsense"
            label="Google AdSense"
            description="Apply & manage ad revenue"
            icon={DollarSign}
          />
          <QuickLink
            href="https://github.com/somen2k0/xtoolkit.live"
            label="GitHub Repository"
            description="Source code & commits"
            icon={Globe}
          />
          <QuickLink
            href="https://www.producthunt.com/posts/new"
            label="Product Hunt"
            description="Launch your product"
            icon={Star}
          />
        </div>
      </section>

      <p className="text-xs text-center text-muted-foreground pb-4">
        xtoolkit.live admin panel · Built in 7 days 🚀
      </p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(() =>
    sessionStorage.getItem("admin_password")
  );

  async function handleAuth(pw: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const status = await fetch("/api/admin/status", {
        headers: { "x-admin-password": pw },
      });
      const body = await status.json().catch(() => ({})) as { adminEnabled?: boolean };

      if (!body.adminEnabled) {
        return { ok: false, error: "Admin panel is disabled. Add ADMIN_PASSWORD to your environment variables and redeploy." };
      }

      const verify = await fetch("/api/admin/stats", {
        headers: { "x-admin-password": pw },
      });

      if (verify.status === 401) {
        return { ok: false, error: "Incorrect password. Please try again." };
      }

      sessionStorage.setItem("admin_password", pw);
      setPassword(pw);
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not reach the server. Check your network or deployment." };
    }
  }

  return (
    <Layout>
      {password ? (
        <AdminDashboard password={password} />
      ) : (
        <PasswordGate onAuth={handleAuth} />
      )}
    </Layout>
  );
}
