import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Newspaper, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "What makes a good newsletter template?", a: "A good newsletter template has a clear header with your brand, a single-column layout (mobile-first), a prominent headline, concise body text, one primary CTA button, and a footer with your unsubscribe link and address. Keep it under 600px wide." },
  { q: "Should I use HTML or plain-text newsletters?", a: "HTML newsletters look polished and support images and branding, but plain-text emails often have higher open rates and feel more personal. Many successful newsletters use a hybrid approach — simple HTML that renders like plain text." },
  { q: "What is the ideal newsletter length?", a: "Most newsletters perform best at 200–500 words. Long newsletters work if readers have opted in for in-depth content (like essay newsletters). Short newsletters (under 200 words) work well for curated link roundups or quick updates." },
  { q: "How do I grow my email newsletter list?", a: "Top growth tactics: add a signup form to every page of your website, offer a lead magnet (PDF, checklist, mini-course), promote your newsletter on social media, add a signup link to your email signature, and cross-promote with complementary newsletters." },
  { q: "What should I include in every newsletter footer?", a: "Every newsletter footer must include: your mailing address (legally required in the US under CAN-SPAM), an unsubscribe link, your company name, and optionally a reason why the reader is receiving it. Missing these elements can damage deliverability." },
];

const relatedTools = [
  { title: "Subject Line Generator", href: "/tools/subject-line-generator", description: "Generate high-converting email subject lines." },
  { title: "Email A/B Tester", href: "/tools/email-ab-tester", description: "Compare two subject lines and predict the winner." },
  { title: "Email Signature Generator", href: "/tools/email-signature-generator", description: "Create a professional email signature." },
];

type TemplateStyle = "minimal" | "editorial" | "digest" | "product";

interface TemplateConfig {
  brandName: string;
  tagline: string;
  accentColor: string;
  headline: string;
  intro: string;
  ctaText: string;
  ctaUrl: string;
  footerAddress: string;
  unsubscribeUrl: string;
}

function generateMinimal(cfg: TemplateConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cfg.brandName} Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
  <!-- Header -->
  <tr><td style="background:${cfg.accentColor};padding:28px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${cfg.brandName}</h1>
    ${cfg.tagline ? `<p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">${cfg.tagline}</p>` : ""}
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:40px;">
    <h2 style="margin:0 0 16px;color:#111111;font-size:24px;font-weight:700;line-height:1.3;">${cfg.headline || "Your Newsletter Headline Here"}</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:16px;line-height:1.7;">${cfg.intro || "Write your newsletter introduction here. Keep it concise and engaging — your readers decided to open this email, so reward them with value immediately."}</p>
    ${cfg.ctaText ? `<table cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background:${cfg.accentColor};"><a href="${cfg.ctaUrl || "#"}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${cfg.ctaText}</a></td></tr></table>` : ""}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee;">
    <p style="margin:0 0 8px;color:#999999;font-size:12px;">${cfg.footerAddress || "Your Company Name, 123 Main St, City, State 00000"}</p>
    <p style="margin:0;color:#999999;font-size:12px;"><a href="${cfg.unsubscribeUrl || "#"}" style="color:#999999;">Unsubscribe</a> · <a href="#" style="color:#999999;">View in browser</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function generateEditorial(cfg: TemplateConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cfg.brandName}</title>
