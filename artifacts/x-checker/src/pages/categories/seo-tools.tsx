import {
  TrendingUp, Globe, Link2, Search, BarChart2, FileText,
  Target, Zap, Users, Sparkles, Type, Code2,
} from "lucide-react";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { CategoryLandingPage, type CategoryPageConfig } from "./CategoryLandingPage";

const tools = ALL_TOOLS.filter((t) => t.category === "seo");

const config: CategoryPageConfig = {
  path: "/seo-tools",
  seoTitle: "Free SEO Tools — Meta Tag Checker, Keyword Density, URL Slug Generator | X Toolkit",
  seoDescription:
    "Free browser-based SEO tools: meta tag analyzer, keyword density checker, and URL slug generator. Optimize your pages for search without expensive subscriptions.",
  title: "SEO Tools",
  tagline: "On-page SEO analysis tools — free and browser-based",
  description:
    "Practical SEO utilities for content creators, developers, and marketers. Analyze meta tags, measure keyword density, and generate clean URL slugs — all for free, with no login or expensive tool subscription required.",
  icon: TrendingUp,
  color: "text-pink-400",
  bg: "bg-pink-400/10 border-pink-400/20",
  heroGradient: "bg-gradient-to-br from-pink-500/8 via-pink-500/3 to-transparent",
  tools,
  comingSoon: true,

  whatIs:
    "SEO tools are utilities that help you audit and optimize the on-page elements that search engines use to understand, rank, and display your content. The Meta Tag Checker analyzes the title and description tags of any page and flags common issues like missing tags, over-length titles, or duplicate descriptions that hurt click-through rates. The Keyword Density Tool measures how frequently a target keyword appears in a piece of content, helping you avoid both under-optimization and keyword stuffing. The URL Slug Generator converts any title or phrase into a clean, hyphenated, lowercase URL slug that follows SEO best practices — removing stop words, replacing special characters, and ensuring the result is both human-readable and search-engine-friendly.",

  benefits: [
    {
      icon: Target,
      title: "Fix the issues that actually affect rankings",
      description:
        "Missing or over-length meta titles, duplicate descriptions, and bad URL slugs are among the highest-impact quick wins in on-page SEO.",
    },
    {
      icon: Zap,
      title: "Instant browser-based analysis",
      description:
        "No Screaming Frog subscription or crawling infrastructure needed. Paste your content and get results in seconds.",
    },
    {
      icon: Search,
      title: "Avoid keyword stuffing",
      description:
        "The keyword density tool shows you exactly how prominent a keyword is so you can hit the optimal range without over-optimizing.",
    },
    {
      icon: Link2,
      title: "Better URLs out of the box",
      description:
        "Well-structured URL slugs improve both search rankings and click-through rates by signaling content relevance at a glance.",
    },
    {
      icon: BarChart2,
      title: "Data-driven content decisions",
      description:
        "Make optimization decisions based on numbers, not guesses — see exactly where your content sits versus best-practice benchmarks.",
    },
    {
      icon: FileText,
      title: "Works on any content",
      description:
        "Paste raw text, HTML, or a URL and analyze blog posts, landing pages, product descriptions, or social content.",
    },
  ],

  useCases: [
    {
      title: "Content writers optimizing posts before publishing",
      description:
        "Check that your meta title is the right length, your keyword density is in the ideal 1–3% range, and your URL slug is clean — before you hit publish.",
    },
    {
      title: "Developers building SEO-compliant pages",
      description:
        "Validate that programmatically generated page metadata meets SEO standards without manually inspecting each rendered page.",
    },
    {
      title: "Marketers auditing landing pages",
      description:
        "Quickly check the meta tags of competitor pages or your own landing pages to identify gaps and improvement opportunities.",
    },
    {
      title: "Bloggers generating clean URLs",
      description:
        "Convert long article titles into SEO-friendly slugs automatically, removing filler words and special characters that weaken URL structure.",
    },
    {
      title: "SEO freelancers doing quick audits",
      description:
        "Run fast spot-checks for clients without opening a full audit tool — useful for first-call audits and quick deliverables.",
    },
    {
      title: "Students learning on-page SEO",
      description:
        "Analyze real pages and see exactly what each SEO element does, making these tools a hands-on learning companion.",
    },
  ],

  faqs: [
    {
      q: "When will the SEO tools be available?",
      a: "The Meta Tag Checker, Keyword Density Tool, and URL Slug Generator are currently in development. We'll publish an update on our homepage and social channels when they launch.",
    },
    {
      q: "Will the SEO tools be free?",
      a: "Yes — like all tools on X Toolkit, these will be completely free with no subscription, trial, or account required.",
    },
    {
      q: "What does the Meta Tag Checker analyze?",
      a: "It checks the meta title (length, presence, uniqueness) and meta description (length, keyword inclusion, readability) of a pasted HTML block or URL. It flags issues with clear explanations and recommended fixes.",
    },
    {
      q: "What is keyword density and why does it matter?",
      a: "Keyword density is the percentage of times a target keyword appears relative to the total word count. The recommended range is 1–3%. Too low and search engines may not associate your page with the keyword; too high and you risk a keyword-stuffing penalty.",
    },
    {
      q: "What makes a good URL slug?",
      a: "A good slug is lowercase, uses hyphens (not underscores) as separators, omits stop words (the, a, of), removes special characters, and directly reflects the page topic. For example: 'free-seo-tools' is better than 'The-Free-SEO-Tools-Page-2024'.",
    },
    {
      q: "Will the data I enter be stored?",
      a: "No. Like all X Toolkit tools, the SEO tools will process your input locally in the browser or via a stateless API call. Nothing is stored or logged.",
    },
  ],

  relatedCategories: [
    {
      title: "Developer Tools",
      href: "/developer-tools",
      description: "JSON formatter, Base64 encoder, and other browser-based dev utilities.",
      icon: Code2,
      color: "text-orange-400",
      bg: "bg-orange-400/10 border-orange-400/20",
    },
    {
      title: "Text & Formatting Tools",
      href: "/text-format-tools",
      description: "Format tweet threads, count characters, and preview Unicode fonts.",
      icon: Type,
      color: "text-green-400",
      bg: "bg-green-400/10 border-green-400/20",
    },
    {
      title: "AI Writing Tools",
      href: "/ai-writing-tools",
      description: "Generate professional X bios and content ideas in seconds with AI.",
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-400/10 border-purple-400/20",
    },
  ],
};

export default function SeoToolsPage() {
  return <CategoryLandingPage config={config} />;
}
