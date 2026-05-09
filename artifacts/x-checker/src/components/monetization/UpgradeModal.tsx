import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, Lock } from "lucide-react";
import { EmailCapture } from "./EmailCapture";
import { trackEvent } from "@/lib/analytics";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  source?: string;
}

const PRO_FEATURES = [
  "AI-powered bio generation (10x more personalized)",
  "Bulk account checking — up to 500 at once",
  "Export results as CSV",
  "Saved collections & history",
  "Username availability alerts",
  "Advanced analytics dashboard",
  "Priority support",
  "No ads",
];

export function UpgradeModal({ open, onOpenChange, featureName, source = "upgrade_modal" }: UpgradeModalProps) {
  const handleOpen = (val: boolean) => {
    if (val) trackEvent("upgrade_click", { label: source, feature: featureName });
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md bg-card border-border/70 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/8 text-xs">Coming Soon</Badge>
          </div>
          <DialogTitle className="text-xl">
            {featureName ? `${featureName} is a Pro feature` : "Unlock X Toolkit Pro"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            We're building premium features for power users. Join the waitlist to get early access and a launch discount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-3">What's in Pro</p>
            <ul className="space-y-2">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <EmailCapture
            variant="compact"
            source={`${source}_modal`}
            headline=""
            subline=""
          />

          <p className="text-xs text-center text-muted-foreground/50">
            <Lock className="h-3 w-3 inline mr-1" />
            Waitlist members get 40% off launch pricing
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PremiumBadge({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 hover:border-amber-500/50 transition-colors"
    >
      <Zap className="h-2.5 w-2.5" /> PRO
    </button>
  );
}
