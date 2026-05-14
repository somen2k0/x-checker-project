import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, X, ChevronRight, Command } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { searchTools, CATEGORIES } from "@/lib/tools-registry";

const BADGE_STYLES: Record<string, string> = {
  Popular: "bg-amber-400/15 text-amber-400 border-amber-400/30",
  New:     "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  AI:      "bg-purple-400/15 text-purple-400 border-purple-400/30",
};

export function NavSearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  const results = useMemo(() => searchTools(query).slice(0, 8), [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    navigate(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Search tools (⌘K)"
        className="hidden md:flex items-center justify-center h-8 w-8 rounded-md border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground shrink-0"
      >
        <Search className="h-3.5 w-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden [&>button]:hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd
              onClick={() => setOpen(false)}
              className="text-[10px] text-muted-foreground border border-border/50 rounded px-1.5 py-0.5 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2">
            {results.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No tools found for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <ul>
                {results.map((tool) => {
                  const Icon = tool.icon;
                  const cat = CATEGORIES[tool.category];
                  return (
                    <li key={tool.id}>
                      <button
                        onClick={() => handleSelect(tool.href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left group"
                      >
                        <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${cat.bg}`}>
                          <Icon className={`h-3.5 w-3.5 ${cat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium leading-tight">{tool.label}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{tool.description}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {tool.badge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${BADGE_STYLES[tool.badge] ?? ""}`}>
                              {tool.badge}
                            </span>
                          )}
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground/50">
            <span>{results.length} result{results.length !== 1 ? "s" : ""}</span>
            <span>Press Enter to select · Esc to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
