#!/usr/bin/env node
/**
 * prerender.mjs — Build-time SSG for X Toolkit
 *
 * Runs after `vite build` to generate per-page HTML files with:
 *   - Unique <title> for every route
 *   - Unique <meta name="description">
 *   - Unique Open Graph + Twitter Card tags
 *   - Unique <link rel="canonical">
 *   - Per-page JSON-LD SoftwareApplication structured data
 *   - <noscript> static content listing tool details + all 55 tool links
 *
 * Vercel serves static files before rewrites, so /tools/json-formatter/index.html
 * is served directly to crawlers without the JS rewrite kicking in.
 *
 * Usage (automatically run as part of `pnpm run build`):
 *   node prerender.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "dist/public");
const SITE_URL = "https://xtoolkit.live";
const TODAY = new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────────────────────
// ALL PAGES — title, description, path, and optional metadata
// ─────────────────────────────────────────────────────────────────────────────

const TOOL_PAGES = [
  // ── Social Media ──────────────────────────────────────────────────────────
  {
    path: "/tools/x-account-checker",
    label: "X Account Checker",
    title: "X Account Checker - Bulk Check Twitter Account Status | X Toolkit",
    description: "Bulk-check up to 100 X (Twitter) accounts at once. Instantly see which are active, suspended, or not found. Free, no signup required.",
    category: "Social Media Tools",
  },
  {
    path: "/tools/profile-link-generator",
    label: "Profile Link Generator",
    title: "Profile Link Generator - Convert Usernames to X Profile URLs | X Toolkit",
    description: "Convert a list of X (Twitter) usernames into direct clickable profile URLs instantly. Paste usernames, get links. Free, no signup needed.",
    category: "Social Media Tools",
  },
  {
    path: "/tools/at-formatter",
    label: "@ Formatter",
    title: "@ Formatter - Bulk Add or Remove @ from X Usernames | X Toolkit",
    description: "Instantly bulk add or remove the @ symbol from a list of X (Twitter) usernames. Clean up lists with one click. Free online tool.",
    category: "Social Media Tools",
  },
  {
    path: "/tools/follower-analyzer",
    label: "Follower Analyzer",
    title: "Follower Analyzer - Check Your X (Twitter) Follower Ratio | X Toolkit",
    description: "Analyze your X follower-to-following ratio and get personalized growth tips. Free Twitter follower analyzer tool — no login needed.",
    category: "Social Media Tools",
  },
  {
    path: "/tools/tweet-scheduler",
    label: "Tweet Scheduler",
    title: "Tweet Scheduler - Plan Your X (Twitter) Content Calendar | X Toolkit",
    description: "Plan your X content calendar, compose tweets with date and time, and export your schedule as CSV. Free tweet scheduler and planner.",
    category: "Social Media Tools",
  },
  {
    path: "/tools/profile-audit",
    label: "Profile Audit",
    title: "X Profile Audit - Score & Improve Your Twitter Profile | X Toolkit",
    description: "Get an instant X (Twitter) profile audit score and letter grade. Answer 8 questions and receive actionable improvement tips. Free.",
    category: "Social Media Tools",
  },

  // ── AI Writing ────────────────────────────────────────────────────────────
  {
    path: "/tools/ai-detector",
    label: "AI Text Detector & Humanizer",
    title: "AI Text Detector & Humanizer - Detect & Rewrite AI Content | X Toolkit",
    description: "Detect if text was written by AI and rewrite it to sound naturally human. Powered by Llama 3.3 70B via Groq. Free AI content detector.",
    category: "AI Writing Tools",
  },
  {
    path: "/tools/bio-generator",
    label: "AI Bio Generator",
    title: "AI Bio Generator for X (Twitter) - Free Profile Bio Creator | X Toolkit",
    description: "Generate 3 unique X (Twitter) bios in seconds. Enter your niche and tone, get AI-crafted professional profile bios instantly. Free.",
    category: "AI Writing Tools",
  },
  {
    path: "/tools/bio-ideas",
    label: "Bio Ideas",
    title: "100+ X Bio Ideas & Templates for Every Niche | X Toolkit",
    description: "Browse 100+ ready-made X (Twitter) bio templates organized by niche — tech, creator, business, personal. Copy and use in seconds. Free.",
    category: "AI Writing Tools",
  },
  {
    path: "/tools/funny-bios",
    label: "Funny Bios",
    title: "Funny X Bio Ideas - Hilarious Twitter Profile Bios | X Toolkit",
    description: "Browse witty and funny X (Twitter) bio ideas that make people laugh and stand out in any feed. Curated humor for every personality. Free.",
    category: "AI Writing Tools",
  },
  {
    path: "/tools/professional-bios",
    label: "Professional Bios",
    title: "Professional X Bio Templates - Career & Business Profile Bios | X Toolkit",
    description: "Clean, credible X (Twitter) bio templates for professionals, executives, and entrepreneurs. Build authority with the right words. Free.",
    category: "AI Writing Tools",
  },
  {
    path: "/tools/aesthetic-bios",
    label: "Aesthetic Bios",
    title: "Aesthetic X Bio Ideas - Minimal & Stylish Twitter Profile Bios | X Toolkit",
    description: "Curated aesthetic X (Twitter) bio ideas for a minimal, clean, and visually appealing profile. Find your perfect look. Free.",
    category: "AI Writing Tools",
  },

  // ── Text & Formatting ─────────────────────────────────────────────────────
  {
    path: "/tools/username-generator",
    label: "Username Generator",
    title: "X Username Generator - Unique Twitter Handle Ideas | X Toolkit",
    description: "Generate unique X (Twitter) username ideas for your niche or brand. Dozens of creative handle suggestions instantly. Free online tool.",
    category: "Text & Formatting Tools",
  },
  {
    path: "/tools/name-ideas",
    label: "Display Name Ideas",
    title: "X Display Name Ideas - Twitter Profile Name Generator | X Toolkit",
    description: "Browse curated X (Twitter) display name ideas for creators, brands, and professionals. Find the perfect name for your profile. Free.",
    category: "Text & Formatting Tools",
  },
  {
    path: "/tools/hashtag-formatter",
    label: "Hashtag Formatter",
    title: "Hashtag Formatter - Clean & Deduplicate Hashtag Lists | X Toolkit",
    description: "Clean, format, and deduplicate hashtag lists in one click. Remove duplicates, fix spacing, and prepare hashtags for X or Instagram. Free.",
    category: "Text & Formatting Tools",
  },
  {
    path: "/tools/tweet-formatter",
    label: "Tweet Thread Formatter",
    title: "Tweet Thread Formatter - Split Text into Tweet Threads | X Toolkit",
    description: "Automatically split long text into numbered tweet threads for X (Twitter). Format content to fit the 280-character limit perfectly. Free.",
    category: "Text & Formatting Tools",
  },
  {
    path: "/tools/font-preview",
    label: "Font Preview",
    title: "Font Preview for X - Unicode Text Style Previewer | X Toolkit",
    description: "Preview your X (Twitter) bio or tweet text in stylish Unicode fonts. See bold, italic, and cursive styles before posting. Free.",
    category: "Text & Formatting Tools",
  },
  {
    path: "/tools/character-counter",
    label: "Character Counter",
    title: "Character Counter for X (Twitter) - Word & Character Limit Tool | X Toolkit",
    description: "Count characters, words, and sentences in real-time. Optimized for X's 280-character limit. Free instant character counter online.",
    category: "Text & Formatting Tools",
  },
  {
    path: "/tools/case-converter",
    label: "Case Converter",
    title: "Case Converter - UPPERCASE, lowercase, camelCase & More | X Toolkit",
    description: "Convert text to UPPERCASE, lowercase, camelCase, snake_case, kebab-case, PascalCase, and Title Case instantly. Free online case converter.",
    category: "Text & Formatting Tools",
  },

  // ── Developer ─────────────────────────────────────────────────────────────
  {
    path: "/tools/json-formatter",
    label: "JSON Formatter",
    title: "JSON Formatter & Validator - Beautify & Minify JSON Online | X Toolkit",
    description: "Format, validate, and beautify JSON data instantly in your browser. Real-time error detection, syntax highlighting, and minify support. Free.",
    category: "Developer Tools",
  },
  {
    path: "/tools/base64",
    label: "Base64 Encoder / Decoder",
    title: "Base64 Encoder / Decoder - Free Online Base64 Tool | X Toolkit",
    description: "Encode text or data to Base64 and decode Base64 strings back to plain text. Full Unicode and emoji support. Runs entirely in your browser.",
    category: "Developer Tools",
  },
  {
    path: "/tools/css-minifier",
    label: "CSS Minifier & Formatter",
    title: "CSS Minifier & Formatter - Beautify or Minify CSS Online | X Toolkit",
    description: "Minify CSS to reduce file size or beautify it for readability. Removes comments, whitespace, and redundant code. Free, browser-based.",
    category: "Developer Tools",
  },
  {
    path: "/tools/html-formatter",
    label: "HTML Formatter & Minifier",
    title: "HTML Formatter & Minifier - Beautify HTML Code Online | X Toolkit",
    description: "Beautify messy HTML for readability or minify it to reduce file size. Format HTML code with proper indentation. Free online tool.",
    category: "Developer Tools",
  },
  {
    path: "/tools/jwt-decoder",
    label: "JWT Decoder",
    title: "JWT Decoder - Decode JSON Web Tokens Online | X Toolkit",
    description: "Decode and inspect JWT header, payload, and expiration instantly. No server — everything runs in your browser. Free JWT inspection tool.",
    category: "Developer Tools",
  },
  {
    path: "/tools/regex-tester",
    label: "Regex Tester",
    title: "Regex Tester - Test Regular Expressions Online | X Toolkit",
    description: "Test and debug regular expressions with real-time match highlighting and common presets. Free browser-based regex tester online.",
    category: "Developer Tools",
  },
  {
    path: "/tools/sql-formatter",
    label: "SQL Formatter & Beautifier",
    title: "SQL Formatter & Beautifier - Format SQL Queries Online | X Toolkit",
    description: "Format SQL queries with proper indentation and capitalized keywords. Clean up messy SQL for PostgreSQL, MySQL, and more. Free online tool.",
    category: "Developer Tools",
  },
  {
    path: "/tools/url-encoder",
    label: "URL Encoder & Decoder",
    title: "URL Encoder & Decoder - Percent-Encode URLs Online | X Toolkit",
    description: "Encode special characters in URLs or decode percent-encoded strings. Works with query strings, paths, and full URLs. Free online tool.",
    category: "Developer Tools",
  },
  {
    path: "/tools/uuid-generator",
    label: "UUID Generator",
    title: "UUID Generator - Free Online UUID v4 Generator | X Toolkit",
    description: "Generate random UUID v4 identifiers using the Web Crypto API. Single or bulk generation with one click. No server, fully private. Free.",
    category: "Developer Tools",
  },
  {
    path: "/tools/yaml-json",
    label: "YAML to JSON Converter",
    title: "YAML to JSON Converter - Convert YAML ↔ JSON Online | X Toolkit",
    description: "Convert YAML to JSON or JSON to YAML instantly. Supports nested objects, arrays, and all data types. Free browser-based converter.",
    category: "Developer Tools",
  },
  {
    path: "/tools/timezone-converter",
    label: "Time Zone Converter",
    title: "Time Zone Converter - Convert Between World Timezones | X Toolkit",
    description: "Convert any date and time between world time zones with full DST support. Compare multiple zones at once. Free online timezone converter.",
    category: "Developer Tools",
  },

  // ── SEO ───────────────────────────────────────────────────────────────────
  {
    path: "/tools/og-image-preview",
    label: "OG / Twitter Card Preview",
    title: "OG Image Preview - Check Open Graph & Twitter Card Tags | X Toolkit",
    description: "Preview how any URL appears when shared on Facebook, X, and LinkedIn. Check all Open Graph and Twitter Card meta tags. Free online tool.",
    category: "SEO Tools",
  },
  {
    path: "/tools/meta-tag-generator",
    label: "Meta Tag Generator",
    title: "Meta Tag Generator - SEO Title & Description Generator | X Toolkit",
    description: "Generate SEO title tags, meta descriptions, Open Graph, and Twitter Card tags with a live SERP preview. Free meta tag generator online.",
    category: "SEO Tools",
  },
  {
    path: "/tools/url-slug-generator",
    label: "URL Slug Generator",
    title: "URL Slug Generator - Convert Titles to SEO-Friendly Slugs | X Toolkit",
    description: "Convert page titles or phrases into clean, SEO-friendly URL slugs instantly. Lowercase, hyphenated, special-character-free. Free.",
    category: "SEO Tools",
  },
  {
    path: "/tools/keyword-density",
    label: "Keyword Density Checker",
    title: "Keyword Density Checker - Free SEO Content Analysis Tool | X Toolkit",
    description: "Analyze keyword frequency and density percentages across any article or text. Improve SEO content optimization. Free online checker.",
    category: "SEO Tools",
  },
  {
    path: "/tools/robots-txt-generator",
    label: "Robots.txt Generator",
    title: "Robots.txt Generator - Create Your Robots File Online | X Toolkit",
    description: "Build a valid robots.txt file with crawl rules, AI bot blocking, and your sitemap URL. Free online robots.txt generator tool.",
    category: "SEO Tools",
  },
  {
    path: "/tools/sitemap-validator",
    label: "Sitemap Validator",
    title: "Sitemap Validator - Validate XML Sitemaps Online | X Toolkit",
    description: "Validate your XML sitemap structure, URL formats, and check for errors instantly. Paste your sitemap and get instant feedback. Free.",
    category: "SEO Tools",
  },
  {
    path: "/tools/page-speed-checker",
    label: "Page Speed Checker",
    title: "Page Speed Checker - Website Performance Audit Tool | X Toolkit",
    description: "Run a 10-point speed audit checklist for any website and get a performance score with actionable improvement tips. Free page speed tool.",
    category: "SEO Tools",
  },
  {
    path: "/tools/backlink-analyzer",
    label: "Backlink Analyzer",
    title: "Backlink Analyzer - Check Backlink Quality Online | X Toolkit",
    description: "Paste your backlinks and get instant quality analysis — HTTPS check, anchor text, domain quality, and spam detection. Free online tool.",
    category: "SEO Tools",
  },
  {
    path: "/tools/schema-generator",
    label: "Schema Generator",
    title: "Schema Generator - JSON-LD Structured Data Markup Tool | X Toolkit",
    description: "Generate JSON-LD structured data for Article, FAQ, Product, LocalBusiness, and more schema types. Free schema markup generator online.",
    category: "SEO Tools",
  },

  // ── Email ─────────────────────────────────────────────────────────────────
  {
    path: "/tools/subject-line-generator",
    label: "Subject Line Generator",
    title: "Email Subject Line Generator - High Open Rate Templates | X Toolkit",
    description: "Generate high-converting email subject line templates for newsletters, cold emails, and campaigns. Free subject line generator online.",
    category: "Email Tools",
  },
  {
    path: "/tools/email-username-generator",
    label: "Email Username Generator",
    title: "Email Username Generator - Professional Email Format Tool | X Toolkit",
    description: "Generate professional email address formats from a name and company. Find the right email format for business. Free online tool.",
    category: "Email Tools",
  },
  {
    path: "/tools/plain-text-formatter",
    label: "Plain Text Email Formatter",
    title: "Plain Text Email Formatter - Convert HTML Emails to Text | X Toolkit",
    description: "Convert HTML emails to clean, readable plain text while preserving links. Format emails for better deliverability. Free online tool.",
    category: "Email Tools",
  },
  {
    path: "/tools/email-character-counter",
    label: "Email Character Counter",
    title: "Email Character Counter - Subject & Body Length Checker | X Toolkit",
    description: "Count subject line, preview text, and body characters with per-email-client limits. Optimize for Gmail, Outlook, and more. Free.",
    category: "Email Tools",
  },
  {
    path: "/tools/email-signature-generator",
    label: "Email Signature Generator",
    title: "Email Signature Generator - HTML & Plain Text Signatures | X Toolkit",
    description: "Build a professional HTML or plain text email signature in seconds. Custom name, title, company, and links. Free email signature maker.",
    category: "Email Tools",
  },
  {
    path: "/tools/email-validator",
    label: "Email Address Validator",
    title: "Email Address Validator - Check Email Format Free | X Toolkit",
    description: "Validate email address syntax and format instantly in your browser. Check if an email address is properly formatted. Free online tool.",
    category: "Email Tools",
  },
  {
    path: "/tools/temp-mail",
    label: "Temp Mail",
    title: "Temp Mail - Free Disposable Temporary Email Inbox | X Toolkit",
    description: "Get a free temporary email inbox instantly — no signup required. Auto-refresh inbox, multiple providers. Protect your real email address.",
    category: "Email Tools",
  },
  {
    path: "/tools/email-ab-tester",
    label: "Email A/B Tester",
    title: "Email A/B Tester - Compare Subject Lines Side by Side | X Toolkit",
    description: "Compare two email subject lines and get a predicted winner with open rate factor breakdown. Free email A/B testing tool online.",
    category: "Email Tools",
  },
  {
    path: "/tools/spam-score-checker",
    label: "Spam Score Checker",
    title: "Spam Score Checker - Email Deliverability Analyzer | X Toolkit",
    description: "Check your email subject line and body for spam trigger words, excessive caps, and 10+ spam signals. Free spam score checker online.",
    category: "Email Tools",
  },
  {
    path: "/tools/newsletter-template-generator",
    label: "Newsletter Template Generator",
    title: "Newsletter Template Generator - Free HTML Email Templates | X Toolkit",
    description: "Generate responsive HTML email newsletter templates in Minimal, Editorial, or Digest style. Free newsletter template builder online.",
    category: "Email Tools",
  },
  {
    path: "/tools/masked-email-generator",
    label: "Masked Email Generator",
    title: "Masked Email Generator - Create Email Aliases for Privacy | X Toolkit",
    description: "Generate random email aliases and Gmail plus-tag variants to protect your real inbox. Free masked email generator online.",
    category: "Email Tools",
  },
  {
    path: "/tools/email-privacy-checker",
    label: "Email Privacy Checker",
    title: "Email Privacy Checker - Score Your Email Address Security | X Toolkit",
    description: "Score your email address across 7 privacy factors — provider, username, data sharing, and more. Free email privacy analyzer online.",
    category: "Email Tools",
  },
  {
    path: "/tools/spam-risk-checker",
    label: "Spam Risk Checker",
    title: "Spam Risk Checker - Is Your Email Attracting Spam? | X Toolkit",
    description: "Analyze your email address for patterns that attract spam bots, harvesters, and bulk senders. Free spam risk analyzer online.",
    category: "Email Tools",
  },
  {
    path: "/tools/email-leak-checker",
    label: "Email Leak Checker",
    title: "Email Leak Checker - Check If Your Email Was Exposed | X Toolkit",
    description: "Learn how email leaks happen, where to check if your address appeared in a data breach, and what steps to take. Free guide.",
    category: "Email Tools",
  },
  {
    path: "/tools/alias-email-explainer",
    label: "Alias Email Explainer",
    title: "Email Alias Explainer - Complete Guide to Email Aliasing | X Toolkit",
    description: "Complete guide to email aliasing — how it works, best services compared (SimpleLogin, AnonAddy), and when to use them. Free resource.",
    category: "Email Tools",
  },
  {
    path: "/tools/disposable-email-guide",
    label: "Disposable Email Guide",
    title: "Disposable Email Guide - When & How to Use Temporary Email | X Toolkit",
    description: "Learn when to use disposable email, its pros and cons, and the best disposable email providers compared. Free comprehensive guide.",
    category: "Email Tools",
  },
];

const STATIC_PAGES = [
  {
    path: "/",
    label: "Home",
    title: "X Toolkit — 55+ Free Tools for X, SEO, Developers & Creators",
    description: "55+ free online tools for X (Twitter), SEO, developers & creators: account checker, AI bio generator, JSON formatter, JWT decoder, temp mail & more. No signup.",
    isHomepage: true,
  },
  {
    path: "/tools",
    label: "All Tools",
    title: "All 55 Free Online Tools | X Toolkit",
    description: "Browse all 55 free tools from X Toolkit: social media, AI writing, developer, SEO, and email tools. No signup required, instant results.",
  },
  {
    path: "/about",
    label: "About",
    title: "About X Toolkit - Free Tools for X, SEO & Developers",
    description: "X Toolkit offers 55+ free online tools for X (Twitter) creators, developers, and SEO professionals. No signup, no fees — tools that just work.",
  },
  {
    path: "/pricing",
    label: "Pricing",
    title: "Pricing | X Toolkit — Free Forever",
    description: "X Toolkit is free to use — no subscription, no credit card, no hidden fees. Every tool works without an account. See what's included.",
  },
  {
    path: "/privacy",
    label: "Privacy Policy",
    title: "Privacy Policy | X Toolkit",
    description: "Read X Toolkit's privacy policy. We don't store your data, usernames, or results. All tools run in your browser with no data collection.",
  },
  {
    path: "/terms",
    label: "Terms of Service",
    title: "Terms of Service | X Toolkit",
    description: "Read X Toolkit's terms of service. Free to use, no warranty. By using the tools you agree to these terms.",
  },
  {
    path: "/blog",
    label: "Blog",
    title: "Blog - Email Privacy, Temp Mail & Developer Tips | X Toolkit",
    description: "Articles on temp mail, email privacy, disposable email services, and developer tools. Tips and guides from X Toolkit.",
  },
  // Category landing pages
  {
    path: "/social-media-tools",
    label: "Social Media Tools",
    title: "Free Social Media Tools for X (Twitter) | X Toolkit",
    description: "Free social media tools for X (Twitter): account checker, profile link generator, @ formatter, bio generator, tweet scheduler, and more.",
  },
  {
    path: "/ai-writing-tools",
    label: "AI Writing Tools",
    title: "Free AI Writing Tools - Bio Generator & AI Detector | X Toolkit",
    description: "Free AI writing tools: AI bio generator, AI content detector & humanizer, bio ideas, funny bios, and more. Powered by Groq's Llama model.",
  },
  {
    path: "/text-format-tools",
    label: "Text & Formatting Tools",
    title: "Free Text & Formatting Tools Online | X Toolkit",
    description: "Free text formatting tools: character counter, tweet formatter, hashtag cleaner, font preview, case converter, and more. No signup needed.",
  },
  {
    path: "/developer-tools",
    label: "Developer Tools",
    title: "Free Developer Tools - JSON, Base64, JWT, Regex & More | X Toolkit",
    description: "Free developer tools: JSON formatter, Base64 encoder, JWT decoder, regex tester, SQL formatter, UUID generator, YAML converter & more.",
  },
  {
    path: "/seo-tools",
    label: "SEO Tools",
    title: "Free SEO Tools - Meta Tags, Slug Generator & Keyword Checker | X Toolkit",
    description: "Free SEO tools: meta tag generator, URL slug generator, keyword density checker, robots.txt generator, OG image preview & more.",
  },
  {
    path: "/email-tools",
    label: "Email Tools",
    title: "Free Email Tools - Temp Mail, Validator, Signature & More | X Toolkit",
    description: "Free email tools: temp mail, email validator, signature generator, subject line generator, spam checker, privacy checker & more.",
  },
  // Blog posts
  {
    path: "/blog/what-is-disposable-email",
    label: "What Is Disposable Email?",
    title: "What Is Disposable Email? Complete Guide | X Toolkit Blog",
    description: "Everything you need to know about disposable email addresses — how they work, when to use them, and the best services available.",
  },
  {
    path: "/blog/best-temp-mail-services",
    label: "Best Temp Mail Services",
    title: "Best Temp Mail Services in 2026 | X Toolkit Blog",
    description: "Reviewed: the best temporary email services in 2026. Compare features, inbox limits, and privacy policies to find the right tool.",
  },
  {
    path: "/blog/temp-mail-vs-gmail",
    label: "Temp Mail vs Gmail",
    title: "Temp Mail vs Gmail: When to Use Which | X Toolkit Blog",
    description: "Should you use temp mail or Gmail? A practical comparison of disposable email vs. a real Gmail account for different use cases.",
  },
  {
    path: "/blog/is-temp-mail-safe",
    label: "Is Temp Mail Safe?",
    title: "Is Temp Mail Safe? Privacy & Security Guide | X Toolkit Blog",
    description: "Is it safe to use a temporary email address? We examine privacy, security risks, and best practices for using temp mail services.",
  },
  {
    path: "/blog/why-websites-ask-email-verification",
    label: "Why Websites Ask for Email Verification",
    title: "Why Websites Ask for Email Verification | X Toolkit Blog",
    description: "Why do websites require email verification? Learn the technical and business reasons — and how to work around them responsibly.",
  },
  {
    path: "/blog/temp-gmail-explained",
    label: "Temp Gmail Explained",
    title: "Temp Gmail Explained: Gmail Tricks for Privacy | X Toolkit Blog",
    description: "How to use Gmail's plus-addressing and dot tricks to create multiple addresses. A complete guide to temporary Gmail usage.",
  },
];

const ALL_PAGES = [...STATIC_PAGES, ...TOOL_PAGES];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Build the extra <head> content for a page:
 *   - Page-specific JSON-LD SoftwareApplication schema (for tool pages)
 *   - WebSite + SearchAction schema (for homepage)
 */
