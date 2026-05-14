import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Badge } from "@/components/ui/badge";
import { Users, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";

type Category = "all" | "tech" | "creator" | "business" | "personal" | "aesthetic" | "funny";

interface NameIdea { name: string; category: Exclude<Category, "all">; tip?: string; }

const NAME_IDEAS: NameIdea[] = [
  { name: "BuildingInPublic", category: "tech" },
  { name: "ShipsCode", category: "tech" },
  { name: "TheDevDiary", category: "tech" },
  { name: "CodeAndCoffee", category: "tech" },
  { name: "StackedSenior", category: "tech" },
  { name: "NightOwlDev", category: "tech" },
  { name: "DebugAndRepeat", category: "tech" },
  { name: "TheShipLog", category: "tech" },
  { name: "ProductUpdates", category: "tech" },
  { name: "TheLaunchLog", category: "creator", tip: "Great for creators documenting a launch" },
  { name: "TheRealCreator", category: "creator" },
  { name: "ContentDaily", category: "creator" },
  { name: "ShortFormStudio", category: "creator" },
  { name: "BehindTheContent", category: "creator" },
  { name: "CreatorJourney", category: "creator" },
  { name: "TheWritingDesk", category: "creator" },
  { name: "ScrollAndCreate", category: "creator" },
  { name: "TweetAndGrow", category: "creator" },
  { name: "GrowthDiary", category: "business" },
  { name: "FoundersNotes", category: "business", tip: "Classic founder account name" },
  { name: "StartupMemo", category: "business" },
  { name: "RevenueLog", category: "business" },
  { name: "TheGrowthFile", category: "business" },
  { name: "BootstrapDiaries", category: "business" },
  { name: "BuildToScale", category: "business" },
  { name: "MarketMovers", category: "business" },
  { name: "TheOperator", category: "business" },
  { name: "TheRealName", category: "personal", tip: "If your name is common" },
  { name: "LifeOfYourName", category: "personal" },
  { name: "YourNameWrites", category: "personal" },
  { name: "YourNameBuilds", category: "personal" },
  { name: "JustYourName", category: "personal" },
  { name: "YourNameDaily", category: "personal" },
  { name: "ImYourName", category: "personal" },
  { name: "YourNameOnX", category: "personal" },
  { name: "DigitalDust", category: "aesthetic" },
  { name: "SoftHours", category: "aesthetic" },
  { name: "MidnightThread", category: "aesthetic" },
  { name: "GlassSlippers", category: "aesthetic" },
  { name: "WarmLight", category: "aesthetic" },
  { name: "CloudCore", category: "aesthetic" },
  { name: "PixelDreams", category: "aesthetic" },
  { name: "NeonNotes", category: "aesthetic" },
  { name: "ProfessionallyLost", category: "funny", tip: "Hugely relatable" },
  { name: "SendHelp", category: "funny" },
  { name: "TryingMyBest", category: "funny" },
  { name: "StillLoading", category: "funny" },
  { name: "PlsIgnore", category: "funny" },
  { name: "ErrorInBio", category: "funny" },
  { name: "NotABot", category: "funny" },
  { name: "ChaosModeOn", category: "funny" },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tech", label: "Tech & Dev" },
  { value: "creator", label: "Creator" },
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal Brand" },
  { value: "aesthetic", label: "Aesthetic" },
  { value: "funny", label: "Funny" },
];

const faqs = [
  { q: "What is a Twitter display name vs. a username?", a: "Your display name is shown prominently at the top of your profile (up to 50 characters, can include spaces and special characters). Your username (@handle) is the unique identifier used in mentions (4-15 characters, letters/numbers/underscores only)." },
  { q: "Can my Twitter name be different from my username?", a: "Yes — your display name and @username are completely independent. Many accounts use a descriptive display name (e.g., 'Building in Public 🚀') while keeping a simple @username (e.g., @johndev)." },
  { q: "How often can I change my Twitter display name?", a: "You can change your Twitter display name as often as you like — there's no cooldown or limit. Your @username can also be changed anytime from Account Settings, but your old handle becomes immediately available to others." },
  { q: "Should my Twitter name include keywords?", a: "For discoverability, including relevant keywords in your display name (e.g., 'John | Software Engineer') helps people find and understand you quickly. This works especially well for professional accounts." },
  { q: "What are good Twitter names for businesses?", a: "Business display names should be identical to your brand name for consistency. If your exact brand name is taken, try adding 'HQ', 'Official', or your niche (e.g., 'Acme | Marketing Tools')." },
];

const relatedTools = [
  { title: "Username Generator", href: "/tools/username-generator", description: "Generate @handle ideas from any keyword." },
  { title: "Bio Ideas Generator", href: "/tools/bio-ideas", description: "Get bio templates for your niche." },
  { title: "Account Checker", href: "/tools/x-account-checker", description: "Check if specific usernames are active on X." },
  { title: "@ Formatter", href: "/tools/at-formatter", description: "Bulk add/remove @ from username lists." },
];

export default function NameIdeas() {
  const [filter, setFilter] = useState<Category>("all");
  const { toast } = useToast();
  const track = useTrack("name-ideas");
  useToolView("name-ideas");

  const filtered = filter === "all" ? NAME_IDEAS : NAME_IDEAS.filter(n => n.category === filter);

  const copy = (name: string, category: string) => {
    navigator.clipboard.writeText(name);
    track("copy_name", { label: category });
    toast({ title: "Copied!", description: name });
  };

  return (
    <MiniToolLayout
      seoTitle="Twitter Name Ideas (2025) — 50+ Display Name Ideas for Every Niche"
      seoDescription="Browse 50+ Twitter display name ideas for tech, creator, business, personal brand, aesthetic, and funny accounts. Copy any name idea instantly."
      icon={Users}
      badge="50+ Ideas"
      title="Twitter Name Ideas"
      description="50+ Twitter display name ideas organized by niche. From tech and business to aesthetic and funny — find a name that fits your brand and copy it in one click."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === cat.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              {cat.label} {cat.value === "all" ? `(${NAME_IDEAS.length})` : `(${NAME_IDEAS.filter(n => n.category === cat.value).length})`}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((idea, i) => (
            <button
              key={i}
              onClick={() => copy(idea.name, idea.category)}
              className="text-left group flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-3.5 hover:border-primary/30 hover:bg-card transition-all cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-between">
                  <span className="font-semibold text-sm text-foreground">{idea.name}</span>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                {idea.tip && <p className="text-xs text-muted-foreground/70 mt-1">{idea.tip}</p>}
                <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground mt-1.5 capitalize">{idea.category}</Badge>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <h3 className="text-sm font-semibold mb-3">Twitter name tips</h3>
          <ul className="space-y-1.5">
            {[
              { tip: "Display name can be up to 50 characters and can include spaces, emojis, and symbols.", good: "John | Software Engineer 🚀" },
              { tip: "Add a keyword after your name to be more discoverable.", good: "Sarah Chen | UX Designer" },
              { tip: "Use '|' to separate different aspects of your identity.", good: "Alex | Founder @ Acme | Ex-Google" },
              { tip: "Emojis in your display name stand out in feeds — use 1-2 max.", good: "Matt 🔨 Building in public" },
            ].map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="text-primary mr-1">→</span>
                {item.tip}
                <span className="ml-1 font-mono text-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">e.g. "{item.good}"</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MiniToolLayout>
  );
}
