import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Type, Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FONT_STYLES, convertToFont } from "@/lib/unicode-fonts";
import { useTrack, useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "Do Unicode fonts work on Twitter?", a: "Yes! Twitter/X supports Unicode characters, which means you can use stylized mathematical fonts in your tweets and bio. These characters are actual Unicode letters from the Mathematical Alphanumeric Symbols block, not images, so they work everywhere that supports Unicode text." },
  { q: "Is using fancy fonts on Twitter against the rules?", a: "Twitter's Terms of Service don't explicitly prohibit Unicode fonts. However, Twitter has occasionally restricted heavily formatted bios. Bold and italic variants are generally safe. Avoid overusing exotic fonts as they can hurt readability and be inaccessible to screen readers." },
  { q: "Will these fonts work on mobile Twitter?", a: "Yes — since these are standard Unicode characters, they render on all devices and platforms that support Unicode, including iOS and Android Twitter apps. Some older devices may show placeholder boxes for very rare characters." },
  { q: "Why don't some characters convert?", a: "Not every Unicode font block includes all characters. Some styles (like Fraktur and Script) have known exceptions for specific capital letters — these use alternative code points. Spaces, numbers, and most punctuation don't have Unicode font equivalents and are kept as-is." },
  { q: "Can I use these fonts for my Twitter name?", a: "Yes! You can paste any of these font variants directly into your Twitter display name or bio field. Just copy the text, go to Twitter Settings, and paste it into the Name or Bio field." },
];

const relatedTools = [
  { title: "Twitter Bio Ideas", href: "/tools/bio-ideas", description: "Generate bio ideas for any niche in seconds." },
  { title: "Aesthetic Bio Ideas", href: "/tools/aesthetic-bios", description: "Aesthetic Twitter bios with symbols and style." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters against Twitter's 160-char bio limit." },
  { title: "Tweet Formatter", href: "/tools/tweet-formatter", description: "Split long text into a numbered thread." },
];

const DEFAULT_TEXT = "Hello World";

export default function FontPreview() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const { toast } = useToast();
  const track = useTrack("font-preview");
  useToolView("font-preview");

  const copy = (converted: string, styleName: string) => {
    navigator.clipboard.writeText(converted);
    track("copy_font", { label: styleName });
    toast({ title: "Copied!", description: `${styleName} style copied.` });
  };

  return (
    <MiniToolLayout
      seoTitle="Twitter Font Preview — Unicode Fonts for Tweets & Bios"
      seoDescription="Preview your text in 12+ Unicode font styles for Twitter. Bold, italic, script, fraktur, monospace and more. Copy any style with one click."
      icon={Type}
      badge="Free Tool"
      title="Twitter Font Preview"
      description="Type any text and instantly preview it in 12+ Unicode font styles — bold, italic, script, monospace, and more. Copy any style and paste it directly into your Twitter bio or tweet."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="design"
    >
      <div className="space-y-5">
        <div className="relative">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type text to preview fonts..."
            className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40 pr-9"
            maxLength={80}
          />
          {text && (
            <button onClick={() => setText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground -mt-2">Tip: spaces, punctuation, and most special characters stay unchanged.</p>

        {text.trim() ? (
          <div className="grid gap-3">
            {FONT_STYLES.map((style) => {
              const converted = convertToFont(text, style);
              return (
                <div key={style.key} className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5 hover:border-primary/25 transition-all">
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{style.name}</span>
                    <p className="text-base font-medium break-all">{converted}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(converted, style.name)}
                    className="shrink-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-transparent hover:border-border/60"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 py-12 text-center text-sm text-muted-foreground/60">
            Type something above to see all font previews
          </div>
        )}

        {/* Quick copy row */}
        {text.trim() && (
          <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Quick Copy — Popular Styles</p>
            <div className="flex flex-wrap gap-2">
              {FONT_STYLES.slice(0, 4).map(style => {
                const converted = convertToFont(text, style);
                return (
                  <button
                    key={style.key}
                    onClick={() => copy(converted, style.name)}
                    title={`Copy ${style.name}`}
                    className="font-medium text-sm px-3 py-1.5 rounded-lg border border-border/60 bg-background/60 hover:border-primary/40 hover:bg-primary/5 transition-all text-foreground"
                  >
                    {converted}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
