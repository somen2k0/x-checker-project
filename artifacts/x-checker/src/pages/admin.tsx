import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Key, Plus, RefreshCw, CheckCircle2, XCircle,
  AlertTriangle, Loader2, Lock, Eye, EyeOff, ShieldCheck,
  Trash2, FlaskConical, Settings, Twitter, Zap, Shield,
  Database, BarChart3, Users, Mail, Sparkles, TrendingUp,
  Clock, Activity,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface ServerKey {
  masked: string;
  source: "db" | "env";
  index: number;
}

type KeyTestStatus = "untested" | "ok" | "rate_limited" | "invalid" | "error" | "testing";

interface KeyStatus {
  status: KeyTestStatus;
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

function StatusBadge({ status }: { status: KeyTestStatus }) {
  if (status === "ok")
    return <Badge className="bg-green-500/15 text-green-400 border-green-500/30 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" /> Active</Badge>;
  if (status === "rate_limited")
    return <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 gap-1 text-xs"><AlertTriangle className="h-3 w-3" /> Rate limited</Badge>;
  if (status === "invalid")
    return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 gap-1 text-xs"><XCircle className="h-3 w-3" /> Invalid</Badge>;
  if (status === "error")
    return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 gap-1 text-xs"><XCircle className="h-3 w-3" /> Error</Badge>;
  if (status === "testing")
    return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 gap-1 text-xs"><Loader2 className="h-3 w-3 animate-spin" /> Testing…</Badge>;
  return <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">Untested</Badge>;
}

// ── Password Gate ──────────────────────────────────────────────────────────

interface PasswordGateProps {
  needsSetup: boolean;
  onAuth: (password: string) => Promise<{ ok: boolean; error?: string }>;
  onSetup: (password: string) => Promise<{ ok: boolean; error?: string }>;
}

function PasswordGate({ needsSetup, onAuth, onSetup }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    if (needsSetup && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    const result = needsSetup
      ? await onSetup(password.trim())
      : await onAuth(password.trim());
    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-24 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-2">
          {needsSetup ? <Shield className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-primary" />}
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          {needsSetup ? "Set Up Admin Panel" : "Admin Panel"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {needsSetup
            ? "Create a password to secure your admin panel."
            : "Enter your admin password to manage credentials."}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder={needsSetup ? "Create a password" : "Admin password"}
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
        {needsSetup && (
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || !password.trim() || (needsSetup && !confirm.trim())}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
          {needsSetup ? "Create Password & Enter" : "Unlock"}
        </Button>
      </form>
    </div>
  );
}

// ── RapidAPI Keys Tab ──────────────────────────────────────────────────────

function RapidApiKeysTab({ password }: { password: string }) {
  const { toast } = useToast();
  const [serverKeys, setServerKeys] = useState<ServerKey[]>([]);
  const [serverKeyStatuses, setServerKeyStatuses] = useState<Record<string, KeyStatus>>({});
  const [draftKeys, setDraftKeys] = useState<DraftKey[]>([]);
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingKey, setAddingKey] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<string | null>(null);

  const headers = { "Content-Type": "application/json", "x-admin-password": password };

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/keys", { headers });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json() as { keys: ServerKey[]; dbKeyCount: number; envKeyCount: number; envVarSet: boolean };
      setServerKeys(data.keys);
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
    try {
      const res = await fetch("/api/admin/keys", {
        method: "POST", headers,
        body: JSON.stringify({ action: "test-server", source: key.source, index: key.index }),
      });
      const data = await res.json() as { status: string; httpStatus: number };
      setServerKeyStatuses((s) => ({ ...s, [id]: { status: data.status as KeyTestStatus, httpStatus: data.httpStatus } }));
    } catch {
      setServerKeyStatuses((s) => ({ ...s, [id]: { status: "error" } }));
    }
  }

  async function deleteServerKey(key: ServerKey) {
    const id = `${key.source}-${key.index}`;
    setDeletingIdx(id);
    try {
      const res = await fetch(`/api/admin/keys/${key.index}?source=${key.source}`, { method: "DELETE", headers });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        toast({ title: d.error ?? "Failed to delete key", variant: "destructive" });
        return;
      }
      toast({ title: "Key removed" });
      await fetchKeys();
    } catch {
      toast({ title: "Failed to delete key", variant: "destructive" });
    } finally {
      setDeletingIdx(null);
    }
  }

  async function testDraftKey(draftId: string, key: string) {
    setDraftKeys((prev) => prev.map((d) => d.id === draftId ? { ...d, status: { status: "testing" } } : d));
    try {
      const res = await fetch("/api/admin/keys", { method: "POST", headers, body: JSON.stringify({ key }) });
      const data = await res.json() as { status: string; httpStatus: number };
      setDraftKeys((prev) => prev.map((d) => d.id === draftId ? { ...d, status: { status: data.status as KeyTestStatus, httpStatus: data.httpStatus } } : d));
    } catch {
      setDraftKeys((prev) => prev.map((d) => d.id === draftId ? { ...d, status: { status: "error" } } : d));
    }
  }

  async function addDraftKey() {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    if (draftKeys.some((d) => d.value === trimmed)) {
      toast({ title: "Key already in draft list", variant: "destructive" });
      return;
    }
    setDraftKeys((prev) => [...prev, { id: crypto.randomUUID(), value: trimmed, status: { status: "untested" } }]);
    setNewKey("");
    setAddingKey(false);
  }

  async function saveKeyToServer(draft: DraftKey) {
    try {
      const res = await fetch("/api/admin/keys/add", {
        method: "POST", headers,
        body: JSON.stringify({ key: draft.value }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        toast({ title: d.error ?? "Failed to save key", variant: "destructive" });
        return;
      }
      toast({ title: "Key saved to database", description: "It is now active and will be used by the Temp Gmail tool." });
      setDraftKeys((prev) => prev.filter((d) => d.id !== draft.id));
      await fetchKeys();
    } catch {
      toast({ title: "Failed to save key", variant: "destructive" });
    }
  }

  const dbKeys = serverKeys.filter((k) => k.source === "db");
  const envKeys = serverKeys.filter((k) => k.source === "env");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> RapidAPI Keys</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Used by the Temp Gmail tool (Gmailnator API).</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchKeys} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Keys stored in DB */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saved Keys</h3>
          <Badge variant="outline" className="text-xs">{dbKeys.length}</Badge>
          <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-xs gap-1"><Database className="h-2.5 w-2.5" /> Database</Badge>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : dbKeys.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 px-4 py-5 text-center text-sm text-muted-foreground">
            No keys saved yet. Add keys below to get started.
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden">
            {dbKeys.map((key) => {
              const id = `${key.source}-${key.index}`;
              const keyStatus = serverKeyStatuses[id] ?? { status: "untested" };
              return (
                <div key={id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
                  <code className="text-xs font-mono text-muted-foreground flex-1 truncate">{key.masked}</code>
                  <StatusBadge status={keyStatus.status} />
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => testServerKey(key)} disabled={keyStatus.status === "testing"}>
                    <FlaskConical className="h-3.5 w-3.5 mr-1" /> Test
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteServerKey(key)}
                    disabled={deletingIdx === id}
                  >
                    {deletingIdx === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Keys from env var */}
      {envKeys.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From Environment Variable</h3>
            <Badge variant="outline" className="text-xs">{envKeys.length}</Badge>
          </div>
          <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden opacity-75">
            {envKeys.map((key) => {
              const id = `${key.source}-${key.index}`;
              const keyStatus = serverKeyStatuses[id] ?? { status: "untested" };
              return (
                <div key={id} className="flex items-center gap-3 px-4 py-3 bg-card">
                  <code className="text-xs font-mono text-muted-foreground flex-1 truncate">{key.masked}</code>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">ENV VAR</Badge>
                  <StatusBadge status={keyStatus.status} />
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => testServerKey(key)} disabled={keyStatus.status === "testing"}>
                    <FlaskConical className="h-3.5 w-3.5 mr-1" /> Test
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">These keys come from the RAPIDAPI_KEYS environment variable and can only be removed from the Replit Secrets panel.</p>
        </section>
      )}

      {/* Draft / add new */}
      <section className="space-y-3 border-t border-border/40 pt-5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add New Key</h3>
        </div>
        <p className="text-xs text-muted-foreground">Paste a key, test it, then click Save to add it to your database instantly.</p>

        {draftKeys.length > 0 && (
          <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden">
            {draftKeys.map((draft) => (
              <div key={draft.id} className="flex items-center gap-3 px-4 py-3 bg-card">
                <code className="text-xs font-mono text-muted-foreground flex-1 truncate">{maskKey(draft.value)}</code>
                <StatusBadge status={draft.status.status} />
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => testDraftKey(draft.id, draft.value)} disabled={draft.status.status === "testing"}>
                  <FlaskConical className="h-3.5 w-3.5 mr-1" /> Test
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="h-7 px-2 text-xs text-green-400 border-green-500/30 hover:bg-green-500/10"
                  onClick={() => saveKeyToServer(draft)}
                >
                  Save
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDraftKeys((prev) => prev.filter((d) => d.id !== draft.id))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {addingKey ? (
          <div className="flex gap-2">
            <Input
              placeholder="Paste your RapidAPI key here"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addDraftKey(); if (e.key === "Escape") { setAddingKey(false); setNewKey(""); } }}
              autoFocus
              className="font-mono text-xs"
            />
            <Button size="sm" onClick={addDraftKey} disabled={!newKey.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAddingKey(false); setNewKey(""); }}>Cancel</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setAddingKey(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Key
          </Button>
        )}

        <div className="rounded-lg bg-muted/30 border border-border/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">How to get a free RapidAPI key:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Go to <strong>rapidapi.com</strong> and create a free account.</li>
            <li>Search for <strong>Gmailnator</strong> and subscribe to the free plan.</li>
            <li>Copy your API key and paste it above.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

// ── Groq API Key Tab section ────────────────────────────────────────────────

function GroqKeySection({ password }: { password: string }) {
  const { toast } = useToast();
  const [groqStatus, setGroqStatus] = useState<{ set: boolean; masked: string | null } | null>(null);
  const [newGroqKey, setNewGroqKey] = useState("");
  const [editingGroq, setEditingGroq] = useState(false);
  const [testStatus, setTestStatus] = useState<KeyTestStatus>("untested");
  const [loading, setLoading] = useState(false);

  const headers = { "Content-Type": "application/json", "x-admin-password": password };

  const fetchGroqStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/groq-key", { headers });
      const data = await res.json() as { set: boolean; masked: string | null };
      setGroqStatus(data);
    } catch {
      toast({ title: "Failed to load Groq key status", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { fetchGroqStatus(); }, [fetchGroqStatus]);

  async function saveGroqKey() {
    if (!newGroqKey.trim()) return;
    try {
      const res = await fetch("/api/admin/groq-key", { method: "PUT", headers, body: JSON.stringify({ key: newGroqKey.trim() }) });
      if (!res.ok) throw new Error();
      toast({ title: "Groq API key saved" });
      setNewGroqKey("");
      setEditingGroq(false);
      setTestStatus("untested");
      await fetchGroqStatus();
    } catch {
      toast({ title: "Failed to save key", variant: "destructive" });
    }
  }

  async function deleteGroqKey() {
    try {
      await fetch("/api/admin/groq-key", { method: "DELETE", headers });
      toast({ title: "Groq API key removed" });
      setTestStatus("untested");
      await fetchGroqStatus();
    } catch {
      toast({ title: "Failed to remove key", variant: "destructive" });
    }
  }

  async function testGroqKey() {
    setTestStatus("testing");
    try {
      const res = await fetch("/api/admin/groq-key/test", { method: "POST", headers });
      const data = await res.json() as { status: string };
      setTestStatus(data.status as KeyTestStatus);
    } catch {
      setTestStatus("error");
    }
  }

  return (
    <section className="space-y-3 border-t border-border/40 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-400" /> Groq API Key</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Used for the AI Bio Generator tool.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : groqStatus?.set ? (
        <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-card">
            <code className="text-xs font-mono text-muted-foreground flex-1">{groqStatus.masked}</code>
            <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-xs gap-1"><Database className="h-2.5 w-2.5" /> Database</Badge>
            <StatusBadge status={testStatus} />
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={testGroqKey} disabled={testStatus === "testing"}>
              <FlaskConical className="h-3.5 w-3.5 mr-1" /> Test
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditingGroq(true)}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={deleteGroqKey}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 px-4 py-4 text-center text-sm text-muted-foreground">
          No Groq API key configured. The Bio Generator tool will ask users for their own key.
        </div>
      )}

      {(!groqStatus?.set || editingGroq) && (
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Paste your Groq API key (starts with gsk_…)"
            value={newGroqKey}
            onChange={(e) => setNewGroqKey(e.target.value)}
            className="font-mono text-xs"
            autoFocus={editingGroq}
          />
          <Button size="sm" onClick={saveGroqKey} disabled={!newGroqKey.trim()}>Save</Button>
          {editingGroq && <Button size="sm" variant="ghost" onClick={() => { setEditingGroq(false); setNewGroqKey(""); }}>Cancel</Button>}
        </div>
      )}
    </section>
  );
}

// ── Twitter Bearer Token section ────────────────────────────────────────────

function TwitterTokenSection({ password }: { password: string }) {
  const { toast } = useToast();
  const [tokenStatus, setTokenStatus] = useState<{ set: boolean; source: string; masked: string } | null>(null);
  const [newToken, setNewToken] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const headers = { "Content-Type": "application/json", "x-admin-password": password };

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/twitter-token", { headers });
      const data = await res.json() as { set: boolean; source: string; masked: string };
      setTokenStatus(data);
    } catch {
      toast({ title: "Failed to load Twitter token status", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function saveToken() {
    if (!newToken.trim()) return;
    try {
      const res = await fetch("/api/admin/twitter-token", { method: "PUT", headers, body: JSON.stringify({ token: newToken.trim() }) });
      if (!res.ok) throw new Error();
      toast({ title: "Twitter Bearer Token saved" });
      setNewToken("");
      setEditing(false);
      await fetchStatus();
    } catch {
      toast({ title: "Failed to save token", variant: "destructive" });
    }
  }

  async function deleteToken() {
    try {
      await fetch("/api/admin/twitter-token", { method: "DELETE", headers });
      toast({ title: "Custom token removed. Using built-in default." });
      await fetchStatus();
    } catch {
      toast({ title: "Failed to remove token", variant: "destructive" });
    }
  }

  return (
    <section className="space-y-3 border-t border-border/40 pt-5">
      <div>
        <h2 className="text-sm font-semibold flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400" /> X / Twitter Bearer Token</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Used by the X Account Checker. A built-in default is used if not set.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : tokenStatus && (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-card">
            <code className="text-xs font-mono text-muted-foreground flex-1">{tokenStatus.masked}</code>
            {tokenStatus.source === "db" && <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-xs gap-1"><Database className="h-2.5 w-2.5" /> Database</Badge>}
            {tokenStatus.source === "env" && <Badge variant="outline" className="text-xs">ENV VAR</Badge>}
            {tokenStatus.source === "default" && <Badge variant="outline" className="text-xs text-muted-foreground">Built-in default</Badge>}
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditing(true)}>
              {tokenStatus.source === "default" ? "Set Custom" : "Edit"}
            </Button>
            {tokenStatus.source === "db" && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={deleteToken}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {editing && (
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Paste your Twitter Bearer Token"
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            className="font-mono text-xs"
            autoFocus
          />
          <Button size="sm" onClick={saveToken} disabled={!newToken.trim()}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setNewToken(""); }}>Cancel</Button>
        </div>
      )}
    </section>
  );
}

// ── Web3Forms Section ─────────────────────────────────────────────────────────

function Web3FormsSection({ password }: { password: string }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<{ source: "db" | "env" | "none"; masked: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newKey, setNewKey] = useState("");

  const headers = { "Content-Type": "application/json", "x-admin-password": password };

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/web3forms-status", { headers });
      if (res.ok) setStatus(await res.json() as { source: "db" | "env" | "none"; masked: string | null });
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function saveKey() {
    if (!newKey.trim()) return;
    try {
      await fetch("/api/admin/web3forms-key", { method: "PUT", headers, body: JSON.stringify({ key: newKey.trim() }) });
      toast({ title: "Web3Forms key saved." });
      setEditing(false);
      setNewKey("");
      await fetchStatus();
    } catch {
      toast({ title: "Failed to save key", variant: "destructive" });
    }
  }

  async function deleteKey() {
    try {
      await fetch("/api/admin/web3forms-key", { method: "DELETE", headers });
      toast({ title: "Key removed. Contact form disabled until a new key is set." });
      await fetchStatus();
    } catch {
      toast({ title: "Failed to remove key", variant: "destructive" });
    }
  }

  return (
    <section className="space-y-3 border-t border-border/40 pt-5">
      <div>
        <h2 className="text-sm font-semibold flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-400" /> Web3Forms Key</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Used by the contact/feedback form to deliver messages to your email.{" "}
          <a href="https://web3forms.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Get a free key at web3forms.com</a>.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : status?.source === "none" ? (
        <div className="rounded-lg border border-dashed border-border/60 px-4 py-4 text-sm text-muted-foreground">
          No key set — contact form is currently disabled.
        </div>
      ) : status && (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-card">
            <code className="text-xs font-mono text-muted-foreground flex-1">{status.masked}</code>
            {status.source === "db" && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs gap-1"><Database className="h-2.5 w-2.5" /> Database</Badge>}
            {status.source === "env" && <Badge variant="outline" className="text-xs">ENV VAR</Badge>}
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditing(true)}>Edit</Button>
            {status.source === "db" && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={deleteKey}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {!editing && (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
          <Plus className="h-3.5 w-3.5" /> {status?.source === "none" ? "Set Key" : "Change Key"}
        </Button>
      )}

      {editing && (
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Paste your Web3Forms access key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="font-mono text-xs"
            autoFocus
          />
          <Button size="sm" onClick={saveKey} disabled={!newKey.trim()}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setNewKey(""); }}>Cancel</Button>
        </div>
      )}
    </section>
  );
}

// ── API Keys Tab ─────────────────────────────────────────────────────────────

function ApiKeysTab({ password }: { password: string }) {
  return (
    <div className="space-y-0">
      <RapidApiKeysTab password={password} />
      <GroqKeySection password={password} />
      <TwitterTokenSection password={password} />
      <Web3FormsSection password={password} />
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({ password, onPasswordChanged }: { password: string; onPasswordChanged: (pw: string) => void }) {
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = { "Content-Type": "application/json", "x-admin-password": password };

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (currentPw !== password) { setError("Current password is incorrect."); return; }
    if (newPw.length < 4) { setError("New password must be at least 4 characters."); return; }
    if (newPw !== confirmPw) { setError("New passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST", headers,
        body: JSON.stringify({ newPassword: newPw }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Password changed successfully" });
      sessionStorage.setItem("admin_password", newPw);
      onPasswordChanged(newPw);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch {
      toast({ title: "Failed to change password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h2 className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Change Admin Password</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Update your admin panel password. Stored securely in the database.</p>
      </div>
      <form onSubmit={changePassword} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Current Password</label>
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              placeholder="Enter current password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="pr-10"
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">New Password</label>
          <Input type={showPw ? "text" : "password"} placeholder="At least 4 characters" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
          <Input type={showPw ? "text" : "password"} placeholder="Repeat new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading || !currentPw || !newPw || !confirmPw} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Update Password
        </Button>
      </form>
    </div>
  );
}

// ── Stats Tab ──────────────────────────────────────────────────────────────

interface ActivityEntry {
  id: number;
  event_type: string;
  count: number;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const EVENT_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  account_check: {
    label: "Account Check",
    color: "text-blue-400",
    icon: <Twitter className="h-3 w-3" />,
  },
  bio_generate: {
    label: "Bio Generate",
    color: "text-yellow-400",
    icon: <Sparkles className="h-3 w-3" />,
  },
  tempgmail_generate: {
    label: "Temp Email",
    color: "text-sky-400",
    icon: <Mail className="h-3 w-3" />,
  },
};

interface RawStats {
  "accounts:requests"?: number;
  "accounts:usernames_checked"?: number;
  "accounts:status_active"?: number;
  "accounts:status_suspended"?: number;
  "accounts:status_not_found"?: number;
  "accounts:status_unknown"?: number;
  "bio:requests"?: number;
  "tempgmail:generates"?: number;
  [key: string]: number | undefined;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card px-4 py-4 space-y-2">
      <div className={`flex items-center gap-2 text-xs font-medium ${color ?? "text-muted-foreground"}`}>
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function StatsTab({ password }: { password: string }) {
  const { toast } = useToast();
  const [stats, setStats] = useState<RawStats | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const headers = { "Content-Type": "application/json", "x-admin-password": password };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/activity?limit=50", { headers }),
      ]);
      if (statsRes.status === 401) {
        sessionStorage.removeItem("admin_password");
        window.location.reload();
        return;
      }
      if (!statsRes.ok) throw new Error("Failed");
      const data = await statsRes.json() as { stats: RawStats };
      setStats(data.stats);
      if (activityRes.ok) {
        const aData = await activityRes.json() as { entries: ActivityEntry[] };
        setActivity(aData.entries);
      }
      setLastRefreshed(new Date());
    } catch {
      toast({ title: "Failed to load stats", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const accountRequests = stats?.["accounts:requests"] ?? 0;
  const usernamesChecked = stats?.["accounts:usernames_checked"] ?? 0;
  const active = stats?.["accounts:status_active"] ?? 0;
  const suspended = stats?.["accounts:status_suspended"] ?? 0;
  const notFound = stats?.["accounts:status_not_found"] ?? 0;
  const unknown = stats?.["accounts:status_unknown"] ?? 0;
  const bioRequests = stats?.["bio:requests"] ?? 0;
  const tempGmailGenerates = stats?.["tempgmail:generates"] ?? 0;

  const totalChecked = active + suspended + notFound + unknown;
  const activeRate = totalChecked > 0 ? Math.round((active / totalChecked) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Site Usage Stats
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cumulative totals since tracking began.
            {lastRefreshed && ` Last updated ${lastRefreshed.toLocaleTimeString()}.`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && !stats ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading stats…
        </div>
      ) : (
        <>
          {/* X Account Checker */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Twitter className="h-3.5 w-3.5" /> X Account Checker
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                label="Check Requests"
                value={accountRequests}
                sub="Total batch check calls"
                color="text-blue-400"
              />
              <StatCard
                icon={<Users className="h-3.5 w-3.5" />}
                label="Usernames Checked"
                value={usernamesChecked}
                sub="Across all requests"
                color="text-purple-400"
              />
            </div>

            {totalChecked > 0 && (
              <div className="rounded-lg border border-border/60 bg-card px-4 py-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Results Breakdown</p>
                <div className="space-y-2">
                  {[
                    { label: "Active", value: active, color: "bg-green-500", textColor: "text-green-400" },
                    { label: "Suspended", value: suspended, color: "bg-red-500", textColor: "text-red-400" },
                    { label: "Not Found", value: notFound, color: "bg-zinc-500", textColor: "text-zinc-400" },
                    { label: "Unknown", value: unknown, color: "bg-yellow-500", textColor: "text-yellow-400" },
                  ].map(({ label, value, color, textColor }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className={`text-xs w-20 shrink-0 ${textColor}`}>{label}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color} transition-all`}
                          style={{ width: totalChecked > 0 ? `${(value / totalChecked) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-10 text-right">{value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{activeRate}% of checked accounts are active.</p>
              </div>
            )}
          </section>

          {/* Other tools */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Other Tools
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Sparkles className="h-3.5 w-3.5" />}
                label="Bio Generations"
                value={bioRequests}
                sub="AI Bio Generator requests"
                color="text-yellow-400"
              />
              <StatCard
                icon={<Mail className="h-3.5 w-3.5" />}
                label="Temp Emails Created"
                value={tempGmailGenerates}
                sub="Via Gmailnator API"
                color="text-sky-400"
              />
            </div>
          </section>

          {accountRequests === 0 && bioRequests === 0 && tempGmailGenerates === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
              No usage recorded yet. Stats will appear here as your tools get used.
            </div>
          )}

          {/* Activity Log */}
          <section className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Recent Activity
            </h3>
            {activity.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 px-4 py-5 text-center text-sm text-muted-foreground">
                No activity yet. Events will appear here in real time.
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 divide-y divide-border/30 overflow-hidden">
                {activity.map((entry) => {
                  const meta = EVENT_META[entry.event_type] ?? {
                    label: entry.event_type,
                    color: "text-muted-foreground",
                    icon: <Clock className="h-3 w-3" />,
                  };
                  return (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5 bg-card hover:bg-muted/20 transition-colors">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${meta.color} w-36 shrink-0`}>
                        {meta.icon} {meta.label}
                      </span>
                      {entry.event_type === "account_check" && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 font-mono">
                          {entry.count} username{entry.count !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      <span className="flex-1" />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(entry.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────

function AdminPanel({ password, onPasswordChanged, onLogout }: { password: string; onPasswordChanged: (pw: string) => void; onLogout: () => void }) {

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all credentials and API keys for your website.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Lock
        </Button>
      </div>

      <Tabs defaultValue="stats">
        <TabsList className="w-full">
          <TabsTrigger value="stats" className="flex-1 gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Stats</TabsTrigger>
          <TabsTrigger value="api-keys" className="flex-1 gap-1.5"><Key className="h-3.5 w-3.5" /> API Keys</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 gap-1.5"><Settings className="h-3.5 w-3.5" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-6">
          <StatsTab password={password} />
        </TabsContent>

        <TabsContent value="api-keys" className="mt-6">
          <ApiKeysTab password={password} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsTab password={password} onPasswordChanged={onPasswordChanged} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

type AuthState = "loading" | "setup" | "login" | "authed";

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const statusRes = await fetch("/api/admin/status");
        if (!statusRes.ok) { setAuthState("login"); return; }
        const status = await statusRes.json() as { needsSetup: boolean };

        if (status.needsSetup) {
          sessionStorage.removeItem("admin_password");
          setAuthState("setup");
          return;
        }

        // Password is configured on the server — check for a stored session
        const stored = sessionStorage.getItem("admin_password");
        if (stored) {
          // Validate the stored password against the server
          const checkRes = await fetch("/api/admin/keys", {
            headers: { "x-admin-password": stored },
          });
          if (checkRes.ok) {
            setPassword(stored);
            setAuthState("authed");
            return;
          }
          // Stale / wrong password — clear it
          sessionStorage.removeItem("admin_password");
        }

        setAuthState("login");
      } catch {
        // Server unreachable — send to login, never auto-show the panel
        setAuthState("login");
      }
    }
    void init();
  }, []);

  async function handleSetup(pw: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        sessionStorage.setItem("admin_password", pw);
        setPassword(pw);
        setAuthState("authed");
        return { ok: true };
      }
      const body = await res.json().catch(() => ({})) as { error?: string };
      return { ok: false, error: body.error ?? `Error (${res.status})` };
    } catch {
      return { ok: false, error: "Could not reach the server." };
    }
  }

  async function handleAuth(pw: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch("/api/admin/keys", { headers: { "x-admin-password": pw } });
      if (res.ok) {
        sessionStorage.setItem("admin_password", pw);
        setPassword(pw);
        setAuthState("authed");
        return { ok: true };
      }
      if (res.status === 401) return { ok: false, error: "Incorrect password. Please try again." };
      const body = await res.json().catch(() => ({})) as { error?: string };
      return { ok: false, error: body.error ?? `Server error (${res.status}).` };
    } catch {
      return { ok: false, error: "Could not reach the server." };
    }
  }

  function handlePasswordChanged(pw: string) {
    sessionStorage.setItem("admin_password", pw);
    setPassword(pw);
  }

  function handleLoggedOut() {
    sessionStorage.removeItem("admin_password");
    setPassword(null);
    setAuthState("login");
  }

  if (authState === "loading") {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {authState === "authed" && password ? (
        <AdminPanel password={password} onPasswordChanged={handlePasswordChanged} onLogout={handleLoggedOut} />
      ) : (
        <PasswordGate needsSetup={authState === "setup"} onAuth={handleAuth} onSetup={handleSetup} />
      )}
    </Layout>
  );
}
