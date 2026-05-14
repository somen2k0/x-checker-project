import { type LucideIcon, ArrowRight, ChevronRight, Home, Calendar, Clock, BookOpen } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Layout } from "./Layout";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailCapture } from "@/components/monetization/EmailCapture";

interface RelatedArticle {
  title: string;
  href: string;
  description: string;
  readTime?: string;
}

interface RelatedTool {
  title: string;
  href: string;
  description: string;
  icon?: LucideIcon;
}

interface BlogLayoutProps {
  seoTitle: string;
  seoDescription: string;
  title: string;
  description: string;
  icon: LucideIcon;
  readTime?: string;
  publishDate?: string;
  category?: string;
  relatedArticles?: RelatedArticle[];
  relatedTools?: RelatedTool[];
  children: React.ReactNode;
}

const SITE_URL = "https://xtoolkit.live";

export function BlogLayout({
  seoTitle,
  seoDescription,
  title,
  description,
  icon: Icon,
  readTime = "5 min read",
  publishDate = "2025",
  category = "Email & Privacy",
  relatedArticles = [],
  relatedTools = [],
  children,
}: BlogLayoutProps) {
  const [path] = useLocation();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}${path}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: seoDescription,
    author: { "@type": "Organization", name: "X Toolkit" },
    publisher: { "@type": "Organization", name: "X Toolkit", url: SITE_URL },
    datePublished: publishDate,
    url: `${SITE_URL}${path}`,
  };

  return (
    <Layout>
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        path={path}
        extraSchemas={[breadcrumbSchema, articleSchema]}
      />

      {/* Hero */}
      <div className="border-b border-border/50 bg-gradient-to-b from-cyan-500/[0.04] to-transparent">
        <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
            <Link href="/"><span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"><Home className="h-3 w-3" /> Home</span></Link>
            <ChevronRight className="h-3 w-3 opacity-40" />
            <Link href="/blog"><span className="hover:text-foreground transition-colors cursor-pointer">Blog</span></Link>
            <ChevronRight className="h-3 w-3 opacity-40" />
            <span className="text-foreground font-medium truncate">{title}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-sm shadow-cyan-500/10">
              <Icon className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="border-cyan-400/30 text-cyan-400 bg-cyan-400/8 text-xs">
                  {category}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {readTime}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {publishDate}
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-3">{title}</h1>
              <p className="text-muted-foreground leading-relaxed max-w-2xl text-sm md:text-base">{description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-12">
        {/* Article content */}
        <article className="prose prose-invert prose-sm md:prose-base max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-foreground
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-foreground
          prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
          prose-li:text-muted-foreground prose-li:leading-relaxed
          prose-strong:text-foreground prose-strong:font-semibold
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-code:text-primary prose-code:bg-muted/60 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
          prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground
          prose-hr:border-border/40
        ">
          {children}
        </article>

        {/* Email capture */}
        <div className="mt-12">
          <EmailCapture
            variant="banner"
            headline="Stay updated on privacy tools and guides"
            subline="New articles, tool updates, and privacy tips. No spam, unsubscribe anytime."
            source="blog"
          />
        </div>

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Free Tools Mentioned
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedTools.map(({ title: t, href, description: d, icon: TIcon }) => (
                <Link key={href} href={href}>
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4 hover:border-primary/30 hover:bg-card transition-all cursor-pointer group">
                    <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                      {TIcon ? <TIcon className="h-4 w-4 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                        {t} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{d}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-5">Related Articles</h2>
            <div className="space-y-3">
              {relatedArticles.map(({ title: t, href, description: d, readTime: rt }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/40 p-4 hover:border-cyan-400/30 hover:bg-card transition-all cursor-pointer group">
                    <div className="h-8 w-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium group-hover:text-primary transition-colors">{t}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{d}</div>
                    </div>
                    {rt && <span className="text-xs text-muted-foreground shrink-0">{rt}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1">Try our free email tools</h3>
            <p className="text-sm text-muted-foreground">Temp mail, email validator, privacy checkers — all free, no signup.</p>
          </div>
          <Link href="/email-tools">
            <Button className="shrink-0 shadow-sm shadow-primary/20 whitespace-nowrap">
              Browse Email Tools <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
