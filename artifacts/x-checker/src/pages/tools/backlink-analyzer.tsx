import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Link2, Copy, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "What is a backlink?", a: "A backlink is a hyperlink from one website pointing to another. Backlinks are one of Google's most important ranking factors. A link from a high-authority domain like a major news site is worth far more than hundreds of links from low-quality sites." },
  { q: "What makes a backlink high quality?", a: "Quality backlinks come from high-authority domains, are editorially placed (not paid or spammy), use relevant anchor text, are from sites in your niche, and are 'do-follow' links. A single great backlink can outperform 1,000 poor ones." },
  { q: "What is anchor text and why does it matter?", a: "Anchor text is the clickable text in a hyperlink. Google uses anchor text to understand what the linked page is about. Varied anchor text (branded, natural language, target keywords) looks more natural than 100% exact-match keyword anchors." },
  { q: "How do I get more backlinks?", a: "Top strategies include creating link-worthy content (studies, tools, guides), digital PR outreach, guest posting on industry publications, broken link building, and building relationships with journalists and bloggers in your niche." },
  { q: "What are toxic backlinks and how do I remove them?", a: "Toxic backlinks come from spammy, irrelevant, or penalized sites. They can hurt your rankings. Use Google Search Console to identify them, then contact site owners to remove them. As a last resort, use Google's Disavow Tool." },
];

const relatedTools = [
  { title: "Page Speed Checker", href: "/tools/page-speed-checker", description: "Audit your website's speed and Core Web Vitals." },
  { title: "Meta Tag Generator", href: "/tools/meta-tag-generator", description: "Generate optimized SEO meta tags for any page." },
  { title: "Keyword Density Checker", href: "/tools/keyword-density", description: "Analyze keyword frequency in your content." },
];

interface BacklinkResult {
  url: string;
  domain: string;
  tld: string;
  hasHttps: boolean;
  anchorText: string;
  quality: "good" | "medium" | "poor";
  issues: string[];
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.split("/")[0].replace(/^www\./, "");
  }
}

function getTld(domain: string): string {
  const parts = domain.split(".");
  return parts[parts.length - 1].toLowerCase();
}

const QUALITY_TLDS = new Set(["com", "org", "net", "edu", "gov", "io", "co", "uk", "de", "fr", "ca", "au"]);
const SPAMMY_PATTERNS = ["casino", "poker", "bet", "loan", "pills", "pharma", "viagra", "xxx", "porn", "adult", "gambling"];

function analyzeBacklink(raw: string): BacklinkResult {
  const parts = raw.split(/\s+/);
  const url = parts[0] || raw;
  const anchorText = parts.slice(1).join(" ") || "";
  const domain = extractDomain(url);
  const tld = getTld(domain);
  const hasHttps = url.startsWith("https://");
  const issues: string[] = [];

  const isSpammy = SPAMMY_PATTERNS.some(p => domain.includes(p) || url.includes(p));
  const isQualityTld = QUALITY_TLDS.has(tld);

  if (!hasHttps) issues.push("Not HTTPS");
  if (isSpammy) issues.push("Potentially spammy domain");
  if (anchorText && /^https?:\/\//.test(anchorText)) issues.push("URL used as anchor text");
  if (anchorText && anchorText.length > 80) issues.push("Anchor text too long");
  if (!anchorText) issues.push("No anchor text provided");
  if (!isQualityTld) issues.push("Uncommon TLD");

  const quality: "good" | "medium" | "poor" =
    isSpammy || issues.length >= 3 ? "poor" :
    issues.length >= 1 ? "medium" : "good";

  return { url, domain, tld, hasHttps, anchorText, quality, issues };
}

const QUALITY_STYLES = {
  good: { label: "Good", color: "text-green-400", bg: "bg-green-500/5 border-green-500/20", dot: "bg-green-400" },
  medium: { label: "Review", color: "text-yellow-400", bg: "bg-yellow-500/5 border-yellow-500/20", dot: "bg-yellow-400" },
  poor: { label: "Poor", color: "text-red-400", bg: "bg-red-500/5 border-red-500/20", dot: "bg-red-400" },
};

export default function BacklinkAnalyzer() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<BacklinkResult[]>([]);
  const { toast } = useToast();
  useToolView("backlink-analyzer");

  const analyze = () => {
    const lines = input.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setResults(lines.slice(0, 50).map(analyzeBacklink));
  };

  const good = results.filter(r => r.quality === "good").length;
  const medium = results.filter(r => r.quality === "medium").length;
  const poor = results.filter(r => r.quality === "poor").length;

  const copyReport = () => {
    const text = results.map(r => `[${r.quality.toUpperCase()}] ${r.domain} — ${r.issues.length ? r.issues.join(", ") : "No issues"}`).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Backlink report copied to clipboard." });
  };

  return (
    <MiniToolLayout
      seoTitle="Backlink Analyzer — Analyze & Audit Your Backlink Profile Free"
      seoDescription="Paste your backlinks and get an instant quality analysis. Check for HTTPS, anchor text quality, spammy patterns, and TLD quality. Free backlink audit tool, no login."
      icon={Link2}
      badge="SEO Tool"
      title="Backlink Analyzer"
      description="Paste a list of backlinks (one per line, optionally with anchor text) and get an instant quality analysis — HTTPS check, anchor text review, spam detection, and more."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="analytics"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Backlinks (one per line)</label>
            <span className="text-xs text-muted-foreground">Max 50 links</span>
          </div>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`https://example.com/your-article anchor text here\nhttps://blog.site.com/post keyword phrase\nhttps://news.org/article`}
            className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40 font-mono resize-none"
            rows={6}
          />
          <p className="text-xs text-muted-foreground">Format: URL (space) optional anchor text — e.g. <code className="bg-muted/40 px-1 rounded">https://site.com/page your brand name</code></p>
        </div>

        <Button onClick={analyze} disabled={!input.trim()} className="w-full">
          <Link2 className="h-4 w-4 mr-2" /> Analyze Backlinks
        </Button>

        {results.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Good", count: good, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                { label: "Review", count: medium, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
                { label: "Poor", count: poor, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
              ].map(({ label, count, color, bg }) => (
                <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
                  <div className={`text-2xl font-bold ${color}`}>{count}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={copyReport} className="border-border/60 gap-1.5 text-xs h-7">
                <Copy className="h-3 w-3" /> Copy Report
              </Button>
            </div>

            <div className="space-y-2">
              {results.map((r, i) => {
                const s = QUALITY_STYLES[r.quality];
                return (
                  <div key={i} className={`rounded-xl border p-3 ${s.bg}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                          <span className="text-sm font-medium truncate">{r.domain}</span>
                          <span className={`text-[10px] font-semibold ${s.color}`}>{s.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground/60 font-mono truncate ml-4">{r.url}</div>
                        {r.anchorText && <div className="text-xs text-muted-foreground ml-4 mt-0.5">Anchor: <span className="text-foreground/80">"{r.anchorText}"</span></div>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {r.hasHttps ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" title="HTTPS" /> : <XCircle className="h-3.5 w-3.5 text-red-400" title="No HTTPS" />}
                      </div>
                    </div>
                    {r.issues.length > 0 && (
                      <div className="ml-4 mt-1.5 flex flex-wrap gap-1">
                        {r.issues.map(issue => (
                          <span key={issue} className="text-[10px] bg-muted/30 border border-border/40 text-muted-foreground rounded px-1.5 py-0.5 flex items-center gap-1">
                            <AlertCircle className="h-2.5 w-2.5" />{issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
