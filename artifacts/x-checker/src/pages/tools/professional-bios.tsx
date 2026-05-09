import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";

type Industry = "tech" | "marketing" | "finance" | "healthcare" | "legal" | "education" | "hr" | "design" | "consulting";

interface BioItem { text: string; industry: Industry; tags?: string[]; }

const PROFESSIONAL_BIOS: BioItem[] = [
  { text: "[Title] @[Company] | [X] years in [field] | Building [product/team] | Prev: [company]", industry: "tech", tags: ["Template"] },
  { text: "Engineering Lead | Scaling distributed systems | Open source contributor | Speaker | He/him", industry: "tech" },
  { text: "VP Engineering @[company] | Ex-[big tech] | I write about leadership, eng culture & career growth", industry: "tech" },
  { text: "Product Manager | Turning customer pain into shipped features 🚀 | [X] launches | PM tips weekly", industry: "tech" },
  { text: "Data scientist @[company] | Using ML to [outcome] | I make charts that tell stories 📊", industry: "tech" },
  { text: "CISO | Cybersecurity practitioner | Securing the enterprise one patch at a time 🔐 | Speaker & advisor", industry: "tech" },
  { text: "CMO @[company] | Growth marketer | $[X]M in revenue generated | I tweet about acquisition & retention", industry: "marketing", tags: ["Senior"] },
  { text: "Performance marketer | 7-figure ad spend managed | Meta, Google & TikTok ads | DM for audits", industry: "marketing" },
  { text: "Brand strategist & creative director | I help B2B companies look like they deserve to charge more", industry: "marketing" },
  { text: "SEO lead @[company] | Took site from 0 → [X]K monthly organic visits | Teaching SEO without the BS", industry: "marketing" },
  { text: "Content strategist | B2B SaaS focus | Turning boring industries into compelling content programs", industry: "marketing" },
  { text: "Head of Partnerships @[company] | Former [role] | Building win-win deals at scale 🤝", industry: "marketing" },
  { text: "CFA | Portfolio manager | [X] years in asset management | I translate market noise into signal 📈", industry: "finance", tags: ["Credentialed"] },
  { text: "Investment banker @[firm] | Coverage: [sector] | Opinions are my own, not advice", industry: "finance" },
  { text: "VC @ [fund] | Investing in [stage/sector] | [X] investments | DM if you're building in [space]", industry: "finance" },
  { text: "CFO @[company] | Financial operations & strategy | Prev IPO at [company] | FP&A & treasury focus", industry: "finance" },
  { text: "Financial advisor | CFP® | Helping [audience] build real, lasting wealth | Fee-only fiduciary", industry: "finance" },
  { text: "MD | [Specialty] @[hospital/practice] | [X] years | Medical education advocate | CME speaker", industry: "healthcare", tags: ["Credentialed"] },
  { text: "Registered Dietitian | Evidence-based nutrition, not fads | [X] years clinical experience", industry: "healthcare" },
  { text: "Physical therapist | Sports & ortho rehab | I debunk fitness myths with research 🔬", industry: "healthcare" },
  { text: "Mental health counselor | LPC | Normalizing therapy | I tweet about anxiety, burnout & resilience", industry: "healthcare" },
  { text: "Pharmacist | [X] years in [setting] | Patient education advocate | Medication safety speaker 💊", industry: "healthcare" },
  { text: "Partner @[firm] | [X] years litigation & transactions | [Specialty] law | NY & CA barred", industry: "legal", tags: ["Credentialed"] },
  { text: "Startup attorney | Helping founders avoid costly mistakes | Prev [firm] | Not legal advice", industry: "legal" },
  { text: "IP attorney | Patent prosecution & strategy | I protect what founders build 🛡️ | USPTO registered", industry: "legal" },
  { text: "Professor of [field] @[university] | Researcher | Author of [book] | I make [topic] accessible", industry: "education" },
  { text: "K-12 educator | [X] years | EdTech advocate | Helping teachers use tech without losing their minds 📚", industry: "education" },
  { text: "Instructional designer & L&D professional | Building learning experiences people actually complete", industry: "education" },
  { text: "CHRO @[company] | [X] years in people operations | Org design, culture & talent strategy", industry: "hr" },
  { text: "Talent acquisition leader | [X] roles filled | I find great people for hard-to-fill positions 🔍", industry: "hr" },
  { text: "Executive coach & facilitator | Helping senior leaders navigate transitions & scale impact", industry: "hr" },
  { text: "Head of Design @[company] | [X] years in product design | Design systems & inclusive UX advocate", industry: "design" },
  { text: "UX researcher | Making products that work for real people | I tweet about research methods & insights", industry: "design" },
  { text: "Brand designer | [X] brands helped | I make companies look premium so they can charge premium", industry: "design" },
  { text: "McKinsey alum | Independent strategy consultant | I help [audience] make better decisions faster", industry: "consulting", tags: ["Credentialed"] },
  { text: "Management consultant → operator | Now [role] @[company] | Applying strategy to messy reality", industry: "consulting" },
];

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: "tech", label: "Tech & Engineering" },
  { value: "marketing", label: "Marketing & Growth" },
  { value: "finance", label: "Finance & Investing" },
  { value: "healthcare", label: "Healthcare" },
  { value: "legal", label: "Legal" },
  { value: "education", label: "Education" },
  { value: "hr", label: "HR & People Ops" },
  { value: "design", label: "Design & UX" },
  { value: "consulting", label: "Consulting" },
];

