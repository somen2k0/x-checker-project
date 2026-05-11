import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Copy, Trash2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

interface EmailResult {
  email: string;
  valid: boolean;
  issues: string[];
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function validateEmail(raw: string): EmailResult {
  const email = raw.trim();
  const issues: string[] = [];

  if (!email) return { email, valid: false, issues: ["Empty"] };

  if (email.length > 320) issues.push("Exceeds maximum length of 320 characters");

  const atIdx = email.lastIndexOf("@");
  if (atIdx === -1) { issues.push("Missing @ symbol"); return { email, valid: false, issues }; }
  if (email.indexOf("@") !== atIdx) issues.push("Multiple @ symbols");

  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);

  if (local.length === 0) issues.push("Missing local part (before @)");
  if (local.length > 64) issues.push("Local part exceeds 64 characters");
  if (local.startsWith(".") || local.endsWith(".")) issues.push("Local part cannot start or end with a period");
  if (/\.\./.test(local)) issues.push("Local part contains consecutive periods");

  if (domain.length === 0) issues.push("Missing domain (after @)");
  if (!domain.includes(".")) issues.push("Domain must contain at least one dot");
  if (domain.startsWith("-") || domain.endsWith("-")) issues.push("Domain cannot start or end with a hyphen");
  if (domain.startsWith(".") || domain.endsWith(".")) issues.push("Domain cannot start or end with a period");

  const tld = domain.split(".").pop() ?? "";
  if (tld.length < 2) issues.push("TLD must be at least 2 characters");
  if (/[^a-zA-Z]/.test(tld) && tld.length < 3) issues.push("TLD appears invalid");

  if (!EMAIL_REGEX.test(email) && issues.length === 0) issues.push("Does not match RFC 5322 format");

  return { email, valid: issues.length === 0, issues };
}

const faqs = [
  { q: "What does email syntax validation check?", a: "Syntax validation checks whether an email address follows the correct format defined by RFC 5322: a local part (before @), an @ symbol, and a domain (after @). It checks for valid characters, proper structure, and reasonable length limits. It does not verify that the mailbox actually exists." },
  { q: "What is the difference between syntax validation and MX verification?", a: "Syntax validation (what this tool does) checks format only — it's instant and runs in the browser. MX verification makes a DNS lookup to check if the domain has mail exchange records configured, which requires a server-side call. Both together give you higher confidence that an address can receive mail." },
  { q: "What characters are allowed in an email address?", a: "In the local part (before @): letters (A-Z, a-z), digits (0-9), and special characters: .!#$%&'*+/=?^_`{|}~-. The @ symbol separates local from domain. The domain allows letters, digits, hyphens, and dots. The TLD must be at least 2 letters." },
  { q: "Can I bulk validate email addresses?", a: "Yes — paste one email per line and this tool validates all of them at once. It shows a pass/fail status with specific issues for each address. You can copy just the valid addresses or export results." },
  { q: "Why does a correctly formatted address still bounce?", a: "Syntax validation only checks format. An address can be syntactically valid but the mailbox may not exist, be full, or the domain may have been deactivated. To catch these cases, you need MX record checking and/or SMTP verification — more advanced steps not covered by a browser-based tool." },
];

const relatedTools = [
  { title: "Email Username Generator", href: "/tools/email-username-generator", description: "Generate professional email address formats." },
  { title: "Email Character Counter", href: "/tools/email-character-counter", description: "Count subject line and body characters." },
  { title: "Subject Line Generator", href: "/tools/subject-line-generator", description: "Generate high-converting email subject lines." },
];

export default function EmailValidator() {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  useToolView("email-validator");

  const results = useMemo<EmailResult[]>(() => {
    if (!input.trim()) return [];
    return input
      .split(/[\n,;]+/)
      .map(l => l.trim())
      .filter(Boolean)
      .map(validateEmail);
  }, [input]);

  const validEmails = results.filter(r => r.valid).map(r => r.email);
  const invalidEmails = results.filter(r => !r.valid).map(r => r.email);

  const copyValid = () => {
    if (!validEmails.length) return;
    navigator.clipboard.writeText(validEmails.join("\n"));
    toast({ title: "Copied!", description: `${validEmails.length} valid addresses copied.` });
  };

  return (
    <MiniToolLayout
      seoTitle="Email Address Validator — Syntax Checker for Email Lists"
      seoDescription="Validate email address syntax instantly. Paste one or many addresses and get instant pass/fail results with specific error messages. Free, browser-based, no signup."
      icon={ShieldCheck}
      badge="Email Tool"
      title="Email Address Validator"
      description="Validate email address syntax instantly. Paste one address or a whole list and get pass/fail results with specific error messages — directly in your browser, no server required."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
              Email Addresses <span className="text-muted-foreground/50 font-normal normal-case">(one per line, or comma/semicolon separated)</span>
            </label>
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input} className="text-xs border-border/60 h-7">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={"jane.smith@example.com\nbadaddress@\nuser@domain.co.uk\n\nOr comma-separated: a@b.com, c@d.org"}
            className="min-h-[160px] text-sm font-mono bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40"
          />
        </div>

        {/* Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Checked", value: results.length, color: "text-foreground" },
              { label: "Valid", value: validEmails.length, color: "text-green-400" },
              { label: "Invalid", value: invalidEmails.length, color: invalidEmails.length > 0 ? "text-red-400" : "text-muted-foreground" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card/50 p-3 text-center">
                <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Results</label>
              {validEmails.length > 0 && (
                <Button variant="outline" size="sm" onClick={copyValid} className="text-xs border-border/60 h-7">
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy valid ({validEmails.length})
                </Button>
              )}
            </div>
            <div className="space-y-1.5">
              {results.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
                  r.valid
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}>
                  {r.valid
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-mono font-medium truncate">{r.email || "(empty)"}</div>
                    {r.issues.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {r.issues.map((issue, j) => (
                          <div key={j} className="flex items-center gap-1.5 text-xs text-red-400">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> {issue}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                    r.valid
                      ? "text-green-400 border-green-500/30 bg-green-500/10"
                      : "text-red-400 border-red-500/30 bg-red-500/10"
                  }`}>
                    {r.valid ? "Valid" : "Invalid"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!input && (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 p-8 text-center space-y-2">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground/50">Paste email addresses above to validate</p>
            <p className="text-xs text-muted-foreground/40">Supports bulk validation — one per line or comma-separated</p>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
