import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FlaskConical, TrendingUp, Minus } from "lucide-react";
import { useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "What is email A/B testing?", a: "Email A/B testing (split testing) means sending two versions of an email to different segments of your audience to see which performs better. You test one variable at a time — usually the subject line — and send the winner to the rest of your list." },
  { q: "What is a good email open rate?", a: "Average email open rates vary by industry but generally fall between 20–30%. Above 30% is excellent. Below 15% typically signals issues with subject lines, sender reputation, or list quality." },
  { q: "What should I A/B test in email campaigns?", a: "Subject lines have the biggest impact on open rates. Other high-impact tests include sender name, preview text, send time, email length, CTA text, and personalization. Test one variable at a time for clean results." },
  { q: "How long should I run an A/B test?", a: "Send your A/B test to 20–30% of your list (10–15% per variant), wait at least 2–4 hours for results to stabilize (or 24 hours if your list is international), then send the winner to the remaining 70–80%." },
  { q: "What makes a high-performing email subject line?", a: "Effective subject lines are concise (under 50 characters), create curiosity or urgency, personalize where possible, avoid spam trigger words, and clearly indicate value. Emojis can boost open rates by 20–30% when used sparingly." },
];

const relatedTools = [
  { title: "Subject Line Generator", href: "/tools/subject-line-generator", description: "Generate high-converting email subject lines." },
  { title: "Email Character Counter", href: "/tools/email-character-counter", description: "Count characters for subject lines and preview text." },
  { title: "Spam Score Checker", href: "/tools/spam-score-checker", description: "Check your subject line for spam trigger words." },
];

interface SubjectAnalysis {
  subject: string;
  charCount: number;
  wordCount: number;
  hasEmoji: boolean;
  hasNumber: boolean;
  hasQuestion: boolean;
  hasUrgency: boolean;
  hasPersonalization: boolean;
  spamWords: string[];
  score: number;
  breakdown: { label: string; value: boolean; points: number; tip: string }[];
}

const URGENCY_WORDS = ["now", "today", "limited", "expires", "last chance", "hurry", "deadline", "urgent", "ending", "only", "final", "exclusive"];
const SPAM_WORDS = ["free!!!", "click here", "buy now", "make money", "guaranteed", "winner", "cash", "prize", "100%", "act now", "order now", "risk free", "no cost", "earn extra"];
const PERSONALIZATION_TOKENS = ["{name}", "{first_name}", "{{name}}", "{{first}}", "[name]", "%name%"];

function analyzeSubject(subject: string): SubjectAnalysis {
  const lower = subject.toLowerCase();
  const hasEmoji = /\p{Emoji}/u.test(subject);
  const hasNumber = /\d/.test(subject);
  const hasQuestion = subject.includes("?");
  const hasUrgency = URGENCY_WORDS.some(w => lower.includes(w));
  const hasPersonalization = PERSONALIZATION_TOKENS.some(t => lower.includes(t.toLowerCase()));
  const spamWords = SPAM_WORDS.filter(w => lower.includes(w));
  const charCount = subject.length;
  const wordCount = subject.trim().split(/\s+/).filter(Boolean).length;

  const breakdown = [
    { label: "Length (30–50 chars)", value: charCount >= 30 && charCount <= 50, points: 20, tip: "30–50 characters is the sweet spot for open rates. Shorter may lack context; longer gets cut off." },
    { label: "Includes a number", value: hasNumber, points: 10, tip: "Numbers (e.g. '5 tips', '3x results') grab attention and set clear expectations." },
    { label: "Has an emoji", value: hasEmoji, points: 10, tip: "One emoji at the start boosts open rates by ~20% when relevant to the content." },
    { label: "Asks a question", value: hasQuestion, points: 10, tip: "Questions create curiosity and invite the reader to find the answer inside." },
    { label: "Creates urgency", value: hasUrgency, points: 15, tip: "Words like 'today', 'limited', 'ending' motivate action. Use sparingly to avoid fatigue." },
    { label: "Personalized", value: hasPersonalization, points: 15, tip: "Using the reader's first name increases open rates by 20%+. Even if you can't personalize, write as if talking to one person." },
    { label: "No spam words", value: spamWords.length === 0, points: 20, tip: `Spam trigger words hurt deliverability. Avoid: ${SPAM_WORDS.slice(0, 5).join(", ")}, etc.` },
  ];

  const score = breakdown.reduce((sum, b) => sum + (b.value ? b.points : 0), 0);
  return { subject, charCount, wordCount, hasEmoji, hasNumber, hasQuestion, hasUrgency, hasPersonalization, spamWords, score, breakdown };
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-yellow-400" : score >= 40 ? "text-orange-400" : "text-red-400";
  const bg = score >= 80 ? "bg-emerald-400/10 border-emerald-400/30" : score >= 60 ? "bg-yellow-400/10 border-yellow-400/30" : score >= 40 ? "bg-orange-400/10 border-orange-400/30" : "bg-red-400/10 border-red-400/30";
  const grade = score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Weak";
  return (
    <div className={`rounded-xl border p-4 text-center ${bg}`}>
      <div className={`text-4xl font-bold ${color}`}>{score}</div>
      <div className={`text-xs font-semibold mt-0.5 ${color}`}>{grade}</div>
      <div className="text-[11px] text-muted-foreground mt-1 truncate max-w-[160px] mx-auto" title={label}>{label || "Subject line"}</div>
    </div>
  );
}

