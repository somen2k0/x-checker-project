import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { Code2, Minimize2, Maximize2, Copy, Trash2, Download, ShieldCheck } from "lucide-react";

const faqs = [
  { q: "What does an HTML formatter do?", a: "An HTML formatter (also called an HTML beautifier) takes messy or minified HTML and reformats it with proper indentation and line breaks, making it easy to read and understand the document structure." },
  { q: "Will formatting change how my page looks?", a: "No. HTML formatting only changes whitespace between tags. Browsers ignore extra whitespace when rendering HTML, so the visual output of your page is identical before and after formatting." },
  { q: "Is my HTML safe to paste here?", a: "Yes. All processing happens entirely in your browser — nothing is sent to a server. You can safely paste any HTML, including HTML containing passwords, tokens, or private data." },
  { q: "Can I minify HTML too?", a: "Yes — the Minify button strips all unnecessary whitespace to give you the smallest possible HTML output, useful for production deployments where page weight matters." },
];

const relatedTools = [
  { title: "CSS Minifier & Formatter", href: "/tools/css-minifier", description: "Minify and format CSS code." },
  { title: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON instantly." },
  { title: "Base64 Encoder / Decoder", href: "/tools/base64", description: "Encode and decode Base64 strings." },
];

const EXAMPLE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Page</title><link rel="stylesheet" href="styles.css"></head><body><header class="nav"><div class="nav__logo"><a href="/">X Toolkit</a></div><nav><ul><li><a href="/tools">Tools</a></li><li><a href="/about">About</a></li></ul></nav></header><main><section class="hero"><h1>Free Online Tools</h1><p>For developers, creators and SEO professionals.</p><a href="/tools" class="btn btn--primary">Browse Tools</a></section></main></body></html>`;

function formatHTML(html: string, indent = 2): string {
  const tab = " ".repeat(indent);
  const voids = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
  const inline = new Set(["a","abbr","acronym","b","bdo","big","br","button","cite","code","dfn","em","i","img","input","kbd","label","map","object","output","q","samp","select","small","span","strong","sub","sup","textarea","time","tt","var"]);

  let result = "";
  let depth = 0;

  const tokenize = (s: string) => {
    const tokens: string[] = [];
    const re = /(<[^>]+>|[^<]+)/g;
    let m;
    while ((m = re.exec(s)) !== null) {
      const t = m[0].trim();
      if (t) tokens.push(t);
    }
    return tokens;
  };

  const tokens = tokenize(html);
  for (const token of tokens) {
    if (token.startsWith("</")) {
      const tag = token.slice(2, -1).split(/[\s/]/)[0].toLowerCase();
      if (!inline.has(tag)) { depth = Math.max(0, depth - 1); result += `\n${tab.repeat(depth)}`; }
      result += token;
    } else if (token.startsWith("<!--")) {
      result += `\n${tab.repeat(depth)}${token}`;
    } else if (token.startsWith("<!")) {
      result += `${token}\n`;
    } else if (token.startsWith("<")) {
      const tag = token.slice(1).split(/[\s/>/]/)[0].toLowerCase();
      const selfClose = token.endsWith("/>") || voids.has(tag);
      if (!inline.has(tag)) result += `\n${tab.repeat(depth)}`;
      result += token;
      if (!selfClose && !inline.has(tag)) depth++;
    } else {
      result += token;
    }
  }

  return result.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n").trim();
}

function minifyHTML(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

type Mode = "format" | "minify";

export default function HtmlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);
  const { toast } = useToast();
  useToolView("html-formatter");

  const run = useCallback((m: Mode) => {
    if (!input.trim()) return;
    setMode(m);
    setOutput(m === "format" ? formatHTML(input) : minifyHTML(input));
  }, [input]);

  const savings = input && output && mode === "minify"
    ? Math.round((1 - output.length / input.length) * 100)
    : null;

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!" });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "minify" ? "index.min.html" : "index.html";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
  };

  const handleClear = () => { setInput(""); setOutput(""); setMode(null); };
  const loadExample = () => { setInput(EXAMPLE_HTML); setOutput(""); setMode(null); };

  return (
    <MiniToolLayout
      seoTitle="HTML Formatter & Minifier Online Free"
      seoDescription="Format and beautify HTML or minify it for production. Instant, 100% client-side — your code never leaves your browser."
      icon={Code2}
      badge="Developer Tool"
      title="HTML Formatter & Minifier"
      description="Beautify messy or minified HTML for readability, or minify it for production. All processing happens in your browser — nothing is sent to a server."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Input HTML</span>
              <button onClick={loadExample} className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">Load example</button>
            </div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutput(""); setMode(null); }}
              placeholder={"Paste your HTML here...\n\n<div><p>Hello</p></div>"}
              spellCheck={false}
              className="w-full min-h-[320px] md:min-h-[400px] resize-y rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/35"
            />
            {input && <span className="text-[10px] text-muted-foreground/60">{input.length.toLocaleString()} chars</span>}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Output {mode ? `(${mode === "format" ? "formatted" : "minified"})` : ""}
              </span>
              {savings !== null && savings > 0 && (
                <span className="text-[10px] font-medium text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                  {savings}% smaller
                </span>
              )}
            </div>
            <div className={`relative w-full min-h-[320px] md:min-h-[400px] rounded-xl border bg-muted/20 overflow-auto transition-all ${output ? "border-border/60" : "border-border/40 border-dashed"}`}>
              {output ? (
                <pre className="px-4 py-3.5 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-all">{output}</pre>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-6">
                  <Code2 className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground/50">Output appears here</p>
                  <p className="text-xs text-muted-foreground/35">Paste HTML and click Format or Minify</p>
                </div>
              )}
            </div>
            {output && <span className="text-[10px] text-muted-foreground/60">{output.length.toLocaleString()} chars</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => run("format")} disabled={!input.trim()} className="text-xs shadow-sm shadow-primary/20 gap-1.5">
            <Maximize2 className="h-3.5 w-3.5" /> Format / Beautify
          </Button>
          <Button variant="outline" onClick={() => run("minify")} disabled={!input.trim()} className="text-xs border-border/60 gap-1.5">
            <Minimize2 className="h-3.5 w-3.5" /> Minify HTML
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output} className="text-xs border-border/60 gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!output} className="text-xs border-border/60 gap-1.5">
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={!input && !output} className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[{ icon: ShieldCheck, label: "100% client-side" }, { icon: Maximize2, label: "Beautify HTML" }, { icon: Minimize2, label: "Minify HTML" }].map(({ icon: Ic, label }) => (
            <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
              <Ic className="h-3 w-3" />{label}
            </div>
          ))}
        </div>
      </div>
    </MiniToolLayout>
  );
}
