import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar, Copy, Trash2, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "What are the best times to post on X?", a: "Studies show peak engagement on X is Tuesday–Thursday between 9 AM–3 PM in your audience's timezone. Wednesday at 9 AM and Tuesday at 9 AM are consistently top performers. Avoid weekends for B2B content." },
  { q: "How many tweets should I post per day?", a: "For most accounts, 1–3 tweets per day is the sweet spot. More than 5 per day can feel spammy. Quality beats quantity — one well-crafted tweet outperforms five mediocre ones." },
  { q: "Should I schedule tweets in advance?", a: "Yes. Scheduling lets you post during peak hours without being online, maintain consistency, and plan content around campaigns or events. Tools like Buffer, Hootsuite, or X's own scheduler handle the actual publishing." },
  { q: "What is a tweet thread and when should I use it?", a: "A thread is a series of connected tweets. Use threads for educational content, storytelling, or long-form insights that exceed 280 characters. Threads typically get higher engagement than single tweets." },
  { q: "Can I export my tweet schedule?", a: "Yes — use the Export CSV button to download your schedule as a spreadsheet. You can then import this into scheduling tools like Buffer, Hootsuite, or Sprout Social." },
];

const relatedTools = [
  { title: "Tweet Formatter", href: "/tools/tweet-formatter", description: "Split long content into tweet threads." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters to stay within 280 limit." },
  { title: "Follower Analyzer", href: "/tools/follower-analyzer", description: "Analyze your follower ratio and engagement." },
];

interface ScheduledTweet {
  id: string;
  content: string;
  date: string;
  time: string;
  type: "single" | "thread";
}

const TIME_SLOTS = ["09:00", "12:00", "15:00", "18:00", "20:00"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TweetScheduler() {
  const [tweets, setTweets] = useState<ScheduledTweet[]>([]);
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const { toast } = useToast();
  useToolView("tweet-scheduler");

  const charCount = content.length;
  const isOver = charCount > 280;

  const addTweet = () => {
    if (!content.trim() || !date) return;
    setTweets(prev => [...prev, {
      id: Date.now().toString(),
      content: content.trim(),
      date,
      time,
      type: content.length > 280 ? "thread" : "single",
    }]);
    setContent("");
  };

  const removeTweet = (id: string) => setTweets(prev => prev.filter(t => t.id !== id));

  const exportCSV = () => {
    if (!tweets.length) return;
    const rows = [["Date", "Time", "Content", "Type"], ...tweets.map(t => [t.date, t.time, `"${t.content.replace(/"/g, '""')}"`, t.type])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "tweet-schedule.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: `${tweets.length} tweets exported to CSV.` });
  };

  const copyAll = () => {
    const text = tweets.map(t => `[${t.date} ${t.time}] ${t.content}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "All scheduled tweets copied to clipboard." });
  };

  const sorted = [...tweets].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return (
    <MiniToolLayout
      seoTitle="Tweet Scheduler — Plan Your X Content Calendar Free"
      seoDescription="Plan and organize your X (Twitter) content calendar. Compose tweets, set dates and times, and export your schedule as CSV for any scheduling tool. Free, no login."
      icon={Calendar}
      badge="X Tool"
      title="Tweet Scheduler"
      description="Plan your X content calendar by composing tweets and organizing them by date and time. Export to CSV and import into any scheduling tool like Buffer or Hootsuite."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="scheduling"
    >
      <div className="space-y-5">
        {/* Compose */}
        <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compose Tweet</h3>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's happening? (280 chars for single tweet, more for thread)"
            className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40 resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className={isOver ? "text-orange-400" : ""}>{charCount}/280 {isOver && `— will post as thread (${Math.ceil(charCount / 280)} parts)`}</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px] space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-sm bg-background/60 border-border/60 h-9" />
            </div>
            <div className="w-32 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Time</label>
              <select value={time} onChange={e => setTime(e.target.value)} className="w-full h-9 rounded-md border border-border/60 bg-background/60 text-sm px-2">
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={addTweet} disabled={!content.trim() || !date} className="h-9 gap-1.5">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Best times hint */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs text-muted-foreground"><span className="text-primary font-semibold">Best posting times:</span> Tue–Thu 9 AM, 12 PM, 3 PM. Avoid Mon mornings and weekends for B2B content.</p>
        </div>

        {/* Schedule list */}
        {sorted.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{sorted.length} Scheduled Tweet{sorted.length !== 1 ? "s" : ""}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAll} className="text-xs h-7 border-border/60 gap-1">
                  <Copy className="h-3 w-3" /> Copy All
                </Button>
                <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs h-7 border-border/60 gap-1">
                  <Download className="h-3 w-3" /> Export CSV
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {sorted.map(t => (
                <div key={t.id} className="flex gap-3 rounded-lg border border-border/60 bg-card/40 p-3">
                  <div className="shrink-0 text-center">
                    <div className="text-xs font-bold text-primary">{t.date}</div>
                    <div className="text-[10px] text-muted-foreground">{t.time}</div>
                    {t.type === "thread" && <span className="text-[9px] bg-orange-400/15 text-orange-400 border border-orange-400/30 rounded px-1 mt-1 inline-block">Thread</span>}
                  </div>
                  <div className="flex-1 text-sm text-foreground/90 leading-relaxed break-words min-w-0">{t.content}</div>
                  <button onClick={() => removeTweet(t.id)} className="shrink-0 text-muted-foreground/40 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly cadence guide */}
        <div className="rounded-xl border border-border/60 bg-card/30 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Recommended Weekly Cadence</h3>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(day => (
              <div key={day} className="text-center">
                <div className="text-[10px] text-muted-foreground mb-1">{day.slice(0, 3)}</div>
                <div className={`rounded-md py-1.5 text-[10px] font-medium ${
                  ["Tuesday", "Wednesday", "Thursday"].includes(day)
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : ["Saturday", "Sunday"].includes(day)
                    ? "bg-muted/20 text-muted-foreground/40 border border-border/30"
                    : "bg-muted/30 text-muted-foreground border border-border/40"
                }`}>
                  {["Tuesday", "Wednesday", "Thursday"].includes(day) ? "Best" : ["Saturday", "Sunday"].includes(day) ? "Low" : "OK"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
