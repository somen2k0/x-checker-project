import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Code2, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "What is schema markup?", a: "Schema markup is structured data added to your HTML that helps search engines understand your content. It uses vocabulary from Schema.org and is formatted as JSON-LD, Microdata, or RDFa. JSON-LD is Google's preferred format." },
  { q: "Does schema markup directly improve rankings?", a: "Schema doesn't directly boost rankings, but it enables rich results (star ratings, FAQs, breadcrumbs in SERPs) which significantly improve click-through rates. Higher CTR signals quality to Google and can indirectly improve rankings." },
  { q: "Which schema types are most valuable for SEO?", a: "FAQ Schema, Article Schema, Product Schema (with reviews), LocalBusiness Schema, and BreadcrumbList are the most impactful. FAQ Schema is particularly effective — it can double your SERP real estate." },
  { q: "How do I add schema markup to my website?", a: "Paste the JSON-LD script tag in the <head> section of your HTML, or just before </body>. In WordPress, use a plugin like RankMath or Yoast. In React/Next.js, use a <script type='application/ld+json'> tag." },
  { q: "How do I test if my schema is valid?", a: "Use Google's Rich Results Test (search.google.com/test/rich-results) or Schema.org's Markup Validator. After deploying, check Google Search Console's Enhancements section for rich result eligibility." },
];

const relatedTools = [
  { title: "Meta Tag Generator", href: "/tools/meta-tag-generator", description: "Generate optimized SEO meta tags for any page." },
  { title: "Robots.txt Generator", href: "/tools/robots-txt-generator", description: "Create a robots.txt file for your site." },
  { title: "URL Slug Generator", href: "/tools/url-slug-generator", description: "Generate SEO-friendly URL slugs from any title." },
];

type SchemaType = "Article" | "FAQPage" | "LocalBusiness" | "Product" | "BreadcrumbList" | "WebSite" | "Person" | "Organization";

interface FaqEntry { q: string; a: string; }

function buildArticleSchema(data: Record<string, string>): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline || "Article Title",
    description: data.description || "",
    author: { "@type": "Person", name: data.author || "Author Name" },
    publisher: { "@type": "Organization", name: data.publisher || "Publisher Name", logo: { "@type": "ImageObject", url: data.logoUrl || "" } },
    datePublished: data.datePublished || new Date().toISOString().split("T")[0],
    dateModified: data.dateModified || new Date().toISOString().split("T")[0],
    url: data.url || "",
    image: data.image || "",
  };
}

function buildFaqSchema(faqs: FaqEntry[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.filter(f => f.q && f.a).map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function buildLocalBusinessSchema(data: Record<string, string>): object {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.name || "Business Name",
    description: data.description || "",
    url: data.url || "",
    telephone: data.phone || "",
    address: {
      "@type": "PostalAddress",
      streetAddress: data.street || "",
      addressLocality: data.city || "",
      addressRegion: data.state || "",
      postalCode: data.zip || "",
      addressCountry: data.country || "US",
    },
    openingHours: data.hours || "",
  };
}

function buildProductSchema(data: Record<string, string>): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name || "Product Name",
    description: data.description || "",
    image: data.image || "",
    brand: { "@type": "Brand", name: data.brand || "" },
    offers: {
      "@type": "Offer",
      price: data.price || "0",
      priceCurrency: data.currency || "USD",
      availability: "https://schema.org/InStock",
      url: data.url || "",
    },
    aggregateRating: data.rating ? {
      "@type": "AggregateRating",
      ratingValue: data.rating,
      reviewCount: data.reviewCount || "1",
    } : undefined,
  };
}

function buildWebSiteSchema(data: Record<string, string>): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name || "Website Name",
    url: data.url || "",
    description: data.description || "",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${data.url || ""}/?s={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

function buildPersonSchema(data: Record<string, string>): object {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name || "Full Name",
    url: data.url || "",
    jobTitle: data.jobTitle || "",
    worksFor: data.employer ? { "@type": "Organization", name: data.employer } : undefined,
    sameAs: [data.twitter, data.linkedin, data.github].filter(Boolean),
  };
}