export default function EmailAbTester() {
  const [subjectA, setSubjectA] = useState("");
  const [subjectB, setSubjectB] = useState("");
  const [tested, setTested] = useState(false);
  useToolView("email-ab-tester");

  const analysisA = useMemo(() => subjectA ? analyzeSubject(subjectA) : null, [subjectA]);
  const analysisB = useMemo(() => subjectB ? analyzeSubject(subjectB) : null, [subjectB]);

  const winner = tested && analysisA && analysisB
    ? analysisA.score > analysisB.score ? "A" : analysisB.score > analysisA.score ? "B" : "tie"
    : null;

  return (
    <MiniToolLayout
      seoTitle="Email A/B Tester — Compare Subject Lines & Predict the Winner Free"
      seoDescription="Compare two email subject lines side-by-side and get an instant score for each. Analyze length, urgency, personalization, spam words, and more. Free email A/B test tool."
      icon={FlaskConical}
      badge="Email Tool"
      title="Email A/B Tester"
      description="Enter two subject lines to compare them side-by-side. Get a score for each based on length, personalization, urgency, spam words, and other proven open-rate factors."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Subject Line A", value: subjectA, set: setSubjectA, placeholder: "🎉 Your exclusive offer expires tonight" },
            { label: "Subject Line B", value: subjectB, set: setSubjectB, placeholder: "5 tips to double your email open rate" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">{label}</label>
              <Input
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
              />
              <div className="text-xs text-muted-foreground">{value.length}/50 chars recommended</div>
            </div>
          ))}
        </div>

        <Button onClick={() => setTested(true)} disabled={!subjectA.trim() || !subjectB.trim()} className="w-full">
          <FlaskConical className="h-4 w-4 mr-2" /> Compare Subject Lines
        </Button>

        {tested && analysisA && analysisB && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {winner && winner !== "tie" && (
              <div className={`rounded-xl border p-3 text-center text-sm font-semibold ${
                winner === "A" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-blue-500/30 bg-blue-500/10 text-blue-400"
              }`}>
                <TrendingUp className="inline h-4 w-4 mr-1.5" />
                Predicted winner: Subject Line {winner} (+{Math.abs(analysisA.score - analysisB.score)} points)
              </div>
            )}
            {winner === "tie" && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center text-sm font-semibold text-yellow-400">
                <Minus className="inline h-4 w-4 mr-1.5" />
                It's a tie — both score equally. Test with a real audience segment.
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <ScoreGauge score={analysisA.score} label={subjectA} />
              <ScoreGauge score={analysisB.score} label={subjectB} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Factor Breakdown</h3>
              {analysisA.breakdown.map((factorA, i) => {
                const factorB = analysisB.breakdown[i];
                return (
                  <div key={factorA.label} className="rounded-xl border border-border/60 bg-card/30 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">{factorA.label}</span>
                      <span className="text-[10px] text-muted-foreground">+{factorA.points} pts</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`rounded-md px-2 py-1 text-center font-medium ${factorA.value ? "bg-green-500/15 text-green-400" : "bg-muted/30 text-muted-foreground/60"}`}>
                        A: {factorA.value ? "✓" : "✗"}
                      </div>
                      <div className={`rounded-md px-2 py-1 text-center font-medium ${factorB.value ? "bg-green-500/15 text-green-400" : "bg-muted/30 text-muted-foreground/60"}`}>
                        B: {factorB.value ? "✓" : "✗"}
                      </div>
                    </div>
                    {(!factorA.value || !factorB.value) && (
                      <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{factorA.tip}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
