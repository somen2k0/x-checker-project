import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Key, Plus, RefreshCw, Copy, CheckCircle2, XCircle,
  AlertTriangle, Loader2, Lock, Eye, EyeOff, ShieldCheck,
  ClipboardCopy, Trash2, FlaskConical,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface ServerKey {
  masked: string;
  source: "env" | "hardcoded";
  index: number;
}

interface KeyStatus {
  status: "untested" | "ok" | "rate_limited" | "invalid" | "error" | "testing";
  httpStatus?: number;
}

interface DraftKey {
  id: string;
  value: string;
  status: KeyStatus;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••••••";
  return key.slice(0, 6) + "••••••••••••" + key.slice(-4);
}

function StatusBadge({ status }: { status: KeyStatus["status"] }) {
  if (status === "ok")
    return <Badge className="bg-green-500/15 text-green-400 border-green-500/30 gap-1"><CheckCircle2 className="h-3 w-3" /> Active</Badge>;
  if (status === "rate_limited")
    return <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 gap-1"><AlertTriangle className="h-3 w-3" /> Rate limited</Badge>;
  if (status === "invalid")
    return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 gap-1"><XCircle className="h-3 w-3" /> Invalid</Badge>;
  if (status === "error")
    return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 gap-1"><XCircle className="h-3 w-3" /> Error</Badge>;
  if (status === "testing")
    return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Testing…</Badge>;
  return <Badge variant="outline" className="text-muted-foreground gap-1">Untested</Badge>;
}

function SourceBadge({ source }: { source: "env" | "hardcoded" }) {
  if (source === "env")
    return <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-[10px]">ENV VAR</Badge>;
  return <Badge variant="outline" className="text-muted-foreground text-[10px]">HARDCODED</Badge>;
}

// ── Password Gate ──────────────────────────────────────────────────────────

