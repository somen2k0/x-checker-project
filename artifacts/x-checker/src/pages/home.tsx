import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToolCard } from "@/components/ToolCard";
import { CATEGORIES, LIVE_TOOLS, TOTAL_LIVE, getPopularTools, getNewTools, getToolsByCategory } from "@/lib/tools-registry";
import { trackEvent } from "@/lib/analytics";
import {
  CheckCircle2, Zap, Shield, Star, ArrowRight, Users,
} from "lucide-react";

const CATEGORY_ORDER: import("@/lib/tools-registry").CategoryKey[] = [
  "social-media",
  "ai-writing",
  "text-formatting",
  "developer",
  "seo",
];

const TESTIMONIALS = [
  {
    quote: "Saved me hours of manual checking. I manage 5 brand accounts and needed to bulk-verify a list of 80+ influencers. Done in 10 seconds.",
    name: "Sarah K.",
    role: "Social Media Manager",
    stars: 5,
  },
  {
    quote: "The JSON formatter is exactly what I needed — real-time validation with proper error messages. Way cleaner than pasting into browser devtools.",
    name: "DevMike",
    role: "Web Developer",
    stars: 5,
  },
  {
    quote: "Clean, fast, no signup. I use the bio generator and @ formatter constantly. The Base64 tool saved me when debugging an API last week.",
    name: "XGrowthPro",
    role: "Growth Marketer",
    stars: 5,
  },
];

const FAQS = [
  { q: "Is everything here completely free?", a: "Yes — 100% free, forever. No signup, no credit card, no hidden fees. Every tool works without an account." },
  { q: "How many X accounts can I check at once?", a: "Up to 100 usernames in a single batch, all checked in parallel. Results come back in seconds." },
  { q: "Do the developer tools send my data to a server?", a: "No. The JSON Formatter, Base64 Encoder, and all other developer tools run entirely in your browser. Nothing is sent to a server." },
  { q: "How does the AI bio generator work?", a: "It uses Groq's fast LLM API. Enter your niche and tone and get 3 ready-to-use bios instantly. Provide your own free Groq API key for unlimited generations." },
  { q: "Is my data stored or tracked?", a: "No. We don't store usernames, results, bios, or any personal data. Everything is processed in real-time and immediately discarded." },
  { q: "What new tools are coming?", a: "We're building SEO tools (meta checker, keyword density), more developer utilities (URL encoder, CSS minifier), and creator tools. Subscribe to get notified." },
  { q: "Does this work on mobile?", a: "Yes — every tool is fully responsive and optimized for mobile, tablet, and desktop." },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
      ))}
    </div>
  );
}

