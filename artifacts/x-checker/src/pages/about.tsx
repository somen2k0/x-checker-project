import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import {
  Shield, Zap, Heart, Search, Sparkles, Link2, AtSign, ArrowRight,
  Code2, Mail, BarChart2, FileText, Users, Globe,
} from "lucide-react";
import { TOTAL_LIVE } from "@/lib/tools-registry";

const values = [
  {
    icon: Zap,
    title: "Fast & Free",
    description: `All ${TOTAL_LIVE}+ tools are instant and completely free. No paywalls, no rate-limit warnings on basic usage, no upsells.`,
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "We don't store usernames, results, bios, or any personal data. Every request is processed in real-time and discarded immediately.",
  },
  {
    icon: Heart,
    title: "Built for Power Users",
    description: "Designed for social media managers, growth hackers, marketers, developers, and SEO professionals who need reliable bulk tools.",
  },
];

const categories = [
  {
    icon: Search,
    name: "X Account Tools",
    desc: "Bulk-check up to 100 X accounts for active/suspended/not found status, follower counts, and join dates. Generate profile links and format @-prefixed lists.",
  },
  {
    icon: Sparkles,
    name: "AI Writing Tools",
    desc: "AI-powered bio generation — get professional, funny, and aesthetic X bios for any niche. Plus name ideas and username generators.",
  },
  {
    icon: FileText,
    name: "Text & Format Tools",
    desc: "Character counter, plain-text formatter, tweet formatter, hashtag formatter, font preview, and more — all running in-browser with zero latency.",
  },
  {
    icon: Code2,
    name: "Developer Tools",
    desc: "JSON formatter, JWT decoder, Base64 encoder/decoder, Regex tester, SQL formatter, URL encoder, CSS minifier, HTML formatter, and UUID generator.",
  },
  {
    icon: BarChart2,
    name: "SEO Tools",
    desc: "Meta tag generator, URL slug generator, keyword density checker, robots.txt generator, and sitemap validator to help you rank on Google.",
  },
  {
    icon: Mail,
    name: "Email Tools",
    desc: "Disposable email inboxes across 16 domains, email validator, email signature generator, subject line generator, and more.",
  },
];

export default function About() {
  return (
    <Layout>
      <SeoHead
        title="About X Toolkit — Free Tools for X, Developers & SEO"
        description="Learn about X Toolkit — a free, privacy-first collection of 39+ tools for X (Twitter) creators, SEO professionals, and developers. No ads, no signup, no data stored."
        path="/about"
      />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/8 border border-primary/20 rounded-full px-3 py-1">
            About X Toolkit
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Built for creators, developers & power users
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            X Toolkit is a free collection of {TOTAL_LIVE}+ productivity tools for X (Twitter) power users,
            developers, SEO professionals, and email marketers. We built it because managing accounts
            and creating content at scale shouldn't require expensive SaaS subscriptions.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12 rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Give everyone free, reliable, instant tools for X account management, content creation,
            developer workflows, SEO, and email — without requiring a login, credit card, or subscription.
            Whether you're cleaning up a follower list, formatting code, checking keywords, or generating
            a temporary email address, X Toolkit handles it instantly, for free.
          </p>
        </section>

        {/* Values */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">What we stand for</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-border/60 bg-card/50 p-5 space-y-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Globe, value: `${TOTAL_LIVE}+`, label: "Free Tools" },
              { icon: Users, value: "6", label: "Categories" },
              { icon: Shield, value: "0", label: "Data Stored" },
              { icon: Zap, value: "~2s", label: "Avg Result Time" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card/40 p-4 text-center space-y-1">
                <Icon className="h-5 w-5 text-primary mx-auto mb-2 opacity-80" />
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tool categories */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">The tools</h2>
          <div className="space-y-3">
            {categories.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="flex items-start gap-4 rounded-xl border border-border/60 bg-card/40 px-5 py-4">
                <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-foreground/70" />
                </div>
                <div>
                  <div className="font-medium text-sm">{name}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy commitment */}
        <section className="mb-12 rounded-2xl border border-success/20 bg-success/5 p-6 md:p-8">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-semibold mb-2 text-success">Privacy commitment</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We don't collect, store, or sell any personal data. Usernames you check, bios you generate,
                code you format, and any other inputs are processed in real-time and never written to a database.
                Developer tools run entirely in your browser — nothing leaves your device.
                Read our full <Link href="/privacy"><span className="text-primary hover:underline cursor-pointer">Privacy Policy</span></Link> for details.
              </p>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">How it's built</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            X Toolkit is built with React + TypeScript on the frontend, and a lightweight Node.js / Express
            API server on the backend. The X account checker uses X's public internal API (no auth required).
            Developer tools (JSON formatter, Base64, JWT decoder, etc.) run entirely in your browser.
            The AI bio generator uses Groq's LLM API — with your own key so we never see it.
          </p>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Node.js", "Express", "TanStack Query", "shadcn/ui", "Tailwind CSS", "Groq API", "Vite", "Zod"].map((tech) => (
              <span key={tech} className="text-xs font-mono bg-muted/50 border border-border/60 rounded-full px-3 py-1 text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Try X Toolkit now</h2>
          <p className="text-muted-foreground text-sm mb-5">{TOTAL_LIVE}+ tools. No account needed. Free forever.</p>
          <Link href="/tools">
            <Button className="shadow-sm shadow-primary/20">
              Open the Tools <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
