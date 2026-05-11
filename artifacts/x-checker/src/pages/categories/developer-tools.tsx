import {
  Code2, FileJson, Lock, Shield, Zap, Globe,
  Terminal, RefreshCw, Sparkles, Type, TrendingUp, Users,
} from "lucide-react";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { CategoryLandingPage, type CategoryPageConfig } from "./CategoryLandingPage";

const tools = ALL_TOOLS.filter((t) => t.category === "developer");

const config: CategoryPageConfig = {
  path: "/developer-tools",
  seoTitle: "Free Online Developer Tools — JSON Formatter, Base64 Encoder | X Toolkit",
  seoDescription:
    "Free browser-based developer utilities: JSON formatter with validation, Base64 encoder/decoder with Unicode support. No install, no signup, no data sent to servers.",
  title: "Developer Tools",
  tagline: "Browser-based dev utilities — instant, private, zero-install",
  description:
    "Fast, privacy-first developer tools that run entirely in your browser. Format and validate JSON with syntax highlighting and line numbers, encode and decode Base64 strings with full Unicode and emoji support — no account, no install, no data leaving your device.",
  icon: Code2,
  color: "text-orange-400",
  bg: "bg-orange-400/10 border-orange-400/20",
  heroGradient: "bg-gradient-to-br from-orange-500/8 via-orange-500/3 to-transparent",
  tools,

  whatIs:
    "Developer tools are browser-based utilities that help engineers, designers, and technical users handle common formatting and encoding tasks without installing anything. The JSON Formatter takes raw, minified, or malformed JSON and outputs a clean, indented, syntax-highlighted version with line numbers and real-time error detection — making API responses, config files, and log payloads immediately readable. The Base64 Encoder/Decoder converts any text, including Unicode characters and emoji, to and from Base64 encoding — useful for working with APIs, authentication tokens, data URIs, and binary-safe data transmission. Both tools operate entirely client-side: your data is never sent to a server.",

  benefits: [
    {
      icon: Shield,
      title: "Fully private — data stays local",
      description:
        "All processing runs in your browser via JavaScript. No text, tokens, or JSON payloads are ever transmitted to our servers.",
    },
    {
      icon: Zap,
      title: "Instant results",
      description:
        "No upload step, no waiting for a server response. Paste your input and the output appears in real time as you type.",
    },
    {
      icon: Globe,
      title: "No install or account needed",
      description:
        "Open a URL, use the tool, close the tab. No npm install, no browser extension, no OAuth flow.",
    },
    {
      icon: FileJson,
      title: "JSON error detection",
      description:
        "The formatter highlights exactly where a syntax error is and explains what's wrong — saving the frustrating hunt through minified blobs.",
    },
    {
      icon: RefreshCw,
      title: "Two-way Base64 conversion",
      description:
        "Encode plain text to Base64 or decode Base64 back to plain text — including full Unicode and emoji — in one tool.",
    },
    {
      icon: Terminal,
      title: "Works on any device",
      description:
        "No local runtime required. The tools work the same on your phone, tablet, or work laptop without any setup.",
    },
  ],

  useCases: [
    {
      title: "Debugging API responses",
      description:
        "Paste a raw JSON response from an API endpoint into the formatter to instantly see the structure, find nested keys, and spot errors in the payload.",
    },
    {
      title: "Validating config files",
      description:
        "Check that a JSON config file (package.json, tsconfig, API spec) is syntactically valid and correctly formatted before committing.",
    },
    {
      title: "Working with Base64-encoded tokens",
      description:
        "Decode JWT payloads, API keys stored in Base64, or data URIs to inspect their raw content without pulling up a terminal.",
    },
    {
      title: "Preparing data for API requests",
      description:
        "Encode strings to Base64 when building API requests that require Base64-encoded credentials or binary-safe payloads.",
    },
    {
      title: "Minifying JSON for production",
      description:
        "Use the minify mode to strip whitespace from JSON config or data files before embedding them in a build or API response.",
    },
    {
      title: "Teaching and learning JSON structure",
      description:
        "Use the formatter as a teaching aid to show students or junior developers how nested JSON structures look when properly indented.",
    },
  ],

  faqs: [
    {
      q: "Is my data sent to X Toolkit's servers when I use these tools?",
      a: "No. The JSON Formatter and Base64 Encoder/Decoder run entirely in your browser using JavaScript. Your input never leaves your device — there is no backend processing for these tools.",
    },
    {
      q: "What types of JSON does the formatter support?",
      a: "The formatter handles any valid JSON: objects, arrays, strings, numbers, booleans, and null values, including deeply nested structures. It also detects and reports common syntax errors like missing commas, unquoted keys, and trailing commas.",
    },
    {
      q: "Does the Base64 tool support Unicode and emoji?",
      a: "Yes. The encoder uses TextEncoder to handle full Unicode — including emoji, CJK characters, and special symbols — correctly converting them to their UTF-8 byte representation before Base64 encoding, which is what most modern APIs expect.",
    },
    {
      q: "Can I use the JSON formatter to minify JSON?",
      a: "Yes. In addition to pretty-printing with indentation, the formatter includes a minify mode that strips all whitespace to produce compact JSON — useful for reducing payload size in APIs or config files.",
    },
    {
      q: "What's the maximum size of input these tools can handle?",
      a: "Because processing happens in the browser, practical limits depend on your device's memory and the browser's JavaScript engine. In practice, both tools handle payloads up to several megabytes without issues on modern hardware.",
    },
    {
      q: "Are more developer tools planned?",
      a: "Yes — upcoming tools include a URL encoder/decoder, JWT inspector, color format converter, and regex tester. Check back or follow @xtoolkit for updates.",
    },
  ],

  relatedCategories: [
    {
      title: "Text & Formatting Tools",
      href: "/text-format-tools",
      description: "Format tweet threads, count characters, and preview Unicode fonts.",
      icon: Type,
      color: "text-green-400",
      bg: "bg-green-400/10 border-green-400/20",
    },
    {
      title: "SEO Tools",
      href: "/seo-tools",
      description: "Meta tag analysis, keyword density checking, and URL slug generation.",
      icon: TrendingUp,
      color: "text-pink-400",
      bg: "bg-pink-400/10 border-pink-400/20",
    },
    {
      title: "Social Media Tools",
      href: "/social-media-tools",
      description: "Bulk account checker, profile link generator, and @ formatter for X.",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/20",
    },
  ],
};

export default function DeveloperToolsPage() {
  return <CategoryLandingPage config={config} />;
}