</head>
<body style="margin:0;padding:0;background:#fafaf8;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
  <!-- Brand bar -->
  <tr><td style="padding:0 0 32px;border-bottom:2px solid #111111;text-align:center;">
    <span style="font-family:-apple-system,sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#999999;">${cfg.brandName}</span>
  </td></tr>
  <!-- Issue date -->
  <tr><td style="padding:24px 0 0;text-align:center;">
    <span style="font-family:-apple-system,sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#bbbbbb;">${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
  </td></tr>
  <!-- Headline -->
  <tr><td style="padding:20px 0;">
    <h1 style="margin:0;color:#111111;font-size:32px;font-weight:700;line-height:1.2;letter-spacing:-0.5px;">${cfg.headline || "Your Headline Here"}</h1>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:0 0 32px;border-bottom:1px solid #e5e5e5;">
    <p style="margin:0;color:#333333;font-size:17px;line-height:1.8;">${cfg.intro || "Your newsletter body goes here. The editorial style works best for long-form essays, personal updates, and opinionated writing."}</p>
    ${cfg.ctaText ? `<p style="margin:24px 0 0;"><a href="${cfg.ctaUrl || "#"}" style="color:${cfg.accentColor};font-family:-apple-system,sans-serif;font-size:14px;font-weight:600;text-decoration:underline;">${cfg.ctaText} →</a></p>` : ""}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:24px 0 0;text-align:center;">
    <p style="margin:0;font-family:-apple-system,sans-serif;font-size:11px;color:#bbbbbb;line-height:1.6;">${cfg.footerAddress || "Your Company · 123 Street, City"}<br><a href="${cfg.unsubscribeUrl || "#"}" style="color:#bbbbbb;">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function generateDigest(cfg: TemplateConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cfg.brandName} Digest</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <!-- Header -->
  <tr><td style="background:${cfg.accentColor};padding:24px 32px;">
    <table width="100%"><tr>
      <td><h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:800;">${cfg.brandName}</h1>${cfg.tagline ? `<p style="margin:3px 0 0;color:rgba(255,255,255,0.75);font-size:12px;">${cfg.tagline}</p>` : ""}</td>
      <td align="right"><span style="background:rgba(255,255,255,0.15);color:#ffffff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:1px;">DIGEST</span></td>
    </tr></table>
  </td></tr>
  <!-- This week's top story -->
  <tr><td style="background:#ffffff;padding:32px;">
    <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${cfg.accentColor};">Top Story</p>
    <h2 style="margin:0 0 12px;color:#111111;font-size:22px;font-weight:700;line-height:1.3;">${cfg.headline || "This Week's Top Story"}</h2>
    <p style="margin:0 0 20px;color:#555555;font-size:15px;line-height:1.7;">${cfg.intro || "Your top story summary goes here. In a digest, keep each section brief — 2–4 sentences — and link to the full content."}</p>
    ${cfg.ctaText ? `<a href="${cfg.ctaUrl || "#"}" style="display:inline-block;padding:10px 20px;background:${cfg.accentColor};color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:6px;">${cfg.ctaText}</a>` : ""}
  </td></tr>
  <!-- Section divider -->
  <tr><td style="background:#ffffff;padding:0 32px 32px;">
    <div style="background:#f5f5f5;border-radius:10px;padding:20px;">
      <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999999;">Also This Week</p>
      <p style="margin:0;color:#555555;font-size:14px;line-height:1.6;">Add more sections here for each link, article, or update you want to include in the digest. Each section gets a brief summary and a "Read more →" link.</p>
    </div>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#e8edf2;padding:20px 32px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#888888;">${cfg.footerAddress || "Your Company · 123 Street, City, State"} · <a href="${cfg.unsubscribeUrl || "#"}" style="color:#888888;">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const STYLES: { id: TemplateStyle; label: string; desc: string }[] = [
  { id: "minimal", label: "Minimal", desc: "Clean, white-background, corporate" },
  { id: "editorial", label: "Editorial", desc: "Serif, essay-style, newsletter feel" },
  { id: "digest", label: "Digest", desc: "Card-based, curated content" },
];

