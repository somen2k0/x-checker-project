import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import {
  Home, Wrench, Info, Search, X, ChevronRight,
  Sparkles, Users, Type, Code2, TrendingUp, AtSign, Smile, Briefcase, Palette,
  Hash, MessageSquare as MessageSquareIcon, BarChart2, FileJson, Lock, Link2,
  Globe, Mail, ShieldCheck, Pencil, Inbox, Minimize2, KeyRound, Database,
  Shuffle, Shield, Tag, FileText, BarChart,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TOOL_CATEGORIES = [
  {
    key: "ai-writing",
    label: "AI Writing Tools",
    icon: Sparkles,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    tools: [
      { icon: Sparkles, label: "AI Bio Generator", desc: "Generate 3 X bios instantly", href: "/tools?tab=bio", badge: "AI" },
      { icon: Sparkles, label: "Bio Ideas", desc: "100+ ready-made bio templates", href: "/tools/bio-ideas", badge: "Popular" },
      { icon: Smile, label: "Funny Bios", desc: "Witty, humorous bio ideas", href: "/tools/funny-bios" },
      { icon: Briefcase, label: "Professional Bios", desc: "Bios for career builders", href: "/tools/professional-bios" },
      { icon: Palette, label: "Aesthetic Bios", desc: "Minimal, stylish profile bios", href: "/tools/aesthetic-bios" },
    ],
  },
  {
    key: "social-media",
    label: "Social Media Tools",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    tools: [
      { icon: Search, label: "Account Checker", desc: "Bulk-check 100 X accounts", href: "/tools?tab=checker", badge: "Popular" },
      { icon: Link2, label: "Profile Link Generator", desc: "Convert usernames to links", href: "/tools?tab=links" },
      { icon: AtSign, label: "Handle Formatter", desc: "Add/remove @ prefix in bulk", href: "/tools?tab=at" },
      { icon: AtSign, label: "Username Generator", desc: "Unique X handle ideas", href: "/tools/username-generator" },
      { icon: Users, label: "Display Name Ideas", desc: "Curated X display names", href: "/tools/name-ideas" },
    ],
  },
  {
    key: "text-formatting",
    label: "Text & Format Tools",
    icon: Type,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    tools: [
      { icon: Hash, label: "Hashtag Formatter", desc: "Format & deduplicate hashtags", href: "/tools/hashtag-formatter" },
      { icon: MessageSquareIcon, label: "Tweet Thread Formatter", desc: "Split text into tweet threads", href: "/tools/tweet-formatter" },
      { icon: Type, label: "Font Preview", desc: "Preview text in Unicode fonts", href: "/tools/font-preview" },
      { icon: BarChart2, label: "Character Counter", desc: "Fit X's 280-char limit", href: "/tools/character-counter" },
    ],
  },
  {
    key: "developer",
    label: "Developer Tools",
    icon: Code2,
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    tools: [
      { icon: FileJson, label: "JSON Formatter", desc: "Format, minify & validate JSON", href: "/tools/json-formatter", badge: "Popular" },
      { icon: Lock, label: "Base64 Encoder / Decoder", desc: "Encode/decode Base64 with Unicode", href: "/tools/base64" },
      { icon: Link2, label: "URL Encoder / Decoder", desc: "Percent-encode and decode URLs", href: "/tools/url-encoder" },
      { icon: Minimize2, label: "CSS Minifier", desc: "Minify CSS files instantly", href: "/tools/css-minifier" },
      { icon: Code2, label: "HTML Formatter", desc: "Prettify & indent HTML", href: "/tools/html-formatter" },
      { icon: KeyRound, label: "JWT Decoder", desc: "Decode & inspect JWT tokens", href: "/tools/jwt-decoder", badge: "New" },
      { icon: BarChart, label: "Regex Tester", desc: "Test regular expressions live", href: "/tools/regex-tester", badge: "New" },
      { icon: Database, label: "SQL Formatter", desc: "Format & beautify SQL queries", href: "/tools/sql-formatter", badge: "New" },
      { icon: Shuffle, label: "UUID Generator", desc: "Generate v4 UUIDs in bulk", href: "/tools/uuid-generator" },
    ],
  },
  {
    key: "seo",
    label: "SEO Tools",
    icon: TrendingUp,
    color: "text-pink-400",
    bg: "bg-pink-400/10 border-pink-400/20",
    tools: [
      { icon: Globe, label: "Meta Tag Generator", desc: "Optimise meta titles & descriptions", href: "/tools/meta-tag-generator", badge: "New" },
      { icon: Link2, label: "URL Slug Generator", desc: "Clean, SEO-friendly slugs", href: "/tools/url-slug-generator", badge: "New" },
      { icon: TrendingUp, label: "Keyword Density", desc: "Check keyword frequency", href: "/tools/keyword-density", badge: "New" },
      { icon: Shield, label: "Robots.txt Generator", desc: "Generate robots.txt rules", href: "/tools/robots-txt-generator", badge: "New" },
      { icon: Tag, label: "Sitemap Validator", desc: "Validate XML sitemaps", href: "/tools/sitemap-validator", badge: "New" },
    ],
  },
  {
    key: "email",
    label: "Email Tools",
    icon: Mail,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
    tools: [
      { icon: Inbox, label: "Temp Email", desc: "Disposable throwaway inbox", href: "/tools/temp-mail/disposable", badge: "New" },
      { icon: Mail, label: "Temp Gmail", desc: "Real temporary Gmail address", href: "/tools/temp-mail/tempgmail", badge: "New" },
      { icon: Hash, label: "Gmail Tricks", desc: "Dot & plus-tag address variants", href: "/tools/temp-mail/gmail-tricks" },
      { icon: Pencil, label: "Subject Line Generator", desc: "AI-powered subject lines", href: "/tools/subject-line-generator" },
      { icon: ShieldCheck, label: "Email Validator", desc: "Validate format & MX records", href: "/tools/email-validator" },
      { icon: Mail, label: "Email Signature Generator", desc: "Professional email signature builder", href: "/tools/email-signature-generator" },
      { icon: FileText, label: "Plain Text Formatter", desc: "Convert HTML email to plain text", href: "/tools/plain-text-formatter" },
    ],
  },
];

const ALL_TOOLS_FLAT = TOOL_CATEGORIES.flatMap((c) =>
  c.tools.map((t) => ({ ...t, categoryLabel: c.label, categoryColor: c.color }))
);

const BADGE_STYLES: Record<string, string> = {
  Popular: "bg-amber-400/15 text-amber-400 border-amber-400/30",
  New: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  AI: "bg-purple-400/15 text-purple-400 border-purple-400/30",
  Soon: "bg-muted/60 text-muted-foreground border-border/50",
};

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/tools/temp-mail/disposable", label: "Temp Mail", icon: Inbox },
  { href: "/about", label: "About", icon: Info },
];

