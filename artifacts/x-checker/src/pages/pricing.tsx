import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Users, Building2, Sparkles } from "lucide-react";
import { EmailCapture } from "@/components/monetization/EmailCapture";

const FREE_FEATURES = [
  "Account checker — up to 100 at once",
  "AI bio generator (3 variations)",
  "Profile link generator",
  "@ formatter",
  "Hashtag formatter",
  "Tweet thread formatter",
  "Character counter",
  "Twitter font preview",
  "All bio templates (100+)",
  "Username generator",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Account checker — up to 500 at once",
  "AI bio generator — unlimited variations",
  "Bulk export to CSV",
  "Saved collections & history",
  "Username availability alerts",
  "Advanced analytics dashboard",
  "Priority support",
  "No ads",
];

const TEAM_FEATURES = [
  "Everything in Pro",
  "Up to 10 team members",
  "Shared collections & workspaces",
  "API access",
  "White-label export",
  "Custom branding",
  "Dedicated account manager",
  "SLA support",
];

interface PlanCardProps {
  icon: React.ElementType;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
  cta: string;
  ctaVariant?: "default" | "outline";
  comingSoon?: boolean;
}

function PlanCard({
  icon: Icon,
  name,
  price,
  period = "/month",
  description,
  features,
  badge,
  highlighted,
  cta,
  ctaVariant = "outline",
  comingSoon,
}: PlanCardProps) {
  return (
    <div className={`relative rounded-2xl border p-6 flex flex-col gap-5 ${
      highlighted
        ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
        : "border-border/60 bg-card/50"
    }`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground border-primary shadow-sm text-xs px-3">
            {badge}
          </Badge>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
            highlighted ? "bg-primary/15 border-primary/30" : "bg-muted/60 border-border/50"
          }`}>
            <Icon className={`h-4.5 w-4.5 ${highlighted ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <span className="font-semibold text-lg">{name}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{price}</span>
          {price !== "Free" && <span className="text-sm text-muted-foreground">{period}</span>}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <Button
        variant={ctaVariant}
        className={`w-full ${highlighted ? "shadow-sm shadow-primary/20" : ""}`}
        disabled={comingSoon}
      >
        {comingSoon ? (
          <>
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Coming Soon
          </>
        ) : cta}
      </Button>

      <ul className="space-y-2.5 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <Check className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${highlighted ? "text-primary" : "text-muted-foreground"}`} />
            <span className={i === 0 && name !== "Free" ? "text-muted-foreground italic text-xs mt-0.5" : ""}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  return (
    <Layout>
      <SeoHead
        title="X Toolkit Pricing — Free & Pro Plans"
        description="X Toolkit is free to use. Pro features are coming soon — join the waitlist for early access and 40% off launch pricing."
        path="/pricing"
      />
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20 space-y-16">

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/8 text-xs">
            <Zap className="h-3 w-3 mr-1.5" /> Pro Features Coming Soon
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            All core tools are free forever. Pro is coming soon with power-user features —
            join the waitlist to get 40% off launch pricing.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-5">
          <PlanCard
            icon={Sparkles}
            name="Free"
            price="Free"
            description="Everything you need to manage your X presence. No credit card, no signup required."
            features={FREE_FEATURES}
            cta="Start Using Free Tools"
            ctaVariant="outline"
          />
          <PlanCard
            icon={Zap}
            name="Pro"
            price="$7"
            description="For power users who want more scale, history, and zero distractions."
            features={PRO_FEATURES}
            badge="Most Popular"
            highlighted
            cta="Join Pro Waitlist"
            comingSoon
          />
          <PlanCard
            icon={Building2}
            name="Team"
            price="$19"
            description="Shared workspace for agencies, community managers, and creator teams."
            features={TEAM_FEATURES}
            cta="Join Team Waitlist"
            comingSoon
          />
        </div>

        {/* Waitlist section */}
        <div className="max-w-lg mx-auto">
          <EmailCapture
            variant="inline"
            headline="Join the Pro waitlist"
            subline="Be first to know when Pro launches. Waitlist members get 40% off and first access."
            source="pricing_page"
          />
        </div>

        {/* FAQ */}
        <div className="space-y-5 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-center">Common questions</h2>
          <div className="space-y-4">
            {[
              { q: "Will the free plan always be free?", a: "Yes. All current tools are free and will stay free forever. Pro is an optional upgrade for power users who want more scale and advanced features." },
              { q: "When will Pro launch?", a: "We're actively building Pro features. Join the waitlist to be notified the moment it's ready — waitlist members get 40% off launch pricing." },
              { q: "What payment methods will you accept?", a: "We'll accept all major credit cards via Stripe, as well as PayPal. Annual billing will be available at a discount." },
              { q: "Can I cancel anytime?", a: "Yes, Pro will be month-to-month with no lock-in. Cancel anytime from your account settings." },
            ].map(({ q, a }, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-5">
                <h3 className="font-medium text-sm mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-muted-foreground/50">
          X Toolkit is not affiliated with Twitter / X Corp. • All trademarks belong to their respective owners.
        </p>
      </div>
    </Layout>
  );
}
