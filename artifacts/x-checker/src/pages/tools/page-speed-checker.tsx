import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gauge, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "What is a good page speed score?", a: "Google's Core Web Vitals consider scores of 90–100 as 'Good', 50–89 as 'Needs Improvement', and 0–49 as 'Poor'. Aim for LCP under 2.5s, FID under 100ms, and CLS under 0.1." },
  { q: "Why does page speed affect SEO?", a: "Google uses Core Web Vitals as a ranking signal since 2021. Faster pages rank higher, have lower bounce rates, and provide better user experience. A 1-second delay can reduce conversions by 7%." },
  { q: "What causes slow page speed?", a: "Common causes include unoptimized images, render-blocking JavaScript, excessive HTTP requests, no caching, slow server response, large CSS files, and loading too many third-party scripts." },
  { q: "How do I improve my LCP (Largest Contentful Paint)?", a: "Optimize your hero image, use a CDN, preload key resources, eliminate render-blocking resources, and ensure server response time is under 200ms. LCP measures how fast the main content loads." },
  { q: "What is CLS and how do I fix it?", a: "CLS (Cumulative Layout Shift) measures unexpected layout shifts. Fix it by always specifying image dimensions, avoiding inserting content above existing content, and using CSS transform for animations." },
];

const relatedTools = [
  { title: "Meta Tag Generator", href: "/tools/meta-tag-generator", description: "Generate optimized title, description, and OG tags." },
  { title: "Robots.txt Generator", href: "/tools/robots-txt-generator", description: "Create a robots.txt file for your site." },
  { title: "Backlink Analyzer", href: "/tools/backlink-analyzer", description: "Analyze your backlink profile for SEO quality." },
];

interface CheckItem {
  id: string;
  label: string;
  description: string;
  impact: "high" | "medium" | "low";
  checked: boolean | null;
}

const CHECKLIST: CheckItem[] = [
  { id: "images", label: "Images Optimized", description: "All images use WebP/AVIF, are compressed, and have explicit width/height attributes", impact: "high", checked: null },
  { id: "cdn", label: "CDN in Use", description: "Static assets are served via a CDN (Cloudflare, CloudFront, etc.)", impact: "high", checked: null },
  { id: "cache", label: "Browser Caching Enabled", description: "Cache-Control headers are set for static assets (1 year for hashed files)", impact: "high", checked: null },
  { id: "minify", label: "CSS/JS Minified", description: "All CSS and JavaScript files are minified and combined where possible", impact: "medium", checked: null },
  { id: "lazyload", label: "Lazy Loading Images", description: "Below-the-fold images use loading='lazy' attribute", impact: "medium", checked: null },
  { id: "compress", label: "Gzip/Brotli Compression", description: "Server compresses text assets with Gzip or Brotli", impact: "high", checked: null },
  { id: "fonts", label: "Web Fonts Optimized", description: "Fonts use font-display: swap, are subset, and preloaded", impact: "medium", checked: null },
  { id: "render_block", label: "No Render-Blocking Resources", description: "Critical CSS is inlined; non-critical JS loads asynchronously", impact: "high", checked: null },
  { id: "http2", label: "HTTP/2 or HTTP/3", description: "Server supports HTTP/2 or HTTP/3 for multiplexed requests", impact: "medium", checked: null },
  { id: "ttfb", label: "Fast Server Response (TTFB < 200ms)", description: "Time to First Byte is under 200ms — fast hosting and server-side caching", impact: "high", checked: null },
];

