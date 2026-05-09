import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCheck, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface EmailCaptureProps {
  variant?: "banner" | "inline" | "compact";
  headline?: string;
  subline?: string;
  source?: string;
}

export function EmailCapture({
  variant = "inline",
  headline = "Be first to know when Pro launches",
  subline = "Get early access, exclusive pricing, and new tool announcements.",
  source = "generic",
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.includes("@") || loading) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));
    trackEvent("email_capture", { label: source });

    const existing = JSON.parse(localStorage.getItem("email_signups") ?? "[]");
    localStorage.setItem("email_signups", JSON.stringify([...existing, { email, source, ts: Date.now() }]));

    setLoading(false);
    setSubmitted(true);
  };

  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="text-xs bg-background/60 border-border/60 focus-visible:ring-primary/40 h-9 flex-1"
            />
            <Button type="submit" size="sm" disabled={!email.includes("@") || loading} className="text-xs shadow-sm shadow-primary/20 shrink-0">
              {loading ? "..." : "Notify Me"}
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCheck className="h-4 w-4 shrink-0" />
            You're on the list!
          </div>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-y border-primary/20 py-4 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">{headline}</p>
              <p className="text-xs text-muted-foreground">{subline}</p>
            </div>
          </div>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="text-xs bg-background/80 border-border/60 focus-visible:ring-primary/40 h-9 min-w-[180px]"
              />
              <Button type="submit" size="sm" disabled={!email.includes("@") || loading} className="text-xs shadow-sm shadow-primary/20 shrink-0">
                {loading ? "..." : "Join Waitlist"}
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-sm text-success font-medium">
              <CheckCheck className="h-4 w-4 shrink-0" />
              You're on the list!
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-6 md:p-8 space-y-5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
          <Mail className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{headline}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{subline}</p>
        </div>
      </div>
      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="text-sm bg-background/70 border-border/60 focus-visible:ring-primary/40 flex-1"
          />
          <Button type="submit" disabled={!email.includes("@") || loading} className="shadow-sm shadow-primary/20 sm:min-w-[130px]">
            {loading ? "Joining..." : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Join Waitlist
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="flex items-center gap-2.5 text-success bg-success/10 border border-success/20 rounded-xl px-4 py-3">
          <CheckCheck className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">You're on the list!</p>
            <p className="text-xs text-muted-foreground">We'll email you as soon as Pro launches.</p>
          </div>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground/50">No spam. Unsubscribe anytime. Your email is stored locally until launch.</p>
    </div>
  );
}
