import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeedbackModal } from "@/components/FeedbackModal";
import {
  MessageSquare, Home, Info, Menu, X, Layers, ChevronDown,
  Search, Sparkles, Link2, AtSign, Smile, Briefcase, Palette,
  Hash, MessageSquareText, Type, BarChart2, Users, FileJson, Lock,
  TrendingUp, Globe, Code2, Wrench,
} from "lucide-react";

const MEGA_MENU_CATEGORIES = [
  {
    key: "ai-writing",
    label: "AI Writing",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    icon: Sparkles,
    tools: [
      { icon: Sparkles, label: "AI Bio Generator", desc: "Generate 3 X bios in seconds", href: "/tools?tab=bio", badge: "AI" },
      { icon: Sparkles, label: "Bio Ideas", desc: "100+ ready-made bio templates", href: "/tools/bio-ideas", badge: "Popular" },
      { icon: Smile, label: "Funny Bios", desc: "Witty, humorous bio ideas", href: "/tools/funny-bios" },
      { icon: Briefcase, label: "Professional Bios", desc: "Bios for career builders", href: "/tools/professional-bios" },
      { icon: Palette, label: "Aesthetic Bios", desc: "Minimal, stylish profile bios", href: "/tools/aesthetic-bios" },
    ],
  },
  {
    key: "social-media",
    label: "Social Media",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    icon: Users,
    tools: [
      { icon: Search, label: "Account Checker", desc: "Bulk-check 100 X accounts", href: "/tools?tab=checker", badge: "Popular" },
      { icon: Link2, label: "Profile Link Generator", desc: "Convert usernames to links", href: "/tools?tab=links" },
      { icon: AtSign, label: "@ Formatter", desc: "Add/remove @ prefix in bulk", href: "/tools?tab=at" },
      { icon: AtSign, label: "Username Generator", desc: "Unique X handle ideas", href: "/tools/username-generator" },
      { icon: Users, label: "Display Name Ideas", desc: "Curated X display names", href: "/tools/name-ideas" },
    ],
  },
  {
    key: "text-formatting",
    label: "Text & Format",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    icon: Type,
    tools: [
      { icon: Hash, label: "Hashtag Formatter", desc: "Format & deduplicate hashtags", href: "/tools/hashtag-formatter" },
      { icon: MessageSquareText, label: "Tweet Thread Formatter", desc: "Split text into tweet threads", href: "/tools/tweet-formatter" },
      { icon: Type, label: "Font Preview", desc: "Preview text in Unicode fonts", href: "/tools/font-preview" },
      { icon: BarChart2, label: "Character Counter", desc: "Fit X's 280-char limit", href: "/tools/character-counter" },
    ],
  },
  {
    key: "developer",
    label: "Developer",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    icon: Code2,
    tools: [
      { icon: FileJson, label: "JSON Formatter", desc: "Format, minify & validate JSON", href: "/tools/json-formatter", badge: "New" },
      { icon: Lock, label: "Base64 Encoder", desc: "Encode/decode with Unicode", href: "/tools/base64", badge: "New" },
    ],
  },
  {
    key: "seo",
    label: "SEO Tools",
    color: "text-pink-400",
    bg: "bg-pink-400/10 border-pink-400/20",
    icon: TrendingUp,
    tools: [
      { icon: Globe, label: "Meta Tag Checker", desc: "Optimize meta titles & descs", href: "#", badge: "Soon" },
      { icon: TrendingUp, label: "Keyword Density", desc: "Check keyword frequency", href: "#", badge: "Soon" },
      { icon: Link2, label: "URL Slug Generator", desc: "Clean, SEO-friendly slugs", href: "#", badge: "Soon" },
    ],
  },
];

const BADGE_STYLES: Record<string, string> = {
  Popular: "bg-amber-400/15 text-amber-400 border-amber-400/30",
  New: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  AI: "bg-purple-400/15 text-purple-400 border-purple-400/30",
  Soon: "bg-muted/60 text-muted-foreground border-border/50",
};

function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[900px] max-w-[calc(100vw-2rem)] z-50
        rounded-2xl border border-border/60 bg-background/98 backdrop-blur-xl shadow-xl shadow-black/20
        animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">All Tools</span>
            <span className="text-xs text-muted-foreground">— free, no signup required</span>
          </div>
          <Link href="/tools" onClick={onClose}>
            <Button variant="outline" size="sm" className="text-xs h-7 border-border/60 hover:bg-muted/50">
              Browse all →
            </Button>
          </Link>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-5 gap-4">
          {MEGA_MENU_CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.key}>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${cat.bg}`}>
                    <CatIcon className={`h-3 w-3 ${cat.color}`} />
                  </div>
                  <span className={`text-[11px] font-semibold uppercase tracking-wide ${cat.color}`}>
                    {cat.label}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {cat.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isSoon = tool.badge === "Soon";
                    const inner = (
                      <div
                        className={`group flex flex-col gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                          isSoon
                            ? "opacity-50 cursor-default"
                            : "hover:bg-muted/60 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <ToolIcon className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                          <span className="text-xs font-medium leading-snug group-hover:text-primary transition-colors">
                            {tool.label}
                          </span>
                          {tool.badge && (
                            <span className={`text-[9px] font-semibold px-1 py-px rounded-full border ml-auto shrink-0 ${BADGE_STYLES[tool.badge]}`}>
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground leading-snug pl-4.5">
                          {tool.desc}
                        </span>
                      </div>
                    );
                    if (isSoon || tool.href === "#") return <li key={tool.label}>{inner}</li>;
                    return (
                      <li key={tool.label}>
                        <Link href={tool.href} onClick={onClose}>{inner}</Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  }, []);

  const closeMega = useCallback(() => setMegaOpen(false), []);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">X Toolkit</span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-medium border-primary/30 text-primary bg-primary/8 px-1.5 py-0">
              16+ Free Tools
            </Badge>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 relative">
            <Link href="/">
              <button className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location === "/"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
                <Home className="h-3.5 w-3.5" />
                Home
              </button>
            </Link>

            {/* Tools with mega menu */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  location === "/tools" || megaOpen
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                onClick={() => setMegaOpen((v) => !v)}
                aria-expanded={megaOpen}
                aria-haspopup="true"
              >
                <Wrench className="h-3.5 w-3.5" />
                Tools
                <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${megaOpen ? "rotate-180" : ""}`} />
              </button>

              {megaOpen && <MegaMenu onClose={closeMega} />}
            </div>

            <Link href="/about">
              <button className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location === "/about"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
                <Info className="h-3.5 w-3.5" />
                About
              </button>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="hidden lg:inline">All systems operational</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFeedback(true)} className="hidden sm:flex text-xs border-border/60 hover:bg-muted/50 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Feedback
            </Button>
            <Link href="/tools">
              <Button size="sm" className="hidden md:flex text-xs shadow-sm shadow-primary/20">
                Browse Tools →
              </Button>
            </Link>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-3 space-y-1">
            {[
              { href: "/", label: "Home", icon: Home },
              { href: "/tools", label: "Tools", icon: Wrench },
              { href: "/about", label: "About", icon: Info },
            ].map(({ href, label, icon: Icon }) => {
              const isActive = location === href;
              return (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                  <button className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                </Link>
              );
            })}
            <button
              onClick={() => { setShowFeedback(true); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Feedback
            </button>
          </div>
        )}
      </nav>

      <FeedbackModal open={showFeedback} onOpenChange={setShowFeedback} />
    </>
  );
}
