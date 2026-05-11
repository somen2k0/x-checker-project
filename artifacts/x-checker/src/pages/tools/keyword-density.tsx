import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, Copy, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

const STOP_WORDS: Set<string> = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are","as","at",
  "be","because","been","before","being","below","between","both","but","by","can","cannot",
  "could","did","do","does","doing","down","during","each","few","for","from","further","get",
  "got","had","has","have","having","he","her","here","him","his","how","i","if","in","into",
  "is","it","its","itself","just","let","like","me","more","most","my","no","nor","not","now",
  "of","off","on","once","only","or","other","our","out","over","own","same","she","should",
  "so","some","such","than","that","the","their","them","then","there","these","they","this",
  "those","through","to","too","under","until","up","us","very","was","we","were","what",
  "when","where","which","while","who","whom","why","will","with","would","you","your","ll",
  "re","ve","don","won","can","t","s",
]);

interface WordEntry {
  word: string;
  count: number;
  density: number;
}

function analyze(text: string): { words: WordEntry[]; total: number } {
  const tokens = text.toLowerCase().match(/\b[a-z][a-z'-]{1,}\b/g) ?? [];
  const filtered = tokens.filter((w: string) => !STOP_WORDS.has(w) && w.length > 2);
  const total = tokens.length;
  const freq: Record<string, number> = {};
  for (const w of filtered) freq[w] = (freq[w] ?? 0) + 1;
  const words = Object.entries(freq)
    .map(([word, count]) => ({ word, count, density: total > 0 ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
  return { words, total };
}

function densityColor(d: number) {
  if (d > 4) return "text-red-400";
  if (d >= 1) return "text-green-400";
  return "text-muted-foreground";
}

function densityLabel(d: number) {
  if (d > 4) return "Over-optimized";
  if (d >= 1) return "Optimal";
  return "Low";
}

const faqs = [
  { q: "What is keyword density?", a: "Keyword density is the percentage of times a target keyword appears in a piece of content relative to the total word count. Formula: (keyword occurrences ÷ total words) × 100. A density of 1–3% is generally considered optimal." },
  { q: "What is the ideal keyword density for SEO?", a: "The widely accepted best practice is 1–3% keyword density. Below 1% and search engines may not strongly associate your page with that keyword. Above 4–5% risks being flagged for keyword stuffing, which can trigger ranking penalties." },
  { q: "What is keyword stuffing and why is it bad?", a: "Keyword stuffing is the practice of unnaturally repeating a keyword to manipulate search rankings. It degrades the reader's experience, and Google's algorithms actively detect and penalize it. Modern SEO focuses on semantic relevance and natural language, not raw keyword repetition." },
  { q: "Should stop words be counted in keyword density?", a: "No. Stop words (the, a, and, of, etc.) are excluded from keyword density calculations because they appear in almost every sentence and carry no semantic weight for search engines. This tool filters stop words by default." },
  { q: "What is LSI (Latent Semantic Indexing) in SEO?", a: "LSI keywords are semantically related terms that help search engines understand the context of your content. Rather than repeating the same keyword, including related terms (synonyms, related concepts) signals topical depth, which can improve rankings." },
  { q: "Does keyword density still matter in 2024?", a: "Keyword density is less critical than it was in the early 2000s. Modern search algorithms use natural language processing to understand content context and intent. However, it's still a useful diagnostic: extreme under- or over-optimization is worth correcting." },
];

const relatedTools = [
  { title: "Meta Tag Generator", href: "/tools/meta-tag-generator", description: "Generate SEO titles, descriptions, and Open Graph tags." },
  { title: "URL Slug Generator", href: "/tools/url-slug-generator", description: "Convert titles to SEO-friendly URL slugs." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters and words in any text." },
];

export default function KeywordDensity() {
  const [text, setText] = useState("");
  const [targetKw, setTargetKw] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();
  useToolView("keyword-density");

  const { words, total } = useMemo(() => analyze(text), [text]);

  const targetEntry = useMemo(() => {
    if (!targetKw.trim()) return null;
    const kw = targetKw.trim().toLowerCase();
    const count = (text.toLowerCase().match(new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) ?? []).length;
    const density = total > 0 ? (count / total) * 100 : 0;
    return { word: kw, count, density };
  }, [text, targetKw, total]);

  const displayed = showAll ? words : words.slice(0, 20);

  const exportCsv = () => {
    if (!words.length) return;
    const header = "Keyword,Count,Density (%)\n";
    const rows = words.map(w => `${w.word},${w.count},${w.density.toFixed(2)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "keyword-density.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: "keyword-density.csv downloaded." });
  };

  const sentenceCount = text.trim() ? (text.match(/[.!?]+/g) ?? []).length : 0;
  const readingTime = Math.max(1, Math.ceil(total / 200));

  return (
    <MiniToolLayout
      seoTitle="Keyword Density Checker — Word Frequency & SEO Analysis Tool"
      seoDescription="Paste any article and instantly see keyword frequency, density percentages, and top keywords. Filter stop words, check a specific keyword, and export results."
      icon={TrendingUp}
      badge="SEO Tool"
      title="Keyword Density Checker"
      description="Paste your article text and instantly measure keyword frequency, density percentages, and top keywords. Filter stop words, check a specific keyword's density, and export the full table."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="analytics"
    >
      <div className="space-y-5">
        {/* Target keyword */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target Keyword <span className="text-muted-foreground/50 font-normal normal-case">(optional — check a specific keyword)</span></label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input
              value={targetKw}
              onChange={e => setTargetKw(e.target.value)}
              placeholder="e.g. keyword density"
              className="pl-8 text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        {/* Target keyword result */}
        {targetEntry && (
          <div className={`rounded-xl border p-4 space-y-1 ${
            targetEntry.density > 4 ? "border-red-500/30 bg-red-500/5" :
            targetEntry.density >= 1 ? "border-green-500/30 bg-green-500/5" :
            "border-yellow-500/30 bg-yellow-500/5"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">"{targetEntry.word}"</span>
              <span className={`text-sm font-bold font-mono ${densityColor(targetEntry.density)}`}>
                {targetEntry.density.toFixed(2)}%
              </span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Occurrences: <strong className="text-foreground">{targetEntry.count}</strong></span>
              <span>Status: <strong className={densityColor(targetEntry.density)}>{densityLabel(targetEntry.density)}</strong></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all ${
                  targetEntry.density > 4 ? "bg-red-500" : targetEntry.density >= 1 ? "bg-green-500" : "bg-yellow-500"
                }`}
                style={{ width: `${Math.min(100, (targetEntry.density / 5) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground">Ideal range: 1–3% · Over 4% risks keyword stuffing</div>
          </div>
        )}

        {/* Article input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Article Text</label>
            <Button variant="outline" size="sm" onClick={() => setText("")} disabled={!text} className="text-xs border-border/60 h-7">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
            </Button>
          </div>
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your article, blog post, or any text here..."
            className="min-h-[180px] text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40"
          />
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total words", value: total.toLocaleString() },
              { label: "Unique keywords", value: words.length.toLocaleString() },
              { label: "Sentences", value: sentenceCount.toLocaleString() },
              { label: "Read time", value: `${readingTime} min` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card/50 p-3 text-center">
                <div className="text-xl font-bold font-mono">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Keywords table */}
        {words.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Top Keywords</label>
              <Button variant="outline" size="sm" onClick={exportCsv} className="text-xs border-border/60 h-7">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Export CSV
              </Button>
            </div>
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 border-b border-border/60">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">#</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Keyword</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Count</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Density</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground hidden sm:table-cell">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((entry, i) => (
                    <tr key={entry.word} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground/50 font-mono">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium font-mono">{entry.word}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{entry.count}</td>
                      <td className={`px-4 py-2.5 text-right font-mono font-semibold ${densityColor(entry.density)}`}>
                        {entry.density.toFixed(2)}%
                      </td>
                      <td className="px-4 py-2.5 hidden sm:table-cell">
                        <div className="w-24 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${entry.density > 4 ? "bg-red-500" : entry.density >= 1 ? "bg-green-500" : "bg-muted-foreground/40"}`}
                            style={{ width: `${Math.min(100, (entry.density / 5) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {words.length > 20 && (
              <button onClick={() => setShowAll(v => !v)} className="text-xs text-primary hover:underline w-full text-center py-1">
                {showAll ? "Show fewer" : `Show all ${words.length} keywords`}
              </button>
            )}
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
