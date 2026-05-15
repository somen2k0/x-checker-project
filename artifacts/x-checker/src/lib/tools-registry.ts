import {
  Search, Link2, AtSign, Sparkles, Smile, Briefcase, Palette,
  Hash, MessageSquare, Type, BarChart2, Users, FileJson, Lock,
  TrendingUp, Globe, Code2, Mail, ShieldCheck, Pencil, FileText,
  Shield, Tag, Minimize2, KeyRound, Regex, Database, Shuffle,
  Clock, ArrowLeftRight, ScanSearch, EyeOff, MailWarning, AlertOctagon,
  BookOpen, Calendar, ClipboardList, Gauge, FlaskConical, ShieldAlert, Newspaper,
  type LucideIcon,
} from "lucide-react";
import toolsManifest from "./tools-manifest.json";

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

/**
 * Icon map — add one entry here when adding a new tool to tools-manifest.json.
 * Falls back to Globe if the id is not found.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  "account-checker": Search,
  "profile-links": Link2,
  "at-formatter": AtSign,
  "follower-analyzer": Users,
  "tweet-scheduler": Calendar,
  "profile-audit": ClipboardList,
  "ai-detector": ScanSearch,
  "bio-generator": Sparkles,
  "bio-ideas": Sparkles,
  "funny-bios": Smile,
  "professional-bios": Briefcase,
  "aesthetic-bios": Palette,
  "username-generator": AtSign,
  "name-ideas": Users,
  "hashtag-formatter": Hash,
  "tweet-formatter": MessageSquare,
  "font-preview": Type,
  "character-counter": BarChart2,
  "case-converter": Type,
  "json-formatter": FileJson,
  "base64": Lock,
  "css-minifier": Minimize2,
  "html-formatter": Code2,
  "jwt-decoder": KeyRound,
  "regex-tester": Regex,
  "sql-formatter": Database,
  "url-encoder": Link2,
  "uuid-generator": Shuffle,
  "yaml-json": ArrowLeftRight,
  "timezone-converter": Clock,
  "og-image-preview": Globe,
  "meta-tag-generator": Globe,
  "url-slug-generator": Link2,
  "keyword-density": TrendingUp,
  "robots-txt-generator": Shield,
  "sitemap-validator": Tag,
  "page-speed-checker": Gauge,
  "backlink-analyzer": Link2,
  "schema-generator": Code2,
  "subject-line-generator": Pencil,
  "email-username-generator": AtSign,
  "plain-text-formatter": FileText,
  "email-character-counter": Hash,
  "email-signature-generator": Mail,
  "email-validator": ShieldCheck,
  "temp-mail": Mail,
  "email-ab-tester": FlaskConical,
  "spam-score-checker": ShieldAlert,
  "newsletter-template-generator": Newspaper,
  "masked-email-generator": EyeOff,
  "email-privacy-checker": ShieldCheck,
  "spam-risk-checker": MailWarning,
  "email-leak-checker": AlertOctagon,
  "alias-email-explainer": EyeOff,
  "disposable-email-guide": BookOpen,
};

/**
 * ALL_TOOLS is derived from tools-manifest.json.
 *
 * To add a new tool:
 *   1. Add an entry to src/lib/tools-manifest.json
 *   2. Add the icon to ICON_MAP above
 *   Done — prerender and sitemap auto-update on next build.
 */
export const ALL_TOOLS: Tool[] = toolsManifest.map((t) => ({
  id: t.id,
  label: t.label,
  description: t.description,
  href: t.href,
  category: t.category as CategoryKey,
  icon: ICON_MAP[t.id] ?? Globe,
  badge: t.badge as ToolBadge | undefined,
  isComingSoon: ('isComingSoon' in t ? !!(t as { isComingSoon?: boolean }).isComingSoon : false),
  tags: t.tags,
}));

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
