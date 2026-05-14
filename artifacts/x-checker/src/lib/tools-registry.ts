import {
  Search, Link2, AtSign, Sparkles, Smile, Briefcase, Palette,
  Hash, MessageSquare, Type, BarChart2, Users, FileJson, Lock,
  TrendingUp, Globe, Code2, Mail, ShieldCheck, Pencil, FileText,
  Shield, Tag, Minimize2, KeyRound, Regex, Database, Shuffle,
  Clock, ArrowLeftRight, ScanSearch, EyeOff, MailWarning, AlertOctagon,
  BookOpen, Calendar, ClipboardList, Gauge, FlaskConical, ShieldAlert, Newspaper,
  type LucideIcon,
} from "lucide-react";

export type CategoryKey =
  | "social-media"
  | "ai-writing"
  | "text-formatting"
  | "developer"
  | "seo"
  | "email";

export interface Category {
  key: CategoryKey;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  description: string;
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  "social-media": {
    key: "social-media",
    label: "Social Media Tools",
    shortLabel: "Social Media",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    description: "Check accounts, generate profile links, and format X usernames in bulk.",
  },
  "ai-writing": {
    key: "ai-writing",
    label: "AI Writing Tools",
    shortLabel: "AI Writing",
    icon: Sparkles,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    description: "AI-powered bio generators, writing prompts, and content ideas.",
  },
  "text-formatting": {
    key: "text-formatting",
    label: "Text & Formatting",
    shortLabel: "Text & Format",
    icon: Type,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    description: "Format tweets, count characters, preview fonts, and clean up text.",
  },
  developer: {
    key: "developer",
    label: "Developer Tools",
    shortLabel: "Developer",
    icon: Code2,
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    description: "JSON formatters, encoders, validators, and other dev utilities.",
  },
  seo: {
    key: "seo",
    label: "SEO Tools",
    shortLabel: "SEO",
    icon: TrendingUp,
    color: "text-pink-400",
    bg: "bg-pink-400/10 border-pink-400/20",
    description: "Meta tag generators, keyword tools, URL slugs, and on-page SEO utilities.",
  },
  email: {
    key: "email",
    label: "Email Tools",
    shortLabel: "Email",
    icon: Mail,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
    description: "Subject line generators, email formatters, signatures, and character counters.",
  },
};

export type ToolBadge = "Popular" | "New" | "AI";

export interface Tool {
  id: string;
  label: string;
  description: string;
  href: string;
  category: CategoryKey;
  icon: LucideIcon;
  badge?: ToolBadge;
  isComingSoon?: boolean;
  tags: string[];
}

