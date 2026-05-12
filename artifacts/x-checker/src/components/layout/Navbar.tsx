import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeedbackModal } from "@/components/FeedbackModal";
import {
  MessageSquare, Home, Info, Menu, X, Layers, ChevronDown,
  Search, Sparkles, Link2, AtSign, Hash, MessageSquareText,
  Type, BarChart2, Users, FileJson, Lock, TrendingUp, Globe,
  Mail, ShieldCheck, Pencil, FileText, Shield, Tag, Clock, Inbox,
} from "lucide-react";

const BADGE_STYLES: Record<string, string> = {
  Popular: "bg-amber-400/15 text-amber-400 border-amber-400/30",
  New: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  AI: "bg-purple-400/15 text-purple-400 border-purple-400/30",
  Soon: "bg-slate-400/15 text-slate-400 border-slate-400/30",
};

const NAV_CATEGORIES = [
  {
    key: "x-tools",
    label: "X Tools",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    href: "/tools",
    tools: [
      { icon: Search, label: "Account Checker", href: "/tools?tab=checker", badge: "Popular" },
      { icon: Sparkles, label: "AI Bio Generator", href: "/tools?tab=bio", badge: "AI" },
      { icon: Link2, label: "Profile Link Generator", href: "/tools?tab=links" },
      { icon: AtSign, label: "Username Generator", href: "/tools/username-generator" },
      { icon: Users, label: "Display Name Ideas", href: "/tools/name-ideas" },
      { icon: Hash, label: "Hashtag Formatter", href: "/tools/hashtag-formatter" },
      { icon: MessageSquareText, label: "Tweet Formatter", href: "/tools/tweet-formatter" },
      { icon: Type, label: "Font Preview", href: "/tools/font-preview" },
      { icon: BarChart2, label: "Character Counter", href: "/tools/character-counter" },
      { icon: FileJson, label: "JSON Formatter", href: "/tools/json-formatter", badge: "Popular" },
      { icon: Lock, label: "Base64 Encoder", href: "/tools/base64" },
    ],
    comingSoon: ["Follower Analyzer", "Tweet Scheduler", "Profile Audit"],
  },
  {
    key: "seo",
    label: "SEO Tools",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    href: "/seo-tools",
    tools: [
      { icon: Globe, label: "Meta Tag Generator", href: "/tools/meta-tag-generator", badge: "New" },
      { icon: Link2, label: "URL Slug Generator", href: "/tools/url-slug-generator", badge: "New" },
      { icon: TrendingUp, label: "Keyword Density", href: "/tools/keyword-density", badge: "New" },
      { icon: Shield, label: "Robots.txt Generator", href: "/tools/robots-txt-generator", badge: "New" },
      { icon: Tag, label: "Sitemap Validator", href: "/tools/sitemap-validator", badge: "New" },
    ],
    comingSoon: ["Page Speed Checker", "Backlink Analyzer", "Schema Generator"],
  },
  {
    key: "email",
    label: "Email Tools",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    href: "/email-tools",
    tools: [
      { icon: Inbox, label: "Temp Gmail", href: "/tools/temp-gmail", badge: "New" },
      { icon: Pencil, label: "Subject Line Generator", href: "/tools/subject-line-generator" },
      { icon: Mail, label: "Email Signature Generator", href: "/tools/email-signature-generator" },
      { icon: Hash, label: "Email Character Counter", href: "/tools/email-character-counter" },
      { icon: ShieldCheck, label: "Email Validator", href: "/tools/email-validator" },
      { icon: FileText, label: "Plain Text Formatter", href: "/tools/plain-text-formatter" },
    ],
    comingSoon: ["Email A/B Tester", "Spam Score Checker", "Newsletter Template Generator"],
  },
];

