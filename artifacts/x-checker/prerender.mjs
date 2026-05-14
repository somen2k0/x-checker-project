#!/usr/bin/env node
/**
 * prerender.mjs — Build-time SSG for X Toolkit
 *
 * Runs after `vite build` to generate per-page HTML files with:
 *   - Unique <title> and <meta name="description"> for every route
 *   - Unique Open Graph + Twitter Card tags
 *   - Unique <link rel="canonical">
 *   - Per-page JSON-LD structured data (SoftwareApplication + BreadcrumbList)
 *   - <noscript> static content (homepage lists all 55 tools as <a href> links)
 *
 * Also auto-generates dist/public/sitemap-tools.xml from tools-manifest.json
 * so the sitemap stays in sync with the tool list automatically.
 *
 * Adding a new tool:
 *  1. Add an entry to src/lib/tools-manifest.json
 *  2. Add the icon to ICON_MAP in src/lib/tools-registry.ts
 *  Done — this script picks up the new tool on the next build.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "dist/public");
const SITE_URL = "https://xtoolkit.live";
const TODAY = new Date().toISOString().split("T")[0];

// Load tools manifest (single source of truth)
const toolsManifest = JSON.parse(
  readFileSync(join(__dirname, "src/lib/tools-manifest.json"), "utf-8"),
);

// Only live tools (skip isComingSoon)
const LIVE_TOOLS = toolsManifest.filter((t) => !t.isComingSoon);

// Category metadata (mirrors tools-registry.ts)
const CATEGORY_LABELS = {
  "social-media": "Social Media Tools",
  "ai-writing": "AI Writing Tools",
  "text-formatting": "Text & Formatting Tools",
  developer: "Developer Tools",
  seo: "SEO Tools",
  email: "Email Tools",
};

// Static pages (non-tool routes)
const STATIC_PAGES = [
  {
    path: "/",
    label: "Home",
    title: "X Toolkit — 55+ Free Tools for X, SEO, Developers & Creators",
    description:
      "55+ free online tools for X (Twitter), SEO, developers & creators: account checker, AI bio generator, JSON formatter, JWT decoder, temp mail & more. No signup.",
    isHomepage: true,
  },
  {
    path: "/tools",
    label: "All Tools",
    title: "All 55 Free Online Tools | X Toolkit",
    description:
      "Browse all 55 free tools from X Toolkit: social media, AI writing, developer, SEO, and email tools. No signup required, instant results.",
  },
  {
    path: "/about",
    label: "About",
    title: "About X Toolkit - Free Tools for X, SEO & Developers",
    description:
      "X Toolkit offers 55+ free online tools for X (Twitter) creators, developers, and SEO professionals. No signup, no fees — tools that just work.",
  },
  {
    path: "/pricing",
    label: "Pricing",
    title: "Pricing | X Toolkit — Free Forever",
    description:
      "X Toolkit is free to use — no subscription, no credit card, no hidden fees. Every tool works without an account. See what's included.",
  },
  {
    path: "/privacy",
    label: "Privacy Policy",
    title: "Privacy Policy | X Toolkit",
    description:
      "Read X Toolkit's privacy policy. We don't store your data, usernames, or results. All tools run in your browser with no data collection.",
  },
  {
    path: "/terms",
    label: "Terms of Service",
    title: "Terms of Service | X Toolkit",
    description:
      "Read X Toolkit's terms of service. Free to use, no warranty. By using the tools you agree to these terms.",
  },
  {
    path: "/blog",
    label: "Blog",
    title: "Blog - Email Privacy, Temp Mail & Developer Tips | X Toolkit",
    description:
      "Articles on temp mail, email privacy, disposable email services, and developer tools. Tips and guides from X Toolkit.",
  },
  // Category landing pages
  {
    path: "/social-media-tools",
    label: "Social Media Tools",
    title: "Free Social Media Tools for X (Twitter) | X Toolkit",
    description:
      "Free social media tools for X (Twitter): account checker, profile link generator, @ formatter, bio generator, tweet scheduler, and more.",
  },
  {
    path: "/ai-writing-tools",
    label: "AI Writing Tools",
    title: "Free AI Writing Tools - Bio Generator & AI Detector | X Toolkit",
    description:
      "Free AI writing tools: AI bio generator, AI content detector & humanizer, bio ideas, funny bios, and more. Powered by Groq's Llama model.",
  },
  {
    path: "/text-format-tools",
    label: "Text & Formatting Tools",
    title: "Free Text & Formatting Tools Online | X Toolkit",
    description:
      "Free text formatting tools: character counter, tweet formatter, hashtag cleaner, font preview, case converter, and more. No signup needed.",
  },
  {
    path: "/developer-tools",
    label: "Developer Tools",
    title: "Free Developer Tools - JSON, Base64, JWT, Regex & More | X Toolkit",
    description:
      "Free developer tools: JSON formatter, Base64 encoder, JWT decoder, regex tester, SQL formatter, UUID generator, YAML converter & more.",
  },
  {
    path: "/seo-tools",
    label: "SEO Tools",
    title: "Free SEO Tools - Meta Tags, Slug Generator & Keyword Checker | X Toolkit",
    description:
      "Free SEO tools: meta tag generator, URL slug generator, keyword density checker, robots.txt generator, OG image preview & more.",
  },
  {
    path: "/email-tools",
    label: "Email Tools",
    title: "Free Email Tools - Temp Mail, Validator, Signature & More | X Toolkit",
    description:
      "Free email tools: temp mail, email validator, signature generator, subject line generator, spam checker, privacy checker & more.",
  },
  // Blog posts
  {
    path: "/blog/what-is-disposable-email",
    label: "What Is Disposable Email?",
    title: "What Is Disposable Email? Complete Guide | X Toolkit Blog",
    description:
      "Everything you need to know about disposable email addresses — how they work, when to use them, and the best services available.",
  },
  {
    path: "/blog/best-temp-mail-services",
    label: "Best Temp Mail Services",
    title: "Best Temp Mail Services in 2026 | X Toolkit Blog",
    description:
      "Reviewed: the best temporary email services in 2026. Compare features, inbox limits, and privacy policies to find the right tool.",
  },
  {
    path: "/blog/temp-mail-vs-gmail",
    label: "Temp Mail vs Gmail",
    title: "Temp Mail vs Gmail: When to Use Which | X Toolkit Blog",
    description:
      "Should you use temp mail or Gmail? A practical comparison of disposable email vs. a real Gmail account for different use cases.",
  },
  {
    path: "/blog/is-temp-mail-safe",
    label: "Is Temp Mail Safe?",
    title: "Is Temp Mail Safe? Privacy & Security Guide | X Toolkit Blog",
    description:
      "Is it safe to use a temporary email address? We examine privacy, security risks, and best practices for using temp mail services.",
  },
  {
    path: "/blog/why-websites-ask-email-verification",
    label: "Why Websites Ask for Email Verification",
    title: "Why Websites Ask for Email Verification | X Toolkit Blog",
    description:
      "Why do websites require email verification? Learn the technical and business reasons — and how to work around them responsibly.",
  },
  {
    path: "/blog/temp-gmail-explained",
    label: "Temp Gmail Explained",
    title: "Temp Gmail Explained: Gmail Tricks for Privacy | X Toolkit Blog",
    description:
      "How to use Gmail's plus-addressing and dot tricks to create multiple addresses. A complete guide to temporary Gmail usage.",
  },
];

// Temp-mail sub-routes (manually defined since they share a parent page)
const TEMP_MAIL_SUB_ROUTES = [
  {
    path: "/tools/temp-mail/tempemail",
    label: "Disposable Email Inbox",
    title: "Disposable Email Inbox - Free Temporary Email | X Toolkit",
    description:
      "Get a free disposable email inbox instantly. No signup, auto-refresh, works with any service. Protect your real email address online.",
    category: "email",
    sitemapPriority: 0.95,
  },
  {
    path: "/tools/temp-mail/tempgmail",
    label: "Temp Gmail",
    title: "Temp Gmail - Temporary Gmail Address Tricks | X Toolkit",
    description:
      "Use Gmail dot tricks and plus-addressing to create unlimited temporary Gmail addresses. Free guide and generator tool online.",
    category: "email",
    sitemapPriority: 0.90,
  },
  {
    path: "/tools/temp-mail/gmail-tricks",
    label: "Gmail Tricks",
    title: "Gmail Dot & Plus Tricks - Create Unlimited Gmail Aliases | X Toolkit",
    description:
      "Learn Gmail's plus-addressing and dot trick to create unlimited aliases. Use john.doe@gmail.com and johndoe@gmail.com interchangeably.",
    category: "email",
    sitemapPriority: 0.85,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Maps tool category → schema.org applicationCategory value.
 * Gives each tool the most accurate category for Google Rich Results.
 */
