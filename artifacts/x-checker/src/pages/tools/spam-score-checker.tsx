import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "What is an email spam score?", a: "A spam score is a numerical rating that estimates the likelihood of an email being flagged as spam by inbox providers like Gmail, Outlook, and Yahoo. Tools like SpamAssassin use hundreds of rules to calculate this score. A score below 5 is generally safe." },
  { q: "What words trigger spam filters?", a: "Common spam triggers include: 'free', 'guaranteed', 'no risk', 'act now', 'click here', 'make money', excessive capitalization (ALL CAPS), multiple exclamation marks, and phrases like 'you have been selected'." },
  { q: "Why do my emails go to spam even without spam words?", a: "Spam filters look at more than just words. Other factors include low sender reputation, high bounce rates, no SPF/DKIM authentication, poor engagement history, sending to purchased lists, and missing unsubscribe links." },
  { q: "How do I improve email deliverability?", a: "Set up SPF, DKIM, and DMARC records, warm up new sender domains gradually, maintain a clean list by removing bounces and inactive subscribers, always include an unsubscribe link, and maintain a healthy sender reputation." },
  { q: "Does using 'free' in an email always trigger spam filters?", a: "Not always — context matters. 'Free shipping on orders over $50' in a transactional email from a trusted sender is usually fine. But 'FREE GIFT!!! Click now!!!' with multiple exclamation marks raises red flags." },
];

const relatedTools = [
  { title: "Email A/B Tester", href: "/tools/email-ab-tester", description: "Compare two subject lines and predict the winner." },
  { title: "Subject Line Generator", href: "/tools/subject-line-generator", description: "Generate high-converting email subject lines." },
  { title: "Email Character Counter", href: "/tools/email-character-counter", description: "Count characters for subject lines and body text." },
];

interface SpamRule {
  id: string;
  label: string;
  description: string;
  severity: "high" | "medium" | "low";
  points: number;
  test: (subject: string, body: string) => boolean;
}

const SPAM_RULES: SpamRule[] = [
  { id: "caps", label: "Excessive ALL CAPS", description: "More than 30% of letters are uppercase", severity: "high", points: 25, test: (s, b) => { const t = (s + " " + b).replace(/[^a-zA-Z]/g, ""); return t.length > 10 && (t.match(/[A-Z]/g)?.length || 0) / t.length > 0.3; } },
  { id: "exclaim", label: "Excessive Exclamation Marks", description: "3 or more exclamation marks found", severity: "high", points: 20, test: (s, b) => (s + b).split("!").length - 1 >= 3 },
  { id: "money", label: "Money/Get-Rich Phrases", description: "Phrases like 'make money', 'earn cash', 'earn extra income'", severity: "high", points: 25, test: (s, b) => { const lower = (s + " " + b).toLowerCase(); return ["make money", "earn cash", "earn extra", "get rich", "double your income", "financial freedom fast"].some(w => lower.includes(w)); } },
  { id: "free_trigger", label: "Spam Trigger: FREE (shouted)", description: "'FREE' in all caps or with punctuation", severity: "high", points: 20, test: (s, b) => /\bFREE\b/.test(s + " " + b) },
  { id: "click_here", label: "Spam Trigger: Click Here / Act Now", description: "Generic CTA phrases that trigger filters", severity: "medium", points: 15, test: (s, b) => { const lower = (s + " " + b).toLowerCase(); return ["click here", "act now", "order now", "buy now", "sign up free"].some(w => lower.includes(w)); } },
  { id: "guaranteed", label: "Guarantee Phrases", description: "Words like 'guaranteed', '100%', 'no risk', 'risk free'", severity: "medium", points: 15, test: (s, b) => { const lower = (s + " " + b).toLowerCase(); return ["guaranteed", "no risk", "risk free", "100% free", "100% safe", "no obligation"].some(w => lower.includes(w)); } },
  { id: "winner", label: "Prize/Winner Phrases", description: "'You have won', 'selected', 'prize', 'claim your'", severity: "high", points: 25, test: (s, b) => { const lower = (s + " " + b).toLowerCase(); return ["you have won", "you've won", "you are selected", "claim your prize", "claim your reward", "you've been selected"].some(w => lower.includes(w)); } },
  { id: "urgent_spam", label: "Excessive Urgency Language", description: "Multiple urgency triggers stacked together", severity: "medium", points: 10, test: (s, b) => { const lower = (s + " " + b).toLowerCase(); const count = ["limited time", "expires", "deadline", "urgent", "immediately", "today only", "last chance"].filter(w => lower.includes(w)).length; return count >= 2; } },
  { id: "subject_long", label: "Subject Line Too Long", description: "Subject line exceeds 60 characters", severity: "low", points: 5, test: (s) => s.length > 60 },
  { id: "no_personalization", label: "No Personalization", description: "No first name token in subject or greeting", severity: "low", points: 5, test: (s, b) => !/{{\s*\w+\s*}}|\{\w+\}|\[name\]|%name%|%first_name%/i.test(s + b) },
];

