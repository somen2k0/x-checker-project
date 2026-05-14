import { useState, useCallback, useRef } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";
import { trackEvent } from "@/lib/analytics";
import {
  Lock,
  Unlock,
  Copy,
  Download,
  Trash2,
  ArrowLeftRight,
  FileText,
  ShieldCheck,
} from "lucide-react";

const faqs = [
  {
    q: "What is Base64 encoding?",
    a: "Base64 is a binary-to-text encoding scheme that converts binary data into a string of ASCII characters. It uses 64 printable characters (A–Z, a–z, 0–9, +, /) to represent arbitrary binary data. It's widely used to safely transmit binary data over systems that only handle text, such as email and JSON APIs.",
  },
  {
    q: "What is Base64 used for?",
    a: "Base64 is used to embed images in HTML/CSS (as data URIs), encode email attachments (MIME), store binary data in JSON, pass data in URLs, encode JWTs (JSON Web Tokens), and send binary payloads through text-only channels like XML or REST APIs.",
  },
  {
    q: "Is Base64 the same as encryption?",
    a: "No. Base64 is encoding, not encryption. It does not protect your data — anyone can decode it instantly. It simply makes binary data safe to transmit through text-based protocols. Never use Base64 to secure sensitive data; use proper encryption like AES for that.",
  },
  {
    q: "What is URL-safe Base64?",
    a: "Standard Base64 uses + and / characters which have special meaning in URLs. URL-safe Base64 replaces + with - and / with _ so the encoded string can be used safely in URLs and filenames without percent-encoding. JWTs use URL-safe Base64 without padding (=) characters.",
  },
  {
    q: "Why does Base64 output end with = or ==?",
    a: "Base64 works in groups of 3 bytes. If the input length is not a multiple of 3, padding characters (=) are added to make the output length a multiple of 4. One = means 1 byte of padding was added; == means 2 bytes. Some implementations omit padding entirely.",
  },
  {
    q: "How do I decode a Base64 image?",
    a: "A Base64-encoded image typically appears as a data URI like data:image/png;base64,iVBORw0K... You can paste just the Base64 part (after the comma) into the decoder here to see the raw binary data. To render the image, use it as the src of an <img> tag with the full data URI.",
  },
  {
    q: "Can I encode any text to Base64?",
    a: "Yes. Any UTF-8 text — including Unicode characters, emojis, and special symbols — can be Base64 encoded. Our tool handles full Unicode by encoding the string as UTF-8 bytes first, then converting to Base64. This matches how most modern systems and browsers work.",
  },
  {
    q: "What is the size increase from Base64 encoding?",
    a: "Base64 increases the data size by approximately 33%. Every 3 bytes of input produce 4 Base64 characters. So a 1 KB file becomes roughly 1.33 KB when Base64 encoded. This overhead is a known tradeoff when embedding binary data in text-based formats.",
  },
];

const relatedTools = [
  {
    title: "JSON Formatter & Validator",
    href: "/tools/json-formatter",
    description: "Format, minify, and validate JSON instantly.",
  },
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
];

