import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, Copy, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";

type Format = "camel" | "lower" | "upper";

function toHashtag(phrase: string, format: Format): string {
  const words = phrase.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  let tag: string;
  if (format === "camel") {
    tag = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  } else if (format === "upper") {
    tag = words.map(w => w.toUpperCase()).join("");
  } else {
    tag = words.map(w => w.toLowerCase()).join("");
  }
  return "#" + tag.replace(/[^a-zA-Z0-9_]/g, "");
}

const faqs = [
  { q: "What is a hashtag formatter?", a: "A hashtag formatter converts plain words or phrases into properly formatted Twitter hashtags. It handles multi-word phrases by combining them (e.g., 'web design' becomes #WebDesign or #webdesign) and strips special characters that aren't allowed in hashtags." },
  { q: "What characters are allowed in Twitter hashtags?", a: "Twitter hashtags can only contain letters (A-Z, a-z), numbers (0-9), and underscores (_). Spaces, hyphens, punctuation, and most special characters are not allowed and will break the hashtag." },
  { q: "Should I use CamelCase or lowercase hashtags?", a: "CamelCase hashtags (#WebDesign) are generally preferred for readability and are screen-reader friendly. Lowercase (#webdesign) also works fine. Uppercase (#WEBDESIGN) can feel like shouting but is sometimes used for brand hashtags or events." },
  { q: "How many hashtags should I use per tweet?", a: "Twitter recommends using 1-2 hashtags per tweet for best engagement. Using too many hashtags (5+) can make tweets look spammy and actually reduce engagement. For Instagram, 5-10 relevant hashtags perform well." },
  { q: "Do hashtags help with Twitter reach?", a: "Yes — hashtags make your tweets discoverable to people searching for that topic. However, only use relevant hashtags that your target audience actually follows. Irrelevant hashtags rarely improve reach and can hurt credibility." },
];

const relatedTools = [
  { title: "Tweet Thread Formatter", href: "/tools/tweet-formatter", description: "Split long text into a numbered tweet thread automatically." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters in real time against Twitter's limits." },
  { title: "Twitter Font Preview", href: "/tools/font-preview", description: "Preview text in Unicode font styles for your tweets." },
  { title: "@ Formatter", href: "/tools/at-formatter", description: "Bulk add or remove @ prefixes from username lists." },
];

const EXAMPLES = ["digital marketing", "web design", "social media", "content creator", "startup life", "tech entrepreneur"];

export default function HashtagFormatter() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<Format>("camel");
  const { toast } = useToast();
  const track = useTrack("hashtag-formatter");
  useToolView("hashtag-formatter");

  const lines = input.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
  const hashtags = lines.map(l => toHashtag(l, format)).filter(Boolean);

  const copyAll = () => {
    if (!hashtags.length) return;
    navigator.clipboard.writeText(hashtags.join(" "));
    track("copy_hashtag", { label: "all", value: hashtags.length });
    toast({ title: "Copied!", description: `${hashtags.length} hashtags copied.` });
  };

  const copyOne = (tag: string) => {
    navigator.clipboard.writeText(tag);
    track("copy_hashtag", { label: "single" });
    toast({ title: "Copied!", description: tag });
  };

  const loadExamples = () => {
    setInput(EXAMPLES.join("\n"));
    track("format_hashtag", { label: "example" });
  };

  return (
    <MiniToolLayout
      seoTitle="Twitter Hashtag Formatter — Convert Words to #Hashtags Instantly"
      seoDescription="Convert any words or phrases into properly formatted Twitter hashtags. Supports CamelCase, lowercase, and uppercase. Copy all hashtags in one click."
      icon={Hash}
      badge="Free Tool"
      title="Twitter Hashtag Formatter"
      description="Enter words or phrases — one per line or comma-separated — and convert them into properly formatted Twitter hashtags instantly. Choose CamelCase, lowercase, or uppercase style."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="scheduling"
    >
      <div className="space-y-5">
        {/* Format selector */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">Format:</span>
          {(["camel", "lower", "upper"] as Format[]).map(f => (
            <button
              key={f}
              onClick={() => { setFormat(f); track("format_hashtag", { label: f }); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                format === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground border-border/60 hover:border-border hover:text-foreground"
              }`}
            >
              {f === "camel" ? "#CamelCase" : f === "lower" ? "#lowercase" : "#UPPERCASE"}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Input</label>
              <button onClick={loadExamples} className="text-xs text-primary hover:underline flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Load examples
              </button>
            </div>
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={"web design\ndigital marketing\ncontent creator\n\nor comma-separated: social media, startup"}
              className="min-h-[200px] font-mono text-sm bg-background/60 border-border/60 resize-none focus-visible:ring-primary/40"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input} className="text-xs border-border/60">
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
              </Button>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Hashtags <span className="font-mono text-primary ml-1">{hashtags.length}</span>
              </label>
              <Button variant="outline" size="sm" onClick={copyAll} disabled={!hashtags.length} className="text-xs border-border/60 h-7">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy All
              </Button>
            </div>
            <div className="min-h-[200px] rounded-xl border border-border/60 bg-background/40 p-4 overflow-y-auto">
              {hashtags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, i) => (
                    <button key={i} onClick={() => copyOne(tag)} title="Click to copy">
                      <Badge variant="outline" className="font-mono text-sm px-3 py-1.5 border-primary/30 text-primary bg-primary/8 hover:bg-primary/15 transition-colors cursor-pointer">
                        {tag}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50 text-center mt-16">Your hashtags will appear here</p>
              )}
            </div>
            {hashtags.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Inline (for copy-paste):</p>
                <p className="font-mono text-xs text-foreground/80 break-all">{hashtags.join(" ")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
