import { useState } from "react";
import { useCheckAccounts, type AccountCheckResult } from "@workspace/api-client-react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2, Copy, Trash2, CheckCircle2, XCircle, HelpCircle,
  UserX, AlertCircle, BadgeCheck, ExternalLink, Users, Calendar,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

const FAQS = [
  { q: "How many accounts can I check at once?", a: "Up to 100 usernames in a single batch — all checked in parallel. Results come back in seconds." },
  { q: "Do I need an X / Twitter account to use this?", a: "No. The tool uses X's public guest API — no login, no API key, no signup required." },
  { q: "What do the statuses mean?", a: "Active = the account is live. Suspended = X has suspended the account. Not Found = the username doesn't exist or has been deleted." },
  { q: "Is my data stored or shared?", a: "No. Usernames are sent to our server only to proxy the X API call and are never logged or stored." },
  { q: "Why might an account show as Unknown?", a: "X's API occasionally returns an ambiguous response — usually due to rate limits or temporary issues. Try again in a few seconds." },
  { q: "Can I export the results?", a: "Yes — click Copy to copy the full results as tab-separated text you can paste directly into a spreadsheet." },
];

export default function XAccountChecker() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<AccountCheckResult[]>([]);
  const { toast } = useToast();
  const checkAccountsMutation = useCheckAccounts();

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
    trackEvent("account_check", { label: String(usernames.length) });
    checkAccountsMutation.mutate(
      { data: { usernames } },
      {
        onSuccess: (data) => {
          setResults(data.results);
          toast({ title: "Check complete", description: `Checked ${data.results.length} accounts.` });
        },
        onError: (error) => {
          const msg = (error as { data?: { error?: string } }).data?.error
            ?? (error as Error).message
            ?? "An unexpected error occurred.";
          toast({ title: "Error", description: msg, variant: "destructive" });
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
    <MiniToolLayout
      seoTitle="X Account Checker — Bulk Check X / Twitter Account Status Free"
      seoDescription="Check if X (Twitter) accounts are active, suspended, or deleted. Paste up to 100 usernames and get instant results. Free, no login required."
      icon={Search}
      badge="Popular"
      title="X Account Checker"
      description="Bulk-check up to 100 X accounts — active, suspended, or deleted — in seconds. No login required."
      faqs={FAQS}
      affiliateCategory="growth"
      relatedTools={[
        { title: "Profile Link Generator", href: "/tools/profile-link-generator", description: "Convert usernames to X profile links instantly." },
        { title: "@ Formatter", href: "/tools/at-formatter", description: "Bulk add or remove the @ prefix from username lists." },
        { title: "AI Bio Generator", href: "/tools/bio-generator", description: "Generate professional X bios with AI." },
        { title: "Username Generator", href: "/tools/username-generator", description: "Generate unique X handle ideas for any niche." },
      ]}
    >
      <div className="space-y-5">
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
            <CardContent className="p-0">
              {/* ── Mobile: card list ── */}
              <div className="sm:hidden divide-y divide-border/40">
                {results.map((r) => (
                  <div key={r.username} className="px-4 py-3.5 flex flex-col gap-2.5">
                    {/* Top row: avatar + name + status */}
                    <div className="flex items-center gap-3">
                      {r.status === "active" && r.profileImageUrl ? (
                        <a
                          href={`https://x.com/${r.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 ring-0 hover:ring-2 hover:ring-primary/40 rounded-full transition-all"
                          title={`View @${r.username} on X`}
                        >
                          <Avatar className="h-10 w-10 border border-border/50">
                            <AvatarImage src={r.profileImageUrl} alt={r.username} />
                            <AvatarFallback className="text-xs bg-muted">{r.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </a>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted/60 border border-border/50 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-muted-foreground">{r.username[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-semibold text-sm">@{r.username}</span>
                          {r.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </div>
                        {r.displayName && (
                          <div className="text-xs text-muted-foreground truncate">{r.displayName}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {getStatusIcon(r.status)}
                        {getStatusBadge(r.status)}
                      </div>
                    </div>
                    {/* Stats row */}
                    {r.status === "active" && (r.followerCount != null || r.followingCount != null || r.createdAt) && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pl-1 flex-wrap">
                        {r.followerCount != null && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="text-foreground font-medium">{formatCount(r.followerCount)}</span> followers
                          </span>
                        )}
                        {r.followingCount != null && (
                          <span className="flex items-center gap-1">
                            <span className="text-foreground font-medium">{formatCount(r.followingCount)}</span> following
                          </span>
                        )}
                        {r.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {formatDate(r.createdAt)}
                          </span>
                        )}
                        {r.status === "active" && (
                          <a
                            href={`https://x.com/${r.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline ml-auto"
                          >
                            <ExternalLink className="h-3 w-3" /> View profile
                          </a>
                        )}
                      </div>
                    )}
                    {r.status !== "active" && (
                      <div className="text-xs text-muted-foreground/50 pl-1">No additional data available</div>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Desktop: table ── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Followers</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Following</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Joined</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {results.map((r) => (
                      <tr key={r.username} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {r.status === "active" && r.profileImageUrl ? (
                              <a
                                href={`https://x.com/${r.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 ring-0 hover:ring-2 hover:ring-primary/40 rounded-full transition-all"
                                title={`View @${r.username} on X`}
                              >
                                <Avatar className="h-8 w-8 border border-border/50">
                                  <AvatarImage src={r.profileImageUrl} alt={r.username} />
                                  <AvatarFallback className="text-[10px] bg-muted">{r.username[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                              </a>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted/60 border border-border/50 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-medium text-muted-foreground">{r.username[0]?.toUpperCase()}</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-medium truncate text-[13px]">@{r.username}</span>
                                {r.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                              </div>
                              {r.displayName && (
                                <div className="text-xs text-muted-foreground truncate">{r.displayName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(r.status)}
                            {getStatusBadge(r.status)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {r.followerCount != null ? (
                            <span className="flex items-center gap-1.5 text-sm text-foreground/80">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatCount(r.followerCount)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.followingCount != null ? (
                            <span className="text-sm text-foreground/80">{formatCount(r.followingCount)}</span>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {r.createdAt ? (
                            <span className="flex items-center gap-1.5 text-sm text-foreground/80">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatDate(r.createdAt)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs">—</span>
                          )}
                        </td>
                        <td className="pr-3 py-3">
                          {r.status === "active" && (
                            <a
                              href={`https://x.com/${r.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors opacity-0 group-hover:opacity-100 inline-flex"
                              title="Open profile"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              {(checkAccountsMutation.error as { data?: { error?: string } } | null)?.data?.error
                ?? (checkAccountsMutation.error as Error | null)?.message
                ?? "Something went wrong. Please try again."}
            </p>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
