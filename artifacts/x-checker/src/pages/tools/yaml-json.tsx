import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { Copy, Trash2, ArrowLeftRight, Download, CheckCircle2, XCircle, FileJson } from "lucide-react";
import yaml from "js-yaml";

type Direction = "yaml-to-json" | "json-to-yaml";

function convert(input: string, direction: Direction): { ok: true; output: string } | { ok: false; error: string } {
  if (!input.trim()) return { ok: true, output: "" };
  try {
    if (direction === "yaml-to-json") {
      const parsed = yaml.load(input);
      return { ok: true, output: JSON.stringify(parsed, null, 2) };
    } else {
      const parsed = JSON.parse(input);
      return { ok: true, output: yaml.dump(parsed, { indent: 2, lineWidth: -1 }) };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

const EXAMPLE_YAML = `user:
  id: 1
  name: Alex Johnson
  username: "@alexj"
  verified: true
  followers: 14200
  links:
    - https://alexj.dev
    - https://github.com/alexj`;

const EXAMPLE_JSON = `{
  "user": {
    "id": 1,
    "name": "Alex Johnson",
    "username": "@alexj",
    "verified": true,
    "followers": 14200,
    "links": [
      "https://alexj.dev",
      "https://github.com/alexj"
    ]
  }
}`;

const faqs = [
  {
    q: "What is YAML?",
    a: "YAML (YAML Ain't Markup Language) is a human-readable data serialization format. It's widely used for configuration files — Docker Compose, Kubernetes, GitHub Actions, and many frameworks use YAML. It's easier to read than JSON because it uses indentation instead of braces and brackets.",
  },
  {
    q: "When should I use YAML vs JSON?",
    a: "Use YAML for configuration files and human-edited data — it supports comments, is less verbose, and is easier to read. Use JSON for APIs, data interchange between systems, and machine-processed data — JSON has wider language support and stricter parsing.",
  },
  {
    q: "Can YAML do everything JSON can?",
    a: "YAML is a superset of JSON — every valid JSON document is also valid YAML. YAML adds extras like comments (#), multi-line strings, anchors for reuse, and more flexible quoting. However, these extras don't have equivalents in JSON, so not all YAML can be losslessly round-tripped to JSON.",
  },
  {
    q: "Is my data sent to a server?",
    a: "No. All conversions happen entirely in your browser using the js-yaml library. Your data never leaves your device. It's safe to use with private configuration files and sensitive data.",
  },
  {
    q: "What errors can occur when converting?",
    a: "Common errors include invalid indentation in YAML (mixing tabs and spaces), duplicate keys, and incorrect JSON syntax (trailing commas, single quotes, unquoted keys). The converter shows the exact error message to help you debug.",
  },
];

const relatedTools = [
  { title: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON with real-time error detection." },
  { title: "Base64 Encoder", href: "/tools/base64", description: "Encode and decode Base64 strings instantly." },
  { title: "JWT Decoder", href: "/tools/jwt-decoder", description: "Decode and inspect JWT tokens in the browser." },
  { title: "URL Encoder", href: "/tools/url-encoder", description: "Encode or decode URL percent-encoded strings." },
];

export default function YamlJsonConverter() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("yaml-to-json");
  const { toast } = useToast();
  useToolView("yaml-json");

  const result = convert(input, direction);
  const output = result.ok ? result.output : "";
  const error = result.ok ? "" : result.error;

  const handleSwap = () => {
    const newDir: Direction = direction === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json";
    if (result.ok && result.output) {
      setInput(result.output);
    }
    setDirection(newDir);
  };

  const handleLoadExample = () => {
    setInput(direction === "yaml-to-json" ? EXAMPLE_YAML : EXAMPLE_JSON);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "Output copied to clipboard." });
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = direction === "yaml-to-json" ? "json" : "yaml";
    const mime = direction === "yaml-to-json" ? "application/json" : "text/yaml";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: `converted.${ext} saved.` });
  };

  const handleClear = () => setInput("");

  const inputLabel = direction === "yaml-to-json" ? "YAML Input" : "JSON Input";
  const outputLabel = direction === "yaml-to-json" ? "JSON Output" : "YAML Output";

  return (
    <MiniToolLayout
      seoTitle="YAML to JSON Converter Online Free — JSON to YAML Too"
      seoDescription="Convert YAML to JSON or JSON to YAML instantly in your browser. Free, no signup, 100% client-side. Supports complex nested structures and arrays."
      icon={FileJson}
      badge="Developer Tool"
      title="YAML ↔ JSON Converter"
      description="Convert between YAML and JSON instantly. Paste your data, pick a direction, and get clean output — no server, no signup, supports nested objects and arrays."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">
        {/* Direction toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center rounded-xl border border-border/60 overflow-hidden bg-muted/30 p-1 gap-1">
            <button
              onClick={() => setDirection("yaml-to-json")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                direction === "yaml-to-json"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              YAML → JSON
            </button>
            <button
              onClick={() => setDirection("json-to-yaml")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                direction === "json-to-yaml"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              JSON → YAML
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleSwap} className="text-xs border-border/60 gap-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Swap & Flip
          </Button>
        </div>

        {/* Validation bar */}
        {input.trim() && (
          <div
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium border transition-all animate-in fade-in duration-200 ${
              result.ok
                ? "bg-green-500/10 border-green-500/25 text-green-500"
                : "bg-destructive/10 border-destructive/25 text-destructive"
            }`}
          >
            {result.ok ? (
              <><CheckCircle2 className="h-4 w-4 shrink-0" /> Valid — conversion successful</>
            ) : (
              <><XCircle className="h-4 w-4 shrink-0" /><span className="truncate">{error}</span></>
            )}
          </div>
        )}

        {/* Two-panel editor */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Input panel */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">{inputLabel}</span>
              <button
                onClick={handleLoadExample}
                className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
              >
                Load example
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === "yaml-to-json"
                ? "Paste your YAML here...\n\nkey: value\nlist:\n  - item1\n  - item2"
                : 'Paste your JSON here...\n\n{\n  "key": "value"\n}'
              }
              spellCheck={false}
              className={`w-full min-h-[320px] md:min-h-[420px] resize-y rounded-xl border bg-background/60 px-4 py-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 transition-all placeholder:text-muted-foreground/35 ${
                error && input.trim()
                  ? "border-destructive/40 focus:ring-destructive/30"
                  : result.ok && input.trim()
                    ? "border-green-500/30 focus:ring-green-500/20"
                    : "border-border/60 focus:ring-primary/30"
              }`}
            />
          </div>

          {/* Output panel */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">{outputLabel}</span>
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
                    <FileJson className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground/60">Output appears here</p>
                    <p className="text-xs text-muted-foreground/40 mt-0.5">Paste input to convert automatically</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleCopy} disabled={!output} className="text-xs shadow-sm shadow-primary/20 gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Copy Output
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!output} className="text-xs border-border/60 gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={!input} className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {["Bidirectional", "Nested objects & arrays", "Download output", "100% client-side"].map((label) => (
            <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
              {label}
            </div>
          ))}
        </div>

        {/* SEO content */}
        <div className="space-y-8 pt-6 border-t border-border/40">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">YAML to JSON Converter — Free & Instant</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This <strong>free YAML to JSON converter</strong> transforms YAML files into valid JSON — or converts
              JSON back to YAML — instantly in your browser. No server, no upload, no account required.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Whether you're working with <strong>Kubernetes configs</strong>, <strong>Docker Compose files</strong>,{" "}
              <strong>GitHub Actions workflows</strong>, or <strong>API responses</strong>, this tool handles any
              valid YAML or JSON structure including nested objects, arrays, booleans, and null values.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">YAML vs JSON — Key Differences</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "YAML", points: ["Human-readable indentation", "Supports comments (#)", "Less punctuation", "Common in config files"], color: "border-blue-500/20 bg-blue-500/5" },
                { label: "JSON", points: ["Strict syntax (no comments)", "Braces and brackets", "Universal API support", "Machine-friendly format"], color: "border-orange-500/20 bg-orange-500/5" },
              ].map(({ label, points, color }) => (
                <div key={label} className={`rounded-xl border p-4 space-y-2 ${color}`}>
                  <p className="text-sm font-semibold">{label}</p>
                  <ul className="space-y-1">
                    {points.map((p) => (
                      <li key={p} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">·</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MiniToolLayout>
  );
}
