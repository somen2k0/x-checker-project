import { useState, useCallback, useRef } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";
import { trackEvent } from "@/lib/analytics";
import {
  Code2,
  Copy,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Minimize2,
  Maximize2,
  AlignLeft,
  FileJson,
} from "lucide-react";

const faqs = [
  {
    q: "What is a JSON formatter?",
    a: "A JSON formatter (also called a JSON beautifier or JSON prettifier) is a tool that takes minified or unformatted JSON text and reformats it with proper indentation and line breaks, making it easy to read and understand. It's an essential tool for developers working with APIs, config files, and data interchange formats.",
  },
  {
    q: "What is JSON validation?",
    a: "JSON validation checks whether a piece of text conforms to the JSON specification (RFC 8259). A valid JSON document must have proper key-value pairs, correct use of quotes, no trailing commas, and balanced brackets. Our validator shows you exactly where any syntax errors are so you can fix them instantly.",
  },
  {
    q: "What are common JSON syntax errors?",
    a: "The most common JSON errors are: trailing commas after the last item in an object or array, using single quotes instead of double quotes around keys or strings, missing quotes around object keys, unescaped special characters in strings, and mismatched or missing brackets and braces.",
  },
  {
    q: "What is the difference between format and minify JSON?",
    a: "Formatting (prettifying) JSON adds indentation and newlines to make it human-readable. Minifying removes all unnecessary whitespace to produce the smallest possible string — useful for reducing file size and network payload when sending JSON in API responses or config files.",
  },
  {
    q: "Is my JSON data safe to paste here?",
    a: "Completely. This tool runs 100% in your browser — no data is ever sent to a server. Your JSON stays on your device at all times. You can use it safely with sensitive configuration data, API keys (though we recommend removing them first), or private business data.",
  },
  {
    q: "Why do developers use JSON formatters?",
    a: "Developers use JSON formatters when debugging API responses, reviewing configuration files, reading log data, or collaborating with teammates. Minified JSON is unreadable, and a formatter instantly makes it clear. JSON validators help catch bugs before they reach production.",
  },
  {
    q: "Can I use this to validate JSON from an API response?",
    a: "Yes. Just paste the raw JSON response from any API directly into the input panel. The tool will validate it instantly and show you a formatted, readable version — or tell you exactly which line has a syntax error.",
  },
  {
    q: "What is JSON-LD?",
    a: "JSON-LD (JSON for Linking Data) is a format for encoding Linked Data using JSON, commonly used for structured data and SEO schema markup. While our formatter can format JSON-LD, it does not provide semantic validation for the JSON-LD vocabulary itself.",
  },
];

const relatedTools = [
  {
    title: "Character Counter",
    href: "/tools/character-counter",
    description: "Count characters, words, and lines in real time.",
  },
  {
    title: "Tweet Formatter",
    href: "/tools/tweet-formatter",
    description: "Format long text into numbered tweet threads.",
  },
  {
    title: "Hashtag Formatter",
    href: "/tools/hashtag-formatter",
    description: "Clean and format hashtag lists in one click.",
  },
  {
    title: "Font Preview",
    href: "/tools/font-preview",
    description: "Preview your bio text in stylish Unicode fonts.",
  },
];

const EXAMPLE_JSON = `{
  "user": {
    "id": 1,
    "name": "Alex Johnson",
    "username": "@alexj",
    "verified": true,
    "followers": 14200,
    "following": 382,
    "bio": "Building in public. Tweeting about tech & startups.",
    "joined": "2019-03-15T00:00:00Z",
    "links": [
      "https://alexj.dev",
      "https://github.com/alexj"
    ]
  }
}`;

function formatJson(input: string, indent = 2): { ok: true; output: string } | { ok: false; error: string; line?: number } {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, output: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : String(e);
    const lineMatch = msg.match(/line (\d+)/i);
    return { ok: false, error: msg, line: lineMatch ? Number(lineMatch[1]) : undefined };
  }
}

function minifyJson(input: string): { ok: true; output: string } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, output: JSON.stringify(parsed) };
  } catch (e) {
    return { ok: false, error: e instanceof SyntaxError ? e.message : String(e) };
  }
}

