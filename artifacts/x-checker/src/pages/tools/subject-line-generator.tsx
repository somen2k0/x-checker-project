import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

type EmailType = "promotional" | "newsletter" | "welcome" | "reengagement" | "transactional" | "announcement";

interface Template {
  text: string;
  tip: string;
}

const TEMPLATES: Record<EmailType, (topic: string) => Template[]> = {
  promotional: (t) => [
    { text: `Don't miss this: ${t} is now available`, tip: "Urgency + topic" },
    { text: `Exclusive deal on ${t} — today only`, tip: "Scarcity" },
    { text: `Your ${t} upgrade is waiting`, tip: "Personalized possession" },
    { text: `Save big on ${t} this week`, tip: "Benefit-led" },
    { text: `${t}: Limited spots left`, tip: "FOMO trigger" },
    { text: `The ${t} offer you've been waiting for`, tip: "Anticipation" },
    { text: `Get ${t} for less — here's how`, tip: "How-to curiosity" },
    { text: `We're slashing prices on ${t}`, tip: "Direct & bold" },
  ],
  newsletter: (t) => [
    { text: `This week in ${t}: what you need to know`, tip: "Weekly roundup" },
    { text: `${t} insights you won't find elsewhere`, tip: "Exclusivity" },
    { text: `5 things happening in ${t} right now`, tip: "List format" },
    { text: `The ${t} update — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`, tip: "Dated edition" },
    { text: `What everyone in ${t} is talking about`, tip: "Social proof" },
    { text: `Your ${t} digest is here`, tip: "Simple & expected" },
    { text: `Trending in ${t} this week`, tip: "Trend-based" },
    { text: `We read everything about ${t} so you don't have to`, tip: "Value proposition" },
  ],
  welcome: (t) => [
    { text: `Welcome! Here's how to get started with ${t}`, tip: "Onboarding" },
    { text: `You're in — your ${t} journey starts now`, tip: "Excitement" },
    { text: `Thanks for joining — here's what to do first with ${t}`, tip: "CTA-driven" },
    { text: `Welcome to ${t} — 3 things to do right now`, tip: "Action list" },
    { text: `You made it! Here's your ${t} welcome pack`, tip: "Reward framing" },
    { text: `Your ${t} account is ready. Let's go!`, tip: "Ready-state" },
  ],
  reengagement: (t) => [
    { text: `We miss you — here's what's new in ${t}`, tip: "Emotional + update" },
    { text: `It's been a while. Check out ${t} again`, tip: "Low pressure" },
    { text: `Still interested in ${t}? Here's a reason to come back`, tip: "Incentive hook" },
    { text: `${t} has changed. A lot. Want to see?`, tip: "Intrigue" },
    { text: `Is this goodbye? (We hope not.)`, tip: "Emotional" },
    { text: `Your ${t} is collecting dust — let's fix that`, tip: "Problem-aware" },
    { text: `One thing we know you'll love about the new ${t}`, tip: "Single benefit" },
  ],
  transactional: (t) => [
    { text: `Your ${t} order is confirmed`, tip: "Confirmation" },
    { text: `${t}: Your receipt is attached`, tip: "Receipt" },
    { text: `Action required for your ${t} account`, tip: "Urgency" },
    { text: `Your ${t} is ready to download`, tip: "Delivery" },
    { text: `${t} — shipping confirmation & tracking`, tip: "Tracking" },
    { text: `Important: your ${t} expires soon`, tip: "Expiry alert" },
  ],
  announcement: (t) => [
    { text: `Introducing ${t} — everything you need to know`, tip: "Launch" },
    { text: `Big news: ${t} is here`, tip: "Bold announcement" },
    { text: `We've been working on something: ${t}`, tip: "Build-up reveal" },
    { text: `${t} is officially live — be first to try it`, tip: "Exclusivity" },
    { text: `Meet ${t}: our biggest update yet`, tip: "Milestone framing" },
    { text: `We're excited to announce ${t}`, tip: "Direct" },
    { text: `The wait is over: ${t} is here`, tip: "Payoff" },
  ],
};

const TYPE_LABELS: Record<EmailType, string> = {
  promotional: "Promotional",
  newsletter: "Newsletter",
  welcome: "Welcome",
  reengagement: "Re-engagement",
  transactional: "Transactional",
  announcement: "Announcement",
};

