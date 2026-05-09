import { ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface AffiliateTool {
  name: string;
  description: string;
  url: string;
  badge?: string;
  category: string;
}

const ALL_AFFILIATES: AffiliateTool[] = [
  {
    name: "Buffer",
    description: "Schedule tweets and threads in advance. The simplest Twitter scheduling tool.",
    url: "https://buffer.com",
    badge: "Scheduling",
    category: "scheduling",
  },
  {
    name: "Typefully",
    description: "Write and schedule Twitter threads with a distraction-free editor.",
    url: "https://typefully.com",
    badge: "Threads",
    category: "scheduling",
  },
  {
    name: "Taplio",
    description: "Grow on LinkedIn with AI-generated posts and scheduling.",
    url: "https://taplio.com",
    badge: "LinkedIn",
    category: "scheduling",
  },
  {
    name: "Canva",
    description: "Design professional Twitter banners, post graphics, and profile images.",
    url: "https://canva.com",
    badge: "Design",
    category: "design",
  },
  {
    name: "Beehiiv",
    description: "Launch a newsletter and monetize your Twitter audience directly.",
    url: "https://beehiiv.com",
    badge: "Newsletter",
    category: "monetize",
  },
  {
    name: "Gumroad",
    description: "Sell digital products — ebooks, templates, courses — to your Twitter following.",
    url: "https://gumroad.com",
    badge: "Sell",
    category: "monetize",
  },
  {
    name: "Hypefury",
    description: "Automate your Twitter presence with scheduling, analytics, and engagement.",
    url: "https://hypefury.com",
    badge: "Growth",
    category: "growth",
  },
  {
    name: "BlackMagic",
    description: "Twitter analytics with CRM features for building real relationships.",
    url: "https://blackmagic.so",
    badge: "Analytics",
    category: "analytics",
  },
];

interface AffiliateSectionProps {
  category?: "scheduling" | "design" | "monetize" | "growth" | "analytics" | "all";
  limit?: number;
}

export function AffiliateSection({ category = "all", limit = 4 }: AffiliateSectionProps) {
  const tools =
    category === "all"
      ? ALL_AFFILIATES.slice(0, limit)
      : ALL_AFFILIATES.filter((a) => a.category === category).slice(0, limit);

  if (!tools.length) return null;

  const handleClick = (name: string, url: string) => {
    trackEvent("affiliate_click", { label: name });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground/70">Recommended Creator Tools</h2>
        <span className="text-[10px] text-muted-foreground/40 border border-border/40 rounded px-1.5 py-0.5">Sponsored</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {tools.map(({ name, description, url, badge }) => (
          <button
            key={name}
            onClick={() => handleClick(name, url)}
            className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card/30 p-3.5 hover:border-border hover:bg-card/60 transition-all text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center shrink-0 text-xs font-bold text-foreground/60">
              {name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{name}</span>
                {badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 border border-border/40 text-muted-foreground">{badge}</span>
                )}
                <ExternalLink className="h-3 w-3 text-muted-foreground/40 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
