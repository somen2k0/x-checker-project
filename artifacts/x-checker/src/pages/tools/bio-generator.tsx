import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Copy, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

const FAQS = [
  { q: "Is the AI bio generator really free?", a: "Yes — 100% free, no signup required. It uses Groq's fast LLM API under the hood." },
  { q: "How many bios does it generate?", a: "It generates 3 different bio options each time so you can pick your favourite or mix and match." },
  { q: "Are bios within X's 160-character limit?", a: "Yes — each generated bio is designed to fit within X's 160-character bio limit." },
  { q: "What tone options can I use?", a: "You can enter any tone — professional, witty, minimal, motivational, casual, bold, or anything else." },
  { q: "Can I regenerate if I don't like the results?", a: "Yes — click Regenerate to get 3 new bios with the same topic and tone." },
  { q: "Does my data get stored?", a: "No. Your topic and tone are sent to the API to generate bios and immediately discarded. Nothing is stored." },
];

export default function BioGenerator() {
  const [bioTopic, setBioTopic] = useState("");
  const [bioTone, setBioTone] = useState("");
  const [bios, setBios] = useState<string[]>([]);
  const [bioLoading, setBioLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateBio = async () => {
    if (!bioTopic.trim()) {
      toast({ title: "Enter a topic", description: "Tell us what your bio should be about.", variant: "destructive" });
      return;
    }
    setBioLoading(true);
    setBios([]);
    trackEvent("bio_generate", { label: bioTopic });
    try {
      const res = await fetch("/api/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: bioTopic, tone: bioTone }),
      });
      const data = await res.json();
      if (res.status === 429) {
        toast({ title: "Too many requests", description: data.error ?? "Please try again in a moment.", variant: "destructive" });
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to generate bio");
      setBios(data.bios ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setBioLoading(false);
    }
  };

  return (
    <MiniToolLayout
      seoTitle="AI Bio Generator — Generate X / Twitter Bios Instantly Free"
      seoDescription="Generate 3 professional X (Twitter) bios in seconds with AI. Enter your niche and tone and get ready-to-use bio ideas. Free, no signup required."
      icon={Sparkles}
      badge="AI"
      title="AI Bio Generator"
      description="Generate 3 professional X bios in seconds — just enter your niche and tone. Powered by Groq's fast AI."
      faqs={FAQS}
      affiliateCategory="growth"
      relatedTools={[
        { title: "Bio Ideas", href: "/tools/bio-ideas", description: "100+ ready-made X bio templates by niche and style." },
        { title: "Funny Bios", href: "/tools/funny-bios", description: "Witty, humorous bio ideas that stand out." },
        { title: "Professional Bios", href: "/tools/professional-bios", description: "Clean, credible bios for business professionals." },
        { title: "Aesthetic Bios", href: "/tools/aesthetic-bios", description: "Minimal and stylish bios for a curated profile." },
      ]}
    >
      <div className="space-y-5">
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">AI Bio Generator</CardTitle>
            <CardDescription>Generate 3 professional X bios in seconds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/70">What's your niche or topic? <span className="text-destructive">*</span></label>
              <Input
                value={bioTopic}
                onChange={(e) => setBioTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !bioLoading && bioTopic.trim()) handleGenerateBio(); }}
                placeholder="e.g. AI startup founder, fitness coach, crypto trader"
                className="bg-background/60 border-border/60 focus-visible:ring-primary/40 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/70">Tone (optional)</label>
              <Input
                value={bioTone}
                onChange={(e) => setBioTone(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !bioLoading && bioTopic.trim()) handleGenerateBio(); }}
                placeholder="e.g. professional, witty, minimal, motivational"
                className="bg-background/60 border-border/60 focus-visible:ring-primary/40 text-sm"
              />
            </div>
            <Button onClick={handleGenerateBio} disabled={bioLoading || !bioTopic.trim()} className="w-full shadow-sm shadow-primary/15">
              {bioLoading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
                : <><Sparkles className="h-4 w-4 mr-2" /> Generate Bios</>}
            </Button>
          </CardContent>
        </Card>

        {bios.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {bios.map((bio, i) => (
              <Card key={i} className="border-border/60 bg-card shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Bio {i + 1}</div>
                      <p className="text-sm leading-relaxed">{bio}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-[11px] ${bio.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                          {bio.length} / 160 chars
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(bio);
                            toast({ title: "Copied!", description: "Bio copied to clipboard." });
                          }}
                          className="text-xs border-border/60 h-7"
                        >
                          <Copy className="h-3 w-3 mr-1.5" /> Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={handleGenerateBio} disabled={bioLoading} className="w-full text-xs border-border/60">
              <RefreshCw className="h-3.5 w-3.5 mr-2" /> Regenerate
            </Button>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
