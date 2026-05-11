import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeedbackModal } from "@/components/FeedbackModal";
import { MessageSquare, Wrench, Home, Info, Menu, X, Layers } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/about", label: "About", icon: Info },
];

export function Navbar() {
  const [location] = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = location === href;
              return (
                <Link key={href} href={href}>
                  <button className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}>
                    {label}
                  </button>
                </Link>
              );
            })}
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

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
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
