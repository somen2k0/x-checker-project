import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "What makes a great X profile?", a: "A great X profile has a clear profile photo, a keyword-rich bio under 160 characters, a pinned tweet showcasing your best content, a header image that reflects your brand, and a link to your website or latest project." },
  { q: "How important is a profile photo on X?", a: "Very important. Accounts with profile photos get 6x more engagement than those without. Use a clear, high-resolution headshot or recognizable logo. Avoid generic stock images." },
  { q: "Should I include keywords in my X bio?", a: "Yes. Your bio appears in search results and helps people decide to follow you. Include your niche keywords, what value you provide, and optionally a CTA or link to your latest work." },
  { q: "What should I pin to my profile?", a: "Pin your best-performing tweet, a thread that showcases your expertise, or a tweet promoting your latest project or offer. Your pinned tweet is the first thing visitors see after your bio." },
  { q: "How do I choose a good X username?", a: "Keep it short (under 15 characters), memorable, and relevant to your brand or niche. Avoid numbers and underscores unless they're part of your established brand. Consistency across platforms helps with discoverability." },
];

const relatedTools = [
  { title: "AI Bio Generator", href: "/tools/bio-generator", description: "Generate a professional X bio instantly with AI." },
  { title: "Follower Analyzer", href: "/tools/follower-analyzer", description: "Analyze your follower ratio and engagement rate." },
  { title: "Username Generator", href: "/tools/username-generator", description: "Generate unique X handle ideas for your brand." },
];

interface AuditItem {
  id: string;
  label: string;
  question: string;
  points: number;
  tip: string;
}

const AUDIT_ITEMS: AuditItem[] = [
  { id: "photo", label: "Profile Photo", question: "Do you have a clear, professional profile photo?", points: 15, tip: "Use a high-res headshot or brand logo. Avoid blurry or generic images." },
  { id: "header", label: "Header Image", question: "Do you have a custom header/banner image?", points: 10, tip: "Your header should reflect your brand or niche. Use it to showcase your offer or latest project." },
  { id: "bio", label: "Bio Filled Out", question: "Is your bio complete with keywords and a value prop?", points: 20, tip: "Write a bio that answers: Who are you? What do you do? Why should someone follow you? Include 2–3 niche keywords." },
  { id: "location", label: "Location / Website", question: "Have you added a location and website link?", points: 10, tip: "Adding a website link increases click-through and credibility. Location builds local trust." },
  { id: "pinned", label: "Pinned Tweet", question: "Do you have a pinned tweet showcasing your best work?", points: 15, tip: "Pin a thread, viral tweet, or your best piece of content. Visitors see this first." },
  { id: "consistent", label: "Consistent Posting", question: "Do you post at least 3x per week?", points: 15, tip: "Consistency is key. Even 3 quality posts per week outperforms sporadic bursts of activity." },
  { id: "engage", label: "Engagement", question: "Do you actively reply and engage with others?", points: 10, tip: "Engagement drives discovery. Replying to posts in your niche is one of the fastest growth levers." },
  { id: "thread", label: "Educational Threads", question: "Have you posted at least one educational thread?", points: 5, tip: "Threads showcase expertise and get shared widely. Aim for one per week." },
];

export default function ProfileAudit() {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [username, setUsername] = useState("");
  const [audited, setAudited] = useState(false);
  useToolView("profile-audit");

  const toggle = (id: string, val: boolean) => setAnswers(prev => ({ ...prev, [id]: prev[id] === val ? null : val }));

  const answered = Object.keys(answers).filter(k => answers[k] !== null).length;
  const score = AUDIT_ITEMS.reduce((sum, item) => sum + (answers[item.id] === true ? item.points : 0), 0);
  const maxScore = AUDIT_ITEMS.reduce((sum, item) => sum + item.points, 0);
  const percent = Math.round((score / maxScore) * 100);

  const getGrade = () => {
    if (percent >= 90) return { grade: "A+", label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" };
    if (percent >= 75) return { grade: "A", label: "Strong", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" };
    if (percent >= 60) return { grade: "B", label: "Good", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" };
    if (percent >= 40) return { grade: "C", label: "Needs Work", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30" };
    return { grade: "D", label: "Incomplete", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" };
  };

  const grade = getGrade();
  const failures = AUDIT_ITEMS.filter(item => answers[item.id] === false);

  return (
    <MiniToolLayout
      seoTitle="X Profile Audit — Score & Improve Your X (Twitter) Profile Free"
      seoDescription="Get an instant audit score for your X (Twitter) profile. Answer 8 questions and receive a detailed score, grade, and personalized tips to optimize your profile for growth."
      icon={ClipboardList}
      badge="X Tool"
      title="Profile Audit"
      description="Answer 8 quick questions about your X profile and get an instant audit score, letter grade, and personalized improvement tips — no login or API access needed."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Your X Username (optional)</label>
          <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40" />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile Checklist ({answered}/{AUDIT_ITEMS.length} answered)</h3>
          {AUDIT_ITEMS.map(item => (
            <div key={item.id} className={`rounded-xl border p-4 transition-colors ${
              answers[item.id] === true ? "border-green-500/30 bg-green-500/5" :
              answers[item.id] === false ? "border-red-500/20 bg-red-500/5" :
              "border-border/60 bg-card/30"
            }`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    {answers[item.id] === true && <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />}
                    {answers[item.id] === false && <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                    {answers[item.id] == null && <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground border border-border/50 rounded px-1">+{item.points}pts</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-5">{item.question}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggle(item.id, true)} className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${answers[item.id] === true ? "bg-green-500/20 border-green-500/40 text-green-400" : "border-border/60 text-muted-foreground hover:border-green-500/40 hover:text-green-400"}`}>Yes</button>
                  <button onClick={() => toggle(item.id, false)} className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${answers[item.id] === false ? "bg-red-500/20 border-red-500/40 text-red-400" : "border-border/60 text-muted-foreground hover:border-red-500/40 hover:text-red-400"}`}>No</button>
                </div>
              </div>
              {answers[item.id] === false && (
                <div className="ml-5 mt-2 text-xs text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
                  💡 {item.tip}
                </div>
              )}
            </div>
          ))}
        </div>

        <Button onClick={() => setAudited(true)} disabled={answered < 4} className="w-full">
          <ClipboardList className="h-4 w-4 mr-2" /> See My Score
        </Button>

        {audited && answered >= 4 && (
          <div className={`rounded-xl border p-5 text-center ${grade.bg} animate-in fade-in duration-300`}>
            <div className={`text-5xl font-bold ${grade.color} mb-1`}>{grade.grade}</div>
            <div className={`text-sm font-semibold ${grade.color}`}>{grade.label}</div>
            <div className="text-2xl font-bold text-foreground mt-2">{score}/{maxScore} points ({percent}%)</div>
            {username && <div className="text-xs text-muted-foreground mt-1">Audit for {username.startsWith("@") ? username : `@${username}`}</div>}
            {failures.length > 0 && (
              <div className="mt-4 text-left space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Wins:</p>
                {failures.slice(0, 3).map(f => (
                  <div key={f.id} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-red-400 shrink-0">✗</span> Fix your <strong className="text-foreground">{f.label}</strong> (+{f.points} pts)
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
