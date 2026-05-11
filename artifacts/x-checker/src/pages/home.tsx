import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Search, Sparkles, Link2, AtSign, CheckCircle2, Zap, Shield,
  Star, ArrowRight, Users, Hash, MessageSquare, Type, BarChart2,
  Smile, Briefcase, Palette, Code2, Lock, FileJson,
} from "lucide-react";

const TOOL_CATEGORIES = [
  {
    label: "X Account Tools",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    tools: [
      { icon: Search, title: "Account Checker", desc: "Bulk-check up to 100 X accounts — active, suspended, or deleted.", href: "/tools?tab=checker" },
      { icon: Link2, title: "Profile Link Generator", desc: "Convert usernames to direct X profile links instantly.", href: "/tools?tab=links" },
      { icon: AtSign, title: "@ Formatter", desc: "Bulk add or remove the @ prefix from username lists.", href: "/tools?tab=at" },
      { icon: Sparkles, title: "Bio Generator", desc: "AI-powered X bios tailored to your niche and tone.", href: "/tools?tab=bio" },
    ],
  },
  {
    label: "Content & Writing",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    tools: [
      { icon: Sparkles, title: "Bio Ideas", desc: "100+ ready-made X bio templates by niche.", href: "/tools/bio-ideas" },
      { icon: Smile, title: "Funny Bios", desc: "Witty, humorous bio ideas that stand out.", href: "/tools/funny-bios" },
      { icon: Briefcase, title: "Professional Bios", desc: "Clean, credible bios for business & career profiles.", href: "/tools/professional-bios" },
      { icon: Palette, title: "Aesthetic Bios", desc: "Minimal and stylish bios for a curated look.", href: "/tools/aesthetic-bios" },
      { icon: Users, title: "Username Generator", desc: "Unique X handle ideas for any niche.", href: "/tools/username-generator" },
      { icon: Users, title: "Name Ideas", desc: "Perfect display names for your X profile.", href: "/tools/name-ideas" },
    ],
  },
  {
    label: "Formatting & Text",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    tools: [
      { icon: Hash, title: "Hashtag Formatter", desc: "Clean and format hashtag lists in one click.", href: "/tools/hashtag-formatter" },
      { icon: MessageSquare, title: "Tweet Formatter", desc: "Split long text into numbered tweet threads.", href: "/tools/tweet-formatter" },
      { icon: Type, title: "Font Preview", desc: "Preview bio text in stylish Unicode fonts.", href: "/tools/font-preview" },
      { icon: BarChart2, title: "Character Counter", desc: "Count characters and words to fit X's limits.", href: "/tools/character-counter" },
    ],
  },
  {
    label: "Developer Tools",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    tools: [
      { icon: FileJson, title: "JSON Formatter", desc: "Format, minify, and validate JSON with real-time error detection.", href: "/tools/json-formatter" },
      { icon: Lock, title: "Base64 Encoder", desc: "Encode and decode Base64 strings with full Unicode support.", href: "/tools/base64" },
      { icon: Code2, title: "More coming soon", desc: "URL encoder, CSS minifier, regex tester, and more on the way.", href: "#tools" },
    ],
  },
];

const testimonials = [
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

const faqs = [
  { q: "Is everything here completely free?", a: "Yes — 100% free, forever. No signup, no credit card, no hidden fees. Every tool on the site works without any account." },
  { q: "How many X accounts can I check at once?", a: "Up to 100 usernames in a single batch, all checked in parallel. Results come back in just a few seconds." },
  { q: "Do the developer tools send my data to a server?", a: "No. The JSON Formatter, Base64 Encoder, and all other developer tools run entirely in your browser. Nothing is ever sent to a server." },
  { q: "How does the bio generator work?", a: "The bio generator uses Groq's fast LLM API. Enter your niche and tone, and get 3 ready-to-use bios instantly. You can provide your own Groq API key (free at console.groq.com) for unlimited generations." },
  { q: "Is my data stored or tracked?", a: "No. We don't store usernames, check results, generated bios, or any personal data. Everything is processed in real-time and discarded immediately." },
  { q: "What new tools are coming?", a: "We're actively building more developer tools (URL encoder, CSS minifier, regex tester) and more X tools. Join the waitlist to get notified when new tools launch." },
  { q: "Does this work on mobile?", a: "Yes — everything is fully responsive and works great on mobile, tablet, and desktop." },
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
  const totalTools = TOOL_CATEGORIES.reduce(
    (sum, c) => sum + c.tools.filter((t) => !t.title.includes("coming soon")).length,
    0,
  );

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-14 md:pt-24 md:pb-20 text-center relative">
          <Badge variant="outline" className="inline-flex mb-5 border-primary/30 text-primary bg-primary/8 px-3 py-1 text-xs font-medium">
            <Zap className="h-3 w-3 mr-1.5" /> {totalTools}+ free tools · no signup required
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
            Free tools for{" "}
            <span className="text-primary">creators</span>
            <br className="hidden sm:block" />{" "}
            &amp; developers
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            X account tools, AI bio generators, text formatters, JSON validators, Base64 encoders — all free, all instant, all in one place. No account needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/tools">
              <Button size="lg" className="w-full sm:w-auto text-sm font-medium shadow-lg shadow-primary/25 px-8">
                Browse All Tools <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href="#tools">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm border-border/60 hover:bg-muted/50">
                See What's Available
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs text-muted-foreground">
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
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: `${totalTools}+`, label: "Free tools" },
              { value: "100", label: "Accounts per batch" },
              { value: "0", label: "Signups required" },
              { value: "~2s", label: "Average result time" },
            ].map(({ value, label }) => (
              <div key={label} className="space-y-1">
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Tools by Category ── */}
      <section id="tools" className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20 space-y-14">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">All Tools</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pick a category and get started instantly. Every tool is free with no account required.
          </p>
        </div>

        {TOOL_CATEGORIES.map(({ label, color, bg, tools }) => (
          <div key={label} className="space-y-5">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-foreground/80 shrink-0">{label}</h3>
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground/50 shrink-0">
                {tools.filter((t) => !t.title.includes("coming")).length} tools
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(({ icon: Icon, title, desc, href }) => {
                const isComingSoon = title.includes("coming soon");
                return (
                  <Link key={title} href={isComingSoon ? "#tools" : href}>
                    <div
                      className={`group relative rounded-xl border border-border/60 bg-card/50 p-5 transition-all duration-200 ${
                        isComingSoon
                          ? "opacity-50 cursor-default"
                          : "hover:border-primary/30 hover:bg-card hover:shadow-sm cursor-pointer"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg border flex items-center justify-center mb-3 ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{title}</h4>
                        {isComingSoon && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/50 text-muted-foreground shrink-0">
                            Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                      {!isComingSoon && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-primary/60 group-hover:text-primary transition-colors mt-3">
                          Open tool <ArrowRight className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Testimonials ── */}
      <section className="border-t border-border/50 bg-muted/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Loved by creators &amp; developers</h2>
            <p className="text-muted-foreground">What people are saying.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(({ quote, name, role, stars }) => (
              <div key={name} className="rounded-xl border border-border/60 bg-card/50 p-6 space-y-4">
                <StarRating count={stars} />
                <p className="text-sm text-muted-foreground leading-relaxed">"{quote}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{name[0]}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know.</p>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map(({ q, a }, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border/60 bg-card/40 px-5 data-[state=open]:bg-card/70 transition-colors">
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
            {totalTools}+ free tools. No account, no signup, no payment.
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
