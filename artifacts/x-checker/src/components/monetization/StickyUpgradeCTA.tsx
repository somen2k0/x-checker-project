import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Zap, CheckCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface StickyUpgradeCTAProps {
  delay?: number;
}

const STORAGE_KEY = "sticky_cta_dismissed";

export function StickyUpgradeCTA({ delay = 20000 }: StickyUpgradeCTAProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    const alreadySubscribed = (JSON.parse(localStorage.getItem("email_signups") ?? "[]") as unknown[]).length > 0;

    if (dismissed || alreadySubscribed) return;

    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.includes("@")) return;
    trackEvent("email_capture", { label: "sticky_cta" });
    const existing = JSON.parse(localStorage.getItem("email_signups") ?? "[]");
    localStorage.setItem("email_signups", JSON.stringify([...existing, { email, source: "sticky_cta", ts: Date.now() }]));
    setSubmitted(true);
    setTimeout(dismiss, 2500);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4 animate-in slide-in-from-bottom-3 duration-400">
      <div className="max-w-2xl mx-auto rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/40 px-4 md:px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            {!submitted ? (
              <>
                <p className="text-sm font-semibold text-foreground">Like this tool? Pro features are coming.</p>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Bulk checking, CSV export, AI bios, and no ads — join the waitlist for 40% off.
                </p>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="text-xs bg-background/60 border-border/60 focus-visible:ring-primary/40 h-8 flex-1 min-w-0"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!email.includes("@")}
                    className="text-xs h-8 shrink-0 shadow-sm shadow-primary/20"
                  >
                    Notify Me
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex items-center gap-2 py-1">
                <CheckCheck className="h-4 w-4 text-success shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">You're on the list!</p>
                  <p className="text-xs text-muted-foreground">We'll email you when Pro launches.</p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 -mr-1 -mt-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
