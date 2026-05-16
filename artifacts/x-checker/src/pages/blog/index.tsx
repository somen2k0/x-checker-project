import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/SeoHead";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ArrowRight, Mail, Shield, HelpCircle, Star, ArrowLeftRight, Chrome } from "lucide-react";

const ARTICLES = [
  {
    slug: "how-to-use-temp-email-extension",
    href: "/blog/how-to-use-temp-email-extension",
    title: "How to Use a Temp Email Chrome Extension",
    description: "Step-by-step guide: install, generate a disposable inbox, auto-copy OTP codes, use temp Gmail, and get background notifications — all from your toolbar.",
    readTime: "7 min",
    category: "Guide",
    icon: Chrome,
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/20",
  },
  {
    slug: "what-is-disposable-email",
    href: "/blog/what-is-disposable-email",
    title: "What Is Disposable Email? A Complete Guide",
    description: "How throwaway email addresses work, why people use them, their limitations, and the best free services.",
    readTime: "6 min",
    category: "Guide",
    icon: BookOpen,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
  },
  {
    slug: "best-temp-mail-services",
    href: "/blog/best-temp-mail-services",
    title: "Best Temp Mail Services (2025)",
    description: "8 top disposable email providers compared on privacy, features, reliability, and ease of use.",
    readTime: "7 min",
    category: "Comparison",
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
  {
    slug: "temp-mail-vs-gmail",
    href: "/blog/temp-mail-vs-gmail",
    title: "Temp Mail vs Gmail — What's the Difference?",
    description: "Side-by-side comparison of temporary email and Gmail: privacy, lifespan, deliverability, and when to use each.",
    readTime: "5 min",
    category: "Comparison",
    icon: ArrowLeftRight,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    slug: "is-temp-mail-safe",
    href: "/blog/is-temp-mail-safe",
    title: "Is Temp Mail Safe to Use?",
    description: "An honest analysis of what temporary email protects against, the real risks, and when not to use it.",
    readTime: "4 min",
    category: "Security",
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    slug: "why-websites-ask-email-verification",
    href: "/blog/why-websites-ask-email-verification",
    title: "Why Websites Ask for Email Verification",
    description: "The real business and technical reasons behind every 'please verify your email' prompt — and what it means for your data.",
    readTime: "4 min",
    category: "Explainer",
    icon: HelpCircle,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
  },
  {
    slug: "temp-gmail-explained",
    href: "/blog/temp-gmail-explained",
    title: "Temp Gmail Explained",
    description: "How Gmail's dot trick, plus trick, and real temporary Gmail addresses work — and when each is the right choice.",
    readTime: "4 min",
    category: "Guide",
    icon: Mail,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
  },
];

const CATEGORY_BADGE: Record<string, string> = {
  Guide: "bg-cyan-400/10 text-cyan-400 border-cyan-400/25",
  Comparison: "bg-amber-400/10 text-amber-400 border-amber-400/25",
  Security: "bg-emerald-400/10 text-emerald-400 border-emerald-400/25",
  Explainer: "bg-purple-400/10 text-purple-400 border-purple-400/25",
};

export default function BlogIndex() {
  const [featured, ...rest] = ARTICLES;

  return (
    <Layout>
      <SeoHead
        title="Blog — Email Privacy & Temp Mail Guides | X Toolkit"
        description="In-depth guides on disposable email, email privacy, temp mail services, and how to protect your inbox from spam and data brokers. Free, no signup."
        path="/blog"
      />

      {/* Hero */}
      <div className="border-b border-border/50 bg-gradient-to-b from-cyan-500/[0.04] to-transparent">
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-10 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Blog</h1>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm md:text-base">
            Guides on temporary email, email privacy, and protecting your inbox from spam, trackers, and data brokers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-12 space-y-10">

        {/* Featured article */}
        <Link href={featured.href}>
          <div className="group rounded-2xl border border-border/60 bg-card/40 hover:border-cyan-400/30 hover:bg-card transition-all cursor-pointer overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${featured.bg}`}>
                  <featured.icon className={`h-5 w-5 ${featured.color}`} />
                </div>
                <Badge variant="outline" className={`text-xs border ${CATEGORY_BADGE[featured.category]}`}>
                  {featured.category}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readTime}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{featured.description}</p>
              <span className="text-sm font-medium text-primary flex items-center gap-1">
                Read article <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </Link>

        {/* Article grid */}
        <div>
          <h2 className="text-lg font-semibold mb-5">All Articles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {rest.map((article) => (
              <Link key={article.slug} href={article.href}>
                <div className="group flex flex-col rounded-xl border border-border/60 bg-card/40 p-5 hover:border-primary/30 hover:bg-card transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${article.bg}`}>
                      <article.icon className={`h-4 w-4 ${article.color}`} />
                    </div>
                    <Badge variant="outline" className={`text-[10px] border ${CATEGORY_BADGE[article.category]}`}>
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                      <Clock className="h-3 w-3" />{article.readTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors flex-1 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{article.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA to tools */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1">Try the free tools</h3>
            <p className="text-sm text-muted-foreground">Temp mail, email privacy checker, spam risk — all free, no signup required.</p>
          </div>
          <Link href="/email-tools">
            <button className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
              Browse Email Tools <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
