import {
  TrendingUp, Globe, Link2, Search, BarChart2, FileText,
  Target, Zap, Users, Sparkles, Type, Code2, Shield, Tag,
} from "lucide-react";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { CategoryLandingPage, type CategoryPageConfig } from "./CategoryLandingPage";

const tools = ALL_TOOLS.filter((t) => t.category === "seo" && !t.isComingSoon);

const config: CategoryPageConfig = {
  path: "/seo-tools",
  seoTitle: "Free SEO Tools — Meta Tag Generator, Keyword Density, URL Slug, Robots.txt | X Toolkit",
  seoDescription:
    "Free browser-based SEO tools: meta tag generator with SERP preview, keyword density checker, URL slug generator, robots.txt builder, and sitemap validator. No signup required.",
  title: "SEO Tools",
  tagline: "On-page SEO tools — free, browser-based, and ready to use",
  description:
    "Practical SEO utilities for content creators, developers, and marketers. Generate meta tags with live SERP preview, measure keyword density, build clean URL slugs, create robots.txt files, and validate XML sitemaps — all free, no login required.",
  icon: TrendingUp,
  color: "text-pink-400",
  bg: "bg-pink-400/10 border-pink-400/20",
  heroGradient: "bg-gradient-to-br from-pink-500/8 via-pink-500/3 to-transparent",
  tools,

  whatIs:
    "SEO tools are utilities that help you audit and optimize the on-page elements that search engines use to understand, rank, and display your content. The Meta Tag Generator builds SEO-optimized title tags, meta descriptions, Open Graph tags, and Twitter Card tags with a live SERP preview showing exactly how your page will look in Google results. The Keyword Density Checker measures how frequently a target keyword appears in a piece of content, helping you hit the optimal 1–3% range without keyword stuffing. The URL Slug Generator converts any title or phrase into a clean, hyphenated, lowercase URL slug that follows SEO best practices. The Robots.txt Generator lets you configure crawl rules for any search engine bot, block AI scrapers, and add your sitemap URL. The Sitemap Validator checks your XML sitemap for structural errors, invalid dates, and URL format issues.",

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
      title: "Control how crawlers see your site",
      description:
        "Generate a robots.txt that allows the right bots, blocks AI scrapers, and points crawlers to your sitemap.",
    },
    {
      icon: FileText,
      title: "Validate before submitting to Google",
      description:
        "Catch sitemap errors before they cause indexing problems. The validator checks structure, URL formats, and required tags.",
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
      title: "Site owners configuring crawl settings",
      description:
        "Use the robots.txt generator to block admin pages, set crawl delays, block AI training bots, and reference your sitemap.",
    },
    {
      title: "SEO freelancers doing quick audits",
      description:
        "Run fast spot-checks for clients without opening a full audit tool — useful for first-call audits and quick deliverables.",
    },
  ],

  faqs: [
    {
      q: "What is the ideal meta title length for SEO?",
      a: "Google typically displays the first 50–60 characters of a page title. Keep meta titles between 50–60 characters for best results. The Meta Tag Generator shows a live SERP preview and flags titles that are too long or too short.",
    },
    {
      q: "What is keyword density and what range is ideal?",
      a: "Keyword density is the percentage of times a target keyword appears relative to total word count. The recommended range is 1–3%. Below 1% may not signal relevance strongly enough; above 4% risks a keyword stuffing flag from Google.",
    },
    {
      q: "Should I use hyphens or underscores in URL slugs?",
      a: "Always use hyphens. Google treats hyphens as word separators (so 'seo-tools' = two words: 'seo' + 'tools'), but treats underscores as character joiners ('seo_tools' = one word). Hyphens are the universal best practice.",
    },
    {
      q: "Does robots.txt prevent pages from being indexed?",
      a: "No — robots.txt controls crawling, not indexing. A blocked page can still appear in search results if other pages link to it. To prevent indexing, use a 'noindex' meta tag or X-Robots-Tag HTTP header in addition to or instead of robots.txt.",
    },
    {
      q: "How many URLs can an XML sitemap contain?",
      a: "Each sitemap file can contain a maximum of 50,000 URLs and must not exceed 50 MB uncompressed. For larger sites, use a sitemap index file that points to multiple individual sitemaps.",
    },
    {
      q: "Are all these SEO tools free?",
      a: "Yes — all SEO tools on X Toolkit are completely free with no subscription, trial, or account required. All processing happens in your browser or via stateless API calls — nothing is stored.",
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
