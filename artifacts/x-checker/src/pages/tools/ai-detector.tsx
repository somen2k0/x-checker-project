import { useState, useRef } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Copy, CheckCircle2, Sparkles, ShieldCheck, RefreshCw,
  AlertCircle, ChevronDown, Eye, Wand2, Info,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const GROQ_KEY_LS = "groq_api_key";

const FAQS = [
  { q: "What AI models does it detect?", a: "It detects text from all major AI models — ChatGPT, Claude, Gemini, Llama, Mistral, and others. It looks for universal AI writing patterns rather than model-specific fingerprints." },
  { q: "How accurate is the detection?", a: "Detection uses Llama 3.3 70B, one of the strongest open models. Accuracy is high for clearly AI-generated or clearly human text. Short or heavily edited text may score as uncertain." },
  { q: "What does the humanizer do?", a: "The humanizer rewrites AI-generated text to sound natural and human — adding contractions, varying sentence length, removing AI transition phrases, and adding personality." },
  { q: "Do I need an API key?", a: "Yes — a free Groq API key is required. Get one in seconds at console.groq.com. It's completely free with generous limits." },
  { q: "Is my text stored?", a: "No. Your text is sent directly to Groq's API for processing and immediately discarded. Nothing is stored on our servers." },
  { q: "What's the text limit?", a: "Detection supports up to 8000 characters. Humanization supports up to 6000 characters. For longer content, process it in sections." },
];

const HUMANIZE_STYLES = [
  { id: "casual",       label: "Casual",       desc: "Like texting a smart friend" },
  { id: "professional", label: "Professional",  desc: "Warm & clear, not corporate" },
  { id: "academic",     label: "Academic",      desc: "Precise but readable" },
  { id: "creative",     label: "Creative",      desc: "Expressive with rhythm" },
];

function scoreColor(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  if (score >= 40) return "text-yellow-400";
  if (score >= 20) return "text-lime-400";
  return "text-green-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-lime-500";
  return "bg-green-500";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Likely AI-Generated";
  if (score >= 60) return "Possibly AI";
  if (score >= 40) return "Mixed / Uncertain";
  if (score >= 20) return "Possibly Human";
  return "Likely Human";
}

function scoreBorder(score: number): string {
  if (score >= 80) return "border-red-500/30 bg-red-500/5";
  if (score >= 60) return "border-orange-500/30 bg-orange-500/5";
  if (score >= 40) return "border-yellow-500/30 bg-yellow-500/5";
  if (score >= 20) return "border-lime-500/30 bg-lime-500/5";
  return "border-green-500/30 bg-green-500/5";
}

function sentenceHighlightClass(score: number): string {
  if (score >= 80) return "bg-red-500/15 border-b border-red-500/30";
  if (score >= 60) return "bg-orange-500/10 border-b border-orange-500/20";
  if (score >= 40) return "bg-yellow-500/8 border-b border-yellow-500/15";
  return "";
}

interface DetectResult {
  score: number;
  label: string;
  confidence: string;
  summary: string;
  indicators: string[];
  sentences: Array<{ text: string; score: number }>;
}

