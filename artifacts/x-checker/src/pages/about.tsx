import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Heart, Search, Sparkles, Link2, AtSign, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Zap,
    title: "Fast & Free",
    description: "All tools are instant and completely free. No paywalls, no rate-limit warnings on basic usage, no upsells.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "We don't store usernames, results, or any personal data. Every request is processed in real-time and discarded immediately.",
  },
  {
    icon: Heart,
    title: "Built for Power Users",
    description: "Designed for social media managers, growth hackers, marketers, and developers who need reliable bulk tools.",
  },
];

const tools = [
  { icon: Search, name: "Account Checker", desc: "Bulk-check up to 100 X accounts for status, follower count, and join date." },
  { icon: Sparkles, name: "Bio Generator", desc: "AI-powered bio generation — get 3 professional options for any niche." },
  { icon: Link2, name: "Profile Links", desc: "Instantly convert usernames into clickable X profile links." },
  { icon: AtSign, name: "@ Formatter", desc: "Bulk add or remove the @ prefix from lists of usernames." },
];

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/8 border border-primary/20 rounded-full px-3 py-1">
            About X Toolkit
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Built for the X community
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            X Toolkit is a free collection of productivity tools for X (Twitter) power users.
            We built it because bulk account management shouldn't require expensive SaaS subscriptions
            or sketchy third-party apps.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12 rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Simple: give X users free, reliable tools to manage accounts at scale. Whether you're
            cleaning up a follower list, checking if accounts are still active, writing a profile bio,
            or formatting username exports from your CRM — X Toolkit handles it instantly, for free,
            without requiring a login.
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

        {/* Tools overview */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">The tools</h2>
          <div className="space-y-3">
            {tools.map(({ icon: Icon, name, desc }) => (
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
                and API keys you add are processed locally or in memory and never written to a database.
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
            API server on the backend. The account checker uses X's public internal API (no auth required),
            and the bio generator uses Groq's blazing-fast LLM API — with your own key so we never see it.
          </p>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Node.js", "Express", "TanStack Query", "shadcn/ui", "Tailwind CSS", "Groq API"].map((tech) => (
              <span key={tech} className="text-xs font-mono bg-muted/50 border border-border/60 rounded-full px-3 py-1 text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Try X Toolkit now</h2>
          <p className="text-muted-foreground text-sm mb-5">No account needed. Free forever.</p>
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
