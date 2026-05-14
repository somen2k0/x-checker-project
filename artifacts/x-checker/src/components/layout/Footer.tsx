import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeedbackModal } from "@/components/FeedbackModal";
import { Search, Sparkles, Link2, AtSign, Mail, CheckCheck, Hash, MessageSquare, Type, BarChart2, Users, Smile, Briefcase, Palette, FileJson, Lock } from "lucide-react";

const X_TOOLS = [
  { icon: Search, label: "Account Checker", href: "/tools/x-account-checker" },
  { icon: Sparkles, label: "Bio Generator", href: "/tools/bio-generator" },
  { icon: Link2, label: "Profile Links", href: "/tools/profile-link-generator" },
  { icon: AtSign, label: "@ Formatter", href: "/tools/at-formatter" },
];

const CONTENT_TOOLS = [
  { icon: Sparkles, label: "Bio Ideas", href: "/tools/bio-ideas" },
  { icon: Smile, label: "Funny Bios", href: "/tools/funny-bios" },
  { icon: Briefcase, label: "Professional Bios", href: "/tools/professional-bios" },
  { icon: Palette, label: "Aesthetic Bios", href: "/tools/aesthetic-bios" },
  { icon: AtSign, label: "Username Generator", href: "/tools/username-generator" },
  { icon: Users, label: "Name Ideas", href: "/tools/name-ideas" },
];

const FORMATTING_TOOLS = [
  { icon: Hash, label: "Hashtag Formatter", href: "/tools/hashtag-formatter" },
  { icon: MessageSquare, label: "Tweet Formatter", href: "/tools/tweet-formatter" },
  { icon: Type, label: "Font Preview", href: "/tools/font-preview" },
  { icon: BarChart2, label: "Character Counter", href: "/tools/character-counter" },
];

const DEV_TOOLS = [
  { icon: FileJson, label: "JSON Formatter", href: "/tools/json-formatter" },
  { icon: Lock, label: "Base64 Encoder", href: "/tools/base64" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubscribe = () => {
    if (!email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <>
      <footer className="border-t border-border/50 bg-card/30 mt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-6">

            {/* Brand */}
            <div className="col-span-2 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                  <span className="text-white font-bold text-sm leading-none">XT</span>
                </div>
                <span className="font-semibold text-foreground">X Toolkit</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Free tools for creators and developers. X tools, content generators, and developer utilities — no signup, no data stored.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                All services operational
              </div>
            </div>

            {/* X Tools */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60">X Tools</h3>
              <ul className="space-y-2">
                {X_TOOLS.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <Link href={href}>
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                        <Icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                        {label}
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Tools */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Content</h3>
              <ul className="space-y-2">
                {CONTENT_TOOLS.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <Link href={href}>
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                        <Icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formatting + Dev Tools */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Formatting</h3>
              <ul className="space-y-2">
                {FORMATTING_TOOLS.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <Link href={href}>
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                        <Icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 pt-3">Developer</h3>
              <ul className="space-y-2">
                {DEV_TOOLS.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <Link href={href}>
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                        <Icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Company</h3>
              <ul className="space-y-2">
                {[
                  { label: "About", href: "/about" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Contact / Feedback", action: () => setShowFeedback(true) },
                ].map(({ label, href, action }) => (
                  <li key={label}>
                    {action ? (
                      <button onClick={action} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {label}
                      </button>
                    ) : (
                      <Link href={href!}>
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {label}
                        </button>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">New tools and features in your inbox.</p>
              {!subscribed ? (
                <div className="flex flex-col gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    placeholder="your@email.com"
                    className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40 h-9"
                  />
                  <Button onClick={handleSubscribe} disabled={!email.includes("@")} size="sm" className="w-full text-xs shadow-sm shadow-primary/20">
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> Subscribe
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2.5">
                  <CheckCheck className="h-4 w-4 shrink-0" />
                  <span>You're subscribed!</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground/50">No spam. Unsubscribe anytime.</p>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/60">
            <span>© {new Date().getFullYear()} X Toolkit. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy"><button className="hover:text-foreground transition-colors">Privacy</button></Link>
              <Link href="/terms"><button className="hover:text-foreground transition-colors">Terms</button></Link>
              <button onClick={() => setShowFeedback(true)} className="hover:text-foreground transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackModal open={showFeedback} onOpenChange={setShowFeedback} />
    </>
  );
}
