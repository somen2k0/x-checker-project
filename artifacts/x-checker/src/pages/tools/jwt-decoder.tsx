import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { KeyRound, Copy, Trash2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

const faqs = [
  { q: "What is a JWT?", a: "A JSON Web Token (JWT) is a compact, URL-safe way to represent claims between two parties. It consists of three Base64URL-encoded parts separated by dots: a header (algorithm info), a payload (claims/data), and a signature (for verification)." },
  { q: "Is it safe to paste my JWT here?", a: "Yes. This tool decodes JWTs entirely in your browser — no data is sent to any server. However, never share your JWT publicly, as it may grant access to protected resources." },
  { q: "Can this tool verify JWT signatures?", a: "No. Signature verification requires the secret or public key used to sign the token, which only your server should have. This tool only decodes and displays the header and payload for inspection purposes." },
  { q: "What do the JWT claims mean?", a: "Common claims include: sub (subject — who the token is about), iat (issued at — Unix timestamp), exp (expiration — Unix timestamp), aud (audience), iss (issuer), and nbf (not before). Custom claims can also be included." },
  { q: "What is the difference between HS256 and RS256?", a: "HS256 uses a shared secret (HMAC-SHA256) — the same key signs and verifies. RS256 uses asymmetric keys (RSA) — a private key signs and a public key verifies. RS256 is preferred for distributed systems." },
];

const relatedTools = [
  { title: "Base64 Encoder / Decoder", href: "/tools/base64", description: "Encode and decode Base64 strings including JWT payloads." },
  { title: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON instantly." },
  { title: "URL Encoder / Decoder", href: "/tools/url-encoder", description: "Encode or decode URLs and query parameters." },
];

const EXAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDAwMDAwMDAsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function b64decode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt: Date | null;
}

function decodeJWT(token: string): { ok: true; data: DecodedJWT } | { ok: false; error: string } {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { ok: false, error: "Invalid JWT: must have 3 parts separated by dots." };
  try {
    const header = JSON.parse(b64decode(parts[0])) as Record<string, unknown>;
    const payload = JSON.parse(b64decode(parts[1])) as Record<string, unknown>;
    const signature = parts[2];
    const exp = typeof payload.exp === "number" ? new Date(payload.exp * 1000) : null;
    const isExpired = exp ? exp < new Date() : false;
    return { ok: true, data: { header, payload, signature, isExpired, expiresAt: exp } };
  } catch {
    return { ok: false, error: "Failed to decode JWT. Make sure it's a valid token." };
  }
}

function formatDate(d: Date): string {
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" });
}

export default function JwtDecoder() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();
  useToolView("jwt-decoder");

  const handleInput = useCallback((val: string) => {
    setInput(val);
    if (!val.trim()) { setDecoded(null); setError(""); return; }
    const result = decodeJWT(val);
    if (result.ok) { setDecoded(result.data); setError(""); }
    else { setDecoded(null); setError(result.error); }
  }, []);

  const copySection = (obj: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    toast({ title: "Copied!" });
  };

  const handleClear = () => { setInput(""); setDecoded(null); setError(""); };
  const loadExample = () => handleInput(EXAMPLE_JWT);

  const formatValue = (key: string, val: unknown): string => {
    if ((key === "iat" || key === "exp" || key === "nbf") && typeof val === "number") {
      return `${val} (${formatDate(new Date(val * 1000))})`;
    }
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (
    <MiniToolLayout
      seoTitle="JWT Decoder Online Free — Decode JSON Web Tokens"
      seoDescription="Decode and inspect JWT (JSON Web Token) header and payload online. Instant decoding, expiry detection, 100% client-side — your token never leaves your browser."
      icon={KeyRound}
      badge="Developer Tool"
      title="JWT Decoder"
      description="Paste a JWT to instantly decode and inspect its header, payload, and expiration. All decoding happens in your browser — your token is never sent to a server."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">JWT Token</span>
            <button onClick={loadExample} className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">Load example</button>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={"Paste your JWT here...\n\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
            spellCheck={false}
            className={`w-full min-h-[100px] resize-y rounded-xl border bg-background/60 px-4 py-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 transition-all placeholder:text-muted-foreground/35 break-all ${
              error ? "border-destructive/40 focus:ring-destructive/30" : decoded ? "border-green-500/30 focus:ring-green-500/20" : "border-border/60 focus:ring-primary/30"
            }`}
          />
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <XCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {decoded && (
          <div className="space-y-3">
            {decoded.isExpired && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive font-medium">
                <XCircle className="h-3.5 w-3.5 shrink-0" />
                Token expired {decoded.expiresAt ? `— ${formatDate(decoded.expiresAt)}` : ""}
              </div>
            )}
            {!decoded.isExpired && decoded.expiresAt && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/25 text-xs text-green-500 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Token valid — expires {formatDate(decoded.expiresAt)}
              </div>
            )}

            {[
              { title: "Header", color: "text-blue-400", data: decoded.header },
              { title: "Payload", color: "text-purple-400", data: decoded.payload },
            ].map(({ title, color, data }) => (
              <div key={title} className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/20">
                  <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</span>
                  <Button variant="ghost" size="sm" onClick={() => copySection(data)} className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground px-2">
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </div>
                <div className="p-4 space-y-2">
                  {Object.entries(data).map(([k, v]) => (
                    <div key={k} className="flex gap-3 text-xs">
                      <span className="font-mono text-primary/80 shrink-0 w-20 truncate">{k}</span>
                      <span className="font-mono text-foreground/80 break-all">{formatValue(k, v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Signature</span>
              </div>
              <pre className="px-4 py-3.5 font-mono text-xs text-muted-foreground/70 break-all whitespace-pre-wrap">{decoded.signature}</pre>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={!input} className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[{ icon: ShieldCheck, label: "100% client-side" }, { icon: KeyRound, label: "Header + payload" }, { icon: CheckCircle2, label: "Expiry detection" }].map(({ icon: Ic, label }) => (
            <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
              <Ic className="h-3 w-3" />{label}
            </div>
          ))}
        </div>

        {/* ── Common Claims Reference ── */}
        <div className="mt-2 rounded-xl border border-border/60 bg-card/40 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Common JWT Claims Reference</span>
          </div>
          <div className="divide-y divide-border/40">
            {[
              { claim: "sub",  type: "string",  desc: "Subject — who the token identifies (usually a user ID)" },
              { claim: "iss",  type: "string",  desc: "Issuer — the authority that created the token (e.g. https://auth.example.com)" },
              { claim: "aud",  type: "string | string[]", desc: "Audience — the intended recipient(s) of the token" },
              { claim: "exp",  type: "number",  desc: "Expiration — Unix timestamp after which the token is invalid" },
              { claim: "iat",  type: "number",  desc: "Issued At — Unix timestamp of when the token was created" },
              { claim: "nbf",  type: "number",  desc: "Not Before — token must not be accepted before this Unix timestamp" },
              { claim: "jti",  type: "string",  desc: "JWT ID — unique identifier, used to prevent token replay attacks" },
              { claim: "name", type: "string",  desc: "Full name of the token subject (OpenID Connect)" },
              { claim: "email",type: "string",  desc: "Email address of the subject (OpenID Connect)" },
              { claim: "role", type: "string",  desc: "Custom claim — user role (e.g. admin, viewer). Not standardised." },
            ].map(({ claim, type, desc }) => (
              <div key={claim} className="flex items-start gap-3 px-4 py-2.5 text-xs">
                <code className="font-mono text-primary/80 shrink-0 w-14">{claim}</code>
                <code className="font-mono text-muted-foreground/60 shrink-0 w-28 hidden sm:block">{type}</code>
                <span className="text-muted-foreground leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MiniToolLayout>
  );
}
