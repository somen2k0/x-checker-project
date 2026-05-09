import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Badge } from "@/components/ui/badge";
import { Smile, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";

type Style = "all" | "self" | "sarcastic" | "punny" | "nerdy" | "random";

interface BioItem { text: string; style: Exclude<Style, "all">; }

const FUNNY_BIOS: BioItem[] = [
  { text: "Professional overthinker. Amateur everything else.", style: "self" },
  { text: "Trying to be a morning person. Results: pending since 2019.", style: "self" },
  { text: "Currently holding it together with caffeine and hope.", style: "self" },
  { text: "My hobbies include starting projects and not finishing them.", style: "self" },
  { text: "Will work for Wi-Fi and validation.", style: "self" },
  { text: "I put the 'fun' in 'fundamentally exhausted'.", style: "self" },
  { text: "Living my best life (terms and conditions may apply).", style: "self" },
  { text: "Normal person. Source: I said so.", style: "self" },
  { text: "Error 404: interesting bio not found.", style: "nerdy" },
  { text: "I speak fluent sarcasm. And also English, sometimes.", style: "sarcastic" },
  { text: "Very important person. Do not disturb. (Please disturb.)", style: "random" },
  { text: "I'm not lazy. I'm in energy-saving mode.", style: "self" },
  { text: "Part-time genius. Full-time disaster.", style: "self" },
  { text: "I was told there would be cookies.", style: "random" },
  { text: "Currently accepting snack donations.", style: "random" },
  { text: "Trying to adult. It's going okay. (It's not going okay.)", style: "self" },
  { text: "I have a black belt in avoiding responsibilities.", style: "self" },
  { text: "Here to ruin your carefully curated feed.", style: "sarcastic" },
  { text: "I'm not arguing. I'm just explaining why I'm right.", style: "sarcastic" },
  { text: "My opinions are like wine — better after you've had a few drinks.", style: "sarcastic" },
  { text: "Please take my tweets with a grain of salt. And a lime. And tequila.", style: "sarcastic" },
  { text: "Professionally unprofessional since birth.", style: "sarcastic" },
  { text: "My superpower is making everything awkward.", style: "sarcastic" },
  { text: "I followed you back because the algorithm told me to.", style: "sarcastic" },
  { text: "I'm not a morning person. I'm barely a daytime person.", style: "self" },
  { text: "Powered by caffeine and spite.", style: "self" },
  { text: "Time flies when you're avoiding your email inbox.", style: "punny" },
  { text: "My career is going places. It's just not telling me where.", style: "punny" },
  { text: "I'm a social media influencer. Specifically, I influence people to question my life choices.", style: "punny" },
  { text: "Technically an adult. Emotionally... checking.", style: "punny" },
  { text: "I work hard so my cat can have a better life.", style: "random" },
  { text: "My plants are thriving. My life choices: less so.", style: "self" },
  { text: "404 bio not found. Please check back when I figure out who I am.", style: "nerdy" },
  { text: "null.personality.exe — please restart with coffee.", style: "nerdy" },
  { text: "On a mission to reduce global stupidity. Results: not great.", style: "nerdy" },
  { text: "I put the 'pro' in 'procrastination'.", style: "nerdy" },
  { text: "Debugging life one day at a time. Too many undefined errors.", style: "nerdy" },
  { text: "I have a great personality. I keep it somewhere safe though, so I rarely use it.", style: "random" },
  { text: "Born to stand out. Mostly because I trip a lot.", style: "random" },
  { text: "If found, please return to bed.", style: "random" },
];

const STYLE_LABELS: Record<Style, string> = {
  all: "All", self: "Self-Deprecating", sarcastic: "Sarcastic", punny: "Punny", nerdy: "Nerdy", random: "Random",
};

const faqs = [
  { q: "Can a funny Twitter bio help me get more followers?", a: "Yes! Humor is one of the strongest bio strategies for building a personality-driven audience. A witty bio makes you memorable and gives people a reason to follow." },
  { q: "How do I make my Twitter bio funny?", a: "The most effective techniques are: self-deprecating humor, subverting expectations, understatement, and absurdism. Keep it short — punchlines land better when concise." },
  { q: "Should a funny bio also include professional info?", a: "It depends on your goal. If you're building a personal brand, include a brief professional note alongside the humor (e.g., 'Software engineer by day, chaos agent by night')." },
  { q: "What are the best funny Twitter bios?", a: "The best funny bios are relatable, short, and feel authentic. They often play on universal experiences: being tired, procrastinating, loving food, or struggling with adult responsibilities." },
  { q: "How many characters is the Twitter bio limit?", a: "Twitter limits bios to 160 characters. Most of these funny bios are well under that limit, giving you room to add your own details, emojis, or location." },
];

const relatedTools = [
  { title: "Bio Ideas Generator", href: "/tools/bio-ideas", description: "Bio templates for developers, marketers, creators and more." },
  { title: "Professional Bios", href: "/tools/professional-bios", description: "Polished, industry-specific bio templates." },
  { title: "Aesthetic Bio Ideas", href: "/tools/aesthetic-bios", description: "Aesthetic bios with Unicode symbols and emojis." },
  { title: "AI Bio Generator", href: "/tools?tab=bio", description: "Generate 3 personalized bios using AI." },
];

export default function FunnyBios() {
  const [filter, setFilter] = useState<Style>("all");
  const { toast } = useToast();
  const track = useTrack("funny-bios");
  useToolView("funny-bios");

  const filtered = filter === "all" ? FUNNY_BIOS : FUNNY_BIOS.filter(b => b.style === filter);

  const copy = (bio: string, style: string) => {
    navigator.clipboard.writeText(bio);
    track("copy_bio", { label: style });
    toast({ title: "Copied!", description: "Bio copied." });
  };

  return (
    <MiniToolLayout
      seoTitle="Funny Twitter Bios (2025) — 40+ Hilarious Bio Ideas to Copy"
      seoDescription="Browse 40+ funny Twitter bio ideas — self-deprecating, sarcastic, punny, and nerdy. Click to copy any bio instantly. Updated for 2025."
      icon={Smile}
      badge="40+ Examples"
      title="Funny Twitter Bio Ideas"
      description="Browse 40+ ready-to-use funny Twitter bios organized by style. Click any bio to copy it instantly. Self-deprecating, sarcastic, punny, nerdy — pick your poison."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="scheduling"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STYLE_LABELS) as Style[]).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/60 hover:border-border hover:text-foreground"
              }`}
            >
              {STYLE_LABELS[s]} {s === "all" ? `(${FUNNY_BIOS.length})` : `(${FUNNY_BIOS.filter(b => b.style === s).length})`}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((bio, i) => (
            <button
              key={i}
              onClick={() => copy(bio.text, bio.style)}
              className="text-left group flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4 hover:border-primary/30 hover:bg-card transition-all cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{bio.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground capitalize">{STYLE_LABELS[bio.style]}</Badge>
                  <span className="text-[10px] font-mono text-muted-foreground/50">{bio.text.length}/160</span>
                </div>
              </div>
              <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/70 text-center">Click any bio to copy it instantly · {filtered.length} bios shown</p>
      </div>
    </MiniToolLayout>
  );
}