const CATEGORY_TO_APP_CATEGORY = {
  "social-media":    "SocialNetworkingApplication",
  "ai-writing":      "UtilitiesApplication",
  "text-formatting": "UtilitiesApplication",
  "developer":       "DeveloperApplication",
  "seo":             "BusinessApplication",
  "email":           "CommunicationApplication",
};

/**
 * Strips homepage-only JSON-LD blocks (WebApplication, ItemList) from the
 * template HTML so they don't appear on tool/static pages — only the homepage
 * should carry those schemas.
 */
function stripHomepageSchemas(html) {
  return html.replace(
    /<script type="application\/ld\+json">[\s\S]*?"@type":\s*"(?:WebApplication|ItemList)"[\s\S]*?<\/script>\n?/g,
    "",
  );
}

function jsonLdTag(obj) {
  return `    <script type="application/ld+json">\n    ${JSON.stringify(obj, null, 2)
    .split("\n")
    .join("\n    ")}\n    </script>`;
}

/**
 * Builds the SoftwareApplication + BreadcrumbList schemas for a tool page.
 * All recommended properties are included to pass Google Rich Results Test.
 */
function buildToolSchema(tool, canonicalUrl) {
  const appCategory =
    CATEGORY_TO_APP_CATEGORY[tool.category] ?? "UtilitiesApplication";

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.label,
    url: canonicalUrl,
    description: tool.seoDescription || tool.description,
    applicationCategory: appCategory,
    operatingSystem: "Web",
    softwareVersion: "1.0",
    screenshot: `${SITE_URL}/opengraph.jpg`,
    author: {
      "@type": "Organization",
      name: "X Toolkit",
      url: SITE_URL + "/",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "X Toolkit", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: "Tools", item: SITE_URL + "/tools" },
      { "@type": "ListItem", position: 3, name: tool.label, item: canonicalUrl },
    ],
  };

  return [jsonLdTag(softwareApp), jsonLdTag(breadcrumb)].join("\n");
}