export default function NewsletterTemplateGenerator() {
  const [style, setStyle] = useState<TemplateStyle>("minimal");
  const [cfg, setCfg] = useState<TemplateConfig>({ brandName: "", tagline: "", accentColor: "#6366f1", headline: "", intro: "", ctaText: "", ctaUrl: "", footerAddress: "", unsubscribeUrl: "" });
  const [html, setHtml] = useState("");
  const { toast } = useToast();
  useToolView("newsletter-template-generator");

  const setField = (key: keyof TemplateConfig, val: string) => setCfg(prev => ({ ...prev, [key]: val }));

  const generate = () => {
    const generators = { minimal: generateMinimal, editorial: generateEditorial, digest: generateDigest, product: generateMinimal };
    setHtml(generators[style](cfg));
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    toast({ title: "Copied!", description: "HTML template copied to clipboard." });
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `newsletter-${style}.html`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "newsletter.html saved." });
  };

  return (
    <MiniToolLayout
      seoTitle="Newsletter Template Generator — Free HTML Email Templates"
      seoDescription="Generate clean, responsive HTML email newsletter templates for free. Choose from Minimal, Editorial, and Digest styles. Customize your brand colors and download instantly."
      icon={Newspaper}
      badge="Email Tool"
      title="Newsletter Template Generator"
      description="Generate a responsive HTML email newsletter template in seconds. Choose a style, fill in your brand details, and get production-ready HTML to paste into any email platform."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        {/* Style selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Template Style</label>
          <div className="grid grid-cols-3 gap-2">
            {STYLES.map(({ id, label, desc }) => (
              <button
                key={id}
                onClick={() => { setStyle(id); setHtml(""); }}
                className={`rounded-xl border p-3 text-left transition-colors ${style === id ? "border-primary/50 bg-primary/10" : "border-border/60 bg-card/30 hover:border-border"}`}
              >
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customize</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: "brandName" as const, label: "Brand / Newsletter Name", placeholder: "The Weekly Digest" },
              { key: "tagline" as const, label: "Tagline (optional)", placeholder: "Curated for curious minds" },
              { key: "headline" as const, label: "Issue Headline", placeholder: "5 Things We Learned This Week" },
              { key: "ctaText" as const, label: "CTA Button Text", placeholder: "Read the full story" },
              { key: "ctaUrl" as const, label: "CTA Button URL", placeholder: "https://yourblog.com/article" },
              { key: "footerAddress" as const, label: "Footer Address (required by law)", placeholder: "Your Company, 123 Main St, NY 10001" },
              { key: "unsubscribeUrl" as const, label: "Unsubscribe URL", placeholder: "https://youresp.com/unsubscribe" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{label}</label>
                <Input value={cfg[key]} onChange={e => setField(key, e.target.value)} placeholder={placeholder} className="text-sm bg-background/60 border-border/60 h-8" />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Accent Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={cfg.accentColor} onChange={e => setField("accentColor", e.target.value)} className="h-8 w-12 rounded border border-border/60 bg-background/60 cursor-pointer p-0.5" />
                <Input value={cfg.accentColor} onChange={e => setField("accentColor", e.target.value)} className="text-sm bg-background/60 border-border/60 h-8 font-mono" />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Intro / Body Text</label>
            <Textarea
              value={cfg.intro}
              onChange={e => setField("intro", e.target.value)}
              placeholder="Write your newsletter intro or main content here..."
              className="text-sm bg-background/60 border-border/60 resize-none"
              rows={4}
            />
          </div>
        </div>

        <Button onClick={generate} className="w-full">
          <Newspaper className="h-4 w-4 mr-2" /> Generate Template
        </Button>

        {html && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Generated HTML</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyHtml} className="border-border/60 gap-1.5 text-xs h-7">
                  <Copy className="h-3 w-3" /> Copy HTML
                </Button>
                <Button variant="outline" size="sm" onClick={downloadHtml} className="border-border/60 gap-1.5 text-xs h-7">
                  <Download className="h-3 w-3" /> Download
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
              <div className="bg-muted/30 border-b border-border/40 px-3 py-1.5 text-xs text-muted-foreground font-mono">preview</div>
              <iframe
                srcDoc={html}
                title="Newsletter preview"
                className="w-full border-0 bg-white"
                style={{ height: "400px" }}
                sandbox="allow-same-origin"
              />
            </div>
            <pre className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs font-mono text-foreground/70 overflow-auto max-h-48 whitespace-pre-wrap">{html.slice(0, 800)}...</pre>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