export function MobileNav() {
  const [location] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTools = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return ALL_TOOLS_FLAT.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q)
    );
  }, [search]);

  const handleToolClick = () => {
    setDrawerOpen(false);
    setSearch("");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md safe-area-pb">
        <div className="flex items-stretch h-14">
          {NAV.map(({ href, label, icon: Icon }) => {
            const isTools = href === "/tools";
            const isTempMail = href === "/tools/temp-mail/disposable";
            const active = isTools
              ? drawerOpen || location === href
              : isTempMail
                ? location.startsWith("/tools/temp-mail")
                : location === href;

            if (isTools) {
              return (
                <button
                  key={href}
                  onClick={() => setDrawerOpen(true)}
                  className={`flex-1 h-full flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
                  {label}
                </button>
              );
            }

            return (
              <Link key={href} href={href} className="flex-1">
                <button
                  className={`w-full h-full flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
                  {label}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Tools Drawer */}
      <Sheet open={drawerOpen} onOpenChange={(v) => { setDrawerOpen(v); if (!v) setSearch(""); }}>
        <SheetContent side="bottom" className="h-[85dvh] rounded-t-2xl px-0 pb-20 flex flex-col [&>button]:hidden">
          <SheetHeader className="px-4 pt-2 pb-3 border-b border-border/50 shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                All Tools
              </SheetTitle>
              <button
                onClick={() => { setDrawerOpen(false); setSearch(""); }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools…"
                className="pl-9 h-9 text-sm bg-muted/40 border-border/50 focus-visible:ring-primary/40"
                autoComplete="off"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pt-3">
            {/* Search results */}
            {filteredTools !== null ? (
              <div className="space-y-1">
                {filteredTools.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No tools found for &ldquo;{search}&rdquo;
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      {filteredTools.length} result{filteredTools.length !== 1 ? "s" : ""}
                    </p>
                    {filteredTools.map((tool) => {
                      const ToolIcon = tool.icon;
                      const isSoon = tool.badge === "Soon" || tool.href === "#";
                      const inner = (
                        <div
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 bg-card/40 transition-colors ${
                            isSoon ? "opacity-50" : "hover:bg-muted/50 cursor-pointer"
                          }`}
                        >
                          <ToolIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{tool.label}</div>
                            <div className="text-xs text-muted-foreground truncate">{tool.desc}</div>
                          </div>
                          {tool.badge && (
                            <span className={`text-[10px] font-semibold px-1.5 py-px rounded-full border shrink-0 ${BADGE_STYLES[tool.badge]}`}>
                              {tool.badge}
                            </span>
                          )}
                          {!isSoon && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
                        </div>
                      );
                      if (isSoon) return <div key={tool.label}>{inner}</div>;
                      return (
                        <Link key={tool.label} href={tool.href} onClick={handleToolClick}>
                          {inner}
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>
            ) : (
              /* Category accordion */
              <Accordion type="multiple" defaultValue={["social-media", "developer"]} className="space-y-2">
                {TOOL_CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon;
                  const liveCount = cat.tools.filter((t) => t.badge !== "Soon" && t.href !== "#").length;
                  return (
                    <AccordionItem
                      key={cat.key}
                      value={cat.key}
                      className="rounded-xl border border-border/60 bg-card/30 px-3 data-[state=open]:bg-card/50 transition-colors"
                    >
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${cat.bg}`}>
                            <CatIcon className={`h-3.5 w-3.5 ${cat.color}`} />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold leading-tight">{cat.label}</div>
                            <div className="text-[10px] text-muted-foreground">{liveCount} live tools</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="space-y-0.5 mt-1">
                          {cat.tools.map((tool) => {
                            const ToolIcon = tool.icon;
                            const isSoon = tool.badge === "Soon" || tool.href === "#";
                            const inner = (
                              <div
                                className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors ${
                                  isSoon
                                    ? "opacity-50"
                                    : "hover:bg-muted/60 cursor-pointer active:bg-muted"
                                }`}
                              >
                                <ToolIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium leading-snug">{tool.label}</div>
                                  <div className="text-[11px] text-muted-foreground">{tool.desc}</div>
                                </div>
                                {tool.badge && (
                                  <span className={`text-[9px] font-semibold px-1.5 py-px rounded-full border shrink-0 ${BADGE_STYLES[tool.badge]}`}>
                                    {tool.badge}
                                  </span>
                                )}
                                {!isSoon && <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                              </div>
                            );
                            if (isSoon) return <div key={tool.label}>{inner}</div>;
                            return (
                              <Link key={tool.label} href={tool.href} onClick={handleToolClick}>
                                {inner}
                              </Link>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