function buildNoscript(page, tool) {
  if (page.isHomepage) {
    const toolLinks = LIVE_TOOLS.map(
      (t) =>
        `      <li><a href="${SITE_URL}${t.href}">${escapeHtml(t.label)}</a> — ${escapeHtml(t.seoDescription || t.description)}</li>`,
    ).join("\n");

    return `  <noscript>
    <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
      <h1>X Toolkit — ${LIVE_TOOLS.length}+ Free Online Tools</h1>
      <p>${escapeHtml(page.description)}</p>
      <h2>All ${LIVE_TOOLS.length} Free Tools</h2>
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

  if (tool) {
    const relatedTools = LIVE_TOOLS.filter(
      (t) => t.category === tool.category && t.id !== tool.id,
    ).slice(0, 5);
    const relatedLinks = relatedTools
      .map((t) => `<a href="${SITE_URL}${t.href}">${escapeHtml(t.label)}</a>`)
      .join(", ");

    return `  <noscript>
    <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
      <h1>${escapeHtml(tool.seoTitle || tool.label)}</h1>
      <p>${escapeHtml(tool.seoDescription || tool.description)}</p>
      ${relatedLinks ? `<p>Related tools: ${relatedLinks}</p>` : ""}
      <p><a href="${SITE_URL}/tools">Browse all ${LIVE_TOOLS.length} free tools</a></p>
    </div>
  </noscript>`;
  }

  return `  <noscript>
    <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <p><a href="${SITE_URL}/tools">Browse all ${LIVE_TOOLS.length} free tools</a></p>
    </div>
  </noscript>`;
}

function generatePageHtml(template, { path, title, description, isHomepage, category }, tool) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);

  // For non-homepage pages, strip the homepage-only schemas (WebApplication,
  // ItemList) so they don't pollute tool and static pages.
  let html = isHomepage ? template : stripHomepageSchemas(template);

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/,  `$1${safeDesc}$2`);
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,  `$1${safeTitle}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,  `$1${safeDesc}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,  `$1${canonicalUrl}$2`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,  `$1${safeTitle}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,  `$1${safeDesc}$2`);
  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/,  `$1${canonicalUrl}$2`);

  // Tool and category pages get SoftwareApplication + BreadcrumbList.
  // Homepage already has complete schemas from the template — no injection needed.
  let schemaBlock = "";
  if (!isHomepage && (tool || category)) {
    schemaBlock = buildToolSchema(
      tool || { label: title, seoDescription: description, id: "", category },
      canonicalUrl,
    );
  }

  const noscriptBlock = buildNoscript({ path, title, description, isHomepage }, tool);
  const injection = `${schemaBlock ? schemaBlock + "\n" : ""}${noscriptBlock}`;
  html = html.replace("</head>", `${injection}\n  </head>`);

  return html;
}