const faqs = [
  { q: "What should a professional Twitter bio include?", a: "Your current role and company, a key credential or accomplishment, the specific value you provide or topics you tweet about, and optionally a link or call to action." },
  { q: "How do I write a Twitter bio for a job search?", a: "Include your current or most recent title, key skills or specializations, and signal openness to opportunities (e.g., 'Open to [role] opportunities | DM me')." },
  { q: "Should I include my company in my Twitter bio?", a: "Yes, if it adds credibility. Always add a disclaimer like 'opinions are my own' if you plan to tweet about industry topics that could be associated with your employer." },
  { q: "What credentials should I put in my Twitter bio?", a: "Include credentials that are recognizable and relevant to your audience: CFA, MD, PhD, CPA, JD, CISSP, PMP, etc. Only include credentials that actually add credibility in the context you're tweeting about." },
  { q: "How do professionals get more Twitter followers?", a: "Post consistently about your niche, engage with others in your field, share original insights (not just retweets), and optimize your bio to clearly communicate your value." },
];

const relatedTools = [
  { title: "Funny Twitter Bios", href: "/tools/funny-bios", description: "40+ funny bio templates for a lighter tone." },
  { title: "Bio Ideas Generator", href: "/tools/bio-ideas", description: "Bio templates organized by niche and role." },
  { title: "AI Bio Generator", href: "/tools?tab=bio", description: "Generate 3 personalized bios using AI." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Check your bio is under 160 characters." },
];

export default function ProfessionalBios() {
  const [filter, setFilter] = useState<Industry | "all">("all");
  const { toast } = useToast();
  const track = useTrack("professional-bios");
  useToolView("professional-bios");

  const filtered = filter === "all" ? PROFESSIONAL_BIOS : PROFESSIONAL_BIOS.filter(b => b.industry === filter);

  const copy = (bio: string, industry: string) => {
    navigator.clipboard.writeText(bio);
    track("copy_bio", { label: industry });
    toast({ title: "Copied!", description: "Bio template copied." });
  };

  return (
    <MiniToolLayout
      seoTitle="Professional Twitter Bios (2025) — Templates for Every Industry"
      seoDescription="Copy professional Twitter bio templates for tech, marketing, finance, healthcare, legal, HR, design and more. 35+ templates — replace brackets with your details."
      icon={Briefcase}
      badge="35+ Templates"
      title="Professional Twitter Bio Templates"
      description="35+ professional Twitter bio templates organized by industry. Replace the [bracketed placeholders] with your details to get a polished, credibility-building bio in under a minute."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="scheduling"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"}`}
          >
            All ({PROFESSIONAL_BIOS.length})
          </button>
          {INDUSTRIES.map(ind => (
            <button
              key={ind.value}
              onClick={() => setFilter(ind.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === ind.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"}`}
            >
              {ind.label} ({PROFESSIONAL_BIOS.filter(b => b.industry === ind.value).length})
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {filtered.map((bio, i) => (
            <button
              key={i}
              onClick={() => copy(bio.text, bio.industry)}
              className="text-left group flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4 hover:border-primary/30 hover:bg-card transition-all cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{bio.text}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground capitalize">
                    {INDUSTRIES.find(i => i.value === bio.industry)?.label}
                  </Badge>
                  {bio.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px] border-primary/30 text-primary/70 bg-primary/5">{tag}</Badge>
                  ))}
                  <span className="text-[10px] font-mono text-muted-foreground/50">{bio.text.length}/160</span>
                </div>
              </div>
              <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/70">
          Replace <span className="font-mono text-primary/80">[bracketed placeholders]</span> with your actual details. Click any bio to copy.
        </p>
      </div>
    </MiniToolLayout>
  );
}
