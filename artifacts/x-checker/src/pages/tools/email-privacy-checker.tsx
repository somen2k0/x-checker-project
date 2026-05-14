import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToolView } from "@/hooks/use-track";
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";

interface PrivacyFactor {
  label: string;
  passed: boolean;
  info: string;
  weight: number;
}

const HIGH_RISK_DOMAINS = ["yahoo.com","hotmail.com","aol.com","outlook.com","live.com","msn.com","rediffmail.com"];
const PRIVACY_DOMAINS = ["protonmail.com","tutanota.com","pm.me","proton.me","tuta.com","mailfence.com","posteo.de","fastmail.com","zoho.com","hey.com"];
const DISPOSABLE_DOMAINS = ["mailinator.com","guerrillamail.com","10minutemail.com","tempmail.com","throwam.com","sharklasers.com","guerrillamail.info","grr.la","guerrillamail.biz","guerrillamail.de","1secmail.com","1secmail.org","1secmail.net"];

function analyzeEmail(email: string): { score: number; factors: PrivacyFactor[]; grade: string; label: string } {
  const lower = email.toLowerCase().trim();
  const [localPart = "", domainPart = ""] = lower.split("@");

  const factors: PrivacyFactor[] = [];

  // 1. Valid format
  const validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower);
  factors.push({ label: "Valid email format", passed: validFormat, info: "The email address has a valid format.", weight: 5 });
  if (!validFormat) return { score: 0, factors, grade: "F", label: "Invalid" };

  // 2. Not a disposable/temp domain
  const isDisposable = DISPOSABLE_DOMAINS.some(d => domainPart === d || domainPart.endsWith("." + d));
  factors.push({ label: "Not a known disposable domain", passed: !isDisposable, info: "Disposable email addresses are often blocked by services and provide no recovery option.", weight: 15 });

  // 3. Privacy-focused provider
  const isPrivacyProvider = PRIVACY_DOMAINS.some(d => domainPart === d || domainPart.endsWith("." + d));
  factors.push({ label: "Privacy-focused email provider", passed: isPrivacyProvider, info: "Providers like ProtonMail and Tutanota use end-to-end encryption and have strong no-logging policies.", weight: 25 });

  // 4. Not using common high-data-sharing providers
  const isHighRisk = HIGH_RISK_DOMAINS.includes(domainPart);
  factors.push({ label: "Not using a high-data-sharing provider", passed: !isHighRisk, info: "Yahoo, Hotmail, AOL, and some Microsoft services scan email content for advertising. Gmail does too.", weight: 15 });

  // 5. No real name in username
  const hasCommonNamePattern = /^(first|last|full|real|name|john|jane|mike|mary|david|sarah|info|admin|contact|hello|support|noreply)/.test(localPart) || /\d{4,}$/.test(localPart);
  factors.push({ label: "Username doesn't expose real identity", passed: !hasCommonNamePattern, info: "Using your real name in your email makes it easier for companies to build a profile on you.", weight: 15 });

  // 6. No plus-tag leakage
  const hasPlusTag = localPart.includes("+");
  factors.push({ label: "No plus-tag that exposes base address", passed: !hasPlusTag, info: "Gmail plus-tags (you+tag@gmail.com) still reveal your base username to anyone who inspects the header.", weight: 10 });

  // 7. Custom domain or non-mainstream provider
  const isMainstream = ["gmail.com","yahoo.com","hotmail.com","outlook.com","aol.com","live.com","icloud.com"].includes(domainPart);
  factors.push({ label: "Non-mainstream provider (harder to target)", passed: !isMainstream || isPrivacyProvider, info: "Using a custom domain or niche provider makes mass-targeting harder for data brokers.", weight: 15 });

  const total = factors.reduce((sum, f) => sum + f.weight, 0);
  const earned = factors.filter(f => f.passed).reduce((sum, f) => sum + f.weight, 0);
  const score = Math.round((earned / total) * 100);

  let grade = "F", label = "Very Poor";
  if (score >= 85) { grade = "A"; label = "Excellent"; }
  else if (score >= 70) { grade = "B"; label = "Good"; }
  else if (score >= 55) { grade = "C"; label = "Fair"; }
  else if (score >= 35) { grade = "D"; label = "Poor"; }

  return { score, factors, grade, label };
}

