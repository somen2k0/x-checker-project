import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, type Tool } from "@/lib/tools-registry";

interface ToolCardProps {
  tool: Tool;
  compact?: boolean;
}

const BADGE_STYLES: Record<string, string> = {
  Popular: "bg-amber-400/15 text-amber-400 border-amber-400/30",
  New: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  AI: "bg-purple-400/15 text-purple-400 border-purple-400/30",
};

export function ToolCard({ tool, compact = false }: ToolCardProps) {
  const cat = CATEGORIES[tool.category];
  const { icon: Icon } = tool;

  const card = (
    <div
      className={`group relative flex flex-col rounded-xl border border-border/60 bg-card/50 transition-all duration-200 ${
        tool.isComingSoon
          ? "opacity-55 cursor-default"
          : "hover:border-primary/35 hover:bg-card hover:shadow-md hover:shadow-primary/5 cursor-pointer"
      } ${compact ? "p-4" : "p-5"}`}
    >
      {/* Top row: icon + badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 ${cat.bg}`}>
          <Icon className={`h-4.5 w-4.5 ${cat.color}`} style={{ height: "1.125rem", width: "1.125rem" }} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {tool.badge && !tool.isComingSoon && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${BADGE_STYLES[tool.badge]}`}>
              {tool.badge}
            </span>
          )}
          {tool.isComingSoon && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-border/50 text-muted-foreground/60 bg-muted/30">
              Soon
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className={`font-semibold leading-snug mb-1.5 group-hover:text-primary transition-colors ${compact ? "text-sm" : "text-sm"}`}>
        {tool.label}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">
        {tool.description}
      </p>

      {/* Category tag + arrow */}
      {!compact && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
          <span className={`text-[10px] font-medium ${cat.color} opacity-70`}>
            {cat.shortLabel}
          </span>
          {!tool.isComingSoon && (
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      )}
    </div>
  );

  if (tool.isComingSoon) return card;
  return <Link href={tool.href}>{card}</Link>;
}