const EXAMPLES = {
  text: "Hello, World! 👋",
  encoded: "SGVsbG8sIFdvcmxkISA8a+w=",
  jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
};

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function decodeBase64(encoded: string): { ok: true; text: string } | { ok: false; error: string } {
  try {
    const binary = atob(encoded.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { ok: true, text: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, error: "Invalid Base64 string. Make sure the input is valid Base64." };
  }
}

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const track = useTrack("base64");
  useToolView("base64");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const process = useCallback(
    (value: string, currentMode: Mode) => {
      if (!value.trim()) {
        setOutput("");
        setError("");
        return;
      }
      if (currentMode === "encode") {
        try {
          const result = encodeBase64(value);
          setOutput(result);
          setError("");
        } catch {
          setError("Failed to encode. Check your input.");
          setOutput("");
        }
      } else {
        const result = decodeBase64(value);
        if (result.ok) {
          setOutput(result.text);
          setError("");
        } else {
          setError(result.error);
          setOutput("");
        }
      }
    },
    [],
  );

  const handleInput = useCallback(
    (val: string) => {
      setInput(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        process(val, mode);
        if (val.trim()) {
          trackEvent(mode === "encode" ? "encode_base64" : "decode_base64", { tool: "base64" });
        }
      }, 300);
    },
    [mode, process],
  );

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setInput("");
    setOutput("");
    setError("");
  };

  const handleSwapInputOutput = () => {
    if (!output) return;
    const newInput = output;
    const newMode: Mode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInput(newInput);
    process(newInput, newMode);
    track("swap_base64" as never);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    track("copy_base64");
    trackEvent("copy_base64", { tool: "base64" });
    toast({ title: "Copied!", description: "Output copied to clipboard." });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "encode" ? "encoded.txt" : "decoded.txt";
    a.click();
    URL.revokeObjectURL(url);
    track("download_base64");
    trackEvent("download_base64", { tool: "base64" });
    toast({ title: "Downloaded!" });
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const loadExample = (type: keyof typeof EXAMPLES) => {
    const val = EXAMPLES[type];
    if (type === "text") {
      setMode("encode");
      setInput(val);
      process(val, "encode");
    } else {
      setMode("decode");
      setInput(val);
      process(val, "decode");
    }
  };

  const inputLines = input ? input.split("\n").length : 0;
  const inputChars = input.length;
  const outputChars = output.length;
  const sizeIncrease =
    mode === "encode" && inputChars > 0
      ? `+${Math.round(((outputChars - inputChars) / inputChars) * 100)}%`
      : null;

  return (
    <MiniToolLayout
      seoTitle="Base64 Encoder & Decoder Online Free"
      seoDescription="Encode and decode Base64 online for free. Real-time conversion with full Unicode support. Paste text or Base64 and get instant results — 100% client-side, nothing sent to a server."
      icon={Lock}
      badge="Developer Tool"
      title="Base64 Encoder & Decoder"
      description="Encode any text to Base64 or decode Base64 back to readable text instantly. Full Unicode and emoji support. All processing happens in your browser — no data is ever sent to a server."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">

        {/* Mode tabs */}
        <div className="flex items-center gap-2 p-1 bg-muted/40 border border-border/60 rounded-xl w-fit">
          <button
            onClick={() => handleModeSwitch("encode")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === "encode"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            Encode
          </button>
          <button
            onClick={() => handleModeSwitch("decode")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === "decode"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Unlock className="h-3.5 w-3.5" />
            Decode
          </button>
        </div>

        {/* Examples strip */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-muted-foreground/60 shrink-0">Examples:</span>
          <button
            onClick={() => loadExample("text")}
            className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
          >
            Encode text
          </button>
          <span className="text-muted-foreground/30 text-xs">·</span>
          <button
            onClick={() => loadExample("encoded")}
            className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
          >
            Decode Base64
          </button>
          <span className="text-muted-foreground/30 text-xs">·</span>
          <button
            onClick={() => loadExample("jwt")}
            className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
          >
            Decode JWT payload
          </button>
        </div>

        {/* Two-panel editor */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                  {mode === "encode" ? "Plain Text" : "Base64 Input"}
                </span>
                {inputChars > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">
                    {inputLines > 1 ? `${inputLines} lines · ` : ""}{inputChars.toLocaleString()} chars
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Type or paste any text to encode...\n\nSupports Unicode, emojis 🎉, and all languages."
                  : "Paste Base64 encoded string to decode...\n\nSGVsbG8sIFdvcmxkIQ=="
              }
              spellCheck={false}
              className="w-full min-h-[260px] md:min-h-[340px] resize-y rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/35"
            />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                  {mode === "encode" ? "Base64 Output" : "Decoded Text"}
                </span>
                {outputChars > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">
                    {outputChars.toLocaleString()} chars
                    {sizeIncrease && (
                      <span className="ml-1 text-yellow-500">{sizeIncrease}</span>
                    )}
                  </span>
                )}
              </div>
            </div>
            <div
              className={`relative w-full min-h-[260px] md:min-h-[340px] rounded-xl border bg-muted/20 overflow-auto transition-all ${
                error
                  ? "border-destructive/40"
                  : output
                    ? "border-border/60"
                    : "border-border/40 border-dashed"
              }`}
            >
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-destructive/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive">Decoding failed</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error}</p>
                  </div>
                </div>
              ) : output ? (
                <pre className="px-4 py-3.5 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-all">
                  {output}
                </pre>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                  <div className="h-10 w-10 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center">
                    {mode === "encode" ? (
                      <Lock className="h-5 w-5 text-muted-foreground/40" />
                    ) : (
                      <Unlock className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground/60">
                      {mode === "encode" ? "Base64 output" : "Decoded text"} appears here
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-0.5">
                      Start typing or paste text above
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
            variant="outline"
            size="sm"
            onClick={handleSwapInputOutput}
            disabled={!output}
            className="text-xs border-border/60 gap-1.5"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Swap &amp; {mode === "encode" ? "Decode" : "Encode"}
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
            Copy Output
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

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { icon: ArrowLeftRight, label: "Real-time conversion" },
            { icon: ShieldCheck, label: "100% client-side" },
            { icon: FileText, label: "Full Unicode support" },
            { icon: Download, label: "Download output" },
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
            <h2 className="text-lg font-semibold">What is Base64 Encoding?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Base64</strong> is a binary-to-text encoding scheme that converts binary data
              into a string of 64 printable ASCII characters (A–Z, a–z, 0–9, +, /). It was designed
              to safely transmit binary data over systems that only handle plain text — like email
              servers, JSON APIs, and XML documents.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This <strong>free online Base64 encoder and decoder</strong> runs entirely in your
              browser. No data is sent to a server — paste your text and get an instant result. It
              supports full Unicode, including non-Latin scripts and emojis, by encoding input as
              UTF-8 bytes first.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Common Uses of Base64</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  title: "Embedding images in HTML/CSS",
                  desc: 'Convert images to Base64 data URIs for inline embedding: <img src="data:image/png;base64,..." />',
                },
                {
                  title: "JSON Web Tokens (JWT)",
                  desc: "JWTs use URL-safe Base64 to encode the header, payload, and signature as three dot-separated parts.",
                },
                {
                  title: "Email attachments (MIME)",
                  desc: "Email protocols are text-based. Base64 allows binary files (PDFs, images) to be safely embedded in email messages.",
                },
                {
                  title: "API payloads",
                  desc: "REST and GraphQL APIs often Base64-encode binary data like files, cursor tokens, or IDs in JSON responses.",
                },
                {
                  title: "Environment variables",
                  desc: "Certificates, private keys, and binary configs are often Base64-encoded to safely store in environment variables.",
                },
                {
                  title: "Data URIs in CSS",
                  desc: "Background images, icons, and fonts can be embedded directly in CSS files as Base64 data URIs to reduce HTTP requests.",
                },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-1.5">
                  <p className="text-sm font-semibold text-foreground/90">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Encode vs Decode — When to Use Each</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Encode (Text → Base64)</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use this when you need to embed binary or text data in a text-only format — for example,
                  embedding an image in an HTML page, storing a certificate in an env var, or building
                  a JWT token manually.
                </p>
              </div>
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-semibold">Decode (Base64 → Text)</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use this when you receive a Base64 string and need to read its contents — for example,
                  inspecting a JWT payload, decoding an API response, or reading an encoded config value
                  from an environment variable.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Base64 Encoding Example</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Here's what Base64 encoding looks like for a simple string:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Input (plain text)</p>
                <pre className="text-[11px] font-mono bg-muted/50 border border-border/50 rounded-xl px-3 py-3 text-foreground/70 leading-relaxed">
                  Hello, World! 👋
                </pre>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Output (Base64)</p>
                <pre className="text-[11px] font-mono bg-muted/50 border border-border/50 rounded-xl px-3 py-3 text-foreground/70 leading-relaxed break-all whitespace-pre-wrap">
                  SGVsbG8sIFdvcmxkISA8k+w=
                </pre>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Notice the output is ~33% longer than the input — this is the standard Base64 size overhead.
            </p>
          </section>

          {/* ── Command-line Quick Reference ── */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Command-line Quick Reference</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              One-liners for Base64 encoding and decoding across common environments:
            </p>
            <div className="space-y-3">
              {[
                {
                  lang: "bash",
                  color: "text-green-400",
                  bg: "bg-green-400/8 border-green-400/20",
                  label: "Bash / Linux / macOS",
                  snippets: [
                    { comment: "Encode a string", code: 'echo -n "Hello, World!" | base64' },
                    { comment: "Decode a Base64 string", code: 'echo "SGVsbG8sIFdvcmxkIQ==" | base64 --decode' },
                    { comment: "Encode a file", code: "base64 input.txt > output.b64" },
                    { comment: "Decode a file", code: "base64 --decode output.b64 > restored.txt" },
                  ],
                },
                {
                  lang: "openssl",
                  color: "text-blue-400",
                  bg: "bg-blue-400/8 border-blue-400/20",
                  label: "OpenSSL (cross-platform)",
                  snippets: [
                    { comment: "Encode a string", code: 'echo -n "Hello, World!" | openssl base64' },
                    { comment: "Decode a Base64 string", code: 'echo "SGVsbG8sIFdvcmxkIQ==" | openssl base64 -d' },
                    { comment: "Encode a file (no line wrapping)", code: "openssl base64 -A -in input.txt" },
                  ],
                },
                {
                  lang: "python",
                  color: "text-yellow-400",
                  bg: "bg-yellow-400/8 border-yellow-400/20",
                  label: "Python 3",
                  snippets: [
                    { comment: "Encode", code: 'import base64\nbase64.b64encode(b"Hello, World!").decode()' },
                    { comment: "Decode", code: 'base64.b64decode("SGVsbG8sIFdvcmxkIQ==").decode()' },
                    { comment: "URL-safe encode (no + or /)", code: 'base64.urlsafe_b64encode(b"Hello, World!").decode()' },
                  ],
                },
                {
                  lang: "node",
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/8 border-emerald-400/20",
                  label: "Node.js",
                  snippets: [
                    { comment: "Encode", code: 'Buffer.from("Hello, World!").toString("base64")' },
                    { comment: "Decode", code: 'Buffer.from("SGVsbG8sIFdvcmxkIQ==", "base64").toString()' },
                    { comment: "URL-safe encode", code: 'Buffer.from("Hello").toString("base64url")' },
                  ],
                },
                {
                  lang: "powershell",
                  color: "text-purple-400",
                  bg: "bg-purple-400/8 border-purple-400/20",
                  label: "PowerShell",
                  snippets: [
                    { comment: "Encode", code: '[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("Hello, World!"))' },
                    { comment: "Decode", code: '[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("SGVsbG8sIFdvcmxkIQ=="))' },
                  ],
                },
              ].map(({ lang, color, bg, label, snippets }) => (
                <div key={lang} className={`rounded-xl border ${bg} overflow-hidden`}>
                  <div className={`px-4 py-2.5 border-b border-border/30 flex items-center gap-2`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{label}</span>
                  </div>
                  <div className="divide-y divide-border/20">
                    {snippets.map(({ comment, code }) => (
                      <div key={comment} className="px-4 py-2.5">
                        <p className="text-[10px] text-muted-foreground/60 mb-1"># {comment}</p>
                        <pre className="font-mono text-[11px] text-foreground/80 whitespace-pre-wrap break-all leading-relaxed">{code}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </MiniToolLayout>
  );
}
