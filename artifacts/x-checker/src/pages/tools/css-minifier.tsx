import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { Minimize2, Maximize2, Copy, Trash2, Download, ShieldCheck } from "lucide-react";

const faqs = [
  { q: "What is CSS minification?", a: "CSS minification removes unnecessary characters from CSS — comments, whitespace, newlines, and redundant semicolons — to produce the smallest possible file that has identical functionality to the original." },
  { q: "Why should I minify CSS?", a: "Smaller CSS files download faster, which directly improves page load time and Core Web Vitals scores. Minifying CSS is a standard performance optimization for production websites." },
  { q: "Will minified CSS work the same?", a: "Yes. Minification only removes characters that have no effect on how the browser interprets the stylesheet. The visual output of the page will be identical." },
  { q: "Is my CSS safe to paste here?", a: "Yes. All processing happens entirely in your browser — nothing is sent to a server." },
];

const relatedTools = [
  { title: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON instantly." },
  { title: "HTML Formatter", href: "/tools/html-formatter", description: "Beautify and format HTML code." },
  { title: "URL Slug Generator", href: "/tools/url-slug-generator", description: "Convert titles into SEO-friendly URL slugs." },
];

const EXAMPLE_CSS = `/* Main navigation styles */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #1a1a2e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav__logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6366f1;
  text-decoration: none;
}

.nav__links {
  display: flex;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav__links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.nav__links a:hover {
  color: #ffffff;
}`;

function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/;\}/g, "}")
    .replace(/^\s+|\s+$/g, "")
    .trim();
}

function formatCSS(css: string): string {
  let result = minifyCSS(css);
  result = result
    .replace(/\{/g, " {\n  ")
    .replace(/;(?!\})/g, ";\n  ")
    .replace(/\}/g, "\n}\n\n")
    .replace(/,\s*(?=[^}]*\{)/g, ",\n")
    .replace(/  \}/g, "}")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return result;
}

type Mode = "minify" | "format";

export default function CssMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);
  const { toast } = useToast();
  useToolView("css-minifier");

  const run = useCallback((m: Mode) => {
    if (!input.trim()) return;
    setMode(m);
    setOutput(m === "minify" ? minifyCSS(input) : formatCSS(input));
  }, [input]);

  const savings = input && output && mode === "minify"
    ? Math.round((1 - output.length / input.length) * 100)
    : null;

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "CSS copied to clipboard." });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "minify" ? "styles.min.css" : "styles.css";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
  };

  const handleClear = () => { setInput(""); setOutput(""); setMode(null); };
  const loadExample = () => { setInput(EXAMPLE_CSS); setOutput(""); setMode(null); };

  return (
    <MiniToolLayout
      seoTitle="CSS Minifier & Formatter Online Free"
      seoDescription="Minify and format CSS online for free. Remove comments, whitespace, and redundant characters instantly. 100% client-side — your code never leaves your browser."
      icon={Minimize2}
      badge="Developer Tool"
      title="CSS Minifier & Formatter"
      description="Minify CSS to reduce file size or format it for readability. Removes comments, whitespace, and redundant characters. All processing happens in your browser."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Input CSS</span>
              <button onClick={loadExample} className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">Load example</button>
            </div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutput(""); setMode(null); }}
              placeholder={"Paste your CSS here...\n\n.selector {\n  property: value;\n}"}
              spellCheck={false}
              className="w-full min-h-[320px] md:min-h-[400px] resize-y rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/35"
            />
            {input && <span className="text-[10px] text-muted-foreground/60">{input.length.toLocaleString()} chars</span>}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Output {mode ? `(${mode === "minify" ? "minified" : "formatted"})` : ""}
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
                  <Minimize2 className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground/50">Output appears here</p>
                  <p className="text-xs text-muted-foreground/35">Paste CSS and click Minify or Format</p>
                </div>
              )}
            </div>
            {output && <span className="text-[10px] text-muted-foreground/60">{output.length.toLocaleString()} chars</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => run("minify")} disabled={!input.trim()} className="text-xs shadow-sm shadow-primary/20 gap-1.5">
            <Minimize2 className="h-3.5 w-3.5" /> Minify CSS
          </Button>
          <Button variant="outline" onClick={() => run("format")} disabled={!input.trim()} className="text-xs border-border/60 gap-1.5">
            <Maximize2 className="h-3.5 w-3.5" /> Format CSS
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
          {[{ icon: ShieldCheck, label: "100% client-side" }, { icon: Minimize2, label: "Removes comments" }, { icon: Download, label: "Download .css" }].map(({ icon: Ic, label }) => (
            <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
              <Ic className="h-3 w-3" />{label}
            </div>
          ))}
        </div>
      </div>
    </MiniToolLayout>
  );
}
