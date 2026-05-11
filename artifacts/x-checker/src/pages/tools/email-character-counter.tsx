import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Hash, AlertTriangle, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { useToolView } from "@/hooks/use-track";

interface Limit {
  name: string;
  subject: number;
  preview: number;
  color: string;
}

const EMAIL_LIMITS: Limit[] = [
  { name: "Gmail (desktop)", subject: 70, preview: 90, color: "bg-red-500" },
  { name: "Apple Mail", subject: 78, preview: 95, color: "bg-blue-500" },
  { name: "Outlook 2019", subject: 73, preview: 140, color: "bg-sky-500" },
  { name: "iPhone Mail", subject: 35, preview: 100, color: "bg-gray-500" },
];

function statusIcon(len: number, warn: number, max: number) {
  if (len === 0) return null;
  if (len > max) return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  if (len > warn) return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />;
  return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
}

function Bar({ len, warn, max, label }: { len: number; warn: number; max: number; label: string }) {
  const pct = Math.min(100, (len / max) * 100);
  const color = len > max ? "bg-destructive" : len > warn ? "bg-yellow-500" : "bg-green-500";
  const textColor = len > max ? "text-destructive" : len > warn ? "text-yellow-500" : "text-green-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {statusIcon(len, warn, max)} {label}
        </span>
        <span className={`font-mono font-semibold ${len > 0 ? textColor : "text-muted-foreground/50"}`}>
          {len} / {max}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const faqs = [
  { q: "How long should an email subject line be?", a: "The widely recommended length is 30–50 characters. Mobile email clients typically show 30–40 characters before truncating. Desktop clients show 60–80 characters. With most emails now opened on mobile, keeping subjects under 50 characters maximizes full display." },
  { q: "What is preview text (preheader) in email?", a: "Preview text is the short snippet of text that appears in your inbox after the subject line. It's pulled from the beginning of your email body or a hidden preheader element. Aim for 40–100 characters. Use it to extend the subject line's message and boost open rates." },
  { q: "Does Gmail cut off subject lines?", a: "Gmail on desktop shows up to about 70 characters before truncating. Gmail on mobile shows around 30–35 characters. The exact cutoff depends on the user's screen width, font size settings, and whether the email is read in a thread." },
  { q: "What is the ideal email body length?", a: "For promotional emails: 50–200 words. For newsletters: 200–500 words. For transactional emails: as short as possible — 50–100 words. Long emails are rarely read in full. Lead with the most important information and put the CTA above the fold." },
  { q: "Do longer subject lines ever work better?", a: "Yes — in some cases a detailed subject line outperforms a short one by setting clearer expectations. Long subject lines also work well for some newsletter audiences that are already engaged. Always A/B test; context and audience matter more than rules." },
];

const relatedTools = [
  { title: "Subject Line Generator", href: "/tools/subject-line-generator", description: "Generate high-converting email subject lines." },
  { title: "Email Signature Generator", href: "/tools/email-signature-generator", description: "Build a professional email signature." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters for tweets, bios, and any text." },
  { title: "Plain Text Formatter", href: "/tools/plain-text-formatter", description: "Convert HTML emails to clean plain text." },
];

export default function EmailCharacterCounter() {
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [body, setBody] = useState("");
  useToolView("email-character-counter");

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const sentenceCount = body.trim() ? (body.match(/[.!?]+/g) ?? []).length : 0;

  return (
    <MiniToolLayout
      seoTitle="Email Character Counter — Subject Line, Preview Text & Body Limits"
      seoDescription="Count characters in your email subject line, preview text, and body. See exactly how they display across Gmail, Outlook, Apple Mail, and iPhone Mail. Free."
      icon={Hash}
      badge="Email Tool"
      title="Email Character Counter"
      description="Count characters in your email subject line, preview text, and body. See real-time limits for Gmail, Outlook, Apple Mail, and iPhone Mail — so your subject never gets cut off."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-6">
        {/* Subject line */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold">Subject Line</h3>
          <div className="space-y-1.5">
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Your email subject line..."
              className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
            />
            <button onClick={() => setSubject("")} disabled={!subject} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 flex items-center gap-1">
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <div className="space-y-3">
            <Bar len={subject.length} warn={40} max={50} label="Recommended limit (50 chars)" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {EMAIL_LIMITS.map(({ name, subject: max }) => {
                const pct = Math.min(100, (subject.length / max) * 100);
                const over = subject.length > max;
                return (
                  <div key={name} className={`rounded-lg border p-2.5 text-center space-y-1 ${over ? "border-red-500/25 bg-red-500/5" : "border-border/60 bg-card/30"}`}>
                    <div className={`text-xs font-mono font-semibold ${over ? "text-red-400" : "text-foreground"}`}>
                      {subject.length}/{max}
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{name}</div>
                    <div className="h-0.5 rounded-full bg-muted/50 overflow-hidden">
                      <div className={`h-full rounded-full ${over ? "bg-red-500" : pct > 75 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    {over && <div className="text-[9px] text-red-400">Truncated</div>}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Inbox preview */}
          {subject && (
            <div className="rounded-lg border border-border/40 bg-background p-3 space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Inbox Preview</div>
              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-primary">S</span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">Sender Name</div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{subject}</span>
                    {preview && <span className="text-xs text-muted-foreground truncate">— {preview}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview text */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold">Preview Text (Preheader)</h3>
          <Input
            value={preview}
            onChange={e => setPreview(e.target.value)}
            placeholder="Short snippet shown after subject line in inbox..."
            className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
          />
          <div className="space-y-3">
            <Bar len={preview.length} warn={70} max={90} label="Recommended limit (90 chars)" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {EMAIL_LIMITS.map(({ name, preview: max }) => {
                const over = preview.length > max;
                return (
                  <div key={name} className={`rounded-lg border p-2.5 text-center space-y-1 ${over ? "border-red-500/25 bg-red-500/5" : "border-border/60 bg-card/30"}`}>
                    <div className={`text-xs font-mono font-semibold ${over ? "text-red-400" : "text-foreground"}`}>
                      {preview.length}/{max}
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{name}</div>
                    {over && <div className="text-[9px] text-red-400">Truncated</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold">Email Body</h3>
          <Textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Paste your email body text here..."
            className="min-h-[140px] text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Characters", value: body.length.toLocaleString() },
              { label: "Words", value: wordCount.toLocaleString() },
              { label: "Sentences", value: sentenceCount.toLocaleString() },
              { label: "Read time", value: `${readTime} min` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card/50 p-3 text-center">
                <div className="text-lg font-bold font-mono">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          {wordCount > 0 && (
            <div className={`text-xs flex items-center gap-1.5 ${wordCount <= 200 ? "text-green-400" : wordCount <= 500 ? "text-yellow-400" : "text-red-400"}`}>
              {wordCount <= 200 ? <CheckCircle2 className="h-3.5 w-3.5" /> : wordCount <= 500 ? <AlertTriangle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {wordCount <= 200 ? "Optimal length for promotional emails" : wordCount <= 500 ? "Good length for newsletters" : "Long email — consider trimming for better engagement"}
            </div>
          )}
        </div>
      </div>
    </MiniToolLayout>
  );
}
