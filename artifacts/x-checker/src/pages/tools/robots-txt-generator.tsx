import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Copy, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

interface Rule {
  id: number;
  type: "allow" | "disallow";
  path: string;
}

interface BotConfig {
  userAgent: string;
  rules: Rule[];
  crawlDelay: string;
}

let nextId = 1;

const PRESET_BOTS = [
  { label: "All bots (*)", value: "*" },
  { label: "Googlebot", value: "Googlebot" },
  { label: "Bingbot", value: "Bingbot" },
  { label: "Slurp (Yahoo)", value: "Slurp" },
  { label: "DuckDuckBot", value: "DuckDuckBot" },
  { label: "GPTBot (OpenAI)", value: "GPTBot" },
  { label: "ClaudeBot (Anthropic)", value: "ClaudeBot" },
  { label: "CCBot", value: "CCBot" },
];

const COMMON_DISALLOW = ["/admin", "/login", "/api/", "/wp-admin/", "/private/", "/*.json$", "/search?", "/tmp/"];

const faqs = [
  { q: "What is a robots.txt file?", a: "A robots.txt file is a plain text file placed at the root of your website (e.g., example.com/robots.txt) that instructs search engine crawlers which pages or sections to crawl and which to skip. It's part of the Robots Exclusion Standard." },
  { q: "Does robots.txt prevent indexing?", a: "No — robots.txt controls crawling, not indexing. A page can appear in search results even if its crawling is blocked, if other pages link to it. To prevent indexing, use the 'noindex' meta tag or X-Robots-Tag HTTP header." },
  { q: "What is the difference between Allow and Disallow?", a: "Disallow tells a bot not to crawl a specific path. Allow overrides a broader Disallow rule for a more specific path. For example, you can Disallow /private/ but Allow /private/public-page.html to selectively open one page within a blocked directory." },
  { q: "What is Crawl-delay?", a: "Crawl-delay specifies the number of seconds a bot should wait between requests to your server. This is useful for limiting crawler load on small or slow servers. Note: Googlebot ignores crawl-delay — use Google Search Console to control Googlebot's crawl rate instead." },
  { q: "Should I block AI bots like GPTBot?", a: "That depends on your preferences. GPTBot (OpenAI) and ClaudeBot (Anthropic) are used to collect training data for AI models. Adding 'Disallow: /' for these bots prevents your content from being used in AI training. Many site owners are choosing to do this." },
  { q: "Where should I put the robots.txt file?", a: "Always at the root of your domain: https://yourdomain.com/robots.txt. It must be accessible without authentication. Place the Sitemap directive at the bottom pointing to your XML sitemap URL." },
];

const relatedTools = [
  { title: "Meta Tag Generator", href: "/tools/meta-tag-generator", description: "Generate SEO title, description, and Open Graph tags." },
  { title: "URL Slug Generator", href: "/tools/url-slug-generator", description: "Convert titles into clean SEO-friendly URLs." },
  { title: "Sitemap Validator", href: "/tools/sitemap-validator", description: "Validate your XML sitemap structure." },
];

