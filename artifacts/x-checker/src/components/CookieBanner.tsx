import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { getConsentStatus, setConsent, loadGA } from "@/lib/analytics";
import { Link } from "wouter";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const status = getConsentStatus();
    if (status === "pending") {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
    if (status === "accepted") {
      loadGA();
    }
  }, []);

  const accept = () => {
    setConsent(true);
    setVisible(false);
  };

  const decline = () => {
    setConsent(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom-2 duration-300"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border/70 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/30 px-5 py-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-0.5">We use cookies to improve your experience</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use Google Analytics to understand how people use our tools — no personal data is sold.{" "}
              <Link href="/privacy">
                <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={decline}
            className="text-xs text-muted-foreground hover:text-foreground flex-1 sm:flex-none border border-border/60 hover:border-border"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="text-xs flex-1 sm:flex-none shadow-sm shadow-primary/20"
          >
            Accept All
          </Button>
          <button
            onClick={decline}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
