import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Globe, CheckCircle2, XCircle, AlertTriangle, Trash2, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

interface ValidationIssue {
  level: "error" | "warn" | "info";
  message: string;
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface ValidationResult {
  isValid: boolean;
  urlCount: number;
  urls: SitemapUrl[];
  issues: ValidationIssue[];
}

const VALID_CHANGEFREQS = new Set(["always","hourly","daily","weekly","monthly","yearly","never"]);

function validateSitemap(xml: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const urls: SitemapUrl[] = [];

  if (!xml.trim()) return { isValid: false, urlCount: 0, urls: [], issues: [{ level: "error", message: "No content to validate." }] };

  if (!xml.includes("<?xml")) issues.push({ level: "warn", message: "Missing XML declaration (<?xml version=\"1.0\" encoding=\"UTF-8\"?>). Recommended but not required." });

  if (!xml.includes("xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\""))
    issues.push({ level: "warn", message: "Missing sitemap namespace. Recommended: xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"" });

  if (!xml.includes("<urlset") && !xml.includes("<sitemapindex"))
    issues.push({ level: "error", message: "Missing <urlset> or <sitemapindex> root element. This is not a valid sitemap." });

  const urlMatches = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];

  urlMatches.forEach((match, i) => {
    const block = match[1];
    const locMatch = block.match(/<loc>(.*?)<\/loc>/);
    const lastmodMatch = block.match(/<lastmod>(.*?)<\/lastmod>/);
    const changefreqMatch = block.match(/<changefreq>(.*?)<\/changefreq>/);
    const priorityMatch = block.match(/<priority>(.*?)<\/priority>/);

    if (!locMatch) {
      issues.push({ level: "error", message: `URL entry #${i + 1}: Missing required <loc> element.` });
      return;
    }

    const loc = locMatch[1].trim();
    if (!loc.startsWith("http://") && !loc.startsWith("https://"))
      issues.push({ level: "error", message: `URL #${i + 1}: <loc> must start with http:// or https://. Got: "${loc.slice(0, 40)}"` });

    const entry: SitemapUrl = { loc };

    if (lastmodMatch) {
      entry.lastmod = lastmodMatch[1].trim();
      if (!/^\d{4}-\d{2}-\d{2}/.test(entry.lastmod))
        issues.push({ level: "warn", message: `URL #${i + 1}: <lastmod> should be in W3C format (YYYY-MM-DD). Got: "${entry.lastmod}"` });
    }

    if (changefreqMatch) {
      entry.changefreq = changefreqMatch[1].trim().toLowerCase();
      if (!VALID_CHANGEFREQS.has(entry.changefreq))
        issues.push({ level: "warn", message: `URL #${i + 1}: Invalid <changefreq> value "${entry.changefreq}". Must be one of: ${[...VALID_CHANGEFREQS].join(", ")}` });
    }

    if (priorityMatch) {
      entry.priority = priorityMatch[1].trim();
      const p = parseFloat(entry.priority);
      if (isNaN(p) || p < 0 || p > 1)
        issues.push({ level: "warn", message: `URL #${i + 1}: <priority> must be between 0.0 and 1.0. Got: "${entry.priority}"` });
    }

    urls.push(entry);
  });

  if (urls.length > 50000)
    issues.push({ level: "error", message: `Sitemap contains ${urls.length} URLs. Maximum allowed is 50,000 per sitemap file.` });

  if (urls.length > 45000)
    issues.push({ level: "warn", message: `You have ${urls.length} URLs. Consider splitting into a sitemap index when approaching 50,000.` });

  if (urls.length === 0 && !issues.some(i => i.level === "error"))
    issues.push({ level: "warn", message: "No <url> entries found in the sitemap." });

  if (issues.length === 0)
    issues.push({ level: "info", message: "Sitemap looks valid! All checks passed." });

  return {
    isValid: !issues.some(i => i.level === "error"),
    urlCount: urls.length,
    urls,
    issues,
  };
}

const EXAMPLE_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2024-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://example.com/blog</loc>
    <lastmod>2024-01-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

const faqs = [
  { q: "What is an XML sitemap?", a: "An XML sitemap is a file that lists all the important URLs on your website and provides metadata about each URL (last modification date, update frequency, priority). It helps search engine crawlers discover and understand your site structure more efficiently." },
  { q: "Does having a sitemap improve rankings?", a: "A sitemap doesn't directly improve rankings, but it improves crawlability — helping search engines find all your pages, especially new content or pages with few inbound links. For large sites or new sites, a sitemap is essential for complete indexing." },
  { q: "How many URLs can a sitemap have?", a: "Each sitemap file can contain a maximum of 50,000 URLs and must not exceed 50 MB uncompressed. For larger sites, create a sitemap index file that points to multiple individual sitemaps." },
  { q: "What is the correct date format for <lastmod>?", a: "The lastmod element should use W3C Datetime format. The most common form is YYYY-MM-DD (e.g., 2024-01-15). Full datetime is also valid: 2024-01-15T12:00:00+00:00. Using the correct format ensures crawlers parse it correctly." },
  { q: "Does priority in a sitemap affect Google ranking?", a: "Google has stated it mostly ignores the <priority> and <changefreq> elements because they're often set inaccurately. Focus on <loc> and <lastmod> as these are the most useful signals for crawlers." },
  { q: "Where do I submit my sitemap to Google?", a: "Submit your sitemap URL in Google Search Console under Indexing > Sitemaps. You can also reference it in your robots.txt file with a 'Sitemap: https://yourdomain.com/sitemap.xml' directive." },
];

const relatedTools = [
  { title: "Robots.txt Generator", href: "/tools/robots-txt-generator", description: "Generate a robots.txt file for your website." },
  { title: "Meta Tag Generator", href: "/tools/meta-tag-generator", description: "Generate SEO title, description, and Open Graph tags." },
  { title: "URL Slug Generator", href: "/tools/url-slug-generator", description: "Convert titles into clean SEO-friendly URLs." },
];

export default function SitemapValidator() {
  const [xml, setXml] = useState("");
  const { toast } = useToast();
  useToolView("sitemap-validator");

  const result = useMemo<ValidationResult | null>(() => xml.trim() ? validateSitemap(xml) : null, [xml]);

  const loadExample = () => setXml(EXAMPLE_SITEMAP);

  const copyFixed = () => {
    navigator.clipboard.writeText(xml);
    toast({ title: "Copied!" });
  };

  return (
    <MiniToolLayout
      seoTitle="XML Sitemap Validator — Check & Debug Your Sitemap File"
      seoDescription="Paste your XML sitemap and instantly validate structure, required tags, URL formats, date formats, and count. Free, browser-based, no signup."
      icon={Globe}
      badge="SEO Tool"
      title="Sitemap Validator"
      description="Paste your XML sitemap to validate its structure. Checks required tags, URL formats, date formats, changefreq values, priority ranges, and URL count limits — all in your browser."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="analytics"
    >
      <div className="space-y-5">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Sitemap XML</label>
            <div className="flex gap-2">
              <button onClick={loadExample} className="text-xs text-primary hover:underline flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Load example
              </button>
              <button onClick={() => setXml("")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>
          <Textarea
            value={xml}
            onChange={e => setXml(e.target.value)}
            placeholder={"Paste your sitemap XML here...\n\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://example.com/</loc>\n  </url>\n</urlset>"}
            className="min-h-[220px] text-sm font-mono bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40"
          />
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Summary */}
            <div className={`rounded-xl border p-4 flex items-start gap-3 ${
              result.isValid ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
            }`}>
              {result.isValid
                ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
              <div>
                <div className="text-sm font-semibold">
                  {result.isValid ? "Valid Sitemap" : "Sitemap has errors"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {result.urlCount} URL{result.urlCount !== 1 ? "s" : ""} found ·{" "}
                  {result.issues.filter(i => i.level === "error").length} errors ·{" "}
                  {result.issues.filter(i => i.level === "warn").length} warnings
                </div>
              </div>
            </div>

            {/* Issues */}
            <div className="space-y-2">
              {result.issues.map((issue, i) => (
                <div key={i} className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs ${
                  issue.level === "error" ? "border-red-500/20 bg-red-500/5 text-red-400" :
                  issue.level === "warn" ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400" :
                  "border-green-500/20 bg-green-500/5 text-green-400"
                }`}>
                  {issue.level === "error" && <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                  {issue.level === "warn" && <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                  {issue.level === "info" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>

            {/* URL list */}
            {result.urls.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    URLs ({result.urls.length})
                  </label>
                  <button onClick={copyFixed} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Copy className="h-3 w-3" /> Copy XML
                  </button>
                </div>
                <div className="rounded-xl border border-border/60 overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/30 border-b border-border/60 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground">URL</th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground hidden md:table-cell">Last Modified</th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground hidden sm:table-cell">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.urls.slice(0, 100).map((u, i) => (
                        <tr key={i} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="px-3 py-2 font-mono text-muted-foreground truncate max-w-[200px] md:max-w-none">
                            <a href={u.loc} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                              {u.loc}
                            </a>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground/70 hidden md:table-cell">{u.lastmod ?? "—"}</td>
                          <td className="px-3 py-2 text-muted-foreground/70 hidden sm:table-cell">{u.priority ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.urls.length > 100 && (
                    <div className="px-3 py-2 text-center text-xs text-muted-foreground/60 bg-muted/20">
                      Showing first 100 of {result.urls.length} URLs
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {!xml && (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 p-8 text-center space-y-2">
            <Globe className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground/50">Paste your XML sitemap above to validate it</p>
            <button onClick={loadExample} className="text-xs text-primary hover:underline">
              Or load an example sitemap
            </button>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