interface PasswordGateProps {
  onAuth: (password: string) => Promise<boolean>;
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
    const ok = await onAuth(password.trim());
    if (!ok) {
      setError("Incorrect password or admin panel is disabled.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-24 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-2">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Enter your admin password to manage RapidAPI keys.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
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
        <Button type="submit" className="w-full" disabled={loading || !password.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
          Unlock
        </Button>
      </form>
      <p className="text-xs text-center text-muted-foreground">
        Set the <code className="bg-muted px-1 rounded">ADMIN_PASSWORD</code> environment variable to enable this panel.
      </p>
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────

interface AdminPanelProps {
  password: string;
}

function AdminPanel({ password }: AdminPanelProps) {
  const { toast } = useToast();
  const [serverKeys, setServerKeys] = useState<ServerKey[]>([]);
  const [serverKeyStatuses, setServerKeyStatuses] = useState<Record<string, KeyStatus>>({});
  const [draftKeys, setDraftKeys] = useState<DraftKey[]>([]);
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [envVarSet, setEnvVarSet] = useState(false);
  const [envKeyCount, setEnvKeyCount] = useState(0);
  const [copiedEnvVar, setCopiedEnvVar] = useState(false);
  const [addingKey, setAddingKey] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    "x-admin-password": password,
  };

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/keys", { headers });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json() as {
        keys: ServerKey[];
        envVarSet: boolean;
        envKeyCount: number;
      };
      setServerKeys(data.keys);
      setEnvVarSet(data.envVarSet);
      setEnvKeyCount(data.envKeyCount);
      setServerKeyStatuses({});
    } catch {
      toast({ title: "Failed to load keys", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  async function testServerKey(key: ServerKey) {
    const id = `${key.source}-${key.index}`;
    setServerKeyStatuses((s) => ({ ...s, [id]: { status: "testing" } }));
    toast({ title: "Testing key…", description: key.masked });
    try {
      const res = await fetch("/api/admin/keys/test-server", {
        method: "POST",
        headers,
        body: JSON.stringify({ source: key.source, index: key.index }),
      });
      const data = await res.json() as { status: string; httpStatus: number };
      setServerKeyStatuses((s) => ({ ...s, [id]: { status: data.status as KeyStatus["status"], httpStatus: data.httpStatus } }));
    } catch {
      setServerKeyStatuses((s) => ({ ...s, [id]: { status: "error" } }));
    }
  }

  async function testDraftKey(draftId: string, key: string) {
    setDraftKeys((prev) => prev.map((d) => d.id === draftId ? { ...d, status: { status: "testing" } } : d));
    try {
      const res = await fetch("/api/admin/keys/test", {
        method: "POST",
        headers,
        body: JSON.stringify({ key }),
      });
      const data = await res.json() as { status: string; httpStatus: number };
      setDraftKeys((prev) =>
        prev.map((d) => d.id === draftId ? { ...d, status: { status: data.status as KeyStatus["status"], httpStatus: data.httpStatus } } : d)
      );
    } catch {
      setDraftKeys((prev) => prev.map((d) => d.id === draftId ? { ...d, status: { status: "error" } } : d));
    }
  }

  function addDraftKey() {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    if (draftKeys.some((d) => d.value === trimmed)) {
      toast({ title: "Key already in list", variant: "destructive" });
      return;
    }
    setDraftKeys((prev) => [...prev, { id: crypto.randomUUID(), value: trimmed, status: { status: "untested" } }]);
    setNewKey("");
    setAddingKey(false);
  }

  function removeDraftKey(id: string) {
    setDraftKeys((prev) => prev.filter((d) => d.id !== id));
  }

  function copyEnvVar() {
    const allKeys = draftKeys.map((d) => d.value);
    if (allKeys.length === 0) {
      toast({ title: "No draft keys to copy", description: "Add at least one key below first.", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(allKeys.join(",")).then(() => {
      setCopiedEnvVar(true);
      toast({ title: "Copied!", description: "Paste this value as RAPIDAPI_KEYS in Vercel → Settings → Environment Variables." });
      setTimeout(() => setCopiedEnvVar(false), 3000);
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" /> RapidAPI Key Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and test your Gmailnator API keys.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchKeys} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Current keys from server */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Configured Keys</h2>
          <Badge variant="outline" className="text-xs">{serverKeys.length} total</Badge>
          {envVarSet && <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">{envKeyCount} from env var</Badge>}
        </div>

        {!envVarSet && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-400 flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span><strong>RAPIDAPI_KEYS</strong> env var is not set — only hardcoded keys are active. Add your keys below and copy the value to Vercel.</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading keys…
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden">
            {serverKeys.map((key) => {
              const id = `${key.source}-${key.index}`;
              const keyStatus = serverKeyStatuses[id] ?? { status: "untested" };
              return (
                <div key={id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
                  <code className="text-xs font-mono text-muted-foreground flex-1 truncate">{key.masked}</code>
                  <SourceBadge source={key.source} />
                  <StatusBadge status={keyStatus.status} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => testServerKey(key)}
                    disabled={keyStatus.status === "testing"}
                  >
                    <FlaskConical className="h-3.5 w-3.5 mr-1" />
                    Test
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Draft keys */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">New Keys Draft</h2>
            <Badge variant="outline" className="text-xs">{draftKeys.length}</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyEnvVar}
            disabled={draftKeys.length === 0}
            className="gap-1.5"
          >
            {copiedEnvVar ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
            Copy as RAPIDAPI_KEYS
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Add new keys here, test them, then click <strong>Copy as RAPIDAPI_KEYS</strong> and paste the value into Vercel → Settings → Environment Variables → <code className="bg-muted px-1 rounded">RAPIDAPI_KEYS</code>.
        </p>

        {draftKeys.length > 0 && (
          <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden">
            {draftKeys.map((draft) => (
              <div key={draft.id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
                <code className="text-xs font-mono text-muted-foreground flex-1 truncate">{maskKey(draft.value)}</code>
                <StatusBadge status={draft.status.status} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => testDraftKey(draft.id, draft.value)}
                  disabled={draft.status.status === "testing"}
                >
                  <FlaskConical className="h-3.5 w-3.5 mr-1" />
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => removeDraftKey(draft.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {addingKey ? (
          <div className="flex gap-2">
            <Input
              placeholder="Paste your RapidAPI key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addDraftKey(); if (e.key === "Escape") setAddingKey(false); }}
              autoFocus
              className="font-mono text-xs"
            />
            <Button size="sm" onClick={addDraftKey} disabled={!newKey.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAddingKey(false); setNewKey(""); }}>Cancel</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setAddingKey(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add key
          </Button>
        )}
      </section>

      {/* Instructions */}
      <section className="rounded-lg border border-border/60 bg-muted/30 px-4 py-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Copy className="h-4 w-4" /> How to add keys to Vercel</h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Get a RapidAPI key by subscribing to <strong>Gmailnator</strong> at rapidapi.com (free tier available).</li>
          <li>Add it to the draft list above and test it.</li>
          <li>Click <strong>Copy as RAPIDAPI_KEYS</strong>.</li>
          <li>In Vercel → your project → <strong>Settings → Environment Variables</strong>, set <code className="bg-background px-1 rounded border border-border/60">RAPIDAPI_KEYS</code> to the copied value.</li>
          <li>Redeploy to apply the change.</li>
        </ol>
      </section>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(() =>
    sessionStorage.getItem("admin_password")
  );

  async function handleAuth(pw: string): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/keys", {
        headers: { "x-admin-password": pw },
      });
      if (res.ok) {
        sessionStorage.setItem("admin_password", pw);
        setPassword(pw);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  return (
    <Layout>
      {password ? (
        <AdminPanel password={password} />
      ) : (
        <PasswordGate onAuth={handleAuth} />
      )}
    </Layout>
  );
}
