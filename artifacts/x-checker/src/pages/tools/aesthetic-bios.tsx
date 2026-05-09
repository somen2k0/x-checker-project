import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Badge } from "@/components/ui/badge";
import { Palette, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";

type Vibe = "all" | "soft" | "dark" | "minimal" | "vintage" | "vaporwave" | "cottage";

const AESTHETIC_BIOS: { text: string; vibe: Exclude<Vibe, "all"> }[] = [
  { text: "✿ soft & dreamy ✿ | she/her | blooming slowly 🌸", vibe: "soft" },
  { text: "❀ romanticizing life one morning at a time ❀ | 🫧🌷", vibe: "soft" },
  { text: "☁️ soft babe ☁️ | self-care & sunsets | manifesting peace 🌙", vibe: "soft" },
  { text: "🌸 healing & glowing 🌸 | flowers, tea, and quiet mornings ☕", vibe: "soft" },
  { text: "◌ cottagecore soul trapped in a city ◌ | making things pretty | 🌿", vibe: "soft" },
  { text: "♡ in love with the small things ♡ | 🍃 slow living | she/her", vibe: "soft" },
  { text: "🖤 dark academia dropout 🖤 | books, rain, & black coffee", vibe: "dark" },
  { text: "⚰️ living in grayscale ⚰️ | horror enthusiast | perpetually tired", vibe: "dark" },
  { text: "✦ creature of the night ✦ | writing in the dark | morally grey protagonist", vibe: "dark" },
  { text: "♠ chaos in a trenchcoat ♠ | black clothes, big thoughts", vibe: "dark" },
  { text: "🌑 dark-romanticist | poetry at midnight | villain era permanently", vibe: "dark" },
  { text: "🕷 if you're reading this, it's already too late 🕷 | dark content, darker humor", vibe: "dark" },
  { text: "— minimalist. still figuring things out. —", vibe: "minimal" },
  { text: "doing less. feeling more.", vibe: "minimal" },
  { text: "quiet by nature. loud by choice.", vibe: "minimal" },
  { text: "building a life i don't need a vacation from.", vibe: "minimal" },
  { text: "less noise, more signal.", vibe: "minimal" },
  { text: "simple life | full heart | clear mind.", vibe: "minimal" },
  { text: "🌻 vintage soul in a modern world 🌻 | thrift shops & vinyls", vibe: "vintage" },
  { text: "꩜ retro heart ꩜ | 70s music, polaroids & old bookshops 📷", vibe: "vintage" },
  { text: "🍂 golden hour, always 🍂 | slow roads & vintage stores | nostalgia core", vibe: "vintage" },
  { text: "☎ old-school values, new-school dreams ☎ | film photography addict", vibe: "vintage" },
  { text: "📼 stuck in an old movie ☁️ | vintage clothes, modern problems", vibe: "vintage" },
  { text: "𝕧𝕒𝕡𝕠𝕣𝕨𝕒𝕧𝕖 ✦ | digital ghost | existing somewhere between online and offline", vibe: "vaporwave" },
  { text: "▓░▒ glitch.exe ▒░▓ | aesthetic overload | pixels & pastel", vibe: "vaporwave" },
  { text: "☆ internet ghost ☆ | online 24/7 | vaporwave & late night thoughts", vibe: "vaporwave" },
  { text: "∞ digital wanderer ∞ | lo-fi beats & neon lights | always online", vibe: "vaporwave" },
  { text: "🌿 mushroom forager irl 🌿 | cottagecore aesthetic | homemade & handmade", vibe: "cottage" },
  { text: "🌾 slow living | cottage dreams | growing things + baking things 🍞", vibe: "cottage" },
  { text: "☾ forest dweller | wildflowers & folklore | witch-adjacent 🌿", vibe: "cottage" },
  { text: "🐝 beekeeper at heart 🐝 | preserves, pressed flowers & dirt under my nails", vibe: "cottage" },
  { text: "♧ mud boots & warm light ♧ | cottagecore forever | make things by hand", vibe: "cottage" },
];

const VIBES: { value: Vibe; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "✨" },
  { value: "soft", label: "Soft", emoji: "🌸" },
  { value: "dark", label: "Dark", emoji: "🖤" },
  { value: "minimal", label: "Minimal", emoji: "◻" },
  { value: "vintage", label: "Vintage", emoji: "🎞" },
  { value: "vaporwave", label: "Vaporwave", emoji: "▓" },
  { value: "cottage", label: "Cottagecore", emoji: "🌿" },
];

