import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Copy, Monitor, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

type Style = "minimal" | "professional" | "bold";

interface SigData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  twitter: string;
  accentColor: string;
}

const DEFAULTS: SigData = {
  name: "",
  title: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  linkedin: "",
  twitter: "",
  accentColor: "#6366f1",
};

function buildHtmlSignature(data: SigData, style: Style): string {
  const { name, title, company, email, phone, website, linkedin, twitter, accentColor } = data;
  if (!name) return "";

  const websiteClean = website.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const linkedinClean = linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/\/$/, "");
  const twitterClean = twitter.replace(/^@/, "");

  const socialLinks = [
    linkedin ? `<a href="${linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`}" style="color:${accentColor};text-decoration:none">LinkedIn</a>` : "",
    twitter ? `<a href="https://x.com/${twitterClean}" style="color:${accentColor};text-decoration:none">X / Twitter</a>` : "",
  ].filter(Boolean).join(" &nbsp;·&nbsp; ");

  if (style === "minimal") {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#374151;line-height:1.5">
  <tr>
    <td>
      <strong style="font-size:14px;color:#111827">${name}</strong>${title ? ` <span style="color:#9ca3af">·</span> <span style="color:#6b7280">${title}</span>` : ""}${company ? ` <span style="color:#9ca3af">·</span> <span style="color:#6b7280">${company}</span>` : ""}
      <br>
      ${email ? `<a href="mailto:${email}" style="color:${accentColor};text-decoration:none">${email}</a>` : ""}${phone ? ` &nbsp;·&nbsp; ${phone}` : ""}${website ? ` &nbsp;·&nbsp; <a href="${website.startsWith("http") ? website : `https://${website}`}" style="color:${accentColor};text-decoration:none">${websiteClean}</a>` : ""}
      ${socialLinks ? `<br><span style="color:#9ca3af;font-size:12px">${socialLinks}</span>` : ""}
    </td>
  </tr>
</table>`;
  }

  if (style === "bold") {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;line-height:1.6">
  <tr>
    <td style="border-left:3px solid ${accentColor};padding-left:14px">
      <div style="font-size:17px;font-weight:700;color:#111827;letter-spacing:-0.3px">${name}</div>
      ${title ? `<div style="font-size:13px;font-weight:600;color:${accentColor}">${title}${company ? ` @ ${company}` : ""}</div>` : company ? `<div style="font-size:13px;font-weight:600;color:${accentColor}">${company}</div>` : ""}
      <div style="margin-top:6px;font-size:12px;color:#6b7280">
        ${email ? `<a href="mailto:${email}" style="color:#374151;text-decoration:none">${email}</a>` : ""}${phone ? ` &nbsp;|&nbsp; ${phone}` : ""}
        ${website ? `<br><a href="${website.startsWith("http") ? website : `https://${website}`}" style="color:${accentColor};text-decoration:none">${websiteClean}</a>` : ""}
        ${socialLinks ? `<br>${socialLinks}` : ""}
      </div>
    </td>
  </tr>
</table>`;
  }

  // professional
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#374151">
  <tr>
    <td style="padding-right:18px;border-right:2px solid ${accentColor};vertical-align:top">
      <div style="font-size:15px;font-weight:700;color:#111827;white-space:nowrap">${name}</div>
      ${title ? `<div style="font-size:12px;color:#6b7280;margin-top:2px">${title}</div>` : ""}
      ${company ? `<div style="font-size:12px;color:${accentColor};font-weight:600;margin-top:1px">${company}</div>` : ""}
    </td>
    <td style="padding-left:18px;vertical-align:top;line-height:1.7">
      ${email ? `<div><a href="mailto:${email}" style="color:${accentColor};text-decoration:none;font-size:12px">${email}</a></div>` : ""}
      ${phone ? `<div style="font-size:12px;color:#6b7280">${phone}</div>` : ""}
      ${website ? `<div><a href="${website.startsWith("http") ? website : `https://${website}`}" style="color:${accentColor};text-decoration:none;font-size:12px">${websiteClean}</a></div>` : ""}
      ${socialLinks ? `<div style="font-size:12px;margin-top:2px">${socialLinks}</div>` : ""}
    </td>
  </tr>
</table>`;
}

function buildPlainTextSignature(data: SigData): string {
  const { name, title, company, email, phone, website, linkedin, twitter } = data;
  if (!name) return "";
  const lines: string[] = [];
  lines.push(name);
  if (title && company) lines.push(`${title} · ${company}`);
  else if (title) lines.push(title);
  else if (company) lines.push(company);
  lines.push("--");
  if (email) lines.push(`Email: ${email}`);
  if (phone) lines.push(`Phone: ${phone}`);
  if (website) lines.push(`Web: ${website}`);
  if (linkedin) lines.push(`LinkedIn: ${linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`}`);
  if (twitter) lines.push(`X: https://x.com/${twitter.replace(/^@/, "")}`);
  return lines.join("\n");
}

const STYLE_LABELS: Record<Style, string> = {
  minimal: "Minimal",
  professional: "Professional",
  bold: "Bold",
};

const faqs = [
  { q: "What should an email signature include?", a: "An effective email signature includes: your full name, job title, company name, email address, and phone number. Optionally add your website, LinkedIn profile, and social handles. Keep it concise — 4–6 lines is ideal. Avoid images, legal disclaimers (unless required), and more than 2 social links." },
  { q: "Should I use an HTML or plain text email signature?", a: "HTML signatures display nicely in most modern email clients (Gmail, Outlook, Apple Mail). However, some corporate email systems strip HTML. For maximum compatibility, set up both an HTML signature for your primary client and a plain text fallback." },
  { q: "What image size should I use in an email signature?", a: "If you include a photo or logo, keep it under 100 KB and size it at 100–200px wide. Larger images can trigger spam filters. Always use a hosted URL for the image rather than an embedded file, and include an alt attribute." },
  { q: "Is it unprofessional to put a quote in an email signature?", a: "Motivational quotes in email signatures are generally considered unprofessional in formal business contexts. Stick to contact information. Quotes can be appropriate in certain creative industries or personal contexts." },
  { q: "How do I add an HTML signature to Gmail?", a: "In Gmail: Settings → See all settings → General → Signature → Create new. Paste the HTML source via the formatting toolbar's code view, or paste the rendered preview directly. For a cleaner paste, open the HTML preview in a browser and copy from there." },
];

const relatedTools = [
  { title: "Subject Line Generator", href: "/tools/subject-line-generator", description: "Generate high-converting email subject lines." },
  { title: "Email Username Generator", href: "/tools/email-username-generator", description: "Generate professional email address formats." },
  { title: "Email Character Counter", href: "/tools/email-character-counter", description: "Count characters for subject and preview text." },
];

export default function EmailSignatureGenerator() {
  const [data, setData] = useState<SigData>(DEFAULTS);
  const [style, setStyle] = useState<Style>("professional");
  const [viewMode, setViewMode] = useState<"preview" | "html" | "text">("preview");
  const { toast } = useToast();
  useToolView("email-signature-generator");

  const set = (key: keyof SigData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData(d => ({ ...d, [key]: e.target.value }));

  const html = buildHtmlSignature(data, style);
  const plainText = buildPlainTextSignature(data);

  const copy = () => {
    const content = viewMode === "text" ? plainText : html;
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: viewMode === "text" ? "Plain text signature copied." : "HTML signature copied." });
  };

  const hasContent = !!data.name;

  const fields: Array<{ key: keyof SigData; label: string; placeholder: string; type?: string }> = [
    { key: "name", label: "Full Name *", placeholder: "Jane Smith" },
    { key: "title", label: "Job Title", placeholder: "Head of Marketing" },
    { key: "company", label: "Company", placeholder: "Acme Corp" },
    { key: "email", label: "Email Address", placeholder: "jane@acmecorp.com", type: "email" },
    { key: "phone", label: "Phone", placeholder: "+1 (555) 000-0000", type: "tel" },
    { key: "website", label: "Website", placeholder: "https://acmecorp.com" },
    { key: "linkedin", label: "LinkedIn URL or username", placeholder: "jane-smith or full URL" },
    { key: "twitter", label: "X / Twitter handle", placeholder: "@janesmith or janesmith" },
  ];

  return (
    <MiniToolLayout
      seoTitle="Email Signature Generator — Free HTML & Plain Text Signature Builder"
      seoDescription="Build a professional email signature in seconds. Choose minimal, professional, or bold style. Copy as HTML for Gmail/Outlook or as plain text. Free, no signup."
      icon={Mail}
      badge="Email Tool"
      title="Email Signature Generator"
      description="Build a professional email signature in seconds. Fill in your details, choose a style, preview it live, and copy the HTML or plain text version — ready to paste into Gmail, Outlook, or Apple Mail."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        {/* Style selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signature Style</label>
          <div className="flex gap-2">
            {(["minimal", "professional", "bold"] as Style[]).map(s => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  style === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:border-border"
                }`}
              >
                {STYLE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Fields */}
          <div className="space-y-3">
            {fields.map(({ key, label, placeholder, type }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
                <Input
                  value={data[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  type={type ?? "text"}
                  className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.accentColor}
                  onChange={e => setData(d => ({ ...d, accentColor: e.target.value }))}
                  className="h-9 w-14 rounded-lg border border-border/60 cursor-pointer bg-background/60 p-0.5"
                />
                <Input
                  value={data.accentColor}
                  onChange={e => setData(d => ({ ...d, accentColor: e.target.value }))}
                  className="text-sm font-mono bg-background/60 border-border/60 focus-visible:ring-primary/40 w-28"
                />
                <div className="flex gap-1.5">
                  {["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map(c => (
                    <button
                      key={c}
                      onClick={() => setData(d => ({ ...d, accentColor: c }))}
                      className="h-6 w-6 rounded-full border-2 transition-all hover:scale-110"
                      style={{ background: c, borderColor: data.accentColor === c ? "#fff" : "transparent" } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Preview</label>
              <div className="flex items-center gap-1.5">
                {(["preview", "html", "text"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors ${
                      viewMode === v
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-muted/40 text-muted-foreground border-border/60"
                    }`}
                  >
                    {v === "preview" ? <Monitor className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[300px] rounded-xl border border-border/60 bg-background/60 overflow-hidden">
              {!hasContent ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-sm text-muted-foreground/40 text-center px-8">Fill in your details on the left<br />to see a live preview here</p>
                </div>
              ) : viewMode === "preview" ? (
                <div className="p-6">
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              ) : viewMode === "html" ? (
                <pre className="p-4 text-[11px] font-mono leading-relaxed text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                  {html}
                </pre>
              ) : (
                <pre className="p-4 text-xs font-mono leading-relaxed text-muted-foreground whitespace-pre">
                  {plainText}
                </pre>
              )}
            </div>

            {hasContent && (
              <Button onClick={copy} className="w-full text-xs">
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy {viewMode === "text" ? "Plain Text" : "HTML"} Signature
              </Button>
            )}
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