function buildPageSchema(page, canonicalUrl) {
  const schemas = [];

  if (page.isHomepage) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "X Toolkit",
      url: SITE_URL + "/",
      description: page.description,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    });
  } else if (page.category) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: page.label,
      url: canonicalUrl,
      description: page.description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      isPartOf: {
        "@type": "WebSite",
        name: "X Toolkit",
        url: SITE_URL + "/",
      },
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "X Toolkit", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: "Tools", item: SITE_URL + "/tools" },
        { "@type": "ListItem", position: 3, name: page.label, item: canonicalUrl },
      ],
    });
  }

  return schemas
    .map(
      (s) =>
        `    <script type="application/ld+json">\n    ${JSON.stringify(s, null, 2)
          .split("\n")
          .join("\n    ")}\n    </script>`,
    )
    .join("\n");
}

/**
 * Build the static <noscript> block for a page.
 * For the homepage, this includes all 55 tools as <a href> links.
 * For tool pages, it includes the tool description.
 * For all pages, it includes a link back to the full tool list.
 */
function buildNoscript(page) {
  if (page.isHomepage) {
    const toolLinks = TOOL_PAGES.map(
      (t) =>
        `      <li><a href="${SITE_URL}${t.path}">${escapeHtml(t.label)}</a> — ${escapeHtml(t.description)}</li>`,
    ).join("\n");

    return `  <noscript>
    <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
      <h1>X Toolkit — 55+ Free Online Tools</h1>
      <p>${escapeHtml(page.description)}</p>
      <h2>All 55 Free Tools</h2>
      <ul>
${toolLinks}
      </ul>
      <p>
        <a href="${SITE_URL}/tools">Browse all tools</a> |
        <a href="${SITE_URL}/about">About</a> |
        <a href="${SITE_URL}/sitemap.xml">Sitemap</a>
      </p>
    </div>
  </noscript>`;
  }

  if (page.category) {
    const relatedTools = TOOL_PAGES.filter((t) => t.category === page.category).slice(0, 5);
    const relatedLinks = relatedTools
      .map((t) => `<a href="${SITE_URL}${t.path}">${escapeHtml(t.label)}</a>`)
      .join(", ");

    return `  <noscript>
    <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
      <h1>${escapeHtml(page.label)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <p>Related tools: ${relatedLinks}</p>
      <p><a href="${SITE_URL}/tools">Browse all 55 free tools</a></p>
    </div>
  </noscript>`;
  }

  return `  <noscript>
    <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <p><a href="${SITE_URL}/tools">Browse all 55 free tools</a></p>
    </div>
  </noscript>`;
}