export const ALL_TOOLS: Tool[] = [
  // ── Social Media ──────────────────────────────────────────────────
  {
    id: "account-checker",
    label: "Account Checker",
    description: "Bulk-check up to 100 X accounts — active, suspended, or deleted — in seconds.",
    href: "/tools/x-account-checker",
    category: "social-media",
    icon: Search,
    badge: "Popular",
    tags: ["x", "twitter", "accounts", "bulk", "check", "suspended", "deleted"],
  },
  {
    id: "profile-links",
    label: "Profile Link Generator",
    description: "Convert a list of usernames into direct X profile links instantly.",
    href: "/tools/profile-link-generator",
    category: "social-media",
    icon: Link2,
    tags: ["x", "twitter", "links", "profile", "url"],
  },
  {
    id: "at-formatter",
    label: "@ Formatter",
    description: "Bulk add or remove the @ prefix from username lists in one click.",
    href: "/tools/at-formatter",
    category: "social-media",
    icon: AtSign,
    tags: ["x", "twitter", "username", "format", "at"],
  },

  // ── AI Writing ────────────────────────────────────────────────────
  {
    id: "ai-detector",
    label: "AI Text Detector & Humanizer",
    description: "Detect if text was written by AI and rewrite it to sound naturally human. Powered by Llama 3.3 70B.",
    href: "/tools/ai-detector",
    category: "ai-writing",
    icon: ScanSearch,
    badge: "AI",
    tags: ["ai", "detector", "humanizer", "chatgpt", "rewrite", "content", "groq", "llama"],
  },
  {
    id: "bio-generator",
    label: "AI Bio Generator",
    description: "Generate 3 professional X bios in seconds — just enter your niche and tone.",
    href: "/tools/bio-generator",
    category: "ai-writing",
    icon: Sparkles,
    badge: "AI",
    tags: ["bio", "ai", "generator", "twitter", "profile", "groq"],
  },
  {
    id: "bio-ideas",
    label: "Bio Ideas",
    description: "100+ ready-made X bio templates organized by niche and style.",
    href: "/tools/bio-ideas",
    category: "ai-writing",
    icon: Sparkles,
    badge: "Popular",
    tags: ["bio", "ideas", "templates", "niche"],
  },
  {
    id: "funny-bios",
    label: "Funny Bios",
    description: "Witty, humorous bio ideas that instantly stand out in any feed.",
    href: "/tools/funny-bios",
    category: "ai-writing",
    icon: Smile,
    tags: ["bio", "funny", "humor", "witty"],
  },
  {
    id: "professional-bios",
    label: "Professional Bios",
    description: "Clean, credible bios for business professionals and career builders.",
    href: "/tools/professional-bios",
    category: "ai-writing",
    icon: Briefcase,
    tags: ["bio", "professional", "business", "career"],
  },
  {
    id: "aesthetic-bios",
    label: "Aesthetic Bios",
    description: "Minimal and stylish bios for a clean, curated profile look.",
    href: "/tools/aesthetic-bios",
    category: "ai-writing",
    icon: Palette,
    tags: ["bio", "aesthetic", "style", "minimal"],
  },

  // ── Text & Formatting ─────────────────────────────────────────────
  {
    id: "username-generator",
    label: "Username Generator",
    description: "Generate unique X handle ideas for any niche or brand.",
    href: "/tools/username-generator",
    category: "text-formatting",
    icon: AtSign,
    tags: ["username", "handle", "generator", "ideas"],
  },
  {
    id: "name-ideas",
    label: "Display Name Ideas",
    description: "Curated display name ideas for your X profile.",
    href: "/tools/name-ideas",
    category: "text-formatting",
    icon: Users,
    tags: ["name", "display", "ideas", "profile"],
  },
  {
    id: "hashtag-formatter",
    label: "Hashtag Formatter",
    description: "Clean, format, and deduplicate hashtag lists in one click.",
    href: "/tools/hashtag-formatter",
    category: "text-formatting",
    icon: Hash,
    tags: ["hashtag", "format", "twitter", "clean"],
  },
  {
    id: "tweet-formatter",
    label: "Tweet Thread Formatter",
    description: "Split long text into numbered tweet threads automatically.",
    href: "/tools/tweet-formatter",
    category: "text-formatting",
    icon: MessageSquare,
    tags: ["tweet", "thread", "format", "split"],
  },
  {
    id: "font-preview",
    label: "Font Preview",
    description: "Preview your bio or tweet text in stylish Unicode fonts.",
    href: "/tools/font-preview",
    category: "text-formatting",
    icon: Type,
    tags: ["font", "unicode", "style", "preview"],
  },
  {
    id: "character-counter",
    label: "Character Counter",
    description: "Count characters, words, and sentences to fit X's 280-character limit.",
    href: "/tools/character-counter",
    category: "text-formatting",
    icon: BarChart2,
    tags: ["character", "word", "count", "limit", "280"],
  },

  // ── Developer ─────────────────────────────────────────────────────
  {
    id: "json-formatter",
    label: "JSON Formatter",
    description: "Format, minify, and validate JSON with real-time error detection and line numbers.",
    href: "/tools/json-formatter",
    category: "developer",
    icon: FileJson,
    badge: "Popular",
    tags: ["json", "format", "minify", "validate", "developer", "api"],
  },
  {
    id: "base64",
    label: "Base64 Encoder / Decoder",
    description: "Encode and decode Base64 strings with full Unicode and emoji support.",
    href: "/tools/base64",
    category: "developer",
    icon: Lock,
    tags: ["base64", "encode", "decode", "developer", "binary"],
  },

  {
    id: "css-minifier",
    label: "CSS Minifier & Formatter",
    description: "Minify CSS to reduce file size or format it for readability. Removes comments and whitespace.",
    href: "/tools/css-minifier",
    category: "developer",
    icon: Minimize2,
    tags: ["css", "minify", "format", "beautify", "developer", "web"],
  },
  {
    id: "html-formatter",
    label: "HTML Formatter & Minifier",
    description: "Beautify messy HTML for readability or minify it for production deployment.",
    href: "/tools/html-formatter",
    category: "developer",
    icon: Code2,
    tags: ["html", "format", "beautify", "minify", "developer", "web"],
  },
  {
    id: "jwt-decoder",
    label: "JWT Decoder",
    description: "Decode and inspect JWT header, payload, and expiration instantly in your browser.",
    href: "/tools/jwt-decoder",
    category: "developer",
    icon: KeyRound,
    badge: "New",
    tags: ["jwt", "token", "decode", "json web token", "auth", "developer"],
  },
  {
    id: "regex-tester",
    label: "Regex Tester",
    description: "Test regular expressions with real-time match highlighting and common presets.",
    href: "/tools/regex-tester",
    category: "developer",
    icon: Regex,
    badge: "New",
    tags: ["regex", "regular expression", "pattern", "match", "developer"],
  },
  {
    id: "sql-formatter",
    label: "SQL Formatter & Beautifier",
    description: "Format SQL queries with proper indentation and capitalized keywords.",
    href: "/tools/sql-formatter",
    category: "developer",
    icon: Database,
    badge: "New",
    tags: ["sql", "format", "beautify", "query", "database", "developer"],
  },
  {
    id: "url-encoder",
    label: "URL Encoder & Decoder",
    description: "Encode special characters in URLs or decode percent-encoded strings instantly.",
    href: "/tools/url-encoder",
    category: "developer",
    icon: Link2,
    tags: ["url", "encode", "decode", "percent", "query", "developer"],
  },
  {
    id: "uuid-generator",
    label: "UUID Generator",
    description: "Generate random UUID v4 identifiers using the Web Crypto API. Bulk generation supported.",
    href: "/tools/uuid-generator",
    category: "developer",
    icon: Shuffle,
    tags: ["uuid", "guid", "unique", "id", "generator", "developer"],
  },

  {
    id: "case-converter",
    label: "Case Converter",
    description: "Convert text to UPPERCASE, lowercase, camelCase, snake_case, kebab-case, PascalCase, and more.",
    href: "/tools/case-converter",
    category: "text-formatting",
    icon: Type,
    badge: "New",
    tags: ["case", "convert", "camelcase", "snake_case", "kebab", "uppercase", "lowercase", "title case", "pascal"],
  },

  // ── Developer ─────────────────────────────────────────────────────
  {
    id: "yaml-json",
    label: "YAML ↔ JSON Converter",
    description: "Convert YAML to JSON or JSON to YAML instantly. Supports nested objects, arrays, and all data types.",
    href: "/tools/yaml-json",
    category: "developer",
    icon: ArrowLeftRight,
    badge: "New",
    tags: ["yaml", "json", "convert", "config", "kubernetes", "docker", "developer"],
  },
  {
    id: "timezone-converter",
    label: "Time Zone Converter",
    description: "Convert any date and time between world timezones with full DST support. Compare multiple zones at once.",
    href: "/tools/timezone-converter",
    category: "developer",
    icon: Clock,
    badge: "New",
    tags: ["timezone", "time zone", "convert", "utc", "dst", "world clock", "schedule"],
  },

  // ── SEO ──────────────────────────────────────────────────────────
  {
    id: "og-image-preview",
    label: "OG / Twitter Card Preview",
    description: "Preview how any URL looks when shared on Facebook, X (Twitter), and LinkedIn. Checks all Open Graph and Twitter Card tags.",
    href: "/tools/og-image-preview",
    category: "seo",
    icon: Globe,
    badge: "New",
    tags: ["og", "open graph", "twitter card", "preview", "social share", "facebook", "linkedin", "meta tags", "seo"],
  },
  {
    id: "meta-tag-generator",
    label: "Meta Tag Generator",
    description: "Generate SEO title, meta description, Open Graph, and Twitter Card tags with live SERP preview.",
    href: "/tools/meta-tag-generator",
    category: "seo",
    icon: Globe,
    badge: "New",
    tags: ["seo", "meta", "title", "description", "og", "open graph", "twitter card", "google"],
  },
  {
    id: "url-slug-generator",
    label: "URL Slug Generator",
    description: "Convert titles or phrases into clean, SEO-friendly URL slugs instantly.",
    href: "/tools/url-slug-generator",
    category: "seo",
    icon: Link2,
    badge: "New",
    tags: ["seo", "slug", "url", "permalink", "hyphen"],
  },
  {
    id: "keyword-density",
    label: "Keyword Density Checker",
    description: "Check keyword frequency and density percentages across any article or text.",
    href: "/tools/keyword-density",
    category: "seo",
    icon: TrendingUp,
    badge: "New",
    tags: ["seo", "keyword", "density", "frequency", "content"],
  },
  {
    id: "robots-txt-generator",
    label: "Robots.txt Generator",
    description: "Build a valid robots.txt file — set crawl rules, block AI bots, add your sitemap.",
    href: "/tools/robots-txt-generator",
    category: "seo",
    icon: Shield,
    badge: "New",
    tags: ["seo", "robots", "crawl", "noindex", "bots", "googlebot"],
  },
  {
    id: "sitemap-validator",
    label: "Sitemap Validator",
    description: "Paste your XML sitemap to validate structure, URL formats, and check for errors.",
    href: "/tools/sitemap-validator",
    category: "seo",
    icon: Tag,
    badge: "New",
    tags: ["seo", "sitemap", "xml", "validate", "google", "indexing"],
  },

  // ── Email ─────────────────────────────────────────────────────────
  {
    id: "subject-line-generator",
    label: "Subject Line Generator",
    description: "Generate high-converting email subject line templates for any campaign type.",
    href: "/tools/subject-line-generator",
    category: "email",
    icon: Pencil,
    badge: "New",
    tags: ["email", "subject", "generator", "marketing", "open rate"],
  },
  {
    id: "email-username-generator",
    label: "Email Username Generator",
    description: "Generate professional email address formats from a name and company.",
    href: "/tools/email-username-generator",
    category: "email",
    icon: AtSign,
    badge: "New",
    tags: ["email", "username", "address", "professional", "format"],
  },
  {
    id: "plain-text-formatter",
    label: "Plain Text Email Formatter",
    description: "Convert HTML emails to clean, readable plain text with links preserved.",
    href: "/tools/plain-text-formatter",
    category: "email",
    icon: FileText,
    badge: "New",
    tags: ["email", "plain text", "html", "convert", "format"],
  },
  {
    id: "email-character-counter",
    label: "Email Character Counter",
    description: "Count subject line, preview text, and body characters with per-client limits.",
    href: "/tools/email-character-counter",
    category: "email",
    icon: Hash,
    badge: "New",
    tags: ["email", "character", "counter", "subject", "gmail", "outlook"],
  },
  {
    id: "email-signature-generator",
    label: "Email Signature Generator",
    description: "Build a professional HTML or plain text email signature in seconds.",
    href: "/tools/email-signature-generator",
    category: "email",
    icon: Mail,
    badge: "New",
    tags: ["email", "signature", "html", "professional", "gmail", "outlook"],
  },
  {
    id: "email-validator",
    label: "Email Address Validator",
    description: "Validate email address syntax and format instantly in your browser.",
    href: "/tools/email-validator",
    category: "email",
    icon: ShieldCheck,
    badge: "New",
    tags: ["email", "validate", "check", "format", "syntax"],
  },
  {
    id: "temp-mail",
    label: "Temp Mail",
    description: "Get a free disposable email inbox — no signup, auto-refresh, multiple providers.",
    href: "/tools/temp-mail",
    category: "email",
    icon: Mail,
    badge: "Popular",
    tags: ["temp mail", "temporary email", "disposable", "inbox", "anonymous", "gmail"],
  },

  // ── X Tools (formerly coming soon) ───────────────────────────────
  {
    id: "follower-analyzer",
    label: "Follower Analyzer",
    description: "Analyze your follower-to-following ratio, engagement rate, and get personalized growth tips.",
    href: "/tools/follower-analyzer",
    category: "social-media",
    icon: Users,
    badge: "New",
    tags: ["x", "twitter", "followers", "engagement", "ratio", "growth", "analytics"],
  },
  {
    id: "tweet-scheduler",
    label: "Tweet Scheduler",
    description: "Plan your X content calendar, compose tweets with date/time, and export as CSV.",
    href: "/tools/tweet-scheduler",
    category: "social-media",
    icon: Calendar,
    badge: "New",
    tags: ["x", "twitter", "schedule", "calendar", "content", "plan", "tweet"],
  },
  {
    id: "profile-audit",
    label: "Profile Audit",
    description: "Answer 8 questions and get an instant audit score, letter grade, and improvement tips for your X profile.",
    href: "/tools/profile-audit",
    category: "social-media",
    icon: ClipboardList,
    badge: "New",
    tags: ["x", "twitter", "profile", "audit", "score", "optimize", "bio"],
  },

  // ── SEO Tools (formerly coming soon) ─────────────────────────────
  {
    id: "page-speed-checker",
    label: "Page Speed Checker",
    description: "Run a 10-point speed audit checklist for your website and get a performance score with actionable fixes.",
    href: "/tools/page-speed-checker",
    category: "seo",
    icon: Gauge,
    badge: "New",
    tags: ["seo", "page speed", "core web vitals", "performance", "lcp", "cls", "lighthouse"],
  },
  {
    id: "backlink-analyzer",
    label: "Backlink Analyzer",
    description: "Paste your backlinks and get instant quality analysis — HTTPS check, anchor text, spam detection.",
    href: "/tools/backlink-analyzer",
    category: "seo",
    icon: Link2,
    badge: "New",
    tags: ["seo", "backlinks", "links", "anchor text", "domain", "quality", "spam"],
  },
  {
    id: "schema-generator",
    label: "Schema Generator",
    description: "Generate JSON-LD structured data markup for Article, FAQ, Product, LocalBusiness, and more.",
    href: "/tools/schema-generator",
    category: "seo",
    icon: Code2,
    badge: "New",
    tags: ["seo", "schema", "json-ld", "structured data", "rich results", "faq", "article"],
  },

  // ── Email Tools (formerly coming soon) ───────────────────────────
  {
    id: "email-ab-tester",
    label: "Email A/B Tester",
    description: "Compare two subject lines side-by-side and get a score, predicted winner, and factor breakdown.",
    href: "/tools/email-ab-tester",
    category: "email",
    icon: FlaskConical,
    badge: "New",
    tags: ["email", "ab test", "subject line", "open rate", "compare", "marketing"],
  },
  {
    id: "spam-score-checker",
    label: "Spam Score Checker",
    description: "Check your email subject line and body for spam trigger words, excessive caps, and 10 other signals.",
    href: "/tools/spam-score-checker",
    category: "email",
    icon: ShieldAlert,
    badge: "New",
    tags: ["email", "spam", "score", "deliverability", "subject line", "trigger words"],
  },
  {
    id: "newsletter-template-generator",
    label: "Newsletter Template Generator",
    description: "Generate responsive HTML email newsletter templates — Minimal, Editorial, or Digest style.",
    href: "/tools/newsletter-template-generator",
    category: "email",
    icon: Newspaper,
    badge: "New",
    tags: ["email", "newsletter", "template", "html", "responsive", "marketing"],
  },

  // ── Privacy Tools ──────────────────────────────────────────────────
  {
    id: "masked-email-generator",
    label: "Masked Email Generator",
    description: "Generate random email aliases and Gmail plus-tag variants to protect your real inbox.",
    href: "/tools/masked-email-generator",
    category: "email",
    icon: EyeOff,
    badge: "New",
    tags: ["masked email", "alias", "anonymous", "privacy", "email", "gmail", "simplelogin", "anonaddy"],
  },
  {
    id: "email-privacy-checker",
    label: "Email Privacy Checker",
    description: "Score your email address across 7 privacy factors — provider, username, data sharing, and more.",
    href: "/tools/email-privacy-checker",
    category: "email",
    icon: ShieldCheck,
    badge: "New",
    tags: ["email", "privacy", "score", "check", "protonmail", "gmail", "data"],
  },
  {
    id: "spam-risk-checker",
    label: "Spam Risk Checker",
    description: "Analyze your email address for patterns that attract spam bots, harvesters, and bulk senders.",
    href: "/tools/spam-risk-checker",
    category: "email",
    icon: MailWarning,
    badge: "New",
    tags: ["spam", "email", "risk", "check", "inbox", "protection"],
  },
  {
    id: "email-leak-checker",
    label: "Email Leak Checker",
    description: "Understand how email leaks happen, where to check if your address was exposed, and what to do.",
    href: "/tools/email-leak-checker",
    category: "email",
    icon: AlertOctagon,
    badge: "New",
    tags: ["email", "leak", "breach", "haveibeenpwned", "data", "privacy"],
  },
  {
    id: "alias-email-explainer",
    label: "Alias Email Explainer",
    description: "Complete guide to email aliasing — how it works and best services compared.",
    href: "/tools/alias-email-explainer",
    category: "email",
    icon: EyeOff,
    badge: "New",
    tags: ["alias", "email", "simplelogin", "anonaddy", "privacy", "anonymous", "forwarding"],
  },
  {
    id: "disposable-email-guide",
    label: "Disposable Email Guide",
    description: "When to use disposable email, its pros & cons, and the best providers compared.",
    href: "/tools/disposable-email-guide",
    category: "email",
    icon: BookOpen,
    badge: "New",
    tags: ["disposable email", "temp mail", "guide", "privacy", "spam"],
  },
];

export function getToolsByCategory(category: CategoryKey): Tool[] {
  return ALL_TOOLS.filter((t) => t.category === category && !t.isComingSoon);
}

export function getPopularTools(): Tool[] {
  return ALL_TOOLS.filter((t) => t.badge === "Popular" && !t.isComingSoon);
}

export function getNewTools(): Tool[] {
  return ALL_TOOLS.filter((t) => t.badge === "New" && !t.isComingSoon);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_TOOLS.filter((t) => !t.isComingSoon);
  return ALL_TOOLS.filter(
    (t) =>
      !t.isComingSoon &&
      (t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q)) ||
        CATEGORIES[t.category].label.toLowerCase().includes(q)),
  );
}

export const LIVE_TOOLS = ALL_TOOLS.filter((t) => !t.isComingSoon);
export const TOTAL_LIVE = LIVE_TOOLS.length;