export default function SchemaGenerator() {
  const [schemaType, setSchemaType] = useState<SchemaType>("Article");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [faqEntries, setFaqEntries] = useState<FaqEntry[]>([{ q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }]);
  const [generated, setGenerated] = useState("");
  const { toast } = useToast();
  useToolView("schema-generator");

  const setField = (key: string, val: string) => setFields(prev => ({ ...prev, [key]: val }));
  const setFaqField = (i: number, key: keyof FaqEntry, val: string) => {
    setFaqEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e));
  };

  const generate = () => {
    let schema: object;
    switch (schemaType) {
      case "Article": schema = buildArticleSchema(fields); break;
      case "FAQPage": schema = buildFaqSchema(faqEntries); break;
      case "LocalBusiness": schema = buildLocalBusinessSchema(fields); break;
      case "Product": schema = buildProductSchema(fields); break;
      case "WebSite": schema = buildWebSiteSchema(fields); break;
      case "Person": schema = buildPersonSchema(fields); break;
      default: schema = { "@context": "https://schema.org", "@type": schemaType };
    }
    setGenerated(JSON.stringify(schema, null, 2));
  };

  const copySchema = () => {
    const wrapped = `<script type="application/ld+json">\n${generated}\n</script>`;
    navigator.clipboard.writeText(wrapped);
    toast({ title: "Copied!", description: "Schema markup copied with script tags." });
  };

  const SCHEMA_TYPES: { type: SchemaType; label: string; desc: string }[] = [
    { type: "Article", label: "Article", desc: "Blog posts, news articles" },
    { type: "FAQPage", label: "FAQ Page", desc: "Q&A pages, help docs" },
    { type: "LocalBusiness", label: "Local Business", desc: "Restaurants, shops, services" },
    { type: "Product", label: "Product", desc: "E-commerce products" },
    { type: "WebSite", label: "Website", desc: "Site-level schema + search" },
    { type: "Person", label: "Person", desc: "Personal/author profiles" },
  ];

  return (
    <MiniToolLayout
      seoTitle="JSON-LD Schema Generator — Free Structured Data Markup Generator"
      seoDescription="Generate JSON-LD structured data schema markup for SEO. Supports Article, FAQ, LocalBusiness, Product, Person, and WebSite schemas. Free, instant, no login."
      icon={Code2}
      badge="SEO Tool"
      title="Schema Generator"
      description="Generate valid JSON-LD structured data markup for your website. Choose a schema type, fill in the fields, and copy the ready-to-use script tag — no coding required."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="analytics"
    >
      <div className="space-y-5">
        {/* Schema type selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Schema Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SCHEMA_TYPES.map(({ type, label, desc }) => (
              <button
                key={type}
                onClick={() => { setSchemaType(type); setGenerated(""); setFields({}); }}
                className={`rounded-xl border p-3 text-left transition-colors ${schemaType === type ? "border-primary/50 bg-primary/10" : "border-border/60 bg-card/30 hover:border-border"}`}
              >
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{schemaType} Fields</h3>

          {schemaType === "Article" && (
            <div className="space-y-3">
              {[
                { key: "headline", label: "Headline / Title", placeholder: "How to Build Better SEO in 2025" },
                { key: "description", label: "Description", placeholder: "A brief description of the article" },
                { key: "author", label: "Author Name", placeholder: "Jane Smith" },
                { key: "publisher", label: "Publisher Name", placeholder: "YourBlog.com" },
                { key: "url", label: "Article URL", placeholder: "https://yourblog.com/article" },
                { key: "image", label: "Featured Image URL", placeholder: "https://yourblog.com/image.jpg" },
                { key: "datePublished", label: "Published Date", placeholder: "2025-01-15" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Input value={fields[key] || ""} onChange={e => setField(key, e.target.value)} placeholder={placeholder} className="text-sm bg-background/60 border-border/60 h-8" />
                </div>
              ))}
            </div>
          )}

          {schemaType === "FAQPage" && (
            <div className="space-y-3">
              {faqEntries.map((entry, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-border/40 bg-background/30 p-3">
                  <label className="text-xs text-muted-foreground font-medium">Q&A #{i + 1}</label>
                  <Input value={entry.q} onChange={e => setFaqField(i, "q", e.target.value)} placeholder="Question text" className="text-sm bg-background/60 border-border/60 h-8" />
                  <Textarea value={entry.a} onChange={e => setFaqField(i, "a", e.target.value)} placeholder="Answer text" className="text-sm bg-background/60 border-border/60 resize-none" rows={2} />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setFaqEntries(prev => [...prev, { q: "", a: "" }])} className="border-border/60 text-xs gap-1">
                + Add Q&A
              </Button>
            </div>
          )}

          {schemaType === "LocalBusiness" && (
            <div className="space-y-3">
              {[
                { key: "name", label: "Business Name", placeholder: "Joe's Pizza" },
                { key: "url", label: "Website URL", placeholder: "https://joespizza.com" },
                { key: "phone", label: "Phone", placeholder: "+1-555-000-0000" },
                { key: "street", label: "Street Address", placeholder: "123 Main St" },
                { key: "city", label: "City", placeholder: "New York" },
                { key: "state", label: "State/Region", placeholder: "NY" },
                { key: "zip", label: "ZIP / Postal Code", placeholder: "10001" },
                { key: "country", label: "Country Code", placeholder: "US" },
                { key: "hours", label: "Opening Hours", placeholder: "Mo-Fr 09:00-17:00" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Input value={fields[key] || ""} onChange={e => setField(key, e.target.value)} placeholder={placeholder} className="text-sm bg-background/60 border-border/60 h-8" />
                </div>
              ))}
            </div>
          )}

          {schemaType === "Product" && (
            <div className="space-y-3">
              {[
                { key: "name", label: "Product Name", placeholder: "Premium Widget Pro" },
                { key: "description", label: "Description", placeholder: "A high-quality widget for professionals" },
                { key: "brand", label: "Brand Name", placeholder: "WidgetCo" },
                { key: "price", label: "Price", placeholder: "49.99" },
                { key: "currency", label: "Currency Code", placeholder: "USD" },
                { key: "url", label: "Product URL", placeholder: "https://store.com/product" },
                { key: "image", label: "Product Image URL", placeholder: "https://store.com/image.jpg" },
                { key: "rating", label: "Average Rating (optional)", placeholder: "4.8" },
                { key: "reviewCount", label: "Review Count (optional)", placeholder: "142" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Input value={fields[key] || ""} onChange={e => setField(key, e.target.value)} placeholder={placeholder} className="text-sm bg-background/60 border-border/60 h-8" />
                </div>
              ))}
            </div>
          )}

          {schemaType === "WebSite" && (
            <div className="space-y-3">
              {[
                { key: "name", label: "Site Name", placeholder: "My Awesome Website" },
                { key: "url", label: "Site URL", placeholder: "https://mysite.com" },
                { key: "description", label: "Description", placeholder: "A website about..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Input value={fields[key] || ""} onChange={e => setField(key, e.target.value)} placeholder={placeholder} className="text-sm bg-background/60 border-border/60 h-8" />
                </div>
              ))}
            </div>
          )}

          {schemaType === "Person" && (
            <div className="space-y-3">
              {[
                { key: "name", label: "Full Name", placeholder: "Jane Smith" },
                { key: "url", label: "Website / About URL", placeholder: "https://janesmith.com" },
                { key: "jobTitle", label: "Job Title", placeholder: "Software Engineer" },
                { key: "employer", label: "Employer / Company", placeholder: "Acme Corp" },
                { key: "twitter", label: "Twitter/X URL", placeholder: "https://x.com/janesmith" },
                { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/janesmith" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Input value={fields[key] || ""} onChange={e => setField(key, e.target.value)} placeholder={placeholder} className="text-sm bg-background/60 border-border/60 h-8" />
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={generate} className="w-full">
          <Code2 className="h-4 w-4 mr-2" /> Generate Schema
        </Button>

        {generated && (
          <div className="space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Generated JSON-LD</label>
              <Button variant="outline" size="sm" onClick={copySchema} className="border-border/60 gap-1.5 text-xs h-7">
                <Copy className="h-3 w-3" /> Copy with &lt;script&gt; tag
              </Button>
            </div>
            <pre className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs font-mono text-foreground/90 overflow-auto max-h-80 whitespace-pre-wrap">{generated}</pre>
            <p className="text-xs text-muted-foreground">Paste inside a <code className="bg-muted/40 px-1 rounded">{"<script type=\"application/ld+json\">"}</code> tag in your HTML <code className="bg-muted/40 px-1 rounded">{"<head>"}</code>.</p>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
