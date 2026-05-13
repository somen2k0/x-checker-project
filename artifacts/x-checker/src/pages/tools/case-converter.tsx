import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { Copy, Trash2, Type, CheckCircle2 } from "lucide-react";

const CASES = [
  { id: "uppercase", label: "UPPERCASE" },
  { id: "lowercase", label: "lowercase" },
  { id: "title", label: "Title Case" },
  { id: "sentence", label: "Sentence case" },
  { id: "camel", label: "camelCase" },
  { id: "pascal", label: "PascalCase" },
  { id: "snake", label: "snake_case" },
  { id: "kebab", label: "kebab-case" },
  { id: "dot", label: "dot.case" },
  { id: "constant", label: "CONSTANT_CASE" },
] as const;

type CaseId = (typeof CASES)[number]["id"];

function toWords(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_\-\.]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function convertCase(input: string, caseId: CaseId): string {
  if (!input) return "";
  switch (caseId) {
    case "uppercase":
      return input.toUpperCase();
    case "lowercase":
      return input.toLowerCase();
    case "title":
      return input.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case "sentence":
      return input
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    case "camel": {
      const words = toWords(input);
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join("");
    }
    case "pascal": {
      return toWords(input)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    }
    case "snake":
      return toWords(input).join("_").toLowerCase();
    case "kebab":
      return toWords(input).join("-").toLowerCase();
    case "dot":
      return toWords(input).join(".").toLowerCase();
    case "constant":
      return toWords(input).join("_").toUpperCase();
    default:
      return input;
  }
}

const faqs = [
  {
    q: "What is a case converter?",
    a: "A case converter transforms text between different letter-case styles — such as UPPERCASE, lowercase, camelCase, snake_case, and more. It's useful for formatting code variables, titles, slugs, and any text that needs a specific style.",
  },
  {
    q: "What is camelCase?",
    a: "camelCase writes compound words with the first word lowercase and each subsequent word starting with a capital letter — like 'myVariableName'. It's widely used in JavaScript, Java, and many other languages for variable and function names.",
  },
  {
    q: "What is snake_case?",
    a: "snake_case uses all lowercase letters with underscores between words — like 'my_variable_name'. It's common in Python, Ruby, and SQL for variable names, table names, and file names.",
  },
  {
    q: "What is kebab-case?",
    a: "kebab-case uses all lowercase letters with hyphens between words — like 'my-variable-name'. It's the standard for CSS class names, HTML attributes, URLs, and command-line flags.",
  },
  {
    q: "What is PascalCase?",
    a: "PascalCase (also called UpperCamelCase) capitalizes the first letter of every word — like 'MyVariableName'. It's the convention for class names in most object-oriented languages including JavaScript, TypeScript, C#, and Java.",
  },
  {
    q: "Is my text processed on the server?",
    a: "No. All conversions happen entirely in your browser using JavaScript. Your text is never sent to any server — it's 100% private and instant.",
  },
];

const relatedTools = [
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters, words, and sentences." },
  { title: "Tweet Thread Formatter", href: "/tools/tweet-formatter", description: "Split long text into tweet threads." },
  { title: "URL Slug Generator", href: "/tools/url-slug-generator", description: "Turn titles into SEO-friendly URL slugs." },
  { title: "Hashtag Formatter", href: "/tools/hashtag-formatter", description: "Clean and format hashtag lists." },
];

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [activeCase, setActiveCase] = useState<CaseId>("title");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  useToolView("case-converter");

  const output = convertCase(input, activeCase);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Converted text copied to clipboard." });
  }, [output, toast]);

  const handleClear = () => {
    setInput("");
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
    <MiniToolLayout
      seoTitle="Case Converter Online Free — camelCase, snake_case, kebab-case & More"
      seoDescription="Convert text to UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case, and more. Free, instant, and 100% browser-side."
      icon={Type}
      badge="Text Tool"
      title="Case Converter"
      description="Instantly convert text between any letter-case style — camelCase, PascalCase, snake_case, kebab-case, UPPERCASE, and more. All processing happens in your browser."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">
        {/* Case selector */}
        <div className="flex flex-wrap gap-2">
          {CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCase(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                activeCase === c.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "bg-muted/40 text-muted-foreground border-border/60 hover:border-border hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Two panels */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Input</span>
              {charCount > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded">
                  {wordCount} words · {charCount} chars
                </span>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full min-h-[260px] md:min-h-[340px] resize-y rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/35"
            />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Output
                <span className="ml-2 font-normal normal-case text-muted-foreground/60 tracking-normal font-sans">
                  ({CASES.find((c) => c.id === activeCase)?.label})
                </span>
              </span>
            </div>
            <div
              className={`relative w-full min-h-[260px] md:min-h-[340px] rounded-xl border bg-muted/20 overflow-auto ${
                output ? "border-border/60" : "border-border/40 border-dashed"
              }`}
            >
              {output ? (
                <pre className="px-4 py-3.5 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                  {output}
                </pre>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                  <div className="h-10 w-10 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center">
                    <Type className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground/60">Output appears here</p>
                    <p className="text-xs text-muted-foreground/40 mt-0.5">Type text on the left to convert</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleCopy}
            disabled={!output}
            className="text-xs shadow-sm shadow-primary/20 gap-1.5"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Result"}
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!input}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: "10 case styles" },
            { label: "Real-time conversion" },
            { label: "100% browser-side" },
            { label: "No signup needed" },
          ].map(({ label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* SEO Content */}
        <div className="space-y-8 pt-6 border-t border-border/40">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">What is a Case Converter?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A <strong>case converter</strong> is a tool that transforms text between different
              capitalization styles. Whether you need <strong>camelCase for JavaScript variables</strong>,{" "}
              <strong>snake_case for Python</strong>, <strong>kebab-case for CSS classes</strong>, or simple
              UPPERCASE for emphasis — this tool handles all of them instantly.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This <strong>free online case converter</strong> works entirely in your browser with no server
              calls, no signup, and no limits. Paste any text and switch between 10 different case styles in
              real time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">All Supported Case Styles</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "UPPERCASE", example: "HELLO WORLD", use: "Headings, constants, emphasis" },
                { name: "lowercase", example: "hello world", use: "URLs, email addresses, casual text" },
                { name: "Title Case", example: "Hello World", use: "Article titles, headings, proper names" },
                { name: "Sentence case", example: "Hello world", use: "Normal sentences, descriptions" },
                { name: "camelCase", example: "helloWorld", use: "JS/TS variables, JSON keys, APIs" },
                { name: "PascalCase", example: "HelloWorld", use: "Classes, components, constructors" },
                { name: "snake_case", example: "hello_world", use: "Python, Ruby, SQL, file names" },
                { name: "kebab-case", example: "hello-world", use: "CSS classes, URLs, HTML attributes" },
                { name: "dot.case", example: "hello.world", use: "Config keys, i18n strings, namespaces" },
                { name: "CONSTANT_CASE", example: "HELLO_WORLD", use: "Environment variables, constants" },
              ].map(({ name, example, use }) => (
                <div key={name} className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{name}</p>
                    <code className="text-[11px] font-mono bg-muted/60 rounded px-2 py-0.5 text-primary/80">{example}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">{use}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MiniToolLayout>
  );
}
