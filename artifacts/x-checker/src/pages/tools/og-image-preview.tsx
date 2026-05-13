import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { Globe, Search, Copy, ExternalLink, AlertCircle, ImageOff, Twitter, Facebook, Linkedin } from "lucide-react";

interface OgResult {
  url: string;
  favicon: string;
  page: { title: string; description: string };
  og: { title: string; description: string; image: string; siteName: string; type: string; url: string };
  twitter: { card: string; title: string; description: string; image: string; site: string };
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const { toast } = useToast();
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0 group">
      <span className="text-[11px] font-mono text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded shrink-0 mt-0.5">{label}</span>
      <span className="text-xs text-foreground/80 flex-1 break-all leading-relaxed">{value}</span>
      <button
        onClick={() => { navigator.clipboard.writeText(value); toast({ title: "Copied!" }); }}
        className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded hover:bg-muted/60 transition-all"
      >
        <Copy className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

function CardPreview({
  type,
  icon: Icon,
  color,
  title,
  description,
  image,
  domain,
  siteName,
}: {
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
  image: string;
  domain: string;
  siteName: string;
}) {
  const displayTitle = title || "No title found";
  const displayDesc = description || "No description found";
  const displayDomain = siteName || domain;

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card/40">
      <div className={`flex items-center gap-2 px-3 py-2 border-b border-border/40 ${color}`}>
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold">{type} Preview</span>
      </div>
      <div className="overflow-hidden">
        {image ? (
          <img
            src={image}
            alt="OG preview"
            className="w-full object-cover max-h-48"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-32 bg-muted/30 flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        <div className="p-3 space-y-1">
          <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide truncate">{displayDomain}</p>
          <p className="text-sm font-semibold leading-snug line-clamp-2">{displayTitle}</p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{displayDesc}</p>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "What is an OG (Open Graph) image?",
    a: "Open Graph (OG) is a protocol created by Facebook that controls how URLs appear when shared on social media. OG tags define the title, description, and image shown in the preview card when someone shares your link on Facebook, LinkedIn, X (Twitter), Slack, and other platforms.",
  },
  {
    q: "What is a Twitter Card?",
    a: "Twitter Cards are meta tags that control how your page looks when shared on X (Twitter). There are four types: summary, summary_large_image, app, and player. The twitter:card, twitter:title, twitter:description, and twitter:image tags define the appearance.",
  },
  {
    q: "Why does my OG image not show up on social media?",
    a: "Common reasons include: the og:image URL is not absolute (must start with https://), the image is too small (minimum 200×200px, recommended 1200×630px), the meta tags are missing from the HTML, or social media platforms have cached an old version. Use this tool to verify your tags are present and correct.",
  },
  {
    q: "How do I add OG tags to my website?",
    a: 'Add these tags inside your HTML <head>: <meta property="og:title" content="Your Title" />, <meta property="og:description" content="Your description" />, <meta property="og:image" content="https://yoursite.com/image.jpg" />, and <meta property="og:url" content="https://yoursite.com/page" />.',
  },
  {
    q: "Why can\'t this tool fetch some URLs?",
    a: "Some websites block bots or require authentication. Our server fetches the page like a browser and extracts meta tags, but sites with bot protection (Cloudflare, login walls, etc.) may return an error. In those cases, view the page source directly in your browser to check the tags.",
  },
];

const relatedTools = [
  { title: "Meta Tag Generator", href: "/tools/meta-tag-generator", description: "Generate SEO and OG meta tags for any page." },
  { title: "Sitemap Validator", href: "/tools/sitemap-validator", description: "Validate your XML sitemap structure and URLs." },
  { title: "Robots.txt Generator", href: "/tools/robots-txt-generator", description: "Build a valid robots.txt file for your site." },
  { title: "Keyword Density Checker", href: "/tools/keyword-density", description: "Analyze keyword frequency in your content." },
];

const EXAMPLES = ["https://github.com", "https://vercel.com", "https://stripe.com", "https://openai.com"];

export default function OgImagePreview() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OgResult | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();
  useToolView("og-image-preview");

  const handleFetch = async (targetUrl?: string) => {
    const fetchUrl = targetUrl || url.trim();
    if (!fetchUrl) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/og-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fetchUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch page.");
      } else {
        setResult(data as OgResult);
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const domain = (() => {
    try { return new URL(result?.url || "").hostname; } catch { return ""; }
  })();

  const ogTitle = result?.og.title || result?.page.title || "";
  const ogDesc = result?.og.description || result?.page.description || "";
  const twTitle = result?.twitter.title || ogTitle;
  const twDesc = result?.twitter.description || ogDesc;
  const twImage = result?.twitter.image || result?.og.image || "";
  const ogImage = result?.og.image || "";

  return (
    <MiniToolLayout
      seoTitle="OG Image & Twitter Card Preview — Check Open Graph Tags Free"
      seoDescription="Preview how any URL looks when shared on Facebook, Twitter/X, and LinkedIn. Instantly extract and check Open Graph and Twitter Card meta tags. Free, no signup."
      icon={Globe}
      badge="SEO Tool"
      title="OG / Twitter Card Preview"
      description="Enter any URL to see exactly how it appears when shared on social media — Facebook, X (Twitter), and LinkedIn. Extracts all Open Graph and Twitter Card meta tags instantly."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-5">
        {/* URL input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://example.com/page"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
            <Button
              onClick={() => handleFetch()}
              disabled={loading || !url.trim()}
              className="text-sm gap-2 shadow-sm shadow-primary/20 shrink-0"
            >
              <Search className="h-4 w-4" />
              {loading ? "Fetching..." : "Preview"}
            </Button>
          </div>

          {/* Example links */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground/50">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setUrl(ex); handleFetch(ex); }}
                className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
              >
                {ex.replace("https://", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Could not fetch page</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-48 rounded-xl bg-muted/40" />
            <div className="h-4 w-2/3 rounded bg-muted/40" />
            <div className="h-3 w-full rounded bg-muted/30" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Page info bar */}
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/30 px-4 py-3">
              {result.favicon && (
                <img src={result.favicon} alt="" className="h-5 w-5 rounded shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{domain}</p>
                <p className="text-xs text-muted-foreground truncate">{result.url}</p>
              </div>
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1.5 rounded-lg hover:bg-muted/60 transition-all">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </div>

            {/* Social previews */}
            <div>
              <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-3">Social Media Previews</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <CardPreview type="Facebook" icon={Facebook} color="bg-blue-500/5 text-blue-400" title={ogTitle} description={ogDesc} image={ogImage} domain={domain} siteName={result.og.siteName} />
                <CardPreview type="X / Twitter" icon={Twitter} color="bg-foreground/5 text-foreground/70" title={twTitle} description={twDesc} image={twImage} domain={domain} siteName={result.twitter.site || result.og.siteName} />
                <CardPreview type="LinkedIn" icon={Linkedin} color="bg-sky-500/5 text-sky-400" title={ogTitle} description={ogDesc} image={ogImage} domain={domain} siteName={result.og.siteName} />
              </div>
            </div>

            {/* All meta tags */}
            <div>
              <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-3">All Extracted Meta Tags</p>
              <div className="rounded-xl border border-border/60 bg-card/30 divide-y divide-border/30 overflow-hidden">
                <div className="px-4 py-2 bg-muted/20">
                  <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wide">Page</p>
                </div>
                <div className="px-4">
                  <MetaRow label="title" value={result.page.title} />
                  <MetaRow label="description" value={result.page.description} />
                </div>
                <div className="px-4 py-2 bg-muted/20">
                  <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wide">Open Graph</p>
                </div>
                <div className="px-4">
                  <MetaRow label="og:title" value={result.og.title} />
                  <MetaRow label="og:description" value={result.og.description} />
                  <MetaRow label="og:image" value={result.og.image} />
                  <MetaRow label="og:url" value={result.og.url} />
                  <MetaRow label="og:site_name" value={result.og.siteName} />
                  <MetaRow label="og:type" value={result.og.type} />
                </div>
                <div className="px-4 py-2 bg-muted/20">
                  <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wide">Twitter Card</p>
                </div>
                <div className="px-4">
                  <MetaRow label="twitter:card" value={result.twitter.card} />
                  <MetaRow label="twitter:title" value={result.twitter.title} />
                  <MetaRow label="twitter:description" value={result.twitter.description} />
                  <MetaRow label="twitter:image" value={result.twitter.image} />
                  <MetaRow label="twitter:site" value={result.twitter.site} />
                </div>
              </div>
            </div>

            {/* Missing tags warning */}
            {(() => {
              const missing: string[] = [];
              if (!result.og.title) missing.push("og:title");
              if (!result.og.description) missing.push("og:description");
              if (!result.og.image) missing.push("og:image");
              if (!result.twitter.card) missing.push("twitter:card");
              if (missing.length === 0) return null;
              return (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 space-y-1.5">
                  <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Missing tags detected</p>
                  <p className="text-xs text-muted-foreground">
                    The following important tags were not found: <span className="font-mono">{missing.join(", ")}</span>. 
                    Use the <a href="/tools/meta-tag-generator" className="underline text-primary">Meta Tag Generator</a> to create them.
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 py-16 text-center">
            <Globe className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground/50">Enter a URL above to preview its social cards</p>
            <p className="text-xs text-muted-foreground/35 mt-1">Supports Open Graph, Twitter Cards, and fallback page metadata</p>
          </div>
        )}

        {/* SEO content */}
        <div className="space-y-8 pt-6 border-t border-border/40">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">What is an OG Image Preview Tool?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This <strong>free OG preview tool</strong> lets you check exactly how any webpage looks when shared
              on Facebook, X (Twitter), LinkedIn, or Slack. It fetches the page's HTML server-side and extracts
              all <strong>Open Graph</strong> and <strong>Twitter Card</strong> meta tags, then renders realistic
              social share previews.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use it to verify your OG tags are correctly set before launching a campaign, sharing a blog post,
              or publishing a product page. Missing or incorrect tags mean your links appear without an image or
              with the wrong title — which significantly reduces click-through rates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Recommended OG Image Sizes</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { platform: "Facebook / LinkedIn", size: "1200 × 630 px", ratio: "1.91:1", note: "Most common, works everywhere" },
                { platform: "X / Twitter", size: "1200 × 628 px", ratio: "1.91:1", note: "summary_large_image card type" },
                { platform: "Minimum (fallback)", size: "200 × 200 px", ratio: "1:1", note: "Square fallback for small cards" },
              ].map(({ platform, size, ratio, note }) => (
                <div key={platform} className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground/70">{platform}</p>
                  <p className="text-sm font-bold">{size}</p>
                  <p className="text-[11px] text-muted-foreground">{ratio} ratio · {note}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MiniToolLayout>
  );
}
