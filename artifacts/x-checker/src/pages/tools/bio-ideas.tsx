import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";

const BIO_POOL: Record<string, string[]> = {
  developer: [
    "Building things with code. Breaking things with bugs. 💻 Open source contributor | Coffee-powered engineer",
    "Software engineer by day, side-project addict by night. Currently obsessed with [tech]. DMs open.",
    "I turn coffee into code ☕ | Full-stack dev | Building in public | Opinions are my own",
    "Code. Ship. Repeat. 🚀 | Software engineer @[company] | Writing about web dev, career, and tech",
    "Making the internet slightly less broken one commit at a time 🔧 | [X] years in tech | Tweets about dev life",
    "Developer 👨‍💻 | I write about clean code, side projects, and lessons learned the hard way",
  ],
  entrepreneur: [
    "Building [company/product] | Entrepreneur | Sharing what works (and what doesn't) on the path to $[milestone]",
    "Founded [X] businesses. Sold [Y]. Working on something new 🚀 | Tweets about startups, growth & lessons",
    "Serial entrepreneur | Investor | Building in public. Follow for startup insights, not motivation quotes.",
    "Turned $[X] into $[Y] bootstrapping [niche] | Now helping others do the same | Founder @[company]",
    "Startup founder documenting the journey from 0 → [goal] 📈 | Real numbers, real struggles, real wins",
    "I build companies and write about it. Currently: [product]. Previously: [company]. Always: learning.",
  ],
  creator: [
    "Making [content type] about [niche] 🎬 | [X]K subscribers/followers | New video every [day]",
    "Content creator & [niche] enthusiast 📱 | Sharing [benefit] tips that actually work | Collab: [email]",
    "I create [content] that helps [audience] do [outcome] | [platform] creator | Teaching [niche] since [year]",
    "Documenting my journey to [goal] 🎯 | Creator | [X] posts and counting | Come learn with me",
    "[Niche] creator | Building an audience around [passion] | Behind-the-scenes on building a creator business",
    "Full-time content creator 🎥 | Helping [audience] achieve [outcome] | Follow for daily [niche] content",
  ],
  marketer: [
    "Growth marketer 📊 | I helped [X] brands grow from [metric] to [metric] | Tweets: SEO, paid ads, strategy",
    "Marketing lead @[company] | Obsessed with data-driven growth | Sharing what's actually working in [year]",
    "Performance marketer turned founder 🚀 | I tweet about acquisition channels that scale to 7 figures",
    "CMO & [niche] strategist | [X] years of marketing experience distilled into 280 characters",
    "I reverse-engineer viral marketing campaigns for breakfast 📈 | DM for growth audits",
    "Marketing nerd 🤓 | If it can be tested, I'll test it | Sharing experiments, results & frameworks",
  ],
  writer: [
    "Writer ✍️ | Covering [niche] | Published in [publication] | Working on [book/project]",
    "Words are my weapon 🖊️ | Freelance writer | [X] articles and counting | I write about [niche]",
    "Storyteller | Journalist | Author of [book] | I tweet shorter versions of the stories in my head",
    "Professional overthinker who writes things down | [niche] writer | Newsletter: [link]",
    "I write long things so you don't have to think hard | Essays on [topic] | [Publication] contributor",
    "Writer & [niche] enthusiast ✍️ | I distill complex [topics] into clear, actionable writing",
  ],
  designer: [
    "Designer 🎨 | I make things look good and feel right | UI/UX at @[company] | Portfolio: [link]",
    "Visual storyteller | Product designer | Turning user problems into elegant solutions since [year]",
    "I design products used by [X] people 📐 | Design lead @[company] | Sharing design tips & process",
    "UX researcher & designer | I ask why until I find the real problem | Design = empathy + logic",
    "Design systems nerd 🎨 | Building consistent, scalable UI | Tweets about components, tokens & taste",
    "Graphic designer & brand strategist | I help [audience] look credible and premium | [X] brands helped",
  ],
  finance: [
    "Finance professional | CFA | Breaking down complex money topics for normal humans 💰",
    "Personal finance nerd 📊 | Paid off $[X] in debt | Now building wealth | Sharing what worked",
    "Investor & [niche] analyst 📈 | I tweet about opportunities most people miss | Not financial advice",
    "Former banker turned investor 💼 | Sharing Wall Street insights in plain English | [X] years in finance",
    "Financial independence at [age] 🔥 | FI/RE community | I retired early and tweet about how you can too",
    "CPA | Tax strategist | Helping [audience] keep more of what they earn 💵 | Not your accountant",
  ],
  student: [
    "CS student @[university] 📚 | Building side projects while learning | Documenting the grind",
    "[Major] student | Intern @[company] | Learning every day | Tweets about [niche] and student life",
    "Pre-med/law/eng student 🎓 | [Year] year | Study tips, campus life & [niche] content",
    "Student → [goal] 📈 | Documenting my journey from 0 to job offer in [field] | Tips for students",
    "Learning [skill] in public 📖 | Day [X] of my [challenge] | Student at [university]",
    "Broke student, big dreams 🚀 | Working toward [goal] | Tweets about [niche], hustle & student life",
  ],
  fitness: [
    "Personal trainer 💪 | Helped [X] people transform their bodies | Evidence-based fitness & nutrition",
    "Fitness coach | NASM certified | I help busy [audience] get strong without spending hours in the gym",
    "Powerlifter 🏋️ | [X] years of training | Sharing programming, nutrition & mindset for serious athletes",
    "Certified nutritionist | Fueling athletes and humans to peak performance 🥗 | No fad diets here",
    "From [X]lbs to [Y]lbs in [time] 💪 | Documenting my fitness journey | Proof that anyone can do it",
    "Fitness & wellness content 🏃 | NASM-CPT | Helping you build a body and mindset that lasts",
  ],
  gamer: [
    "Gamer & content creator 🎮 | [Main game] main | Streaming [days] | Highlights & gaming hot takes",
    "[Game] competitive player 🏆 | Rank: [rank] | I tweet about [game] meta, tips & gaming culture",
    "Full-time gamer | [Game] streamer | Clip highlights daily 🎮 | Big gaming takes, no apologies",
    "Esports athlete | Playing [game] since [year] | Training clips & tournament updates 🎮",
    "Gaming + [other interest] content 🎮 | I play games for fun and tweet about it relentlessly",
    "Pro gamer wannabe 😅 | Actually pretty good at [game] | Stream + tweet + repeat",
  ],
};