type ValidationState = "idle" | "valid" | "invalid";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorLine, setErrorLine] = useState<number | undefined>();
  const [activeAction, setActiveAction] = useState<"format" | "minify" | null>(null);
  const { toast } = useToast();
  const track = useTrack("json-formatter");
  useToolView("json-formatter");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = useCallback((value: string) => {
    if (!value.trim()) {
      setValidationState("idle");
      setErrorMsg("");
      setErrorLine(undefined);
      return;
    }
    const result = formatJson(value);
    if (result.ok) {
      setValidationState("valid");
      setErrorMsg("");
      setErrorLine(undefined);
    } else {
      setValidationState("invalid");
      setErrorMsg(result.error);
      setErrorLine(result.line);
    }
  }, []);

  const handleInput = useCallback(
    (val: string) => {
      setInput(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        validate(val);
        if (val.trim()) trackEvent("validate_json", { tool: "json-formatter" });
      }, 400);
    },
    [validate],
  );

  const handleFormat = () => {
    if (!input.trim()) return;
    const result = formatJson(input);
    if (result.ok) {
      setOutput(result.output);
      setValidationState("valid");
      setErrorMsg("");
      setErrorLine(undefined);
      setActiveAction("format");
      track("format_json");
      trackEvent("format_json", { tool: "json-formatter" });
    } else {
      setValidationState("invalid");
      setErrorMsg(result.error);
      setErrorLine(result.line);
      setOutput("");
      toast({ title: "Invalid JSON", description: result.error, variant: "destructive" });
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    const result = minifyJson(input);
    if (result.ok) {
      setOutput(result.output);
      setValidationState("valid");
      setErrorMsg("");
      setErrorLine(undefined);
      setActiveAction("minify");
      track("minify_json" as never);
      trackEvent("validate_json", { tool: "json-formatter", label: "minify" });
    } else {
      setValidationState("invalid");
      setErrorMsg(result.error);
      setOutput("");
      toast({ title: "Invalid JSON", description: result.error, variant: "destructive" });
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    track("copy_json");
    trackEvent("copy_json", { tool: "json-formatter" });
    toast({ title: "Copied!", description: "JSON copied to clipboard." });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
    track("download_json");
    trackEvent("download_json", { tool: "json-formatter" });
    toast({ title: "Downloaded!", description: "formatted.json saved." });
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setValidationState("idle");
    setErrorMsg("");
    setErrorLine(undefined);
    setActiveAction(null);
  };

  const handleLoadExample = () => {
    setInput(EXAMPLE_JSON);
    validate(EXAMPLE_JSON);
    setOutput("");
    setActiveAction(null);
  };

  const lineCount = input ? input.split("\n").length : 0;
  const charCount = input.length;

  return (
    <MiniToolLayout
      seoTitle="JSON Formatter & Validator Online Free"
      seoDescription="Format, prettify, minify, and validate JSON online for free. Real-time syntax validation with detailed error messages. 100% client-side — your data never leaves your browser."
      icon={FileJson}
      badge="Developer Tool"
      title="JSON Formatter & Validator"
      description="Paste your JSON to instantly format, prettify, minify, or validate it. Detailed error messages highlight exactly what's wrong. Fully client-side — your data never leaves the browser."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">

        {/* Validation status bar */}
        {validationState !== "idle" && (
          <div
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium border transition-all animate-in fade-in duration-200 ${
              validationState === "valid"
                ? "bg-green-500/10 border-green-500/25 text-green-500"
                : "bg-destructive/10 border-destructive/25 text-destructive"
            }`}
          >
            {validationState === "valid" ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Valid JSON
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">
                  {errorLine ? `Line ${errorLine}: ` : ""}
                  {errorMsg}
                </span>
              </>
            )}
          </div>
        )}

        {/* Two-panel editor */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Input panel */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Input</span>
                {charCount > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">
                    {lineCount} lines · {charCount.toLocaleString()} chars
                  </span>
                )}
              </div>
              <button
                onClick={handleLoadExample}
                className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
              >
                Load example
              </button>
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={`Paste your JSON here...\n\n{\n  "key": "value"\n}`}
                spellCheck={false}
                className={`w-full min-h-[320px] md:min-h-[420px] resize-y rounded-xl border bg-background/60 px-4 py-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 transition-all placeholder:text-muted-foreground/35 ${
                  validationState === "invalid"
                    ? "border-destructive/40 focus:ring-destructive/30"
                    : validationState === "valid"
                      ? "border-green-500/30 focus:ring-green-500/20"
                      : "border-border/60 focus:ring-primary/30"
                }`}
              />
            </div>
          </div>

          {/* Output panel */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Output
                {activeAction && (
                  <span className="ml-2 font-normal normal-case text-muted-foreground/60 tracking-normal">
                    ({activeAction === "format" ? "formatted" : "minified"})
                  </span>
                )}
              </span>
              {output && (
                <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">
                  {output.split("\n").length} lines · {output.length.toLocaleString()} chars
                </span>
              )}
            </div>
            <div
              className={`relative w-full min-h-[320px] md:min-h-[420px] rounded-xl border bg-muted/20 overflow-auto ${
                output ? "border-border/60" : "border-border/40 border-dashed"
              }`}
            >
              {output ? (
                <pre className="px-4 py-3.5 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-all">
                  {output}
                </pre>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                  <div className="h-10 w-10 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center">
                    <Code2 className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground/60">Output appears here</p>
                    <p className="text-xs text-muted-foreground/40 mt-0.5">
                      Paste JSON and click Format or Minify
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleFormat}
            disabled={!input.trim()}
            className="text-xs shadow-sm shadow-primary/20 gap-1.5"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Format / Prettify
          </Button>
          <Button
            variant="outline"
            onClick={handleMinify}
            disabled={!input.trim()}
            className="text-xs border-border/60 gap-1.5"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            Minify
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!output}
            className="text-xs border-border/60 gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!output}
            className="text-xs border-border/60 gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!input && !output}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { icon: AlignLeft, label: "Real-time validation" },
            { icon: Code2, label: "Syntax highlighting" },
            { icon: Download, label: "Download .json" },
            { icon: FileJson, label: "100% client-side" },
          ].map(({ icon: Ic, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1"
            >
              <Ic className="h-3 w-3" />
              {label}
            </div>
          ))}
        </div>

        {/* SEO content sections */}
        <div className="space-y-8 pt-6 border-t border-border/40">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">What is a JSON Formatter?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A <strong>JSON formatter</strong> (also known as a JSON beautifier or JSON prettifier) transforms
              compact or minified JSON into a human-readable format with proper indentation. When APIs return
              data or config files are minified for production, the output is nearly impossible to read at a
              glance. Pasting it into a JSON formatter instantly makes the structure clear.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This <strong>free online JSON formatter</strong> works entirely in your browser — no server, no
              upload, no account. It's the fastest way to <strong>format JSON online</strong> without
              compromising the privacy of your data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">How JSON Validation Works</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>JSON validation</strong> checks whether your text strictly follows the JSON specification
              (RFC 8259). The validator parses the input using JavaScript's native <code className="bg-muted/60 rounded px-1 py-0.5 text-xs font-mono">JSON.parse()</code> and
              catches any <code className="bg-muted/60 rounded px-1 py-0.5 text-xs font-mono">SyntaxError</code> thrown — giving you the exact error message and line
              number where the problem occurs.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Validation runs automatically as you type (with a short debounce), so you get instant feedback
              while editing. The status bar at the top of the editor turns green for valid JSON and red with an
              error message for invalid JSON.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Common JSON Syntax Errors</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  error: "Trailing comma",
                  example: '{ "a": 1, }',
                  fix: 'Remove the comma after the last item: { "a": 1 }',
                },
                {
                  error: "Single quotes",
                  example: "{ 'key': 'value' }",
                  fix: 'Use double quotes: { "key": "value" }',
                },
                {
                  error: "Unquoted keys",
                  example: "{ key: 1 }",
                  fix: 'Quote every key: { "key": 1 }',
                },
                {
                  error: "Missing comma",
                  example: '{ "a": 1 "b": 2 }',
                  fix: 'Add comma between pairs: { "a": 1, "b": 2 }',
                },
                {
                  error: "Comments in JSON",
                  example: "// not allowed\n{ }",
                  fix: "JSON has no comment syntax — remove all comments.",
                },
                {
                  error: "Undefined value",
                  example: '{ "val": undefined }',
                  fix: 'Use null instead: { "val": null }',
                },
              ].map(({ error, example, fix }) => (
                <div
                  key={error}
                  className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2"
                >
                  <p className="text-sm font-semibold text-destructive">{error}</p>
                  <code className="block text-[11px] font-mono bg-muted/60 rounded px-2 py-1.5 text-foreground/70 whitespace-pre">
                    {example}
                  </code>
                  <p className="text-xs text-muted-foreground">{fix}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Format vs Minify — When to Use Each</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-semibold">Format / Prettify</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Adds indentation and line breaks. Use this when debugging API responses, reviewing
                  config files, writing documentation, or collaborating with teammates.
                </p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Minimize2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Minify</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Strips all whitespace. Use this for production API payloads, HTTP request bodies,
                  or config files where file size matters.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">JSON Formatting Example</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Here's what our <strong>JSON beautifier</strong> does to a typical minified API response:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Before (minified)</p>
                <pre className="text-[11px] font-mono bg-muted/50 border border-border/50 rounded-xl px-3 py-3 overflow-x-auto text-foreground/70 whitespace-pre-wrap break-all leading-relaxed">
                  {`{"user":{"id":1,"name":"Alex","verified":true,"followers":14200}}`}
                </pre>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">After (formatted)</p>
                <pre className="text-[11px] font-mono bg-muted/50 border border-border/50 rounded-xl px-3 py-3 overflow-x-auto text-foreground/70 whitespace-pre-wrap leading-relaxed">
                  {`{\n  "user": {\n    "id": 1,\n    "name": "Alex",\n    "verified": true,\n    "followers": 14200\n  }\n}`}
                </pre>
              </div>
            </div>
          </section>

        </div>
      </div>
    </MiniToolLayout>
  );
}