const IMPACT_COLORS = {
  high: { badge: "bg-red-500/15 text-red-400 border-red-500/30", label: "High Impact" },
  medium: { badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", label: "Medium Impact" },
  low: { badge: "bg-blue-500/15 text-blue-400 border-blue-500/30", label: "Low Impact" },
};

export default function PageSpeedChecker() {
  const [url, setUrl] = useState("");
  const [items, setItems] = useState<CheckItem[]>(CHECKLIST.map(i => ({ ...i })));
  const [audited, setAudited] = useState(false);
  const { toast } = useToast();
  useToolView("page-speed-checker");

  const toggle = (id: string, val: boolean) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: item.checked === val ? null : val } : item));
  };

  const passed = items.filter(i => i.checked === true).length;
  const failed = items.filter(i => i.checked === false).length;
  const answered = passed + failed;
  const score = answered > 0 ? Math.round((passed / answered) * 100) : 0;

  const getScoreColor = () => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const openPageSpeed = () => {
    const target = url.trim() || "https://example.com";
    window.open(`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(target)}`, "_blank");
  };

  return (
    <MiniToolLayout
      seoTitle="Page Speed Checker — Audit Your Website Speed & Core Web Vitals"
      seoDescription="Check your website's page speed with a free SEO audit checklist. Audit images, caching, compression, fonts, and Core Web Vitals. Get a speed score and actionable fixes."
      icon={Gauge}
      badge="SEO Tool"
      title="Page Speed Checker"
      description="Run a manual speed audit against the 10 most impactful performance factors. Check each item and get a score, then use Google PageSpeed Insights for in-depth automated testing."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="analytics"
    >
      <div className="space-y-5">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://your-website.com"
            className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
          />
          <Button variant="outline" onClick={openPageSpeed} className="shrink-0 border-border/60 gap-1.5 text-xs">
            <ExternalLink className="h-3.5 w-3.5" /> Test on Google
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Speed Audit Checklist ({answered}/{items.length} checked)</h3>
          {items.map(item => {
            const impact = IMPACT_COLORS[item.impact];
            return (
              <div key={item.id} className={`rounded-xl border p-3.5 transition-colors ${
                item.checked === true ? "border-green-500/30 bg-green-500/5" :
                item.checked === false ? "border-red-500/20 bg-red-500/5" :
                "border-border/60 bg-card/30"
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex gap-1.5 shrink-0 mt-0.5">
                    <button onClick={() => toggle(item.id, true)} className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors ${item.checked === true ? "bg-green-500/20 border-green-500/40 text-green-400" : "border-border/60 text-muted-foreground/40 hover:border-green-500/40"}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toggle(item.id, false)} className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors ${item.checked === false ? "bg-red-500/20 border-red-500/40 text-red-400" : "border-border/60 text-muted-foreground/40 hover:border-red-500/40"}`}>
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${impact.badge}`}>{impact.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {answered >= 5 && (
          <div className="rounded-xl border border-border/60 bg-card/30 p-5 text-center animate-in fade-in duration-300">
            <div className={`text-5xl font-bold mb-1 ${getScoreColor()}`}>{score}</div>
            <div className="text-sm text-muted-foreground mb-3">Performance Score ({passed}/{answered} checks passed)</div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2">
                <div className="font-bold text-green-400">{passed}</div>
                <div className="text-xs text-muted-foreground">Passing</div>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2">
                <div className="font-bold text-red-400">{failed}</div>
                <div className="text-xs text-muted-foreground">Failing</div>
              </div>
              <div className="rounded-lg bg-muted/20 border border-border/40 p-2">
                <div className="font-bold text-muted-foreground">{items.length - answered}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
            </div>
            {failed > 0 && (
              <div className="mt-3 text-xs text-left text-muted-foreground bg-muted/20 rounded-lg p-3">
                <span className="font-semibold text-foreground">Top fix:</span>{" "}
                {items.filter(i => i.checked === false && i.impact === "high")[0]?.label || items.filter(i => i.checked === false)[0]?.label} — fixing high-impact items first gives the biggest score boost.
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">For automated testing:</span> Use{" "}
            <button onClick={openPageSpeed} className="text-primary underline underline-offset-2">Google PageSpeed Insights</button>{" "}
            for real Core Web Vitals data, Lighthouse scores, and field data from real users visiting your site.
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