// Auto-generate sitemap-tools.xml from manifest

function generateSitemapTools() {
  const DEFAULT_PRIORITY = {
    Popular: 0.85,
    AI: 0.85,
    New: 0.75,
    undefined: 0.70,
  };

  const toolEntries = LIVE_TOOLS.map((t) => {
    const priority =
      t.sitemapPriority ??
      DEFAULT_PRIORITY[t.badge] ??
      0.70;
    return `  <url>
    <loc>${SITE_URL}${t.href}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${priority >= 0.90 ? "daily" : priority >= 0.80 ? "weekly" : "monthly"}</changefreq>
    <priority>${priority.toFixed(2)}</priority>
  </url>`;
  }).join("\n");

  const subRouteEntries = TEMP_MAIL_SUB_ROUTES.map((r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.sitemapPriority >= 0.90 ? "daily" : "weekly"}</changefreq>
    <priority>${r.sitemapPriority.toFixed(2)}</priority>
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  sitemap-tools.xml — auto-generated by prerender.mjs on each production build.
  Source of truth: src/lib/tools-manifest.json
  Last generated: ${TODAY}
  Total live tools: ${LIVE_TOOLS.length}
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${toolEntries}

${subRouteEntries}

</urlset>
`;
}

// Main

function main() {
  console.log(`🔍 Reading built index.html template…`);
  const template = readFileSync(join(DIST, "index.html"), "utf-8");

  let count = 0;

  // 1. Static pages
  for (const page of STATIC_PAGES) {
    const segments = page.path.split("/").filter(Boolean);
    const pageDir = segments.length > 0 ? join(DIST, ...segments) : null;
    let outputPath;
    if (pageDir) {
      mkdirSync(pageDir, { recursive: true });
      outputPath = join(pageDir, "index.html");
    } else {
      outputPath = join(DIST, "index.html"); // homepage overwrites root
    }
    writeFileSync(outputPath, generatePageHtml(template, page, null), "utf-8");
    console.log(`  ✅ ${page.path}`);
    count++;
  }

  // 2. Tool pages (from manifest — automatically picks up new tools)
  for (const tool of LIVE_TOOLS) {
    const segments = tool.href.split("/").filter(Boolean);
    const pageDir = join(DIST, ...segments);
    mkdirSync(pageDir, { recursive: true });
    const outputPath = join(pageDir, "index.html");
    const page = {
      path: tool.href,
      title: tool.seoTitle || `${tool.label} | X Toolkit`,
      description: tool.seoDescription || tool.description,
      category: tool.category,
    };
    writeFileSync(outputPath, generatePageHtml(template, page, tool), "utf-8");
    console.log(`  ✅ ${tool.href}`);
    count++;
  }

  // 3. Temp-mail sub-routes
  for (const sub of TEMP_MAIL_SUB_ROUTES) {
    const segments = sub.path.split("/").filter(Boolean);
    const pageDir = join(DIST, ...segments);
    mkdirSync(pageDir, { recursive: true });
    const outputPath = join(pageDir, "index.html");
    const page = { path: sub.path, title: sub.title, description: sub.description, category: sub.category };
    const fakeTool = { label: sub.label, seoTitle: sub.title, seoDescription: sub.description, category: sub.category, id: sub.path };
    writeFileSync(outputPath, generatePageHtml(template, page, fakeTool), "utf-8");
    console.log(`  ✅ ${sub.path}`);
    count++;
  }

  // 4. Auto-generate sitemap-tools.xml
  const sitemapPath = join(DIST, "sitemap-tools.xml");
  writeFileSync(sitemapPath, generateSitemapTools(), "utf-8");
  console.log(`\n  📍 sitemap-tools.xml → ${LIVE_TOOLS.length} tools + ${TEMP_MAIL_SUB_ROUTES.length} sub-routes`);

  console.log(`\n🎉 Prerender complete: ${count} pages generated.`);
  console.log(`   Output: ${DIST}`);
  console.log(`\n💡 To add a new tool:`);
  console.log(`   1. Add entry to src/lib/tools-manifest.json`);
  console.log(`   2. Add icon to ICON_MAP in src/lib/tools-registry.ts`);
  console.log(`   Done — prerender + sitemap update automatically on next build.`);
}

main();
