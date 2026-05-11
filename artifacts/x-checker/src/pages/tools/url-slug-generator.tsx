import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by","from",
  "is","was","are","were","be","been","being","have","has","had","do","does","did",
  "will","would","could","should","may","might","shall","can","up","out","if","so",
  "as","its","it","this","that","these","those","then","than","also","into","about",
]);

type Separator = "-" | "_" | ".";

const TRANSLITERATION: Record<string, string> = {
  à:"a",á:"a",â:"a",ã:"a",ä:"a",å:"a",æ:"ae",ç:"c",è:"e",é:"e",ê:"e",ë:"e",
  ì:"i",í:"i",î:"i",ï:"i",ð:"d",ñ:"n",ò:"o",ó:"o",ô:"o",õ:"o",ö:"o",ø:"o",
  ù:"u",ú:"u",û:"u",ü:"u",ý:"y",þ:"th",ÿ:"y",ß:"ss",
};

function generateSlug(text: string, sep: Separator, removeStopWords: boolean): string {
  let s = text.toLowerCase();
  s = s.replace(/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿß]/g, ch => TRANSLITERATION[ch] ?? ch);
  s = s.replace(/[^a-z0-9\s-]/g, " ");
  const words = s.split(/\s+/).filter(Boolean);
  const filtered = removeStopWords ? words.filter(w => !STOP_WORDS.has(w)) : words;
  const result = filtered.join(sep);
  return result.replace(new RegExp(`[${sep}]+`, "g"), sep).replace(new RegExp(`^[${sep}]|[${sep}]$`, "g"), "");
}

const EXAMPLES = [
  "How to Build a REST API with Node.js in 2024",
  "The Best Free SEO Tools for Small Businesses",
  "Getting Started with React & TypeScript",
  "10 Tips for Writing Better Email Subject Lines",
];

const faqs = [
  { q: "What is a URL slug?", a: "A URL slug is the part of a URL that identifies a specific page in a human-readable format. For example, in 'example.com/best-seo-tools', the slug is 'best-seo-tools'. Good slugs are lowercase, use hyphens as separators, and directly reflect the page topic." },
  { q: "Why should I remove stop words from slugs?", a: "Stop words like 'the', 'a', 'and', 'of' add length without adding meaning for search engines. 'best-seo-tools' is better than 'the-best-seo-tools-for-everyone'. Shorter, cleaner slugs are easier to read, remember, and share. However, sometimes keeping stop words preserves meaning." },
  { q: "Should I use hyphens or underscores in URLs?", a: "Hyphens (-) are strongly preferred over underscores (_) by Google. Google treats hyphens as word separators, so 'seo-tools' is treated as two separate words. Underscores join words, so 'seo_tools' is treated as one word. Always use hyphens for new URLs." },
  { q: "How long should a URL slug be?", a: "Keep slugs concise — 3 to 5 meaningful words is ideal. Long slugs are hard to share and look spammy. Focus on the core keywords that represent the page. Avoid dates, numbers, or filler words in slugs when possible." },
  { q: "Should I change an existing URL slug?", a: "Only if necessary. Changing a URL breaks existing links and loses any SEO equity built up for that URL. If you must change it, always set up a 301 redirect from the old URL to the new one. Never just delete the old URL." },
];

const relatedTools = [
  { title: "Meta Tag Generator", href: "/tools/meta-tag-generator", description: "Generate SEO title, description, and Open Graph tags." },
  { title: "Keyword Density Checker", href: "/tools/keyword-density", description: "Measure keyword frequency in your article text." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters for any text." },
];

export default function UrlSlugGenerator() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<Separator>("-");
  const [removeStop, setRemoveStop] = useState(true);
  const { toast } = useToast();
  useToolView("url-slug-generator");

  const slug = useMemo(() => input ? generateSlug(input, separator, removeStop) : "", [input, separator, removeStop]);

  const copySlug = () => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    toast({ title: "Copied!", description: slug });
  };

  const loadExample = () => {
    setInput(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);
  };

  return (
    <MiniToolLayout
      seoTitle="URL Slug Generator — Clean SEO-Friendly Slugs from Any Title"
      seoDescription="Convert any title or phrase into a clean, SEO-friendly URL slug. Supports custom separators, stop-word removal, and transliteration. Instant, free, no signup."
      icon={Link2}
      badge="SEO Tool"
      title="URL Slug Generator"
      description="Convert any title, phrase, or sentence into a clean, lowercase, SEO-friendly URL slug. Automatically removes stop words, special characters, and transliterates accented letters."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="analytics"
    >
      <div className="space-y-5">
        {/* Options row */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Separator:</span>
            {(["-", "_", "."] as Separator[]).map(s => (
              <button
                key={s}
                onClick={() => setSeparator(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                  separator === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:border-border"
                }`}
              >
                word{s}slug
              </button>
            ))}
          </div>
          <button
            onClick={() => setRemoveStop(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              removeStop
                ? "bg-green-500/10 text-green-400 border-green-500/30"
                : "bg-muted/40 text-muted-foreground border-border/60"
            }`}
          >
            {removeStop ? <CheckCircle2 className="h-3 w-3" /> : null}
            Remove stop words
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Title or Phrase</label>
            <button onClick={loadExample} className="text-xs text-primary hover:underline flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Try an example
            </button>
          </div>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. How to Build a REST API with Node.js in 2024"
            className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Generated Slug</label>
          <div className="flex items-center gap-2">
            <div className={`flex-1 rounded-xl border px-4 py-3 font-mono text-sm transition-colors ${
              slug
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-border/60 bg-background/40 text-muted-foreground/40"
            }`}>
              {slug || "your-slug-will-appear-here"}
            </div>
            <Button variant="outline" size="sm" onClick={copySlug} disabled={!slug} className="text-xs border-border/60 shrink-0">
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
            </Button>
          </div>
          {slug && (
            <div className="text-xs text-muted-foreground font-mono bg-muted/20 rounded-lg px-3 py-2">
              Full URL preview: <span className="text-foreground">https://example.com/<span className="text-primary">{slug}</span></span>
            </div>
          )}
        </div>

        {/* Stats */}
        {slug && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Characters", value: slug.length },
              { label: "Words", value: slug.split(separator).filter(Boolean).length },
              { label: "Rating", value: slug.length <= 60 ? "Good" : "Long" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card/50 p-3 text-center">
                <div className="text-lg font-bold font-mono">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Best practices */}
        <div className="rounded-xl border border-border/60 bg-card/30 p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">URL Slug Best Practices</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { good: true, text: "Use hyphens as separators" },
              { good: true, text: "Keep it under 60 characters" },
              { good: true, text: "Include your primary keyword" },
              { good: true, text: "Use only lowercase letters" },
              { good: false, text: "Avoid stop words (the, a, of)" },
              { good: false, text: "No special characters or spaces" },
              { good: false, text: "No dates unless required" },
              { good: false, text: "Avoid underscores — use hyphens" },
            ].map(({ good, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${
                  good ? "border-green-500/40 text-green-500 bg-green-500/10" : "border-red-500/40 text-red-500 bg-red-500/10"
                }`}>{good ? "✓" : "✗"}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