const faqs = [
  { q: "What makes a good email subject line?", a: "The best subject lines are specific, benefit-driven, and create curiosity or urgency without being clickbait. Keep them under 50 characters for mobile. Personalization (using the recipient's name or referencing their behavior) consistently improves open rates." },
  { q: "How long should an email subject line be?", a: "Aim for 30–50 characters. Most mobile email clients display around 30–40 characters before truncating. Desktop clients show more, but with mobile-first audiences, shorter wins. Preheader text (preview text) can carry the rest of the message." },
  { q: "What is preheader text?", a: "Preheader text (also called preview text) is the short summary that appears after the subject line in many email clients, in your inbox list view. It's a second chance to convince someone to open. Aim for 40–100 characters and treat it as a continuation of the subject line." },
  { q: "Should I use emojis in email subject lines?", a: "Used sparingly, emojis can boost open rates — they stand out visually in the inbox. Relevant emojis that reinforce the message work best. Avoid using emojis as the first character (some clients don't render them) and don't overuse them — it can look spammy." },
  { q: "Do spam trigger words in subject lines affect deliverability?", a: "Yes. Words like 'FREE!!!', 'GUARANTEED', 'ACT NOW', or excessive punctuation can trigger spam filters. Modern spam detection is more sophisticated than just keyword matching, but it's still good practice to avoid overtly salesy language." },
  { q: "What is a good email open rate?", a: "Average open rates vary by industry, but 20–40% is generally considered good for B2C email. B2B campaigns often see 20–30%. Rates above 40% are excellent. Factors include list quality, sender reputation, subject line, and send time." },
];

const relatedTools = [
  { title: "Email Character Counter", href: "/tools/email-character-counter", description: "Count subject line and body characters by platform." },
  { title: "Email Signature Generator", href: "/tools/email-signature-generator", description: "Build a professional email signature in seconds." },
  { title: "Plain Text Email Formatter", href: "/tools/plain-text-formatter", description: "Convert HTML emails to clean plain text." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters for any text." },
];

export default function SubjectLineGenerator() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<EmailType>("promotional");
  const [generated, setGenerated] = useState(false);
  const { toast } = useToast();
  useToolView("subject-line-generator");

  const lines = useMemo(() => {
    if (!topic.trim()) return [];
    return TEMPLATES[type](topic.trim());
  }, [topic, type, generated]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: text });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(lines.map(l => l.text).join("\n"));
    toast({ title: "All copied!", description: `${lines.length} subject lines copied.` });
  };

  const charColor = (len: number) => {
    if (len <= 40) return "text-green-500";
    if (len <= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <MiniToolLayout
      seoTitle="Email Subject Line Generator — Free Templates for Every Campaign Type"
      seoDescription="Generate high-converting email subject lines instantly. Templates for promotional, newsletter, welcome, re-engagement, and announcement emails. Free, no signup."
      icon={Mail}
      badge="Email Tool"
      title="Email Subject Line Generator"
      description="Generate subject line templates for any email campaign type. Enter your topic, choose the email type, and get proven subject line formulas — ready to copy and customize."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        {/* Email type selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Type</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_LABELS) as EmailType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  type === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:border-border hover:text-foreground"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Topic input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Topic / Product / Brand</label>
          <div className="flex gap-2">
            <Input
              value={topic}
              onChange={e => { setTopic(e.target.value); setGenerated(true); }}
              placeholder="e.g. our new analytics dashboard, summer sale, free trial"
              className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
            />
            {lines.length > 0 && (
              <Button variant="outline" size="sm" onClick={copyAll} className="text-xs border-border/60 shrink-0">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy all
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {lines.length > 0 ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
              Subject Lines — {lines.length} templates
            </label>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 hover:border-primary/30 hover:bg-card/70 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{line.text}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[10px] font-mono font-semibold ${charColor(line.text.length)}`}>
                        {line.text.length} chars
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 bg-muted/40 px-1.5 py-0.5 rounded">
                        {line.tip}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => copy(line.text)} className="shrink-0 p-1.5 rounded-md text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 p-8 text-center space-y-2">
            <Mail className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground/50">Enter your topic above to generate subject lines</p>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border/60 bg-card/30 p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject Line Best Practices</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { good: true, text: "Keep it under 50 characters" },
              { good: true, text: "Lead with the benefit or value" },
              { good: true, text: "Create curiosity or urgency" },
              { good: true, text: "Test two versions (A/B test)" },
              { good: false, text: "Avoid ALL CAPS — looks like spam" },
              { good: false, text: "No misleading clickbait" },
              { good: false, text: "Avoid spam words: FREE!!!, URGENT" },
              { good: false, text: "Don't start with 'Hi', 'Hello', etc." },
            ].map(({ good, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${
                  good ? "border-green-500/40 text-green-500 bg-green-500/10" : "border-red-500/40 text-red-500 bg-red-500/10"
                }`}>{good ? "✓" : "✗"}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