const faqs = [
  { q: "What does the privacy score measure?", a: "The score evaluates your email address across 7 factors: whether it uses a privacy-focused provider, how much identifying information the username contains, whether the provider sells data, and structural patterns that can reveal your real identity." },
  { q: "Is a Gmail address private?", a: "Gmail is not considered a privacy-focused email. Google analyzes email metadata and content to serve ads and improve its products. For stronger privacy, consider ProtonMail or Tutanota, which offer end-to-end encryption and no content scanning." },
  { q: "What email provider scores highest?", a: "Providers like ProtonMail (proton.me), Tutanota (tuta.com), Mailfence, and Posteo score highest. They offer end-to-end encryption, no advertising tracking, and are based in privacy-friendly jurisdictions like Switzerland or Germany." },
  { q: "Does this checker send my email anywhere?", a: "No. All analysis runs entirely in your browser using pattern matching. Your email address is never sent to any server." },
  { q: "What should I do with a low score?", a: "Consider using a privacy email provider (ProtonMail is free), use email aliases to avoid giving your real address to websites, and use a username that doesn't include your real name." },
];

const relatedTools = [
  { title: "Masked Email Generator", href: "/tools/masked-email-generator", description: "Generate anonymous email aliases." },
  { title: "Spam Risk Checker", href: "/tools/spam-risk-checker", description: "Check if your email pattern attracts spam." },
  { title: "Temp Mail", href: "/tools/temp-mail/tempemail", description: "Anonymous throwaway inbox — no signup." },
  { title: "Email Validator", href: "/tools/email-validator", description: "Validate email address syntax instantly." },
];

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "text-emerald-400" : score >= 45 ? "text-amber-400" : "text-red-400";
  const bg = score >= 70 ? "bg-emerald-400/10 border-emerald-400/20" : score >= 45 ? "bg-amber-400/10 border-amber-400/20" : "bg-red-400/10 border-red-400/20";
  return (
    <div className={`h-20 w-20 rounded-full border-4 ${bg} flex flex-col items-center justify-center shrink-0`}>
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] text-muted-foreground">/ 100</span>
    </div>
  );
}

export default function EmailPrivacyChecker() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeEmail> | null>(null);
  useToolView("email-privacy-checker");

  const check = useCallback(() => {
    if (!email.trim()) return;
    setResult(analyzeEmail(email.trim()));
  }, [email]);

  return (
    <MiniToolLayout
      seoTitle="Email Privacy Checker — Score Your Email Address Privacy"
      seoDescription="Check how private your email address really is. Get a privacy score across 7 factors: provider, username, data sharing, and more. Free, runs in your browser."
      icon={ShieldCheck}
      badge="Privacy Tool"
      title="Email Privacy Checker"
      description="Score your email address across 7 privacy factors. Find out if your inbox is leaking your identity to data brokers and advertisers."
      faqs={faqs}
      relatedTools={relatedTools}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="flex gap-2">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && check()}
              placeholder="your@email.com"
              type="email"
              className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono"
            />
            <Button onClick={check} disabled={!email.trim()}>Check Privacy</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Runs entirely in your browser — your email is never sent to any server.
          </p>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Score summary */}
            <div className="rounded-xl border border-border/60 bg-card/40 p-5">
              <div className="flex items-center gap-5">
                <ScoreRing score={result.score} />
                <div>
                  <div className="text-2xl font-bold mb-0.5">{result.grade} — {result.label}</div>
                  <p className="text-sm text-muted-foreground">
                    {result.score >= 70 ? "Your email address has good privacy characteristics." :
                     result.score >= 45 ? "Your email has moderate privacy. Consider the improvements below." :
                     "Your email address has significant privacy risks. Review the factors below."}
                  </p>
                </div>
              </div>
            </div>

            {/* Factors */}
            <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-3">
              <h3 className="font-semibold text-sm mb-4">Privacy Factors</h3>
              {result.factors.map((f, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${f.passed ? "border-emerald-400/20 bg-emerald-400/5" : "border-red-400/20 bg-red-400/5"}`}>
                  {f.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${f.passed ? "text-emerald-400" : "text-red-400"}`}>{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.info}</p>
                  </div>
                </div>
              ))}
            </div>

            {result.score < 70 && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-sm text-amber-400">How to improve your score</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Switch to <strong className="text-foreground">ProtonMail</strong> or <strong className="text-foreground">Tutanota</strong> for end-to-end encrypted email</li>
                  <li>• Use <strong className="text-foreground">email aliases</strong> (SimpleLogin, AnonAddy) when signing up for services</li>
                  <li>• Choose a username that doesn't include your real name or obvious patterns</li>
                  <li>• Use a <strong className="text-foreground">custom domain</strong> to make your email harder to target in bulk</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {!result && (
          <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center">
            <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Enter your email address above to get your privacy score.</p>
            <p className="text-xs text-muted-foreground mt-1">No data is sent — analysis happens entirely in your browser.</p>
          </div>
        )}

        {/* Info card */}
        <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong className="text-foreground">What this checker does:</strong> Analyzes the structural privacy of your email address using pattern matching — no external lookups, no data sent to servers.</p>
              <p><strong className="text-foreground">What it doesn't do:</strong> It cannot check data breaches (use HaveIBeenPwned for that), verify deliverability, or access your actual inbox.</p>
            </div>
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
