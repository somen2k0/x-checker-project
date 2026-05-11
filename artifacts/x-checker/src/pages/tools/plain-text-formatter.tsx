import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

function htmlToPlainText(html: string): string {
  let text = html;
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<h[1-6][^>]*>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "  • ");
  text = text.replace(/<\/ul>|<\/ol>/gi, "\n");
  text = text.replace(/<hr[^>]*>/gi, "\n---\n");
  text = text.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "$2 ($1)");
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "*$1*");
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, "*$1*");
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_");
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, "_$1_");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&[a-zA-Z0-9#]+;/gi, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]+\n/g, "\n");
  text = text.replace(/\n[ \t]+/g, "\n");
  return text.trim();
}

const EXAMPLE_HTML = `<h2>Welcome to Our Newsletter</h2>
<p>Hi <strong>Jane</strong>,</p>
<p>We're excited to share our <em>latest updates</em> with you this week.</p>
<h3>What's New</h3>
<ul>
  <li>New dashboard with <strong>real-time analytics</strong></li>
  <li>Improved <a href="https://example.com/docs">documentation</a></li>
  <li>Faster loading times across all pages</li>
</ul>
<p>Visit our <a href="https://example.com">website</a> to learn more.</p>
<hr>
<p>Thanks for being a valued subscriber.<br>The Example Team</p>`;

const faqs = [
  { q: "Why do I need a plain text version of an HTML email?", a: "Most email marketing platforms require or strongly recommend a plain text version alongside your HTML email. Some email clients display plain text by default. It also improves deliverability because spam filters view the presence of a plain text version as a positive signal." },
  { q: "What is a multi-part MIME email?", a: "A multi-part MIME email contains both an HTML version and a plain text version of the same message, packaged together. The recipient's email client chooses which version to display based on its capabilities and the user's preferences." },
  { q: "How should links be formatted in plain text emails?", a: "In plain text emails, URLs must be written out in full since they can't be hyperlinked. This tool formats them as 'Link text (https://url)'. Alternatively, you can place the URL on its own line. Keep URLs short or use a URL shortener for readability." },
  { q: "What formatting does plain text email support?", a: "Plain text emails support no visual formatting — no bold, italic, colors, or images. You can use basic structure like: ALL CAPS for headings, dashes (-) or equals signs (=) for dividers, asterisks for bullet points, and blank lines for paragraph breaks." },
  { q: "How long should a plain text email be?", a: "Keep it as concise as possible. Plain text reads without the visual hierarchy of HTML, so long blocks of text are harder to scan. Aim for clear sections, short paragraphs, and prominent calls-to-action. Shorter is almost always better in email." },
];

const relatedTools = [
  { title: "Email Character Counter", href: "/tools/email-character-counter", description: "Count characters for subject lines and email body." },
  { title: "Subject Line Generator", href: "/tools/subject-line-generator", description: "Generate high-converting email subject lines." },
  { title: "Email Signature Generator", href: "/tools/email-signature-generator", description: "Build a professional plain text email signature." },
];

export default function PlainTextFormatter() {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  useToolView("plain-text-formatter");

  const output = useMemo(() => input ? htmlToPlainText(input) : "", [input]);

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "Plain text copied to clipboard." });
  };

  const loadExample = () => setInput(EXAMPLE_HTML);

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  return (
    <MiniToolLayout
      seoTitle="Plain Text Email Formatter — Convert HTML Email to Plain Text"
      seoDescription="Convert HTML emails to clean, readable plain text. Preserves links, bold emphasis, lists, and structure. Free, browser-based, instant."
      icon={FileText}
      badge="Email Tool"
      title="Plain Text Email Formatter"
      description="Convert HTML email code into clean, properly formatted plain text. Preserves hyperlinks as readable URLs, converts bold/italic to text emphasis, and formats lists and headings."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">HTML Input</label>
              <div className="flex gap-2">
                <button onClick={loadExample} className="text-xs text-primary hover:underline">Load example</button>
                <button onClick={() => setInput("")} disabled={!input} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={"Paste your HTML email here...\n\n<h2>Hello</h2>\n<p>Your <strong>content</strong> goes here.</p>"}
              className="min-h-[320px] text-xs font-mono bg-background/60 border-border/60 resize-none focus-visible:ring-primary/40"
            />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Plain Text Output
                {output && <span className="ml-2 text-muted-foreground/60 font-normal normal-case font-mono">{charCount} chars · {wordCount} words</span>}
              </label>
              <Button variant="outline" size="sm" onClick={copy} disabled={!output} className="text-xs border-border/60 h-7">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
            </div>
            <div className={`min-h-[320px] rounded-xl border text-xs font-mono p-4 whitespace-pre-wrap overflow-y-auto leading-relaxed ${
              output ? "border-primary/20 bg-primary/3 text-foreground/80" : "border-border/60 bg-background/40 text-muted-foreground/40"
            }`}>
              {output || "Plain text will appear here..."}
            </div>
          </div>
        </div>

        {/* What gets converted */}
        <div className="rounded-xl border border-border/60 bg-card/30 p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What gets converted</h3>
          <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-xs text-muted-foreground">
            {[
              ["<h1> – <h6>", "Headings with line breaks"],
              ["<p>", "Paragraphs with spacing"],
              ["<br>", "Line breaks (\\n)"],
              ["<ul> / <li>", "Bullet point lists (•)"],
              ["<a href=\"...\">", "Link text (URL)"],
              ["<strong>, <b>", "*bold text*"],
              ["<em>, <i>", "_italic text_"],
              ["<hr>", "--- divider line"],
              ["&nbsp; &amp; &lt;", "Decoded HTML entities"],
              ["Multiple spaces", "Normalized whitespace"],
            ].map(([from, to]) => (
              <div key={from} className="flex items-center gap-2">
                <code className="text-[10px] bg-muted/40 px-1.5 py-0.5 rounded font-mono text-foreground/70">{from}</code>
                <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                <span>{to}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
