import { useState } from "react";
import { Link } from "wouter";
import { useSearchParams } from "@/hooks/use-search-params";
import { useCheckAccounts, type AccountCheckResult } from "@workspace/api-client-react";
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
  Sparkles, RefreshCw, AtSign, Search,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToolCard } from "@/components/ToolCard";
import {
  ALL_TOOLS, CATEGORIES, searchTools, getToolsByCategory,
  type Tool, type CategoryKey,
} from "@/lib/tools-registry";
import { trackEvent } from "@/lib/analytics";

const CATEGORY_TABS = [
  { key: "all", label: "All Tools" },
  { key: "social-media", label: "Social Media" },
  { key: "ai-writing", label: "AI Writing" },
  { key: "text-formatting", label: "Text & Format" },
  { key: "developer", label: "Developer" },
  { key: "seo", label: "SEO" },
] as const;

const MORE_CATEGORY_KEYS: CategoryKey[] = [
  "ai-writing",
  "text-formatting",
  "developer",
  "seo",
];

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

  // ── X Account Tools state ─────────────────────────────────────────
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

  // ── Search + category filter state ───────────────────────────────
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredTools: Tool[] = search.trim()
    ? searchTools(search)
    : activeCategory === "all"
    ? ALL_TOOLS.filter((t) => !t.isComingSoon)
    : (getToolsByCategory(activeCategory as CategoryKey) as Tool[]).filter((t) => !t.isComingSoon);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleGenerateBio = async () => {
    if (!bioTopic.trim()) {
      toast({ title: "Enter a topic", description: "Tell us what your bio should be about.", variant: "destructive" });
      return;
    }
    setBioLoading(true);
    setBios([]);
    try {
      const res = await fetch("/api/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: bioTopic, tone: bioTone }),
      });
      const data = await res.json();
      if (res.status === 429) {
        toast({ title: "Too many requests", description: data.error ?? "Please try again in a moment.", variant: "destructive" });
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
          toast({ title: "Error", description: (error as { error?: { error?: string } }).error?.error ?? "An unexpected error occurred.", variant: "destructive" });
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

  // ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

        {/* ── Page header + search ── */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1.5">Tools Hub</h1>
          <p className="text-muted-foreground text-sm mb-5">
            Search or browse by category — everything is free, no signup required.
          </p>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value.length > 2) trackEvent("tool_search", { label: e.target.value });
              }}
              placeholder="Search tools… (e.g. JSON, bio, base64)"
              className="pl-10 bg-background/60 border-border/60 focus-visible:ring-primary/40 h-11 text-sm"
            />
          </div>

          {/* Category filter chips */}
          {!search && (
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key);
                    if (key !== "all") trackEvent("category_click", { label });
                  }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    activeCategory === key
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border bg-muted/30 hover:bg-muted/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Search results view ── */}
        {search.trim() ? (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm text-muted-foreground">
                {filteredTools.length} result{filteredTools.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
              </span>
              <button onClick={() => setSearch("")} className="text-xs text-primary hover:underline">Clear</button>
            </div>
            {filteredTools.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-card/40 p-10 text-center">
                <p className="text-muted-foreground text-sm">No tools found for &ldquo;{search}&rdquo;. Try a different term.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>

        ) : activeCategory !== "all" && activeCategory !== "social-media" ? (
          /* ── Category filter view (non-X categories) ── */
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-sm font-semibold text-foreground/70 shrink-0">
                {CATEGORIES[activeCategory as CategoryKey]?.label ?? "Tools"}
              </h2>
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground/50">{filteredTools.length} tools</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>

        ) : (
          /* ── Default view: X Account Tools tabs + more ── */
          <>
            {/* X Account Tools tabs */}
            <div className="mb-2">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-sm font-semibold text-foreground/70 shrink-0">X Account Tools</h2>
                <div className="flex-1 h-px bg-border/50" />
              </div>
            </div>

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
                  <span className="hidden sm:inline">@ Formatter</span>
                  <span className="sm:hidden">Format</span>
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
                      placeholder={"elonmusk\n@jack\nsama\nOpenAI"}
                      className="min-h-[140px] font-mono text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40 placeholder:text-muted-foreground/40"
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleCheck}
                        disabled={checkAccountsMutation.isPending || !input.trim()}
                        className="flex-1 shadow-sm shadow-primary/15"
                      >
                        {checkAccountsMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking…</>
                        ) : (
                          <><Search className="h-4 w-4 mr-2" /> Check Status</>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleClear} disabled={!input && !results.length} className="border-border/60 text-xs">
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Results */}
                {results.length > 0 && (
                  <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <CardTitle className="text-base font-semibold">Results</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-3">
                          <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> {activeCount} active</span>
                          <span className="flex items-center gap-1 text-destructive"><XCircle className="h-3 w-3" /> {suspendedCount} suspended</span>
                          <span className="flex items-center gap-1 text-muted-foreground"><UserX className="h-3 w-3" /> {notFoundCount} not found</span>
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleCopyResults} className="text-xs border-border/60">
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {results.map((r) => (
                        <div key={r.username} className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/40 px-3 py-2.5">
                          {r.status === "active" && r.profileImageUrl ? (
                            <Avatar className="h-8 w-8 border border-border/50 shrink-0">
                              <AvatarImage src={r.profileImageUrl} alt={r.username} />
                              <AvatarFallback className="text-[10px] bg-muted">{r.username[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted/60 border border-border/50 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-medium text-muted-foreground">{r.username[0]?.toUpperCase()}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium truncate">@{r.username}</span>
                              {r.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                            </div>
                            {r.displayName && <div className="text-xs text-muted-foreground truncate">{r.displayName}</div>}
                            {r.followerCount != null && (
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Users className="h-2.5 w-2.5" /> {formatCount(r.followerCount)}
                                </span>
                                {r.createdAt && (
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-2.5 w-2.5" /> {formatDate(r.createdAt)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getStatusIcon(r.status)}
                            {getStatusBadge(r.status)}
                            {r.status === "active" && (
                              <a href={`https://x.com/${r.username}`} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {checkAccountsMutation.isPending && (
                  <div className="flex items-center justify-center gap-2.5 py-8 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Checking accounts…</span>
                  </div>
                )}

                {checkAccountsMutation.isError && !results.length && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 p-4">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">
                      {(checkAccountsMutation.error as { error?: { error?: string } } | null)?.error?.error ?? "Something went wrong. Please try again."}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* ── Profile Link Generator ── */}
              <TabsContent value="links" className="space-y-5 mt-0">
                <Card className="border-border/60 bg-card shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">Profile Link Generator</CardTitle>
                    <CardDescription>Paste usernames to generate X profile links instantly.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea value={profileInput} onChange={(e) => setProfileInput(e.target.value)} placeholder={"elonmusk\n@jack\nsama"} className="min-h-[120px] font-mono text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40 placeholder:text-muted-foreground/40" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{profileUsernames.length} username{profileUsernames.length !== 1 ? "s" : ""}</span>
                      <Button variant="outline" size="sm" disabled={!profileLinks.length} onClick={handleCopyAllLinks} className="text-xs border-border/60">
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                {profileLinks.length > 0 && (
                  <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Generated Links</CardTitle>
                      <CardDescription className="text-xs">{profileLinks.length} profile link{profileLinks.length !== 1 ? "s" : ""}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-border/50 bg-background/40 divide-y divide-border/40 overflow-hidden">
                        {profileLinks.map(({ username, url }) => (
                          <div key={username} className="flex items-center gap-3 px-3 py-2.5 group hover:bg-muted/30 transition-colors">
                            <span className="text-sm font-medium text-foreground/80 shrink-0 w-32 truncate">@{username}</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex-1 truncate">{url}</a>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleCopyLink(url)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" title="Copy link">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" title="Open profile">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ── Bio Generator ── */}
              <TabsContent value="bio" className="space-y-5 mt-0">
                <Card className="border-border/60 bg-card shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">AI Bio Generator</CardTitle>
                    <CardDescription>Generate 3 professional X bios in seconds.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground/70">What's your niche or topic? <span className="text-destructive">*</span></label>
                      <Input value={bioTopic} onChange={(e) => setBioTopic(e.target.value)} placeholder="e.g. AI startup founder, fitness coach, crypto trader" className="bg-background/60 border-border/60 focus-visible:ring-primary/40 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground/70">Tone (optional)</label>
                      <Input value={bioTone} onChange={(e) => setBioTone(e.target.value)} placeholder="e.g. professional, witty, minimal, motivational" className="bg-background/60 border-border/60 focus-visible:ring-primary/40 text-sm" />
                    </div>
                    <Button onClick={handleGenerateBio} disabled={bioLoading || !bioTopic.trim()} className="w-full shadow-sm shadow-primary/15">
                      {bioLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Bios</>}
                    </Button>
                  </CardContent>
                </Card>
                {bios.length > 0 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    {bios.map((bio, i) => (
                      <Card key={i} className="border-border/60 bg-card shadow-sm">
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="text-xs font-medium text-muted-foreground mb-2">Bio {i + 1}</div>
                              <p className="text-sm leading-relaxed">{bio}</p>
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-[11px] text-muted-foreground">{bio.length} / 160 chars</span>
                                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(bio); toast({ title: "Copied!", description: "Bio copied to clipboard." }); }} className="text-xs border-border/60 h-7">
                                  <Copy className="h-3 w-3 mr-1.5" /> Copy
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={handleGenerateBio} disabled={bioLoading} className="w-full text-xs border-border/60">
                      <RefreshCw className="h-3.5 w-3.5 mr-2" /> Regenerate
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* ── @ Formatter ── */}
              <TabsContent value="at" className="space-y-5 mt-0">
                <Card className="border-border/60 bg-card shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">@ Formatter</CardTitle>
                    <CardDescription>Bulk add or remove the @ prefix from username lists.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      {(["add", "remove"] as const).map((mode) => (
                        <Button
                          key={mode}
                          variant={atMode === mode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAtMode(mode)}
                          className={`flex-1 text-xs ${atMode !== mode ? "border-border/60" : ""}`}
                        >
                          {mode === "add" ? "Add @" : "Remove @"}
                        </Button>
                      ))}
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
            </Tabs>

            {/* ── More Tools — registry-powered card grids ── */}
            <div className="mt-14 space-y-10">
              {MORE_CATEGORY_KEYS.map((catKey) => {
                const cat = CATEGORIES[catKey];
                const tools = getToolsByCategory(catKey);
                return (
                  <div key={catKey} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold text-foreground/70 shrink-0">{cat.label}</h2>
                      <div className="flex-1 h-px bg-border/50" />
                      <span className="text-xs text-muted-foreground/50 shrink-0">{tools.length} tools</span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Bottom ad ── */}
        <div className="mt-10">
          <AdBanner slot="3333333333" format="horizontal" className="rounded-xl overflow-hidden" />
        </div>

      </div>
    </Layout>
  );
}
