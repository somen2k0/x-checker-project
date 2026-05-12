import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { useToolView } from "@/hooks/use-track";
import { Regex, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

const faqs = [
  { q: "What is a regular expression?", a: "A regular expression (regex) is a sequence of characters that defines a search pattern. Regex is used to match, search, and replace text in strings. It's supported in nearly every programming language." },
  { q: "What flags are available?", a: "Common flags: g (global — find all matches), i (case-insensitive), m (multiline — ^ and $ match line boundaries), s (dotAll — . matches newlines)." },
  { q: "What does \\d, \\w, \\s mean?", a: "\\d matches any digit (0–9). \\w matches any word character (a–z, A–Z, 0–9, _). \\s matches any whitespace character (space, tab, newline). Their uppercase counterparts (\\D, \\W, \\S) match the opposite." },
  { q: "Is my text safe here?", a: "Yes. All regex testing happens entirely in your browser — nothing is sent to a server." },
];

const relatedTools = [
  { title: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON instantly." },
  { title: "URL Encoder / Decoder", href: "/tools/url-encoder", description: "Encode or decode URLs and query parameters." },
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters, words, and lines." },
];

const PRESETS = [
  { label: "Email address", pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}", flags: "gi" },
  { label: "URL", pattern: "https?:\\/\\/[^\\s/$.?#].[^\\s]*", flags: "gi" },
  { label: "Phone number", pattern: "\\+?[1-9]\\d{1,14}", flags: "g" },
  { label: "IPv4 address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { label: "Hashtag", pattern: "#[\\w]+", flags: "g" },
  { label: "HTML tag", pattern: "<[^>]+>", flags: "gi" },
  { label: "Digits only", pattern: "\\d+", flags: "g" },
];

const DEFAULT_TEXT = `Welcome to X Toolkit! Visit us at https://xtoolkit.live or email hello@xtoolkit.live for support.
You can also reach us at +1-800-555-0199.
Check out #XToolkit and #DevTools on X (Twitter).
Server IP: 192.168.1.100 | Backup: 10.0.0.1`;

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState(DEFAULT_TEXT);
  useToolView("regex-tester");

  const result = useMemo(() => {
    if (!pattern.trim() || !text) return null;
    try {
      const re = new RegExp(pattern, flags);
      const matches: Array<{ match: string; index: number; groups: Record<string, string> | null }> = [];
      let m: RegExpExecArray | null;
      const testRe = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      while ((m = testRe.exec(text)) !== null) {
        matches.push({ match: m[0], index: m.index, groups: m.groups ? { ...m.groups } : null });
        if (!flags.includes("g")) break;
      }
      return { ok: true as const, matches, re };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Invalid regex" };
    }
  }, [pattern, flags, text]);

  const highlighted = useMemo(() => {
    if (!result?.ok || result.matches.length === 0) return null;
    const parts: Array<{ text: string; match: boolean }> = [];
    let last = 0;
    for (const { match, index } of result.matches) {
      if (index > last) parts.push({ text: text.slice(last, index), match: false });
      parts.push({ text: match, match: true });
      last = index + match.length;
    }
    if (last < text.length) parts.push({ text: text.slice(last), match: false });
    return parts;
  }, [result, text]);

  const AVAILABLE_FLAGS = ["g", "i", "m", "s"];
  const toggleFlag = (f: string) => {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, "") : prev + f);
  };

  return (
    <MiniToolLayout
      seoTitle="Regex Tester Online Free — Regular Expression Tester"
      seoDescription="Test and debug regular expressions online for free. Real-time match highlighting, named groups, and common regex presets. 100% client-side."
      icon={Regex}
      badge="Developer Tool"
      title="Regex Tester"
      description="Test regular expressions against any text in real time. Matches are highlighted inline. All processing happens in your browser — nothing is sent to a server."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Presets</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { setPattern(p.pattern); setFlags(p.flags); }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-muted/60 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Pattern</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-sm shrink-0">/</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                spellCheck={false}
                className={`flex-1 rounded-xl border bg-background/60 px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 transition-all ${
                  result?.ok === false ? "border-destructive/40 focus:ring-destructive/30" : "border-border/60 focus:ring-primary/30"
                }`}
              />
              <span className="text-muted-foreground font-mono text-sm shrink-0">/{flags}</span>
            </div>
            {result?.ok === false && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <XCircle className="h-3.5 w-3.5 shrink-0" />{result.error}
              </div>
            )}
          </div>
          <div className="space-y-1.5 shrink-0">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Flags</label>
            <div className="flex gap-1.5">
              {AVAILABLE_FLAGS.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFlag(f)}
                  className={`w-8 h-9 rounded-lg border font-mono text-xs font-bold transition-all ${
                    flags.includes(f) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {result?.ok && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${result.matches.length > 0 ? "bg-green-500/10 border border-green-500/20 text-green-500" : "bg-muted/40 border border-border/50 text-muted-foreground"}`}>
            {result.matches.length > 0 ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
            {result.matches.length > 0 ? `${result.matches.length} match${result.matches.length !== 1 ? "es" : ""} found` : "No matches"}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Test String</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[160px] resize-y rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {highlighted && highlighted.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Matches Highlighted</label>
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
              {highlighted.map((part, i) =>
                part.match ? (
                  <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">{part.text}</mark>
                ) : (
                  <span key={i} className="text-foreground/80">{part.text}</span>
                )
              )}
            </div>
          </div>
        )}

        {result?.ok && result.matches.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Match List</label>
            <div className="rounded-xl border border-border/60 bg-card/40 divide-y divide-border/40 overflow-hidden max-h-48 overflow-y-auto">
              {result.matches.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-6 shrink-0">#{i + 1}</span>
                  <code className="text-xs font-mono text-foreground/90 flex-1 break-all">{JSON.stringify(m.match)}</code>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">idx {m.index}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {[{ icon: ShieldCheck, label: "100% client-side" }, { icon: Regex, label: "Real-time matching" }, { icon: CheckCircle2, label: "Highlight matches" }].map(({ icon: Ic, label }) => (
            <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
              <Ic className="h-3 w-3" />{label}
            </div>
          ))}
        </div>
      </div>
    </MiniToolLayout>
  );
}
