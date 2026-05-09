import { useState, useRef } from "react";
import { useSearchParams } from "@/hooks/use-search-params";
import { useCheckAccounts } from "@workspace/api-client-react";
import { AccountCheckResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { Layout } from "@/components/layout/Layout";
import { AdBanner } from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Copy, Trash2, CheckCircle2, XCircle, HelpCircle,
  UserX, AlertCircle, BadgeCheck, ExternalLink, Users, Calendar, Link2,
  Sparkles, RefreshCw, Plus, KeyRound, Eye, EyeOff, ShieldCheck, AtSign,
  Search, Settings2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "groq_api_keys";
const MAX_KEYS = 5;

function loadKeys(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveKeys(keys: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••••••";
  return key.slice(0, 8) + "••••••••" + key.slice(-4);
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function Tools() {
  const defaultTab = useSearchParams().get("tab") ?? "checker";

  const [input, setInput] = useState("");
  const [results, setResults] = useState<AccountCheckResult[]>([]);
  const { toast } = useToast();
  const checkAccountsMutation = useCheckAccounts();

  const [profileInput, setProfileInput] = useState("");

  const [bioTopic, setBioTopic] = useState("");
  const [bioTone, setBioTone] = useState("");
  const [bios, setBios] = useState<string[]>([]);
  const [bioLoading, setBioLoading] = useState(false);

  const [atInput, setAtInput] = useState("");
  const [atMode, setAtMode] = useState<"add" | "remove">("add");

  const atLines = atInput.split(/\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const atOutput = atLines.map((u) =>
    atMode === "add" ? (u.startsWith("@") ? u : `@${u}`) : u.replace(/^@+/, "")
  );

  const [groqKeys, setGroqKeys] = useState<string[]>(loadKeys);
  const [newKey, setNewKey] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);
  const keyIndexRef = useRef(0);

  const addKey = () => {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    if (groqKeys.length >= MAX_KEYS) {
      toast({ title: "Max keys reached", description: `You can store up to ${MAX_KEYS} API keys.`, variant: "destructive" });
      return;
    }
    if (groqKeys.includes(trimmed)) {
      toast({ title: "Duplicate key", description: "This key is already saved.", variant: "destructive" });
      return;
    }
    const updated = [...groqKeys, trimmed];
    setGroqKeys(updated);
    saveKeys(updated);
    setNewKey("");
    setShowNewKey(false);
    toast({ title: "Key saved", description: "Groq API key added successfully." });
  };

  const removeKey = (index: number) => {
    const updated = groqKeys.filter((_, i) => i !== index);
    setGroqKeys(updated);
    saveKeys(updated);
    keyIndexRef.current = 0;
    toast({ title: "Key removed" });
  };

  const pickNextKey = (): string | null => {
    if (groqKeys.length === 0) return null;
    const key = groqKeys[keyIndexRef.current % groqKeys.length];
    keyIndexRef.current = (keyIndexRef.current + 1) % groqKeys.length;
    return key;
  };

  const handleGenerateBio = async () => {
    if (!bioTopic.trim()) {
      toast({ title: "Enter a topic", description: "Tell us what your bio should be about.", variant: "destructive" });
      return;
    }
    const apiKey = pickNextKey();
    if (!apiKey) {
      toast({ title: "No API key", description: "Add a Groq API key in the Settings tab first.", variant: "destructive" });
      return;
    }
    setBioLoading(true);
    setBios([]);
    try {
      const res = await fetch("/api/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: bioTopic, tone: bioTone, apiKey }),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === "invalid_api_key") {
        toast({ title: "Invalid API key", description: "One of your keys is invalid. Check your Settings.", variant: "destructive" });
        return;
      }
      if (res.status === 429 || data.error === "rate_limited") {
        toast({ title: "Rate limited", description: "This key hit its limit. Trying next key on the next attempt.", variant: "destructive" });
        return;
      }
      if (data.error === "no_api_key") {
        toast({ title: "No API key sent", description: "Add a Groq API key in Settings.", variant: "destructive" });
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to generate bio");
      setBios(data.bios ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setBioLoading(false);
    }
  };

  const profileUsernames = profileInput
    .split(/[\s,\n]+/).map((u) => u.trim().replace(/^@/, "")).filter((u) => u.length > 0);
  const profileLinks = profileUsernames.map((u) => ({ username: u, url: `https://x.com/${u}` }));

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: url });
  };

  const handleCopyAllLinks = () => {
    if (!profileLinks.length) return;
    navigator.clipboard.writeText(profileLinks.map((l) => l.url).join("\n"));
    toast({ title: "Copied all links!", description: `${profileLinks.length} links copied.` });
  };

  const handleCheck = () => {
    const usernames = input
      .split(/[\s,]+/).map((u) => u.trim().replace(/^@/, "")).filter((u) => u.length > 0);
    if (usernames.length === 0) {
      toast({ title: "No usernames provided", description: "Please enter at least one username.", variant: "destructive" });
      return;
    }
    if (usernames.length > 100) {
      toast({ title: "Too many usernames", description: "Max 100 at a time.", variant: "destructive" });
      return;
    }
    checkAccountsMutation.mutate(
      { data: { usernames } },
      {
        onSuccess: (data) => {
          setResults(data.results);
          toast({ title: "Check complete", description: `Checked ${data.results.length} accounts.` });
        },
        onError: (error) => {
          toast({ title: "Error", description: error.error?.error ?? "An unexpected error occurred.", variant: "destructive" });
        },
      }
    );
  };

  const handleClear = () => { setInput(""); setResults([]); };

  const handleCopyResults = () => {
    if (!results.length) return;
    const text = results.map((r) =>
      `${r.username}\t${r.status.toUpperCase()}${r.displayName ? `\t${r.displayName}` : ""}${r.followerCount != null ? `\t${r.followerCount} followers` : ""}`
    ).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Results copied as TSV." });
  };

  const getStatusIcon = (status: AccountCheckResult["status"]) => {
    switch (status) {
      case "active": return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "suspended": return <XCircle className="h-4 w-4 text-destructive" />;
      case "not_found": return <UserX className="h-4 w-4 text-muted-foreground" />;
      default: return <HelpCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: AccountCheckResult["status"]) => {
    switch (status) {
      case "active": return <Badge variant="outline" className="bg-success/10 text-success border-success/25 font-medium">Active</Badge>;
      case "suspended": return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/25 font-medium">Suspended</Badge>;
      case "not_found": return <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-muted-foreground/20 font-medium">Not Found</Badge>;
      default: return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/25 font-medium">Unknown</Badge>;
    }
  };

  const activeCount = results.filter(r => r.status === "active").length;
  const suspendedCount = results.filter(r => r.status === "suspended").length;
  const notFoundCount = results.filter(r => r.status === "not_found").length;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1.5">X Toolkit</h1>
          <p className="text-muted-foreground text-sm">Four free tools for X / Twitter power users. No signup required.</p>
        </div>

        {/* Top ad */}
        <AdBanner slot="1111111111" format="horizontal" className="rounded-xl overflow-hidden mb-8" />

        {/* ── Main Tabs ── */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="flex w-full h-auto p-1 bg-muted/40 border border-border/60 rounded-xl gap-0.5 mb-6">
            <TabsTrigger value="checker" className="flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Account Checker</span>
              <span className="sm:hidden">Checker</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
              <Link2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profile Links</span>
              <span className="sm:hidden">Links</span>
            </TabsTrigger>
            <TabsTrigger value="bio" className="flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bio Generator</span>
              <span className="sm:hidden">Bio</span>
            </TabsTrigger>
            <TabsTrigger value="at" className="flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
              <AtSign className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Formatter</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
              <Settings2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Settings</span>
              {groqKeys.length > 0 && (
                <span className="rounded-full bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 leading-none">
                  {groqKeys.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Account Checker ── */}
          <TabsContent value="checker" className="space-y-5 mt-0">
            <Card className="border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Check Account Status</CardTitle>
                    <CardDescription className="mt-1">Paste usernames separated by newlines, spaces, or commas. The @ prefix is optional.</CardDescription>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-muted/50 border border-border/50 rounded-md px-2 py-1 shrink-0">
                    {input.split(/[\s,]+/).filter(Boolean).length} / 100
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={"elonmusk\n@jack\nsama"}
                  className="min-h-[160px] font-mono text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40 placeholder:text-muted-foreground/40"
                  data-testid="textarea-usernames"
                />
                <div className="flex items-center justify-end gap-2.5">
                  <Button variant="outline" onClick={handleClear} disabled={!input && !results.length} className="text-xs border-border/60 hover:bg-muted/50" data-testid="button-clear">
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
                  </Button>
                  <Button onClick={handleCheck} disabled={checkAccountsMutation.isPending || !input.trim()} className="text-xs min-w-[130px] shadow-sm shadow-primary/20" data-testid="button-check">
                    {checkAccountsMutation.isPending
                      ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Checking...</>
                      : <><Search className="h-3.5 w-3.5 mr-1.5" />Check Status</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {results.length > 0 && (
              <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Results</CardTitle>
                      <CardDescription className="mt-0.5">{results.length} account{results.length !== 1 ? "s" : ""} checked</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopyResults} className="text-xs border-border/60 hover:bg-muted/50" data-testid="button-copy-results">
                      <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-success/10 text-success border border-success/20 rounded-full px-3 py-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {activeCount} Active
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-3 py-1">
                      <XCircle className="h-3.5 w-3.5" /> {suspendedCount} Suspended
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted/60 text-muted-foreground border border-border/60 rounded-full px-3 py-1">
                      <UserX className="h-3.5 w-3.5" /> {notFoundCount} Not Found
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border/60">
                          <tr>
                            <th className="px-4 py-3 font-medium tracking-wide uppercase text-[11px]">Account</th>
                            <th className="px-4 py-3 font-medium tracking-wide uppercase text-[11px] w-[130px]">Status</th>
                            <th className="px-4 py-3 font-medium tracking-wide uppercase text-[11px]">Followers</th>
                            <th className="px-4 py-3 font-medium tracking-wide uppercase text-[11px]">Following</th>
                            <th className="px-4 py-3 font-medium tracking-wide uppercase text-[11px]">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {results.map((result, i) => (
                            <tr key={`${result.username}-${i}`} className="hover:bg-muted/20 transition-colors group">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-border/60 rounded-full bg-muted/50 shrink-0">
                                    {result.profileImageUrl && <AvatarImage src={result.profileImageUrl} alt={result.username} />}
                                    <AvatarFallback className="rounded-full bg-muted/80 text-muted-foreground font-mono text-xs">
                                      {result.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      {result.status === "active" ? (
                                        <a href={`https://x.com/${result.username}`} target="_blank" rel="noopener noreferrer"
                                          className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1 hover:underline text-sm">
                                          @{result.username}
                                          <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-70" />
                                        </a>
                                      ) : (
                                        <span className="font-medium text-muted-foreground text-sm">@{result.username}</span>
                                      )}
                                      {result.isVerified && <BadgeCheck className="h-4 w-4 text-blue-400 shrink-0" title="Verified" />}
                                    </div>
                                    {result.displayName && <span className="text-xs text-muted-foreground/70 truncate max-w-[180px]">{result.displayName}</span>}
                                    {result.error && (
                                      <span className="text-destructive/70 text-xs flex items-center gap-1 font-mono mt-0.5">
                                        <AlertCircle className="h-3 w-3" />{result.error}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">{getStatusIcon(result.status)}{getStatusBadge(result.status)}</div>
                              </td>
                              <td className="px-4 py-3.5">
                                {result.followerCount != null ? (
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
                                    <span className="font-mono font-semibold text-sm">{formatCount(result.followerCount)}</span>
                                  </div>
                                ) : <span className="text-muted-foreground/30 font-mono text-xs">—</span>}
                              </td>
                              <td className="px-4 py-3.5">
                                {result.followingCount != null
                                  ? <span className="font-mono font-semibold text-sm">{formatCount(result.followingCount)}</span>
                                  : <span className="text-muted-foreground/30 font-mono text-xs">—</span>}
                              </td>
                              <td className="px-4 py-3.5">
                                {result.createdAt ? (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5 opacity-60" />
                                    <span className="font-mono">{formatDate(result.createdAt)}</span>
                                  </div>
                                ) : <span className="text-muted-foreground/30 font-mono text-xs">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {results.length > 0 && (
              <AdBanner slot="2222222222" format="auto" className="rounded-xl overflow-hidden" />
            )}
          </TabsContent>

          {/* ── Profile Links ── */}
          <TabsContent value="links" className="space-y-5 mt-0">
            <Card className="border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Profile Link Generator</CardTitle>
                <CardDescription className="mt-1">Enter one or more usernames and get their direct X profile links instantly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={profileInput}
                  onChange={(e) => setProfileInput(e.target.value)}
                  placeholder={"@elonmusk\njack\nsama"}
                  className="min-h-[120px] font-mono text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40 placeholder:text-muted-foreground/40"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{profileUsernames.length} username{profileUsernames.length !== 1 ? "s" : ""}</span>
                  {profileLinks.length > 1 && (
                    <Button variant="outline" size="sm" onClick={handleCopyAllLinks} className="text-xs border-border/60">
                      <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy All
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            {profileLinks.length > 0 && (
              <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
                <CardContent className="pt-5">
                  <div className="space-y-2">
                    {profileLinks.map(({ username, url }) => (
                      <div key={username} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/50 px-4 py-3 group hover:border-primary/30 hover:bg-muted/20 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-muted/60 border border-border/50 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-muted-foreground font-mono">{username.substring(0, 1).toUpperCase()}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-foreground font-mono">@{username}</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary/80 hover:text-primary hover:underline flex items-center gap-1 truncate transition-colors">
                              {url}<ExternalLink className="h-2.5 w-2.5 opacity-60 shrink-0" />
                            </a>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleCopyLink(url)} className="text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border border-transparent hover:border-border/60">
                          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Bio Generator ── */}
          <TabsContent value="bio" className="space-y-5 mt-0">
            {groqKeys.length === 0 && (
              <div className="rounded-xl border border-warning/25 bg-warning/5 px-4 py-3.5 flex items-start gap-3 text-sm text-warning">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>No Groq API key found. Go to the <strong>Settings</strong> tab to add one before generating bios.</span>
              </div>
            )}
            <Card className="border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">X Bio Generator</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Describe yourself or your niche and get 3 ready-to-use bios instantly.
                      {groqKeys.length > 1 && <span className="ml-1 text-primary/80">{groqKeys.length} keys active.</span>}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Topic / Niche</label>
                  <Input value={bioTopic} onChange={(e) => setBioTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleGenerateBio()} placeholder="e.g. web3 gaming, crypto trader, fitness coach..." className="font-mono text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Tone <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span></label>
                  <Input value={bioTone} onChange={(e) => setBioTone(e.target.value)} placeholder="e.g. professional, funny, bold, mysterious..." className="font-mono text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40" />
                </div>
                <div className="flex justify-end pt-1">
                  <Button onClick={handleGenerateBio} disabled={bioLoading || !bioTopic.trim() || groqKeys.length === 0} className="text-xs min-w-[150px] shadow-sm shadow-primary/20">
                    {bioLoading ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Generating...</> : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Generate Bios</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {bios.length > 0 && (
              <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold">Generated Bios</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleGenerateBio} disabled={bioLoading} className="text-xs opacity-70 hover:opacity-100 border border-transparent hover:border-border/60">
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Regenerate
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bios.map((bio, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-background/50 px-4 py-3.5 group hover:border-primary/25 hover:bg-muted/20 transition-all">
                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold font-mono text-muted-foreground uppercase tracking-wider bg-muted/60 px-2 py-0.5 rounded-full">Option {i + 1}</span>
                          <span className="text-[10px] font-mono text-muted-foreground/50">{bio.length}/160</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{bio}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(bio); toast({ title: "Copied!", description: "Bio copied to clipboard." }); }} className="text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1 border border-transparent hover:border-border/60">
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── @ Formatter ── */}
          <TabsContent value="at" className="space-y-5 mt-0">
            <Card className="border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center">
                    <AtSign className="h-4 w-4 text-foreground/70" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">@ Formatter</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Bulk add or remove the @ prefix from a list of usernames.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant={atMode === "add" ? "default" : "outline"} size="sm" onClick={() => setAtMode("add")} className="text-xs">
                    <AtSign className="h-3.5 w-3.5 mr-1.5" /> Add @
                  </Button>
                  <Button variant={atMode === "remove" ? "default" : "outline"} size="sm" onClick={() => setAtMode("remove")} className="text-xs border-border/60">
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove @
                  </Button>
                </div>
                <Textarea value={atInput} onChange={(e) => setAtInput(e.target.value)} placeholder={"elonmusk\n@jack\nsama"} className="min-h-[150px] font-mono text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40 placeholder:text-muted-foreground/40" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{atLines.length} username{atLines.length !== 1 ? "s" : ""}</span>
                  <Button variant="outline" size="sm" disabled={!atLines.length} onClick={() => setAtInput("")} className="text-xs border-border/60">
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
            {atOutput.length > 0 && (
              <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-semibold">Result</CardTitle>
                    <CardDescription className="text-xs">@ {atMode === "add" ? "added to" : "removed from"} {atOutput.length} username{atOutput.length !== 1 ? "s" : ""}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(atOutput.join("\n")); toast({ title: "Copied!", description: `${atOutput.length} usernames copied.` }); }} className="text-xs border-border/60">
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border/50 bg-background/40 p-4 max-h-72 overflow-y-auto">
                    <ul className="space-y-1.5">
                      {atOutput.map((u, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 group">
                          <span className="font-mono text-sm text-foreground">{u}</span>
                          <button type="button" onClick={() => { navigator.clipboard.writeText(u); toast({ title: "Copied!", description: u }); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60" title="Copy">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Settings ── */}
          <TabsContent value="settings" className="space-y-5 mt-0">
            <Card className="border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center">
                    <KeyRound className="h-4 w-4 text-foreground/70" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Groq API Keys</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Add up to {MAX_KEYS} keys. They rotate automatically to avoid rate limits.{" "}
                      <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                        Get a free key <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {groqKeys.length < MAX_KEYS && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input type={showNewKey ? "text" : "password"} value={newKey} onChange={(e) => setNewKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKey()} placeholder="gsk_••••••••••••••••••••••••••••••" className="font-mono text-sm bg-background/60 border-border/60 pr-10 focus-visible:ring-primary/40" />
                      <button type="button" onClick={() => setShowNewKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showNewKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button onClick={addKey} disabled={!newKey.trim()} className="text-xs shrink-0 shadow-sm shadow-primary/20">
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Key
                    </Button>
                  </div>
                )}
                {groqKeys.length >= MAX_KEYS && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary/80 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Maximum of {MAX_KEYS} keys reached. Remove one to add another.
                  </div>
                )}
                {groqKeys.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Saved Keys ({groqKeys.length}/{MAX_KEYS})</span>
                      {groqKeys.length > 1 && <span className="text-xs text-muted-foreground flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Round-robin active</span>}
                    </div>
                    {groqKeys.map((key, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 px-4 py-3 group hover:border-border/80 transition-colors">
                        <div className="h-7 w-7 rounded-md bg-muted/60 border border-border/50 flex items-center justify-center shrink-0">
                          <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="flex-1 font-mono text-sm text-foreground/80 truncate">{maskKey(key)}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeKey(i)} className="h-7 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 px-6 py-10 text-center space-y-2">
                    <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center mx-auto">
                      <KeyRound className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No API keys saved yet</p>
                    <p className="text-xs text-muted-foreground/60">Add a Groq API key above to start generating bios.</p>
                  </div>
                )}
                <div className="rounded-lg border border-border/40 bg-muted/10 px-4 py-3.5 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground/70">How key rotation works</p>
                  <p className="leading-relaxed">Each bio generation uses the next key in the list (round-robin). If one key hits its rate limit, the next will be used automatically on the next attempt.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom ad */}
        <div className="mt-8">
          <AdBanner slot="3333333333" format="horizontal" className="rounded-xl overflow-hidden" />
        </div>
      </div>
    </Layout>
  );
}
