import { Link } from "wouter";
import { type LucideIcon, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/SeoHead";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type Tool } from "@/lib/tools-registry";

const SITE_URL = "https://xtoolkit.live";

export interface CategoryBenefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface CategoryUseCase {
  title: string;
  description: string;
}

export interface RelatedCategory {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface CategoryPageConfig {
  path: string;
  seoTitle: string;
  seoDescription: string;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  heroGradient: string;
  tools: Tool[];
  comingSoon?: boolean;
  whatIs: string;
  benefits: CategoryBenefit[];
  useCases: CategoryUseCase[];
  faqs: { q: string; a: string }[];
  relatedCategories: RelatedCategory[];
}

export function CategoryLandingPage({ config }: { config: CategoryPageConfig }) {
  const {
    path, seoTitle, seoDescription, title, tagline, description,
    icon: Icon, color, bg, heroGradient, tools, comingSoon,
    whatIs, benefits, useCases, faqs, relatedCategories,
  } = config;

  const liveTools = tools.filter((t) => !t.isComingSoon);
  const canonicalUrl = `${SITE_URL}${path}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
      { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonicalUrl,
    url: canonicalUrl,
    name: seoTitle,
    description: seoDescription,
    breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
    isPartOf: { "@type": "WebSite", url: SITE_URL },
  };

  const itemListSchema = liveTools.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${title} — X Toolkit`,
        description: seoDescription,
        numberOfItems: liveTools.length,
        itemListElement: liveTools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.label,
          description: t.description,
          url: `${SITE_URL}${t.href.split("?")[0]}`,
        })),
      }
    : null;

  const extraSchemas = [
    breadcrumbSchema,
    webPageSchema,
    ...(itemListSchema ? [itemListSchema] : []),
  ];

  return (
    <Layout>
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        path={path}
        faqs={faqs}
        extraSchemas={extraSchemas}
      />

      {/* ── Hero ── */}
      <section className={`relative overflow-hidden border-b border-border/50 ${heroGradient}`}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-10 pb-12 md:pt-14 md:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link href="/"><span className="hover:text-foreground transition-colors cursor-pointer">Home</span></Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/tools"><span className="hover:text-foreground transition-colors cursor-pointer">Tools</span></Link>
            <ChevronRight className="h-3 w-3" />
            <span className={`font-medium ${color}`}>{title}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="flex-1">
              {/* Icon + badge row */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shadow-sm ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                {comingSoon ? (
                  <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground text-xs">
                    Coming Soon
                  </Badge>
                ) : (
                  <Badge variant="outline" className={`border-current/30 bg-current/5 text-xs font-medium ${color}`}>
                    {liveTools.length} Free {liveTools.length === 1 ? "Tool" : "Tools"}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{title}</h1>
              <p className={`text-base md:text-lg font-medium mb-3 ${color}`}>{tagline}</p>
              <p className="text-muted-foreground leading-relaxed max-w-xl text-sm md:text-base mb-6">
                {description}
              </p>

              <div className="flex flex-wrap gap-3">
                {!comingSoon && liveTools.length > 0 && (
                  <a href="#tools">
                    <Button className="shadow-sm shadow-primary/20">
                      Browse {liveTools.length} {liveTools.length === 1 ? "Tool" : "Tools"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                )}
                <Link href="/tools">
                  <Button variant="outline" className="border-border/60 hover:bg-muted/50">
                    All Categories
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            {!comingSoon && (
              <div className="shrink-0 grid grid-cols-2 gap-3 md:grid-cols-1 md:w-40">
                {[
                  { value: `${liveTools.length}`, label: "Free tools" },
                  { value: "0", label: "Signup needed" },
                  { value: "Free", label: "Forever" },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm p-4 text-center">
                    <div className={`text-xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* ── Tool Grid ── */}
        {!comingSoon && liveTools.length > 0 && (
          <section id="tools" className="py-12 md:py-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold tracking-tight">{title}</h2>
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground">{liveTools.length} tools</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon placeholder */}
        {comingSoon && (
          <section className="py-12 md:py-16 text-center">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-10 md:p-14">
              <div className={`h-14 w-14 rounded-xl border mx-auto mb-4 flex items-center justify-center ${bg}`}>
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <h2 className="text-xl font-bold mb-2">These tools are on their way</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                We're actively building this category. Subscribe below to get notified the moment they go live.
              </p>
              <Link href="/tools">
                <Button variant="outline" className="border-border/60">Browse available tools →</Button>
              </Link>
            </div>
          </section>
        )}

        {/* ── What Are These Tools ── */}
        <section className="py-12 border-t border-border/50">
          <div className="grid md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-2">
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-4 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">What are {title}?</h2>
              <p className={`text-sm font-medium ${color}`}>{tagline}</p>
            </div>
            <div className="md:col-span-3">
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{whatIs}</p>
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-12 border-t border-border/50">
          <h2 className="text-xl font-bold tracking-tight mb-6">Why use {title}?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map(({ icon: BIcon, title: btitle, description: bdesc }) => (
              <div key={btitle} className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-2.5">
                <div className={`h-9 w-9 rounded-lg border flex items-center justify-center ${bg}`}>
                  <BIcon className={`h-4.5 w-4.5 ${color}`} style={{ height: "1.125rem", width: "1.125rem" }} />
                </div>
                <h3 className="text-sm font-semibold">{btitle}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{bdesc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Use Cases ── */}
        <section className="py-12 border-t border-border/50">
          <h2 className="text-xl font-bold tracking-tight mb-2">Common use cases</h2>
          <p className="text-sm text-muted-foreground mb-6">Real scenarios where these tools save time.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {useCases.map(({ title: utitle, description: udesc }) => (
              <div key={utitle} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
                <CheckCircle2 className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${color}`} style={{ height: "1.125rem", width: "1.125rem" }} />
                <div>
                  <h3 className="text-sm font-semibold mb-1">{utitle}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{udesc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-12 border-t border-border/50">
          <h2 className="text-xl font-bold tracking-tight mb-6">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border/60 bg-card/40 px-5 data-[state=open]:bg-card/70 transition-colors"
              >
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ── Related Categories ── */}
        {relatedCategories.length > 0 && (
          <section className="py-12 border-t border-border/50">
            <h2 className="text-xl font-bold tracking-tight mb-2">Explore other categories</h2>
            <p className="text-sm text-muted-foreground mb-6">More free tools in other areas.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedCategories.map(({ title: rtitle, href, description: rdesc, icon: RIcon, color: rcolor, bg: rbg }) => (
                <Link key={href} href={href}>
                  <div className="group rounded-xl border border-border/60 bg-card/40 p-5 hover:border-primary/30 hover:bg-card hover:shadow-sm transition-all cursor-pointer">
                    <div className={`h-9 w-9 rounded-lg border flex items-center justify-center mb-3 ${rbg}`}>
                      <RIcon className={`h-4.5 w-4.5 ${rcolor}`} style={{ height: "1.125rem", width: "1.125rem" }} />
                    </div>
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors mb-1">{rtitle}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rdesc}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground/50 group-hover:text-primary transition-colors">
                      Explore <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Bottom CTA ── */}
        <section className="py-12 border-t border-border/50">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-8 md:p-10 text-center">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Ready to try these tools?</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              All tools are 100% free, no signup required, and work instantly in your browser.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!comingSoon && liveTools.length > 0 && (
                <a href="#tools">
                  <Button className="shadow-sm shadow-primary/20">
                    Browse {title} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              )}
              <Link href="/tools">
                <Button variant="outline" className="border-border/60">
                  All 16+ Free Tools
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
