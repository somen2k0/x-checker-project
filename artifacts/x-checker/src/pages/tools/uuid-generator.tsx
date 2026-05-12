import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { Shuffle, Copy, Trash2, ShieldCheck, Zap } from "lucide-react";

const faqs = [
  { q: "What is a UUID?", a: "A UUID (Universally Unique Identifier) is a 128-bit label used to uniquely identify information in computer systems. The standard format is 8-4-4-4-12 hexadecimal characters separated by hyphens, e.g. 550e8400-e29b-41d4-a716-446655440000." },
  { q: "What is UUID v4?", a: "UUID version 4 is randomly generated. It uses 122 random bits and 6 fixed bits to denote the version and variant. It is the most commonly used UUID version because it requires no coordination between systems and has an astronomically low collision probability." },
  { q: "Can UUIDs collide?", a: "Theoretically yes, but practically no. With UUID v4, the probability of generating two identical UUIDs is so low that you'd need to generate about 1 billion UUIDs per second for 85 years before having a 50% chance of a single collision." },
  { q: "Is it safe to use UUIDs as primary keys?", a: "Yes. UUIDs are widely used as database primary keys, especially in distributed systems where auto-incrementing integers would create conflicts across multiple nodes. The main tradeoff is that UUIDs are larger (16 bytes vs 4-8 bytes) and can reduce index performance at very large scale." },
];

const relatedTools = [
  { title: "Base64 Encoder / Decoder", href: "/tools/base64", description: "Encode and decode Base64 strings." },
  { title: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON instantly." },
  { title: "URL Encoder / Decoder", href: "/tools/url-encoder", description: "Encode or decode URLs and query parameters." },
];

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, generateUUID));
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);
  const { toast } = useToast();
  useToolView("uuid-generator");

  const format = (id: string) => {
    let v = id;
    if (noDashes) v = v.replace(/-/g, "");
    if (uppercase) v = v.toUpperCase();
    return v;
  };

  const generate = () => {
    setUuids(Array.from({ length: count }, generateUUID));
  };

  const copyOne = (id: string) => {
    navigator.clipboard.writeText(format(id));
    toast({ title: "Copied!", description: "UUID copied to clipboard." });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.map(format).join("\n"));
    toast({ title: "Copied!", description: `${uuids.length} UUIDs copied to clipboard.` });
  };

  const clear = () => setUuids([]);

  return (
    <MiniToolLayout
      seoTitle="UUID Generator Online Free — v4 UUID"
      seoDescription="Generate random UUID v4 identifiers online for free. Instant generation, no signup, 100% client-side."
      icon={Shuffle}
      badge="Developer Tool"
      title="UUID Generator"
      description="Generate random UUID v4 identifiers instantly. All UUIDs are generated in your browser using the Web Crypto API — nothing is sent to a server."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Count:</span>
            <div className="flex items-center gap-1">
              {[1, 5, 10, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${count === n ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:text-foreground"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded" />
              Uppercase
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              <input type="checkbox" checked={noDashes} onChange={(e) => setNoDashes(e.target.checked)} className="rounded" />
              No dashes
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} className="text-xs shadow-sm shadow-primary/20 gap-1.5">
            <Shuffle className="h-3.5 w-3.5" />
            Generate {count} UUID{count !== 1 ? "s" : ""}
          </Button>
          <Button variant="outline" size="sm" onClick={copyAll} disabled={uuids.length === 0} className="text-xs border-border/60 gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Copy All
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} disabled={uuids.length === 0} className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>

        {uuids.length > 0 && (
          <div className="space-y-2">
            {uuids.map((id, i) => (
              <div key={i} className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card/40 hover:border-primary/30 hover:bg-card transition-all">
                <code className="flex-1 font-mono text-sm text-foreground/90 break-all">{format(id)}</code>
                <button
                  onClick={() => copyOne(id)}
                  className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uuids.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border border-dashed border-border/40">
            <Shuffle className="h-8 w-8 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground/50">Click Generate to create UUIDs</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {[{ icon: ShieldCheck, label: "100% client-side" }, { icon: Zap, label: "Web Crypto API" }, { icon: Shuffle, label: "UUID v4" }].map(({ icon: Ic, label }) => (
            <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
              <Ic className="h-3 w-3" />{label}
            </div>
          ))}
        </div>
      </div>
    </MiniToolLayout>
  );
}