export default function SpamScoreChecker() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [checked, setChecked] = useState(false);
  useToolView("spam-score-checker");

  const triggeredRules = useMemo(() => checked ? SPAM_RULES.filter(r => r.test(subject, body)) : [], [checked, subject, body]);
  const totalScore = triggeredRules.reduce((s, r) => s + r.points, 0);
  const maxScore = 100;
  const clampedScore = Math.min(totalScore, maxScore);

  const getRating = () => {
    if (clampedScore === 0) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30", desc: "Your email looks clean. Good deliverability expected." };
    if (clampedScore <= 15) return { label: "Good", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30", desc: "Minor issues found. Most inboxes will accept this." };
    if (clampedScore <= 35) return { label: "Caution", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", desc: "Some spam triggers detected. Review flagged items." };
    if (clampedScore <= 60) return { label: "Risky", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30", desc: "High spam risk. This email may land in spam." };
    return { label: "Spam", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30", desc: "Very likely to be flagged as spam. Revise before sending." };
  };

  const rating = getRating();
  const passedRules = SPAM_RULES.filter(r => !triggeredRules.includes(r));
  const SEVERITY_COLORS = { high: "text-red-400 bg-red-400/10 border-red-400/30", medium: "text-orange-400 bg-orange-400/10 border-orange-400/30", low: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" };

  return (
    <MiniToolLayout
      seoTitle="Email Spam Score Checker — Check Subject Line & Content for Spam Triggers"
      seoDescription="Check your email subject line and body for spam trigger words, excessive caps, urgency overload, and 10 other spam signals. Get an instant spam score and fix recommendations."
      icon={ShieldAlert}
      badge="Email Tool"
      title="Spam Score Checker"
      description="Paste your email subject line and body to instantly check for spam triggers. Get a spam score, see exactly which rules are triggered, and learn how to fix each one."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Email Subject Line</label>
            <Input
              value={subject}
              onChange={e => { setSubject(e.target.value); setChecked(false); }}
              placeholder="e.g. FREE GIFT!!! You've been selected — Act NOW!!!"
              className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Email Body (optional)</label>
            <Textarea
              value={body}
              onChange={e => { setBody(e.target.value); setChecked(false); }}
              placeholder="Paste your email body content here for a more thorough check..."
              className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40 resize-none"
              rows={5}
            />
          </div>
        </div>

        <Button onClick={() => setChecked(true)} disabled={!subject.trim()} className="w-full">
          <ShieldAlert className="h-4 w-4 mr-2" /> Check Spam Score
        </Button>

        {checked && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`rounded-xl border p-5 text-center ${rating.bg}`}>
              <div className={`text-5xl font-bold ${rating.color} mb-1`}>{clampedScore}/100</div>
              <div className={`text-base font-semibold ${rating.color}`}>{rating.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{rating.desc}</div>
            </div>

            {triggeredRules.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" /> {triggeredRules.length} Issue{triggeredRules.length !== 1 ? "s" : ""} Found
                </h3>
                {triggeredRules.map(rule => (
                  <div key={rule.id} className={`rounded-xl border p-3.5 ${SEVERITY_COLORS[rule.severity]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{rule.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase border rounded px-1.5 py-0.5 border-current opacity-70">{rule.severity}</span>
                        <span className="text-xs font-bold">+{rule.points}pts</span>
                      </div>
                    </div>
                    <p className="text-xs opacity-80">{rule.description}</p>
                  </div>
                ))}
              </div>
            )}

            {passedRules.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> {passedRules.length} Checks Passed
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {passedRules.map(rule => (
                    <div key={rule.id} className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      <span className="text-xs text-green-400">{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