const faqs = [
  { q: "What is an aesthetic Twitter bio?", a: "An aesthetic bio uses visual elements — Unicode symbols, specific emojis, minimal punctuation, and carefully chosen words — to create a distinctive mood or vibe. Instead of a list of credentials, aesthetic bios communicate a feeling or personality." },
  { q: "What symbols can I use in a Twitter bio?", a: "Twitter supports all Unicode characters in bios, including symbols like ✦ ◌ ♡ ✿ ❀ ♠ ♧ ☁ ☾ ꩜ and many others. You can paste any Unicode symbol directly into your bio. Just stay under 160 characters total." },
  { q: "What fonts work in Twitter bios?", a: "You can use Unicode mathematical fonts in your Twitter bio — they're actual characters, not images. Bold, italic, script, and other styles work. Check our Twitter Font Preview tool to preview and copy your text in different styles." },
  { q: "How do I make my Twitter aesthetic?", a: "To create a cohesive aesthetic: (1) pick a theme and stick to it, (2) use a matching header image and profile photo, (3) choose 2-3 emojis that align with your vibe and use them consistently, (4) pin a tweet that best represents your aesthetic." },
  { q: "Are aesthetic bios good for growing an audience?", a: "Aesthetic bios work well for lifestyle, art, fashion, music, and niche interest accounts where personality matters more than credentials. They're less effective for professional or business accounts." },
];

const relatedTools = [
  { title: "Twitter Font Preview", href: "/tools/font-preview", description: "Preview text in Unicode fonts for your bio." },
  { title: "Funny Twitter Bios", href: "/tools/funny-bios", description: "40+ funny bio templates to copy." },
  { title: "Bio Ideas Generator", href: "/tools/bio-ideas", description: "Bio templates for every niche." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters for the 160-char bio limit." },
];

export default function AestheticBios() {
  const [vibe, setVibe] = useState<Vibe>("all");
  const { toast } = useToast();
  const track = useTrack("aesthetic-bios");
  useToolView("aesthetic-bios");

  const filtered = vibe === "all" ? AESTHETIC_BIOS : AESTHETIC_BIOS.filter(b => b.vibe === vibe);

  const copy = (bio: string, bioVibe: string) => {
    navigator.clipboard.writeText(bio);
    track("copy_bio", { label: bioVibe });
    toast({ title: "Copied!", description: "Bio copied." });
  };

  return (
    <MiniToolLayout
      seoTitle="Aesthetic Twitter Bio Ideas (2025) — Soft, Dark, Minimal & More"
      seoDescription="Copy aesthetic Twitter bio ideas for every vibe: soft girl, dark academia, minimalist, vintage, vaporwave, and cottagecore. 30+ templates to copy instantly."
      icon={Palette}
      badge="30+ Aesthetic Bios"
      title="Aesthetic Twitter Bio Ideas"
      description="30+ aesthetic Twitter bio templates for every vibe — soft, dark academia, minimalist, vintage, vaporwave, and cottagecore. Click any bio to copy it instantly."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="design"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {VIBES.map(v => (
            <button
              key={v.value}
              onClick={() => setVibe(v.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                vibe === v.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              <span>{v.emoji}</span> {v.label}
              {v.value !== "all" && <span className="opacity-60">({AESTHETIC_BIOS.filter(b => b.vibe === v.value).length})</span>}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((bio, i) => (
            <button
              key={i}
              onClick={() => copy(bio.text, bio.vibe)}
              className="text-left group flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4 hover:border-primary/30 hover:bg-card transition-all cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{bio.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground capitalize">
                    {VIBES.find(v => v.value === bio.vibe)?.emoji} {bio.vibe}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground/50">{bio.text.length}/160</span>
                </div>
              </div>
              <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/70 text-center">Click any bio to copy it · {filtered.length} shown</p>
      </div>
    </MiniToolLayout>
  );
}
