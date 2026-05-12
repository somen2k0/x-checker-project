import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { Link2, Copy, Trash2, ArrowLeftRight, ShieldCheck } from "lucide-react";

const faqs = [
  { q: "What is URL encoding?", a: "URL encoding (also called percent-encoding) converts characters that are not allowed in URLs into a safe format by replacing them with a % followed by two hexadecimal digits. For example, a space becomes %20 and & becomes %26." },
  { q: "When do I need to URL encode?", a: "You need to URL encode data when passing it as a query parameter or path segment in a URL. Characters like spaces, &, =, #, and ? have special meaning in URLs and must be encoded to be treated as data rather than URL structure." },
  { q: "What is the difference between encodeURI and encodeURIComponent?", a: "encodeURI encodes a full URL and preserves structural characters like /, ?, &, and =. encodeURIComponent encodes a single component (like a query value) and encodes those structural characters too. This tool uses encodeURIComponent, which is correct for encoding individual values." },
  { q: "Is this tool safe for sensitive data?", a: "Yes. All processing happens entirely in your browser. No data is sent to any server. You can safely use it with passwords, tokens, or private data." },
];

const relatedTools = [
  { title: "URL Slug Generator", href: "/tools/url-slug-generator", description: "Convert titles into clean SEO-friendly URL slugs." },
  { title: "Base64 Encoder / Decoder", href: "/tools/base64", description: "Encode and decode Base64 strings." },
  { title: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON instantly." },
];

type Mode = "encode" | "decode";

export default function UrlEncoder() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  useToolView("url-encoder");

  const process = useCallback((value: string, m: Mode) => {
    if (!value.trim()) { setOutput(""); setError(""); return; }
    try {
      if (m === "encode") {
        setOutput(encodeURIComponent(value));
        setError("");
      } else {
        setOutput(decodeURIComponent(value));
        setError("");
      }
    } catch {
      setError(m === "decode" ? "Invalid URL-encoded string. Check your input." : "Failed to encode.");
      setOutput("");
    }
  }, []);

  const handleInput = (val: string) => {
    setInput(val);
    process(val, mode);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setInput("");
    setOutput("");
    setError("");
  };

  const handleSwap = () => {
    if (!output) return;
    const newMode: Mode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInput(output);
    process(output, newMode);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "Output copied to clipboard." });
  };

  const handleClear = () => { setInput(""); setOutput(""); setError(""); };

  const exampleEncode = () => { switchMode("encode"); const v = "https://example.com/search?q=hello world&lang=en"; setInput(v); process(v, "encode"); };
  const exampleDecode = () => { switchMode("decode"); const v = "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den"; setInput(v); process(v, "decode"); };

  return (
    <MiniToolLayout
      seoTitle="URL Encoder & Decoder Online Free"
      seoDescription="Encode or decode URLs and query parameters online for free. Instant percent-encoding and decoding — 100% client-side, nothing sent to a server."
      icon={Link2}
      badge="Developer Tool"
      title="URL Encoder & Decoder"
      description="Encode special characters in URLs using percent-encoding, or decode percent-encoded strings back to readable text. All processing happens in your browser."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-1 bg-muted/40 border border-border/60 rounded-xl w-fit">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize ${mode === m ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-muted-foreground/60 shrink-0">Examples:</span>
          <button onClick={exampleEncode} className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">Encode URL</button>
          <span className="text-muted-foreground/30 text-xs">·</span>
          <button onClick={exampleDecode} className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">Decode URL</button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
              {mode === "encode" ? "Plain Text / URL" : "Encoded URL"}
            </span>
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={mode === "encode" ? "Paste text or URL to encode...\n\nhttps://example.com/search?q=hello world" : "Paste encoded URL to decode...\n\nhttps%3A%2F%2Fexample.com"}
              spellCheck={false}
              className="w-full min-h-[260px] md:min-h-[320px] resize-y rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/35"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
              {mode === "encode" ? "Encoded Output" : "Decoded Output"}
            </span>
            <div className={`relative w-full min-h-[260px] md:min-h-[320px] rounded-xl border bg-muted/20 overflow-auto transition-all ${error ? "border-destructive/40" : output ? "border-border/60" : "border-border/40 border-dashed"}`}>
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              ) : output ? (
                <pre className="px-4 py-3.5 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-all">{output}</pre>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-6">
                  <Link2 className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground/50">Output appears here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSwap} disabled={!output} className="text-xs border-border/60 gap-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Swap &amp; {mode === "encode" ? "Decode" : "Encode"}
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output} className="text-xs border-border/60 gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={!input && !output} className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[{ icon: ShieldCheck, label: "100% client-side" }, { icon: ArrowLeftRight, label: "Real-time conversion" }, { icon: Link2, label: "encodeURIComponent" }].map(({ icon: Ic, label }) => (
            <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
              <Ic className="h-3 w-3" />{label}
            </div>
          ))}
        </div>
      </div>
    </MiniToolLayout>
  );
}
