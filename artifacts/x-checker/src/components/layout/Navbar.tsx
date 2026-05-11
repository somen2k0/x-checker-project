import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeedbackModal } from "@/components/FeedbackModal";
import {
  MessageSquare, Home, Info, Menu, X, Layers, ChevronDown,
  Search, Sparkles, Link2, AtSign, Smile, Briefcase, Palette,
  Hash, MessageSquareText, Type, BarChart2, Users, FileJson, Lock,
  TrendingUp, Globe, Code2, Wrench, Mail, ShieldCheck, Pencil,
  FileText, Shield, Tag,
} from "lucide-react";

const BADGE_STYLES: Record<string, string> = {
  Popular: "bg-amber-400/15 text-amber-400 border-amber-400/30",
  New: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  AI: "bg-purple-400/15 text-purple-400 border-purple-400/30",
};

const NAV_CATEGORIES = [
  {
    key: "x-tools",
    label: "X Tools",
    icon: Layers,
    color: "text-blue-400",
    href: "/tools",
    tools: [
      { icon: Search, label: "Account Checker", desc: "Bulk-check 100 X accounts", href: "/tools?tab=checker", badge: "Popular" },
      { icon: Sparkles, label: "AI Bio Generator", desc: "Generate 3 X bios in seconds", href: "/tools?tab=bio", badge: "AI" },
      { icon: Link2, label: "Profile Link Generator", desc: "Convert usernames to links", href: "/tools?tab=links" },
      { icon: AtSign, label: "Username Generator", desc: "Unique X handle ideas", href: "/tools/username-generator" },
      { icon: Hash, label: "Hashtag Formatter", desc: "Format & deduplicate hashtags", href: "/tools/hashtag-formatter" },
      { icon: MessageSquareText, label: "Tweet Formatter", desc: "Split text into tweet threads", href: "/tools/tweet-formatter" },
      { icon: Type, label: "Font Preview", desc: "Preview text in Unicode fonts", href: "/tools/font-preview" },
      { icon: BarChart2, label: "Character Counter", desc: "Fit X's 280-char limit", href: "/tools/character-counter" },
      { icon: Users, label: "Display Name Ideas", desc: "Curated X display names", href: "/tools/name-ideas" },
      { icon: FileJson, label: "JSON Formatter", desc: "Format, minify & validate JSON", href: "/tools/json-formatter", badge: "Popular" },
      { icon: Lock, label: "Base64 Encoder", desc: "Encode/decode with Unicode", href: "/tools/base64" },
    ],
  },
  {
    key: "seo",
    label: "SEO Tools",
    icon: TrendingUp,
    color: "text-pink-400",
    href: "/seo-tools",
    tools: [
      { icon: Globe, label: "Meta Tag Generator", desc: "SEO title, OG & Twitter Cards", href: "/tools/meta-tag-generator", badge: "New" },
      { icon: Link2, label: "URL Slug Generator", desc: "Clean, SEO-friendly slugs", href: "/tools/url-slug-generator", badge: "New" },
      { icon: TrendingUp, label: "Keyword Density", desc: "Check keyword frequency", href: "/tools/keyword-density", badge: "New" },
      { icon: Shield, label: "Robots.txt Generator", desc: "Build your robots.txt file", href: "/tools/robots-txt-generator", badge: "New" },
      { icon: Tag, label: "Sitemap Validator", desc: "Validate XML sitemap structure", href: "/tools/sitemap-validator", badge: "New" },
    ],
  },
  {
    key: "email",
    label: "Email Tools",
    icon: Mail,
    color: "text-cyan-400",
    href: "/email-tools",
    tools: [
      { icon: Pencil, label: "Subject Line Generator", desc: "Templates for every campaign", href: "/tools/subject-line-generator", badge: "New" },
      { icon: Mail, label: "Email Signature Generator", desc: "HTML & plain text signatures", href: "/tools/email-signature-generator", badge: "New" },
      { icon: Hash, label: "Email Character Counter", desc: "Subject & preview text limits", href: "/tools/email-character-counter", badge: "New" },
      { icon: ShieldCheck, label: "Email Validator", desc: "Validate email syntax", href: "/tools/email-validator", badge: "New" },
      { icon: FileText, label: "Plain Text Formatter", desc: "Convert HTML email to text", href: "/tools/plain-text-formatter", badge: "New" },
    ],
  },
];

function NavDropdown({
  category,
  isActive,
  onClose,
}: {
  category: typeof NAV_CATEGORIES[number];
  isActive: boolean;
  onClose: () => void;
}) {
  const CatIcon = category.icon;
  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 z-50
        rounded-xl border border-border/60 bg-background/98 backdrop-blur-xl shadow-xl shadow-black/20
        animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="p-2">
        <Link href={category.href} onClick={onClose}>
          <div className={`flex items-center gap-2 px-3 py-2 mb-1 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer border-b border-border/30 pb-2 mb-2`}>
            <CatIcon className={`h-3.5 w-3.5 ${category.color}`} />
            <span className="text-xs font-semibold text-foreground">Browse all {category.label}</span>
            <span className="ml-auto text-xs text-muted-foreground">→</span>
          </div>
        </Link>
        <ul className="space-y-0.5">
          {category.tools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <li key={tool.label}>
                <Link href={tool.href} onClick={onClose}>
                  <div className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer">
                    <ToolIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                    <span className="text-xs font-medium group-hover:text-primary transition-colors flex-1">{tool.label}</span>
                    {tool.badge && (
                      <span className={`text-[9px] font-semibold px-1.5 py-px rounded-full border shrink-0 ${BADGE_STYLES[tool.badge] ?? ""}`}>
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function NavItem({
  category,
  currentPath,
}: {
  category: typeof NAV_CATEGORIES[number];
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = category.icon;

  const handleMouseEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const isActive =
    currentPath === category.href ||
    currentPath.startsWith(category.href + "/") ||
    open;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
          isActive
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Icon className="h-3.5 w-3.5" />
        {category.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <NavDropdown category={category} isActive={isActive} onClose={close} />}
    </div>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

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
              26+ Free Tools
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

            {NAV_CATEGORIES.map((cat) => (
              <NavItem key={cat.key} category={cat} currentPath={location} />
            ))}

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
            <Link href="/" onClick={() => setMenuOpen(false)}>
              <button className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                location === "/" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
                <Home className="h-4 w-4" />
                Home
              </button>
            </Link>

            {NAV_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const expanded = mobileExpanded === cat.key;
              return (
                <div key={cat.key}>
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
                    onClick={() => setMobileExpanded(expanded ? null : cat.key)}
                  >
                    <Icon className="h-4 w-4" />
                    {cat.label}
                    <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  {expanded && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/40 pl-3">
                      <Link href={cat.href} onClick={() => setMenuOpen(false)}>
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left">
                          Browse all {cat.label} →
                        </button>
                      </Link>
                      {cat.tools.map((tool) => {
                        const TIcon = tool.icon;
                        return (
                          <Link key={tool.label} href={tool.href} onClick={() => setMenuOpen(false)}>
                            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left">
                              <TIcon className="h-3.5 w-3.5 shrink-0" />
                              {tool.label}
                              {tool.badge && (
                                <span className={`text-[9px] font-semibold px-1.5 py-px rounded-full border ml-auto ${BADGE_STYLES[tool.badge] ?? ""}`}>
                                  {tool.badge}
                                </span>
                              )}
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <Link href="/about" onClick={() => setMenuOpen(false)}>
              <button className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                location === "/about" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
                <Info className="h-4 w-4" />
                About
              </button>
            </Link>

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