export default function AiDetector() {
  const [tab, setTab] = useState<"detect" | "humanize">("detect");
  const [text, setText] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(GROQ_KEY_LS) ?? "");
  const [showKey, setShowKey] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [humanizing, setHumanizing] = useState(false);
  const [detectResult, setDetectResult] = useState<DetectResult | null>(null);
  const [humanized, setHumanized] = useState("");
  const [humanizeStyle, setHumanizeStyle] = useState("casual");
  const [copiedDetect, setCopiedDetect] = useState(false);
  const [copiedHuman, setCopiedHuman] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveKey = (k: string) => {
    setApiKey(k);
    if (k.trim()) localStorage.setItem(GROQ_KEY_LS, k.trim());
    else localStorage.removeItem(GROQ_KEY_LS);
  };

  const handleError = (res: Response, data: { error?: string }) => {
    if (res.status === 401 || data.error === "invalid_api_key") {
      setError("Invalid API key. Get a free key at console.groq.com");
      return;
    }
    if (res.status === 429 || data.error === "rate_limited") {
      setError("Rate limited. Please wait a moment and try again.");
      return;
    }
    if (data.error === "no_api_key") {
      setError("Please enter your Groq API key above.");
      return;
    }
    setError(data.error ?? "Something went wrong. Please try again.");
  };

  const detect = async () => {
    if (!text.trim()) { toast({ title: "Enter some text first", variant: "destructive" }); return; }
    if (!apiKey.trim()) { setError("Please enter your Groq API key above."); return; }
    setDetecting(true); setDetectResult(null); setError(null);
    trackEvent("ai_detect", { chars: text.length });
    try {
      const res = await fetch("/api/ai-detector/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), apiKey: apiKey.trim() }),
      });
      const data = await res.json() as DetectResult & { error?: string };
      if (!res.ok) { handleError(res, data); return; }
      setDetectResult(data);
    } catch { setError("Network error. Please try again."); }
    finally { setDetecting(false); }
  };

  const humanize = async () => {
    if (!text.trim()) { toast({ title: "Enter some text first", variant: "destructive" }); return; }
    if (!apiKey.trim()) { setError("Please enter your Groq API key above."); return; }
    setHumanizing(true); setHumanized(""); setError(null);
    trackEvent("ai_humanize", { style: humanizeStyle, chars: text.length });
    try {
      const res = await fetch("/api/ai-detector/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), apiKey: apiKey.trim(), style: humanizeStyle }),
      });
      const data = await res.json() as { humanized?: string; error?: string };
      if (!res.ok) { handleError(res, data as { error?: string }); return; }
      setHumanized(data.humanized ?? "");
    } catch { setError("Network error. Please try again."); }
    finally { setHumanizing(false); }
  };

  const copy = (val: string, which: "detect" | "human") => {
    navigator.clipboard.writeText(val);
    if (which === "detect") { setCopiedDetect(true); setTimeout(() => setCopiedDetect(false), 2000); }
    else { setCopiedHuman(true); setTimeout(() => setCopiedHuman(false), 2000); }
    toast({ title: "Copied!" });
  };

  const charCount = text.length;
  const maxChars = tab === "detect" ? 8000 : 6000;

  return (
    <MiniToolLayout
      seoTitle="AI Text Detector & Humanizer — Free, No Signup"
      seoDescription="Detect if text is AI-generated and rewrite it to sound human. Powered by Llama 3.3 70B. Free Groq API key required."
      icon={Sparkles}
      badge="AI"
      title="AI Text Detector & Humanizer"
      description="Detect AI-generated content with sentence-level analysis, then rewrite it to sound naturally human. Powered by Llama 3.3 70B."
      faqs={FAQS}
      relatedTools={[
        { title: "AI Bio Generator", href: "/tools/bio-generator", description: "Generate 3 professional X bios with AI." },
        { title: "Subject Line Generator", href: "/tools/subject-line-generator", description: "AI-powered email subject lines." },
        { title: "Case Converter", href: "/tools/case-converter", description: "Convert text case instantly." },
      ]}
    >
      <div className="space-y-4">

        {/* API Key */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              Groq API Key
            </label>
            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
              Get free key →
            </a>
          </div>
          <div className="flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="gsk_…"
              className="flex-1 min-w-0 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 font-mono"
            />
            <Button variant="outline" size="sm" onClick={() => setShowKey((v) => !v)} className="text-xs shrink-0">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />
            Stored locally in your browser. Never sent to our servers.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/40 border border-border/50">
          {(["detect", "humanize"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? "bg-background border border-border/60 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t === "detect" ? <ShieldCheck className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
              {t === "detect" ? "Detect AI" : "Humanize"}
            </button>
          ))}
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
              {tab === "detect" ? "Text to Analyze" : "AI-Generated Text to Rewrite"}
            </label>
            <span className={`text-[11px] font-mono ${charCount > maxChars ? "text-red-400" : "text-muted-foreground/60"}`}>
              {charCount.toLocaleString()} / {maxChars.toLocaleString()}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              tab === "detect"
                ? "Paste any text here to check if it was written by AI…"
                : "Paste AI-generated text here to rewrite it and make it sound human…"
            }
            rows={8}
            className="w-full rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/30 placeholder:text-muted-foreground/40 leading-relaxed"
          />
        </div>

        {/* Humanize style selector */}
        {tab === "humanize" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Writing Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HUMANIZE_STYLES.map((s) => (
                <button key={s.id} onClick={() => setHumanizeStyle(s.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    humanizeStyle === s.id
                      ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                      : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}>
                  <div className="text-xs font-semibold">{s.label}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-300 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-xs shrink-0">×</button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {tab === "detect" ? (
            <>
              <Button onClick={detect} disabled={detecting || charCount > maxChars || !text.trim()}
                className="gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6">
                {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {detecting ? "Analyzing…" : "Detect AI Content"}
              </Button>
              {detectResult && (
                <>
                  <Button variant="outline" size="default" onClick={() => copy(
                    `AI Score: ${detectResult.score}% — ${detectResult.label}\n\nSummary: ${detectResult.summary}\n\nIndicators:\n${detectResult.indicators.map(i => `• ${i}`).join("\n")}`,
                    "detect"
                  )} className="gap-2 text-sm">
                    {copiedDetect ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedDetect ? "Copied!" : "Copy Report"}
                  </Button>
                  <Button variant="outline" size="default" onClick={() => { setDetectResult(null); setText(""); }} className="gap-2 text-sm">
                    <RefreshCw className="h-4 w-4" />Clear
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button onClick={humanize} disabled={humanizing || charCount > maxChars || !text.trim()}
                className="gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6">
                {humanizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {humanizing ? "Humanizing…" : "Humanize Text"}
              </Button>
              {humanized && (
                <Button variant="outline" size="default" onClick={humanize} disabled={humanizing} className="gap-2 text-sm">
                  <RefreshCw className={`h-4 w-4 ${humanizing ? "animate-spin" : ""}`} />Regenerate
                </Button>
              )}
            </>
          )}
        </div>

        {/* ── DETECT RESULT ── */}
        {tab === "detect" && detectResult && (
          <div className="space-y-4">

            {/* Score card */}
            <div className={`rounded-xl border p-5 ${scoreBorder(detectResult.score)}`}>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                    <circle cx="40" cy="40" r="34" fill="none" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - detectResult.score / 100)}`}
                      className={scoreBg(detectResult.score).replace("bg-", "stroke-")}
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold tabular-nums ${scoreColor(detectResult.score)}`}>
                      {detectResult.score}%
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-lg font-bold ${scoreColor(detectResult.score)}`}>{scoreLabel(detectResult.score)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">Confidence: {detectResult.confidence}</div>
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{detectResult.summary}</p>
                </div>
              </div>
            </div>

            {/* AI Indicators */}
            {detectResult.indicators?.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/30 p-4 space-y-2">
                <h3 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide flex items-center gap-1.5">
                  <ChevronDown className="h-3.5 w-3.5" />AI Signals Detected
                </h3>
                <ul className="space-y-1.5">
                  {detectResult.indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sentence-level breakdown */}
            {detectResult.sentences?.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
                <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide flex-1">Sentence Analysis</h3>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-500/40 inline-block" />High AI</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-orange-500/30 inline-block" />Medium</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-transparent border border-border/40 inline-block" />Human</span>
                  </div>
                </div>
                <div className="divide-y divide-border/30">
                  {detectResult.sentences.map((s, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${sentenceHighlightClass(s.score)}`}>
                      <span className="text-[10px] text-muted-foreground/50 font-mono w-4 shrink-0">{i + 1}</span>
                      <p className="text-sm text-foreground/80 flex-1 leading-relaxed">{s.text}{s.text.length >= 79 ? "…" : ""}</p>
                      <span className={`text-xs font-bold tabular-nums shrink-0 w-10 text-right ${scoreColor(s.score)}`}>{s.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HUMANIZE RESULT ── */}
        {tab === "humanize" && humanized && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground/70 uppercase tracking-wide flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-purple-400" />Humanized Result
              </h3>
              <Button variant="outline" size="sm" onClick={() => copy(humanized, "human")} className="gap-1.5 text-xs">
                {copiedHuman ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedHuman ? "Copied!" : "Copy"}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border/50 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-400/70" />
                  <span className="text-xs font-semibold text-muted-foreground">Original (AI)</span>
                </div>
                <div className="p-4 text-sm text-foreground/60 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">{text}</div>
              </div>
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-purple-500/20 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">Humanized</span>
                </div>
                <div className="p-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">{humanized}</div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { icon: Wand2, label: "Bypass AI detectors" },
                { icon: CheckCircle2, label: `${humanizeStyle} tone` },
                { icon: RefreshCw, label: "Regenerate for variations" },
              ].map(({ icon: Ic, label }) => (
                <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
                  <Ic className="h-3 w-3 text-purple-400" />{label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
