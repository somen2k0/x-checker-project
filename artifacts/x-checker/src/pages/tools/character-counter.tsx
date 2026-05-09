import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Hash, Type, AlignLeft, Clock, Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";
import { trackEvent } from "@/lib/analytics";

const LIMITS = [
  { label: "X Tweet", max: 280, color: "bg-blue-500" },
  { label: "X Bio", max: 160, color: "bg-purple-500" },
  { label: "LinkedIn Post", max: 3000, color: "bg-sky-500" },
  { label: "Instagram Bio", max: 150, color: "bg-pink-500" },
];

const faqs = [
  { q: "What counts as a character on Twitter/X?", a: "Every letter, number, space, punctuation mark, and emoji counts as 1 character. URLs are automatically shortened to 23 characters regardless of their actual length. Line breaks also count as 1 character each." },
  { q: "What is the Twitter character limit?", a: "Standard Twitter/X accounts have a 280-character limit per tweet. Twitter Blue / X Premium subscribers can post up to 25,000 characters (long-form posts). Your profile bio is limited to 160 characters." },
  { q: "Do emojis count as 1 or 2 characters?", a: "Most emojis count as 2 characters on Twitter because they use two Unicode code units. Some complex emojis (like those with modifiers) may count as more. Our counter uses JavaScript's length property which matches Twitter's counting method." },
  { q: "Does Twitter count spaces as characters?", a: "Yes, every space counts as one character on Twitter. Leading and trailing spaces are also counted, so be mindful of extra whitespace at the start or end of your tweet." },
  { q: "What happens if I go over 280 characters?", a: "Twitter will not allow you to post a tweet that exceeds 280 characters. The tweet button will be disabled. You would need to either shorten your tweet or create a thread by splitting it into multiple tweets." },
  { q: "How do I split a long text into tweets?", a: "Use our Tweet Thread Formatter tool to automatically split long text into a numbered tweet thread. It respects word boundaries and adds tweet numbers (1/3, 2/3, etc.) automatically." },
];

const relatedTools = [
  { title: "Tweet Thread Formatter", href: "/tools/tweet-formatter", description: "Split long text into a numbered tweet thread." },
  { title: "Hashtag Formatter", href: "/tools/hashtag-formatter", description: "Convert words into properly formatted hashtags." },
  { title: "Twitter Font Preview", href: "/tools/font-preview", description: "Preview your text in Unicode font styles." },
  { title: "Bio Generator", href: "/tools/bio-ideas", description: "Generate Twitter bio ideas for any niche." },
];

let counterDebounce: ReturnType<typeof setTimeout> | null = null;

export default function CharacterCounter() {
  const [text, setText] = useState("");
  const { toast } = useToast();
  const track = useTrack("character-counter");
  useToolView("character-counter");

  const handleTextChange = useCallback((val: string) => {
    setText(val);
    if (counterDebounce) clearTimeout(counterDebounce);
    counterDebounce = setTimeout(() => {
      if (val.length > 0) trackEvent("counter_type", { tool: "character-counter", value: val.length });
    }, 2000);
  }, []);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split("\n").length : 0;
  const sentenceCount = text.trim() ? (text.match(/[.!?]+/g) ?? []).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const getBarColor = (pct: number, max: number) => {
    if (charCount > max) return "bg-destructive";
    if (pct > 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <MiniToolLayout
      seoTitle="Twitter Character Counter — Live Count for Tweets & Bios"
      seoDescription="Count characters, words, and lines in real time. See how close you are to Twitter's 280-character tweet limit and 160-character bio limit."
      icon={Hash}
      badge="Free Tool"
      title="Twitter Character Counter"
      description="Count characters, words, lines, and sentences in real time. Instantly see how your text measures up against Twitter's tweet limit (280) and bio limit (160)."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="scheduling"
    >
      <div className="space-y-5">
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type or paste your tweet, bio, or any text here..."
            className="min-h-[200px] text-sm font-mono bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40"
          />
          <div className={`absolute bottom-3 right-3 text-xs font-mono font-semibold px-2 py-1 rounded-md border ${
            charCount > 280 ? "bg-destructive/10 text-destructive border-destructive/25" :
            charCount > 240 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/25" :
            "bg-muted/60 text-muted-foreground border-border/50"
          }`}>
            {charCount} / 280
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setText("")} disabled={!text} className="text-xs border-border/60">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText(text);
            track("copy_bio", { label: "text" });
            toast({ title: "Copied!" });
          }} disabled={!text} className="text-xs border-border/60">
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Hash, label: "Characters", value: charCount.toLocaleString() },
            { icon: Type, label: "Words", value: wordCount.toLocaleString() },
            { icon: AlignLeft, label: "Lines", value: lineCount.toLocaleString() },
            { icon: Clock, label: "Read time", value: `${readingTime} min` },
          ].map(({ icon: Ic, label, value }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card/50 p-4 text-center">
              <Ic className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
              <div className="text-xl font-bold font-mono">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Limit bars */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground/80">Platform Limits</h3>
          {LIMITS.map(({ label, max }) => {
            const pct = Math.min(100, (charCount / max) * 100);
            const barColor = getBarColor(pct, max);
            const over = charCount > max;
            return (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-mono font-semibold ${over ? "text-destructive" : pct > 80 ? "text-yellow-500" : "text-green-500"}`}>
                    {charCount} / {max} {over && `(+${charCount - max} over)`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-200 ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sentences */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground/80">Sentence count: </span>{sentenceCount} &nbsp;·&nbsp;
          <span className="font-medium text-foreground/80">Paragraphs: </span>{text.split(/\n\s*\n/).filter(Boolean).length || 0} &nbsp;·&nbsp;
          <span className="font-medium text-foreground/80">Unique words: </span>{new Set(text.toLowerCase().match(/\b\w+\b/g) ?? []).size}
        </div>
      </div>
    </MiniToolLayout>
  );
}