const CATEGORIES = Object.keys(BIO_POOL).map(k => ({
  value: k,
  label: k.charAt(0).toUpperCase() + k.slice(1),
}));

const faqs = [
  { q: "What makes a great Twitter bio?", a: "A great Twitter bio clearly communicates who you are, what you do, and why someone should follow you — all in 160 characters or less. The best bios either establish credibility (role, achievements), show personality, or create curiosity. Always include a concrete benefit for the reader." },
  { q: "How long can a Twitter bio be?", a: "Twitter allows up to 160 characters for your bio. That's about 2-3 short sentences or one punchy paragraph. Use every character wisely — start with your strongest hook and cut anything that doesn't add value." },
  { q: "Should I use emojis in my Twitter bio?", a: "Yes, strategically. 1-3 relevant emojis can make your bio more visually appealing and help break up text. Use emojis that reinforce your message (e.g., 💻 for tech, 📊 for data). Avoid using emojis as pure decoration or overdoing it." },
  { q: "Can I use these bio templates directly?", a: "These are starting templates — replace the [bracketed placeholders] with your specific details. Customize the tone, niche, and achievements to match your real story. A personalized bio always outperforms a generic one." },
  { q: "How often should I update my Twitter bio?", a: "Update your bio whenever your role, focus, or goals change. A stale bio that says you're still at a company you left 2 years ago hurts credibility. Many power users update their bio seasonally or when launching something new." },
  { q: "What's the difference between a Twitter bio and a Twitter name?", a: "Your Twitter name (display name) is shown prominently at the top of your profile and in feeds. It can be up to 50 characters. Your bio is the description below your name and is limited to 160 characters. Both contribute to first impressions." },
];

const relatedTools = [
  { title: "Funny Twitter Bios", href: "/tools/funny-bios", description: "30+ funny bio templates to stand out with humor." },
  { title: "Professional Twitter Bios", href: "/tools/professional-bios", description: "Polished bio templates for every industry." },
  { title: "Aesthetic Bio Ideas", href: "/tools/aesthetic-bios", description: "Aesthetic bios with Unicode symbols and vibes." },
  { title: "AI Bio Generator", href: "/tools/bio-generator", description: "Generate 3 personalized bios using AI." },
];

export default function BioIdeas() {
  const [category, setCategory] = useState("developer");
  const [shown, setShown] = useState<string[]>(BIO_POOL["developer"].slice(0, 3));
  const { toast } = useToast();
  const track = useTrack("bio-ideas");
  useToolView("bio-ideas");

  const generate = (cat: string) => {
    const pool = BIO_POOL[cat] ?? [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setShown(shuffled.slice(0, 4));
    track("generate_bio", { label: cat });
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    generate(val);
  };

  const copy = (bio: string) => {
    navigator.clipboard.writeText(bio);
    track("copy_bio", { label: category });
    toast({ title: "Copied!", description: "Bio copied to clipboard." });
  };

  return (
    <MiniToolLayout
      seoTitle="Twitter Bio Ideas Generator — Bio Templates for Every Niche (2025)"
      seoDescription="Get free Twitter bio ideas for developers, entrepreneurs, creators, marketers, designers and more. Pick a niche, get 4 ready-to-use bio templates instantly."
      icon={Sparkles}
      badge="Free Bio Generator"
      title="Twitter Bio Ideas Generator"
      description="Get bio template ideas for any niche on X (Twitter). Pick your category, click Generate, and copy a bio that resonates with your audience — with [placeholders] to personalize."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="scheduling"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48 bg-background/60 border-border/60 text-sm">
              <SelectValue placeholder="Select niche..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => generate(category)} className="text-xs shadow-sm shadow-primary/20">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Generate Ideas
          </Button>
        </div>

        <div className="space-y-3">
          {shown.map((bio, i) => (
            <div key={i} className="group flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/50 p-4 hover:border-primary/25 transition-all">
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border/50 px-1.5">Option {i + 1}</Badge>
                  <span className={`text-[10px] font-mono ${bio.length > 160 ? "text-warning" : "text-muted-foreground/50"}`}>{bio.length}/160</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{bio}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copy(bio)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs border border-transparent hover:border-border/60 mt-1">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/70">
          Replace <span className="font-mono text-primary/80">[bracketed text]</span> with your specific details. For AI-generated personalized bios, try the{" "}
          <a href="/tools/bio-generator" className="text-primary hover:underline">Bio Generator</a> tool.
        </p>
      </div>
    </MiniToolLayout>
  );
}
