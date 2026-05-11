import {
  Search, Link2, AtSign, Sparkles, Smile, Briefcase, Palette,
  Hash, MessageSquare, Type, BarChart2, Users, FileJson, Lock,
  TrendingUp, Globe, Code2, type LucideIcon,
} from "lucide-react";

export type CategoryKey =
  | "social-media"
  | "ai-writing"
  | "text-formatting"
  | "developer"
  | "seo";

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
    description: "Meta tag checkers, keyword tools, and on-page SEO utilities.",
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
    href: "/tools?tab=checker",
    category: "social-media",
    icon: Search,
    badge: "Popular",
    tags: ["x", "twitter", "accounts", "bulk", "check", "suspended", "deleted"],
  },
  {
    id: "profile-links",
    label: "Profile Link Generator",
    description: "Convert a list of usernames into direct X profile links instantly.",
    href: "/tools?tab=links",
    category: "social-media",
    icon: Link2,
    tags: ["x", "twitter", "links", "profile", "url"],
  },
  {
    id: "at-formatter",
    label: "@ Formatter",
    description: "Bulk add or remove the @ prefix from username lists in one click.",
    href: "/tools?tab=at",
    category: "social-media",
    icon: AtSign,
    tags: ["x", "twitter", "username", "format", "at"],
  },

  // ── AI Writing ────────────────────────────────────────────────────
  {
    id: "bio-generator",
    label: "AI Bio Generator",
    description: "Generate 3 professional X bios in seconds — just enter your niche and tone.",
    href: "/tools?tab=bio",
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
    badge: "New",
    tags: ["json", "format", "minify", "validate", "developer", "api"],
  },
  {
    id: "base64",
    label: "Base64 Encoder / Decoder",
    description: "Encode and decode Base64 strings with full Unicode and emoji support.",
    href: "/tools/base64",
    category: "developer",
    icon: Lock,
    badge: "New",
    tags: ["base64", "encode", "decode", "developer", "binary"],
  },

  // ── SEO (coming soon) ─────────────────────────────────────────────
  {
    id: "meta-checker",
    label: "Meta Tag Checker",
    description: "Analyze and optimize meta titles and descriptions for better search rankings.",
    href: "#",
    category: "seo",
    icon: Globe,
    isComingSoon: true,
    tags: ["seo", "meta", "title", "description", "google"],
  },
  {
    id: "keyword-density",
    label: "Keyword Density Tool",
    description: "Check keyword frequency and density in any block of text.",
    href: "#",
    category: "seo",
    icon: TrendingUp,
    isComingSoon: true,
    tags: ["seo", "keyword", "density", "frequency"],
  },
  {
    id: "slug-generator",
    label: "URL Slug Generator",
    description: "Convert titles or phrases into clean, SEO-friendly URL slugs.",
    href: "#",
    category: "seo",
    icon: Link2,
    isComingSoon: true,
    tags: ["seo", "slug", "url", "permalink"],
  },
];

export function getToolsByCategory(category: CategoryKey): Tool[] {
  return ALL_TOOLS.filter((t) => t.category === category);
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
