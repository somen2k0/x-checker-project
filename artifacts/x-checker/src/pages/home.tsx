import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AdBanner } from "@/components/AdBanner";
import {
  Search, Sparkles, Link2, AtSign, CheckCircle2, Zap, Shield,
  Star, ArrowRight, Users, Clock, ChevronRight
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Account Checker",
    description: "Bulk-check up to 100 X accounts at once. Instantly see who's active, suspended, or deleted — with follower counts and join dates.",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    tab: "checker",
  },
  {
    icon: Sparkles,
    title: "Bio Generator",
    description: "Generate 3 professional X bios in seconds powered by AI. Just describe your niche and tone — copy and paste straight to your profile.",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    tab: "bio",
  },
  {
    icon: Link2,
    title: "Profile Link Generator",
    description: "Convert a list of usernames into direct X profile links instantly. Copy all links at once or individually.",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    tab: "links",
  },
  {
    icon: AtSign,
    title: "@ Formatter",
    description: "Bulk add or remove the @ prefix from a list of usernames in one click. Clean up lists fast.",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    tab: "at",
  },
];

const steps = [
  {
    number: "01",
    title: "Paste Your Usernames",
    description: "Enter one username per line, or separated by commas or spaces. The @ prefix is optional.",
  },
  {
    number: "02",
    title: "Check in One Click",
    description: "Hit Check Status and we query X's API for all accounts in parallel — results in seconds.",
  },
  {
    number: "03",
    title: "Copy Your Results",
    description: "See status, follower counts, and join dates. Copy results to clipboard in one click.",
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
    quote: "The bio generator is surprisingly good. Got a great professional bio on the first try. Way better than spending 20 minutes agonizing over it.",
    name: "DevMike",
    role: "Web Developer",
    stars: 5,
  },
  {
    quote: "Clean, fast, no signup needed. Exactly what I wanted. I use the @ formatter every time I clean up my CRM lists.",
    name: "XGrowthPro",
    role: "Growth Marketer",
    stars: 5,
  },
];

const faqs = [
  {
    q: "Is X Toolkit completely free?",
    a: "Yes — 100% free. No signup, no credit card, no hidden fees. All core tools work without any account.",
  },
  {
    q: "How many accounts can I check at once?",
    a: "Up to 100 usernames in a single batch. All accounts are checked in parallel so results come back in just a few seconds.",
  },
  {
    q: "Do I need a Twitter or X account to use this?",
    a: "No. X Toolkit works without any authentication. Just paste your usernames and go.",
  },
  {
    q: "How accurate is the account checker?",
    a: "Very accurate. We use X's own internal API — the same one that powers the official Twitter/X website. Results reflect real-time account status.",
  },
  {
    q: "How does the bio generator work?",
    a: "The bio generator is powered by Groq's fast LLM API. You provide your own free Groq API key (get one at console.groq.com), enter your niche and tone, and get 3 ready-to-use bios instantly.",
  },
  {
    q: "Is my data stored or tracked?",
    a: "No. We don't store usernames, check results, generated bios, or any personal data. Everything is processed in real-time and discarded immediately.",
  },
  {
    q: "Does this work on mobile?",
    a: "Yes — X Toolkit is fully responsive and works great on mobile, tablet, and desktop.",
  },
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
  const [emailInput, setEmailInput] = useState("");
  const [ctaSubscribed, setCtaSubscribed] = useState(false);

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-14 md:pt-24 md:pb-20 text-center relative">
          <Badge variant="outline" className="inline-flex mb-5 border-primary/30 text-primary bg-primary/8 px-3 py-1 text-xs font-medium">
            <Zap className="h-3 w-3 mr-1.5" /> 4 free tools · no signup required
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
            The Complete{" "}
            <span className="text-primary">X / Twitter</span>
            <br />Toolkit
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Check account status in bulk, generate AI-powered bios, create profile links,
            and format usernames — all for free, instantly, no account needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/tools">
              <Button size="lg" className="w-full sm:w-auto text-sm font-medium shadow-lg shadow-primary/25 px-8">
                Try the Tools <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm border-border/60 hover:bg-muted/50">
                See All Features
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs text-muted-foreground">
            {[
              { icon: Shield, text: "No data stored" },
              { icon: CheckCircle2, text: "No login required" },
              { icon: Zap, text: "Results in seconds" },
              { icon: Users, text: "Free forever" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-success" /> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad banner ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <AdBanner slot="1111111111" format="horizontal" className="rounded-xl overflow-hidden mb-10" />
      </div>

      {/* ── Stats bar ── */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "100", label: "Accounts per batch" },
              { value: "4", label: "Free tools" },
              { value: "0", label: "Signups required" },
              { value: "~2s", label: "Average check time" },
            ].map(({ value, label }) => (
              <div key={label} className="space-y-1">
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Everything you need for X</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Four powerful tools, one clean interface. No account needed, no paywalls.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, description, color, bg, tab }) => (
            <div key={title} className="group relative rounded-xl border border-border/60 bg-card/50 p-6 hover:border-primary/30 hover:bg-card transition-all duration-200">
              <div className={`h-10 w-10 rounded-lg border flex items-center justify-center mb-4 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="text-base font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
              <Link href={`/tools?tab=${tab}`}>
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                  Try it now <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-t border-border/50 bg-muted/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">How the Account Checker Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three steps from paste to results.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-border/60 -translate-y-px" />

            {steps.map(({ number, title, description }) => (
              <div key={number} className="relative text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold text-primary font-mono">{number}</span>
                </div>
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/tools">
              <Button className="shadow-sm shadow-primary/20">
                <Search className="h-4 w-4 mr-2" /> Start Checking Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Loved by power users</h2>
          <p className="text-muted-foreground">What people are saying about X Toolkit.</p>
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
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-border/50 bg-muted/10">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about X Toolkit.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border/60 bg-card/40 px-5 data-[state=open]:bg-card/70 transition-colors">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/3 to-transparent pointer-events-none" />
          <Badge variant="outline" className="inline-flex mb-4 border-primary/30 text-primary bg-primary/8 px-3 py-1 text-xs">
            <Clock className="h-3 w-3 mr-1.5" /> Takes 30 seconds
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Ready to check your accounts?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm md:text-base">
            No account, no signup, no payment. Just paste your usernames and hit Check Status.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/tools">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/25 px-8">
                <Search className="h-4 w-4 mr-2" /> Check Accounts Now
              </Button>
            </Link>
            <Link href="/tools">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-border/60">
                <Sparkles className="h-4 w-4 mr-2" /> Generate a Bio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom ad ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
        <AdBanner slot="3333333333" format="horizontal" className="rounded-xl overflow-hidden" />
      </div>
    </Layout>
  );
}
