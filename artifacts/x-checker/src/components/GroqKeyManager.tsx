import { useState } from "react";
import { ShieldCheck, Eye, EyeOff, X, Plus, Zap, Info, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroqKeys } from "@/hooks/use-groq-keys";

interface GroqKeyManagerProps {
  compact?: boolean;
}

export function GroqKeyManager({ compact = false }: GroqKeyManagerProps) {
  const { keys, addKey, removeKey } = useGroqKeys();
  const [newKey, setNewKey] = useState("");
  const [revealIdx, setRevealIdx] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const maskKey = (k: string) => {
    if (k.length <= 11) return "•".repeat(k.length);
    return `${k.slice(0, 7)}${"•".repeat(Math.min(16, k.length - 11))}${k.slice(-4)}`;
  };

  const handleAdd = () => {
    const k = newKey.trim();
    if (!k) return;
    if (!k.startsWith("gsk_")) {
      setAddError("Groq keys start with gsk_");
      return;
    }
    const added = addKey(k);
    if (!added) {
      setAddError("This key is already in the list.");
      return;
    }
    setNewKey("");
    setAddError(null);
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
          Groq API Keys
          {keys.length > 0 && (
            <span className="ml-1 text-[10px] bg-purple-400/15 text-purple-400 border border-purple-400/25 rounded-full px-2 py-0.5 font-mono">
              {keys.length} key{keys.length > 1 ? "s" : ""}
            </span>
          )}
        </label>
        <a
          href="https://console.groq.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
        >
          Get free key →
        </a>
      </div>

      {/* Existing keys list */}
      {keys.length > 0 && (
        <div className="space-y-1.5">
          {keys.map((k, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                i === 0
                  ? "border-purple-500/30 bg-purple-500/5"
                  : "border-border/50 bg-background/30"
              }`}
            >
              {i === 0 && (
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-0.5">
                  <RotateCw className="h-2.5 w-2.5" />active
                </span>
              )}
              {i > 0 && (
                <span className="shrink-0 text-[9px] text-muted-foreground/40 w-10 text-center">
                  key {i + 1}
                </span>
              )}
              <code className="flex-1 min-w-0 font-mono text-foreground/80 truncate">
                {revealIdx === i ? k : maskKey(k)}
              </code>
              <button
                onClick={() => setRevealIdx(revealIdx === i ? null : i)}
                className="shrink-0 text-muted-foreground/50 hover:text-foreground/70 transition-colors p-0.5"
                title={revealIdx === i ? "Hide" : "Reveal"}
              >
                {revealIdx === i
                  ? <EyeOff className="h-3.5 w-3.5" />
                  : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => { removeKey(i); if (revealIdx === i) setRevealIdx(null); }}
                className="shrink-0 text-muted-foreground/50 hover:text-red-400 transition-colors p-0.5"
                title="Remove key"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new key */}
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <input
            type="password"
            value={newKey}
            onChange={(e) => { setNewKey(e.target.value); setAddError(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={keys.length === 0 ? "gsk_…  (paste your Groq API key)" : "gsk_…  (add another key)"}
            className="flex-1 min-w-0 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 font-mono"
          />
          <Button
            onClick={handleAdd}
            disabled={!newKey.trim()}
            size="sm"
            className="shrink-0 gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />Add
          </Button>
        </div>
        {addError && (
          <p className="text-[11px] text-red-400 flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />{addError}
          </p>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
        {keys.length > 1 ? (
          <>
            <Zap className="h-3 w-3 shrink-0 text-purple-400" />
            Keys rotate automatically when one hits a rate limit.
          </>
        ) : (
          <>
            <Info className="h-3 w-3 shrink-0" />
            {compact
              ? "Stored locally in your browser."
              : "Stored locally in your browser. Never sent to our servers. Add multiple keys to avoid rate limits."}
          </>
        )}
      </p>
    </div>
  );
}