export default function Home() {
  const popularTools = getPopularTools();
  const newTools = getNewTools();
  const socialTools = getToolsByCategory("social-media");
  const devTools = getToolsByCategory("developer");

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-14 md:pt-24 md:pb-20 text-center relative">
          <Badge variant="outline" className="inline-flex mb-5 border-primary/30 text-primary bg-primary/8 px-3 py-1 text-xs font-medium">
            <Zap className="h-3 w-3 mr-1.5" /> {TOTAL_LIVE}+ free tools · no signup required
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
            Free online tools for<br />
            <span className="text-primary">SEO, creators &amp; developers</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            X account checker, AI bio generators, JSON formatter, Base64 encoder, text formatters — all free, all instant, all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/tools">
              <Button size="lg" className="w-full sm:w-auto text-sm font-medium shadow-lg shadow-primary/25 px-8">
                Browse All Tools <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href="#categories">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm border-border/60 hover:bg-muted/50">
                See All Categories
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {[
              { icon: Shield, text: "No data stored" },
              { icon: CheckCircle2, text: "No login required" },
              { icon: Zap, text: "Instant results" },
              { icon: Users, text: "Free forever" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-success" /> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: `${TOTAL_LIVE}+`, label: "Free tools" },
              { value: "5", label: "Tool categories" },
              { value: "0", label: "Signups required" },
              { value: "~2s", label: "Average result time" },
            ].map(({ value, label }) => (
              <div key={label} className="space-y-1">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Overview ── */}
      <section id="categories" className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Tool Categories</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Five categories and growing. Every tool is free — no paywall, no account.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_ORDER.map((key) => {
            const cat = CATEGORIES[key];
            const Icon = cat.icon;
            const count = LIVE_TOOLS.filter((t) => t.category === key).length;
            const isNew = key === "seo";
            return (
              <Link
                key={key}
                href={`/tools#${key}`}
                onClick={() => trackEvent("category_click", { label: cat.label })}
              >
                <div className="group relative rounded-xl border border-border/60 bg-card/50 p-5 hover:border-primary/30 hover:bg-card hover:shadow-sm transition-all cursor-pointer">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-3 ${cat.bg}`}>
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{cat.label}</h3>
                    {isNew && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 border border-emerald-400/30">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{cat.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/50">{count} {count === 1 ? "tool" : "tools"}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Popular Tools ── */}
      <section className="border-t border-border/50 bg-muted/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Popular Tools</h2>
              <p className="text-sm text-muted-foreground">Most-used tools across the platform.</p>
            </div>
            <Link href="/tools">
              <Button variant="outline" size="sm" className="text-xs border-border/60 hidden sm:flex">
                All Tools <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTools.map((tool) => (
              <div key={tool.id} onClick={() => trackEvent("popular_tool_click", { tool: tool.id })}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Media Spotlight ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="outline" className="border-blue-400/30 text-blue-400 bg-blue-400/8 text-xs mb-4">
              Social Media Tools
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Manage X accounts at scale
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
              Bulk-check up to 100 X accounts in seconds, convert usernames to profile links, format @ lists, and generate AI-powered bios — all without logging in.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Check 100 accounts in ~2 seconds",
                "Active, suspended, and deleted detection",
                "AI bio generation with Groq",
                "Bulk @ prefix add / remove",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/tools?tab=checker">
              <Button size="sm" className="shadow-sm shadow-primary/20">
                Try Account Checker <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {socialTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} compact />
            ))}
          </div>
        </div>
      </section>

      {/* ── Developer Tools Spotlight ── */}
      <section className="border-t border-border/50 bg-muted/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="grid grid-cols-1 gap-3 order-2 md:order-1">
              {devTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
            <div className="order-1 md:order-2">
              <Badge variant="outline" className="border-orange-400/30 text-orange-400 bg-orange-400/8 text-xs mb-4">
                Developer Tools
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                Developer utilities that just work
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                Format and validate JSON with real-time error highlighting. Encode and decode Base64 strings including emojis and Unicode. All processing happens in your browser — nothing is sent to a server.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Real-time JSON validation with line numbers",
                  "Format or minify with one click",
                  "Base64 with full Unicode support",
                  "JWT payload decoding built in",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/tools/json-formatter">
                <Button variant="outline" size="sm" className="border-border/60">
                  Try JSON Formatter <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newly Added ── */}
      {newTools.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Recently Added</h2>
              <p className="text-sm text-muted-foreground">Fresh tools, just launched.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newTools.map((tool) => (
              <div key={tool.id} onClick={() => trackEvent("new_tool_click", { tool: tool.id })}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      <section className="border-t border-border/50 bg-muted/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Loved by creators &amp; developers</h2>
            <p className="text-muted-foreground text-sm">What people are saying.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, role, stars }) => (
              <div key={name} className="rounded-xl border border-border/60 bg-card/50 p-6 space-y-4">
                <StarRating count={stars} />
                <p className="text-sm text-muted-foreground leading-relaxed">"{quote}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{name[0]}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-sm">Everything you need to know.</p>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border/60 bg-card/40 px-5 data-[state=open]:bg-card/70 transition-colors">
              <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">{q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16 md:pb-20">
        <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-8 md:p-12 text-center overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Ready to get started?</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm md:text-base">
            {TOTAL_LIVE}+ free tools. No account, no signup, no payment. Ever.
          </p>
          <Link href="/tools">
            <Button size="lg" className="shadow-lg shadow-primary/25 px-8">
              Browse All Tools <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
