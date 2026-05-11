import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtSign, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

function clean(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function initial(s: string) {
  return clean(s).charAt(0);
}

interface Pattern {
  label: string;
  fn: (f: string, l: string, c: string) => string;
  category: "professional" | "simple" | "branded";
}

const PATTERNS: Pattern[] = [
  { label: "firstname.lastname", fn: (f, l) => `${clean(f)}.${clean(l)}`, category: "professional" },
  { label: "firstnamelastname", fn: (f, l) => `${clean(f)}${clean(l)}`, category: "simple" },
  { label: "f.lastname", fn: (f, l) => `${initial(f)}.${clean(l)}`, category: "professional" },
  { label: "flastname", fn: (f, l) => `${initial(f)}${clean(l)}`, category: "simple" },
  { label: "lastname.firstname", fn: (f, l) => `${clean(l)}.${clean(f)}`, category: "professional" },
  { label: "firstnamel", fn: (f, l) => `${clean(f)}${initial(l)}`, category: "simple" },
  { label: "firstname_lastname", fn: (f, l) => `${clean(f)}_${clean(l)}`, category: "simple" },
  { label: "firstname+lastname", fn: (f, l) => `${clean(f)}+${clean(l)}`, category: "simple" },
  { label: "firstname@company", fn: (f, _l, c) => `${clean(f)}@${clean(c)}`, category: "branded" },
  { label: "f.lastname@company", fn: (f, l, c) => `${initial(f)}.${clean(l)}@${clean(c)}`, category: "branded" },
  { label: "firstname.l@company", fn: (f, l, c) => `${clean(f)}.${initial(l)}@${clean(c)}`, category: "branded" },
  { label: "team@company", fn: (_f, _l, c) => `team@${clean(c)}`, category: "branded" },
  { label: "hello@company", fn: (_f, _l, c) => `hello@${clean(c)}`, category: "branded" },
  { label: "support@company", fn: (_f, _l, c) => `support@${clean(c)}`, category: "branded" },
  { label: "contact@company", fn: (_f, _l, c) => `contact@${clean(c)}`, category: "branded" },
  { label: "info@company", fn: (_f, _l, c) => `info@${clean(c)}`, category: "branded" },
];

type Category = "all" | "professional" | "simple" | "branded";

const CAT_LABELS: Record<Category, string> = {
  all: "All",
  professional: "Professional",
  simple: "Simple",
  branded: "Branded",
};

const faqs = [
  { q: "What is the most professional email format?", a: "The most widely accepted professional email format is firstname.lastname@company.com (e.g., jane.smith@company.com). This is the standard at most enterprises and is easy for recipients to remember and type." },
  { q: "Should I use my full name or initials in my email?", a: "Full name (firstname.lastname) is clearest and most professional for most roles. Initial formats (j.smith or jsmith) work well at large organizations where full-name addresses are taken. Avoid numbers in professional addresses unless necessary." },
  { q: "What are good generic business email addresses?", a: "Common generic addresses include: hello@, contact@, support@, info@, team@, and press@. 'hello@' feels friendlier for startups; 'support@' is standard for customer service; 'press@' is for media inquiries. Avoid 'noreply@' — it discourages replies." },
  { q: "Can email addresses contain special characters?", a: "The local part (before @) can technically contain periods (.), plus signs (+), hyphens (-), and underscores (_). However, some older email systems don't handle special characters well. Stick to letters, numbers, periods, and hyphens for maximum compatibility." },
  { q: "What is the maximum length of an email address?", a: "The local part (before @) can be up to 64 characters. The domain part (after @) can be up to 255 characters. The total email address can be up to 320 characters. In practice, keep addresses short and memorable." },
];

const relatedTools = [
  { title: "Subject Line Generator", href: "/tools/subject-line-generator", description: "Generate high-converting email subject lines." },
  { title: "Email Signature Generator", href: "/tools/email-signature-generator", description: "Build a professional email signature in seconds." },
  { title: "Email Character Counter", href: "/tools/email-character-counter", description: "Count subject line and preview text characters." },
];

export default function EmailUsernameGenerator() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const { toast } = useToast();
  useToolView("email-username-generator");

  const effectiveDomain = domain.trim() || (company ? `${clean(company)}.com` : "company.com");

  const results = useMemo(() => {
    if (!firstName && !lastName) return [];
    return PATTERNS
      .filter(p => category === "all" || p.category === category)
      .map(p => {
        const raw = p.fn(firstName || "first", lastName || "last", company || "company");
        const full = raw.includes("@") ? `${raw.split("@")[0]}@${effectiveDomain}` : `${raw}@${effectiveDomain}`;
        return { label: p.label, full, category: p.category };
      })
      .filter(r => r.full.length > 3);
  }, [firstName, lastName, company, effectiveDomain, category]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: text });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(results.map(r => r.full).join("\n"));
    toast({ title: "All copied!", description: `${results.length} email addresses copied.` });
  };

  const catColor: Record<string, string> = {
    professional: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    simple: "text-green-400 bg-green-400/10 border-green-400/20",
    branded: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  };

  return (
    <MiniToolLayout
      seoTitle="Email Username Generator — Professional Email Address Formats"
      seoDescription="Generate professional email address formats from a name and company. All common patterns including firstname.lastname, initials, and branded addresses. Free."
      icon={AtSign}
      badge="Email Tool"
      title="Email Username Generator"
      description="Enter a name and company to generate all common professional email address patterns. Get firstname.lastname, initial formats, and branded addresses — all in one click."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">First Name</label>
            <Input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="e.g. Jane"
              className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name</label>
            <Input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="e.g. Smith"
              className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company Name</label>
            <Input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Domain <span className="text-muted-foreground/50 font-normal normal-case">(optional)</span></label>
            <Input
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder={company ? `${clean(company) || "company"}.com` : "company.com"}
              className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        {/* Filter */}
        {results.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filter:</span>
            {(["all", "professional", "simple", "branded"] as Category[]).map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                }`}
              >
                {CAT_LABELS[c]}
              </button>
            ))}
            <Button variant="outline" size="sm" onClick={copyAll} className="text-xs border-border/60 h-7 ml-auto">
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy all
            </Button>
          </div>
        )}

        {/* Results */}
        {results.length > 0 ? (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 hover:border-primary/30 hover:bg-card/70 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${catColor[r.category]}`}>
                    {r.category}
                  </span>
                  <span className="text-sm font-mono font-medium text-primary truncate">{r.full}</span>
                </div>
                <button onClick={() => copy(r.full)} className="shrink-0 p-1.5 rounded-md text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 p-8 text-center space-y-2">
            <AtSign className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground/50">Enter a first name or last name above to generate email addresses</p>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