/**
 * Generate the full HTML for a page by transforming the template.
 */
function generatePageHtml(template, page) {
  const canonicalUrl = `${SITE_URL}${page.path}`;
  const safeTitle = escapeHtml(page.title);
  const safeDesc = escapeHtml(page.description);

  let html = template;

  // 1. Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  // 2. Replace meta description
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`,
  );

  // 3. Replace og:title
  html = html.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${safeTitle}$2`,
  );

  // 4. Replace og:description
  html = html.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`,
  );

  // 5. Replace og:url
  html = html.replace(
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
    `$1${canonicalUrl}$2`,
  );

  // 6. Replace twitter:title
  html = html.replace(
    /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
    `$1${safeTitle}$2`,
  );

  // 7. Replace twitter:description
  html = html.replace(
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`,
  );

  // 8. Replace canonical
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${canonicalUrl}$2`,
  );

  // 9. Inject page-specific JSON-LD + noscript before </head>
  const pageSchema = buildPageSchema(page, canonicalUrl);
  const noscriptBlock = buildNoscript(page);

  const injection = `${pageSchema ? pageSchema + "\n" : ""}${noscriptBlock}`;
  html = html.replace("</head>", `${injection}\n  </head>`);

  return html;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — read template, write per-page files
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  console.log("🔍 Reading built index.html template...");
  const template = readFileSync(join(DIST, "index.html"), "utf-8");

  let generated = 0;
  let skipped = 0;

  for (const page of ALL_PAGES) {
    // Determine the output path
    const segments = page.path.split("/").filter(Boolean); // e.g. ["tools", "json-formatter"]
    const pageDir = segments.length > 0 ? join(DIST, ...segments) : null;

    let outputPath;
    if (pageDir) {
      mkdirSync(pageDir, { recursive: true });
      outputPath = join(pageDir, "index.html");
    } else {
      // Homepage — overwrite dist/public/index.html itself
      outputPath = join(DIST, "index.html");
    }

    const html = generatePageHtml(template, page);
    writeFileSync(outputPath, html, "utf-8");
    console.log(`  ✅ ${page.path}`);
    generated++;
  }

  // Also write temp-mail sub-routes
  const tempMailSubRoutes = [
    {
      path: "/tools/temp-mail/tempemail",
      label: "Temp Mail - Disposable Inbox",
      title: "Disposable Email Inbox - Free Temporary Email | X Toolkit",
      description: "Get a free disposable email inbox instantly. No signup, auto-refresh, works with any service. Protect your real email address online.",
      category: "Email Tools",
    },
    {
      path: "/tools/temp-mail/tempgmail",
      label: "Temp Gmail",
      title: "Temp Gmail - Temporary Gmail Address Tricks | X Toolkit",
      description: "Use Gmail dot tricks and plus-addressing to create unlimited temporary Gmail addresses. Free guide and generator tool online.",
      category: "Email Tools",
    },
    {
      path: "/tools/temp-mail/gmail-tricks",
      label: "Gmail Tricks",
      title: "Gmail Dot & Plus Tricks - Create Unlimited Gmail Aliases | X Toolkit",
      description: "Learn Gmail's plus-addressing and dot trick to create unlimited aliases. Use john.doe@gmail.com and johndoe@gmail.com interchangeably.",
      category: "Email Tools",
    },
  ];

  for (const page of tempMailSubRoutes) {
    const segments = page.path.split("/").filter(Boolean);
    const pageDir = join(DIST, ...segments);
    mkdirSync(pageDir, { recursive: true });
    const outputPath = join(pageDir, "index.html");
    const html = generatePageHtml(template, page);
    writeFileSync(outputPath, html, "utf-8");
    console.log(`  ✅ ${page.path}`);
    generated++;
  }

  console.log(`\n🎉 Prerender complete: ${generated} pages generated, ${skipped} skipped.`);
  console.log(`   Output: ${DIST}`);
}

main();