export default function RobotsTxtGenerator() {
  const [bots, setBots] = useState<BotConfig[]>([
    { userAgent: "*", rules: [{ id: nextId++, type: "disallow", path: "/admin" }, { id: nextId++, type: "disallow", path: "/private/" }], crawlDelay: "" },
  ]);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [expandedBot, setExpandedBot] = useState(0);
  const { toast } = useToast();
  useToolView("robots-txt-generator");

  const output = useMemo(() => {
    const lines: string[] = [];
    bots.forEach(bot => {
      lines.push(`User-agent: ${bot.userAgent}`);
      if (bot.crawlDelay) lines.push(`Crawl-delay: ${bot.crawlDelay}`);
      bot.rules.forEach(r => {
        lines.push(`${r.type === "allow" ? "Allow" : "Disallow"}: ${r.path}`);
      });
      if (bot.rules.length === 0) lines.push("Allow: /");
      lines.push("");
    });
    if (sitemapUrl) lines.push(`Sitemap: ${sitemapUrl}`);
    return lines.join("\n").trim();
  }, [bots, sitemapUrl]);

  const addBot = () => {
    setBots(b => [...b, { userAgent: "Googlebot", rules: [], crawlDelay: "" }]);
    setExpandedBot(bots.length);
  };

  const removeBot = (i: number) => setBots(b => b.filter((_, idx) => idx !== i));

  const updateBot = (i: number, updates: Partial<BotConfig>) =>
    setBots(b => b.map((bot, idx) => idx === i ? { ...bot, ...updates } : bot));

  const addRule = (i: number, type: "allow" | "disallow", path = "") =>
    updateBot(i, { rules: [...bots[i].rules, { id: nextId++, type, path }] });

  const updateRule = (bi: number, rid: number, updates: Partial<Rule>) =>
    updateBot(bi, { rules: bots[bi].rules.map(r => r.id === rid ? { ...r, ...updates } : r) });

  const removeRule = (bi: number, rid: number) =>
    updateBot(bi, { rules: bots[bi].rules.filter(r => r.id !== rid) });

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "robots.txt content copied to clipboard." });
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "robots.txt"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "robots.txt saved." });
  };

  return (
    <MiniToolLayout
      seoTitle="Robots.txt Generator — Free SEO Robots File Builder"
      seoDescription="Generate a valid robots.txt file for your website. Block specific bots, set crawl rules, add your sitemap URL. Download or copy in one click."
      icon={Shield}
      badge="SEO Tool"
      title="Robots.txt Generator"
      description="Build a valid robots.txt file for your website. Configure crawl rules for any bot, set crawl delays, block AI scrapers, and add your sitemap URL. Download or copy in seconds."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="analytics"
    >
      <div className="space-y-5">
        {/* Bot configs */}
        <div className="space-y-3">
          {bots.map((bot, bi) => (
            <div key={bi} className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedBot(expandedBot === bi ? -1 : bi)}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-pink-400" />
                  <span className="text-sm font-medium font-mono">{bot.userAgent || "Select a bot"}</span>
                  <span className="text-xs text-muted-foreground/60">{bot.rules.length} rule{bot.rules.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  {bots.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); removeBot(bi); }}
                      className="p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {expandedBot === bi ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {expandedBot === bi && (
                <div className="px-4 pb-4 space-y-4 border-t border-border/40">
                  <div className="grid sm:grid-cols-2 gap-3 pt-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">User-agent</label>
                      <select
                        value={bot.userAgent}
                        onChange={e => updateBot(bi, { userAgent: e.target.value })}
                        className="w-full text-sm rounded-lg border border-border/60 bg-background/60 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
                      >
                        {PRESET_BOTS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Crawl-delay (seconds)</label>
                      <Input
                        type="number"
                        value={bot.crawlDelay}
                        onChange={e => updateBot(bi, { crawlDelay: e.target.value })}
                        placeholder="e.g. 2 (optional)"
                        className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rules</label>
                    {bot.rules.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No rules — all paths are allowed.</p>
                    )}
                    {bot.rules.map(rule => (
                      <div key={rule.id} className="flex items-center gap-2">
                        <select
                          value={rule.type}
                          onChange={e => updateRule(bi, rule.id, { type: e.target.value as "allow" | "disallow" })}
                          className={`text-xs rounded-lg border px-2 py-1.5 font-medium focus:outline-none shrink-0 ${
                            rule.type === "allow"
                              ? "border-green-500/30 text-green-400 bg-green-500/10"
                              : "border-red-500/30 text-red-400 bg-red-500/10"
                          }`}
                        >
                          <option value="allow">Allow</option>
                          <option value="disallow">Disallow</option>
                        </select>
                        <Input
                          value={rule.path}
                          onChange={e => updateRule(bi, rule.id, { path: e.target.value })}
                          placeholder="/path/"
                          className="text-sm font-mono bg-background/60 border-border/60 focus-visible:ring-primary/40 h-8"
                        />
                        <button onClick={() => removeRule(bi, rule.id)} className="p-1.5 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => addRule(bi, "disallow")} className="text-xs border-border/60 h-7">
                        <Plus className="h-3 w-3 mr-1" /> Disallow
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addRule(bi, "allow")} className="text-xs border-border/60 h-7">
                        <Plus className="h-3 w-3 mr-1" /> Allow
                      </Button>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_DISALLOW.map(path => (
                          <button
                            key={path}
                            onClick={() => addRule(bi, "disallow", path)}
                            className="text-[10px] px-2 py-1 rounded-md border border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border transition-colors font-mono"
                          >
                            {path}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addBot} className="text-xs border-border/60 w-full">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add User-agent Block
          </Button>
        </div>

        {/* Sitemap URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sitemap URL <span className="text-muted-foreground/50 font-normal normal-case">(optional)</span></label>
          <Input
            value={sitemapUrl}
            onChange={e => setSitemapUrl(e.target.value)}
            placeholder="https://example.com/sitemap.xml"
            className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Generated robots.txt</label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copy} className="text-xs border-border/60 h-7">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
              <Button size="sm" onClick={download} className="text-xs h-7">
                Download
              </Button>
            </div>
          </div>
          <pre className="rounded-xl border border-border/60 bg-background/60 p-4 text-xs font-mono overflow-x-auto leading-relaxed text-muted-foreground whitespace-pre">
            {output}
          </pre>
        </div>
      </div>
    </MiniToolLayout>
  );
}
