import { type LucideIcon, ArrowRight, Wrench } from "lucide-react";
import { Link } from "wouter";
import { Layout } from "./Layout";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmailCapture } from "@/components/monetization/EmailCapture";
import { AffiliateSection } from "@/components/monetization/AffiliateSection";
import { StickyUpgradeCTA } from "@/components/monetization/StickyUpgradeCTA";

interface RelatedTool {
  title: string;
  href: string;
  description: string;
  icon?: LucideIcon;
}

interface Faq {
  q: string;
  a: string;
}

interface MiniToolLayoutProps {
  seoTitle: string;
  seoDescription: string;
  icon: LucideIcon;
  badge?: string;
  title: string;
  description: string;
  faqs: Faq[];
  relatedTools: RelatedTool[];
  children: React.ReactNode;
  affiliateCategory?: "scheduling" | "design" | "monetize" | "growth" | "analytics" | "all";
}

export function MiniToolLayout({
  seoTitle,
  seoDescription,
  icon: Icon,
  badge = "Free Tool",
  title,
  description,
  faqs,
  relatedTools,
  children,
  affiliateCategory = "all",
}: MiniToolLayoutProps) {
  return (
    <Layout>
      <SeoHead title={seoTitle} description={seoDescription} faqs={faqs} />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-12">

        {/* Page header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/8 text-xs">
              {badge}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
        </div>

        {/* Tool content */}
        <div>{children}</div>

        {/* Email capture — pro waitlist */}
        <EmailCapture
          variant="banner"
          headline="Pro features are coming — join the waitlist"
          subline="Bulk checking, CSV export, AI bios, no ads. Get 40% off launch pricing."
          source={seoTitle.split("—")[0].trim().toLowerCase().replace(/\s+/g, "_")}
        />

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold mb-5">Frequently Asked Questions</h2>
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

        {/* Affiliate section */}
        <AffiliateSection category={affiliateCategory} limit={4} />

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-5">Related Tools</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedTools.map(({ title: t, href, description: d, icon: TIcon }) => (
                <Link key={href} href={href}>
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4 hover:border-primary/30 hover:bg-card transition-all cursor-pointer group">
                    <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                      {TIcon ? <TIcon className="h-4 w-4 text-muted-foreground" /> : <Wrench className="h-4 w-4 text-muted-foreground" />}
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

        {/* CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1">Explore all tools</h3>
            <p className="text-sm text-muted-foreground">16+ free tools — X tools, AI writing, developer utilities, and more. No signup required.</p>
          </div>
          <Link href="/tools">
            <Button className="shrink-0 shadow-sm shadow-primary/20 whitespace-nowrap">
              Browse All Tools <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

      </div>

      {/* Sticky upgrade bar — appears after 20s */}
      <StickyUpgradeCTA delay={20000} />
    </Layout>
  );
}