function NavDropdown({
  category,
  onClose,
}: {
  category: typeof NAV_CATEGORIES[number];
  onClose: () => void;
}) {
  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 z-50
        rounded-xl border border-border/60 bg-background/98 backdrop-blur-xl
        shadow-2xl shadow-black/30 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      <div className="p-2">
        {/* View all link */}
        <Link href={category.href} onClick={onClose}>
          <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-1 hover:bg-muted/60 transition-colors cursor-pointer`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${category.color}`}>
              All {category.label}
            </span>
            <span className="text-xs text-muted-foreground">View all →</span>
          </div>
        </Link>

        <div className="h-px bg-border/40 mx-1 mb-2" />

        {/* Tools list */}
        <ul className="space-y-0.5">
          {category.tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <li key={tool.label}>
                <Link href={tool.href} onClick={onClose}>
                  <div className="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                    <span className="text-xs font-medium group-hover:text-primary transition-colors flex-1 leading-tight">
                      {tool.label}
                    </span>
                    {tool.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${BADGE_STYLES[tool.badge] ?? ""}`}>
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Coming soon */}
        {category.comingSoon && category.comingSoon.length > 0 && (
          <>
            <div className="h-px bg-border/40 mx-1 my-2" />
            <div className="px-3 py-1 flex items-center gap-1.5 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground/60" />
              <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
            {category.comingSoon.map((name) => (
              <div key={name} className="flex items-center gap-2.5 px-3 py-1 opacity-50 cursor-default">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                <span className="text-xs text-muted-foreground">{name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function NavItem({ category, currentPath }: { category: typeof NAV_CATEGORIES[number]; currentPath: string }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = useCallback(() => { if (timer.current) clearTimeout(timer.current); setOpen(true); }, []);
  const leave = useCallback(() => { timer.current = setTimeout(() => setOpen(false), 150); }, []);
  const close = useCallback(() => setOpen(false), []);

  const isActive = currentPath === category.href || currentPath.startsWith(category.href + "/") || open;

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
          isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        {category.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <NavDropdown category={category} onClose={close} />}
    </div>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">X Toolkit</span>
            <Badge variant="outline" className="hidden lg:inline-flex text-[10px] font-medium border-primary/30 text-primary bg-primary/8 px-1.5 py-0">
              26+ Tools
            </Badge>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            <Link href="/">
              <button className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                location === "/" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
                Home
              </button>
            </Link>

            {NAV_CATEGORIES.map((cat) => (
              <NavItem key={cat.key} category={cat} currentPath={location} />
            ))}

            <Link href="/about">
              <button className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                location === "/about" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
                About
              </button>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden xl:inline text-[11px]">All systems operational</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFeedback(true)}
              className="hidden sm:flex text-xs border-border/60 hover:bg-muted/50 gap-1.5 h-8"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Feedback</span>
            </Button>
            <Link href="/tools">
              <Button size="sm" className="hidden md:flex text-xs h-8 shadow-sm shadow-primary/20 whitespace-nowrap">
                Browse All →
              </Button>
            </Link>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => { setMenuOpen((v) => !v); setMobileExpanded(null); }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/98 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">

              <Link href="/" onClick={closeMenu}>
                <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  location === "/" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                  <Home className="h-4 w-4 shrink-0" />
                  Home
                </button>
              </Link>

              {NAV_CATEGORIES.map((cat) => {
                const expanded = mobileExpanded === cat.key;
                return (
                  <div key={cat.key} className="rounded-lg overflow-hidden border border-border/30">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left bg-muted/20"
                      onClick={() => setMobileExpanded(expanded ? null : cat.key)}
                    >
                      <span className={`text-sm font-semibold flex-1 ${cat.color}`}>{cat.label}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                    </button>

                    {expanded && (
                      <div className="px-2 py-2 space-y-0.5 bg-muted/10">
                        <Link href={cat.href} onClick={closeMenu}>
                          <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/60 transition-colors cursor-pointer mb-1">
                            <span className="text-xs font-semibold text-foreground">Browse all {cat.label}</span>
                            <span className="text-xs text-muted-foreground">→</span>
                          </div>
                        </Link>

                        {cat.tools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <Link key={tool.label} href={tool.href} onClick={closeMenu}>
                              <div className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-muted/60 transition-colors cursor-pointer">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium text-foreground flex-1">{tool.label}</span>
                                {tool.badge && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${BADGE_STYLES[tool.badge] ?? ""}`}>
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}

                        {cat.comingSoon && cat.comingSoon.length > 0 && (
                          <>
                            <div className="h-px bg-border/40 mx-1 my-1.5" />
                            <div className="flex items-center gap-1.5 px-3 py-1">
                              <Clock className="h-3 w-3 text-muted-foreground/50" />
                              <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Coming Soon</span>
                            </div>
                            {cat.comingSoon.map((name) => (
                              <div key={name} className="flex items-center gap-2.5 px-3 py-1.5 opacity-40 cursor-default">
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                <span className="text-sm text-muted-foreground">{name}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link href="/about" onClick={closeMenu}>
                <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  location === "/about" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                  <Info className="h-4 w-4 shrink-0" />
                  About
                </button>
              </Link>

              <button
                onClick={() => { setShowFeedback(true); closeMenu(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                Feedback
              </button>

              <div className="pt-2 pb-1">
                <Link href="/tools" onClick={closeMenu}>
                  <Button className="w-full text-sm h-10">Browse All Tools →</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <FeedbackModal open={showFeedback} onOpenChange={setShowFeedback} />
    </>
  );
}
