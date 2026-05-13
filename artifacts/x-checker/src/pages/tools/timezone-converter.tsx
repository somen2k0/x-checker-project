import { useState, useMemo } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { Copy, Clock, Plus, Trash2, X } from "lucide-react";

const ALL_ZONES: string[] = Intl.supportedValuesOf("timeZone");

const POPULAR_ZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function formatInZone(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      weekday: "short",
    }).format(date);
  } catch {
    return "Invalid timezone";
  }
}

function getOffset(date: Date, tz: string): string {
  try {
    const utcMs = date.getTime();
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const diffMin = Math.round((tzDate.getTime() - utcDate.getTime()) / 60000);
    const sign = diffMin >= 0 ? "+" : "-";
    const abs = Math.abs(diffMin);
    const h = Math.floor(abs / 60).toString().padStart(2, "0");
    const m = (abs % 60).toString().padStart(2, "0");
    return `UTC${sign}${h}:${m}`;
  } catch {
    return "";
  }
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const faqs = [
  {
    q: "How does the timezone converter work?",
    a: "It uses the browser's built-in Intl.DateTimeFormat API, which knows the UTC offset for every IANA timezone — including daylight saving time adjustments. You enter a date and time in one timezone, and it automatically calculates the equivalent in any other timezone you add.",
  },
  {
    q: "What is UTC?",
    a: "UTC (Coordinated Universal Time) is the world's primary time standard. All other timezones are defined as offsets from UTC — for example, New York is UTC-5 in winter and UTC-4 in summer (daylight saving time). UTC itself never changes for daylight saving.",
  },
  {
    q: "Does this account for daylight saving time?",
    a: "Yes. The Intl API uses the full IANA timezone database, which includes all daylight saving time rules for every region. The conversion is always accurate for the specific date you choose — not just the current UTC offset.",
  },
  {
    q: "What is an IANA timezone?",
    a: "IANA timezones are the standardized names used by operating systems, databases, and programming languages — like 'America/New_York' or 'Europe/London'. They're more precise than abbreviations like 'EST' (which can mean different things in different countries).",
  },
  {
    q: "Can I compare more than two timezones?",
    a: "Yes. Click 'Add Timezone' to add as many target timezones as you need. Each one shows the converted time, date, and UTC offset side by side.",
  },
];

const relatedTools = [
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters, words, and lines." },
  { title: "Case Converter", href: "/tools/case-converter", description: "Convert text to camelCase, snake_case, and more." },
  { title: "UUID Generator", href: "/tools/uuid-generator", description: "Generate random UUIDs in bulk." },
  { title: "Base64 Encoder", href: "/tools/base64", description: "Encode and decode Base64 strings instantly." },
];

export default function TimezoneConverter() {
  const now = new Date();
  const [dateInput, setDateInput] = useState(toDatetimeLocal(now));
  const [sourceZone, setSourceZone] = useState("UTC");
  const [targetZones, setTargetZones] = useState<string[]>(["America/New_York", "Europe/London", "Asia/Tokyo"]);
  const [zoneSearch, setZoneSearch] = useState("");
  const { toast } = useToast();
  useToolView("timezone-converter");

  const parsedDate = useMemo(() => {
    if (!dateInput) return null;
    try {
      const localDate = new Date(dateInput);
      const localStr = localDate.toLocaleString("en-US", { timeZone: sourceZone });
      const asSource = new Date(new Date(dateInput).toLocaleString("en-US", { timeZone: "UTC" }));
      const diff = new Date(dateInput).toLocaleString("en-US", { timeZone: sourceZone });
      const utcOffset = (() => {
        const d = new Date(dateInput);
        const utcDate = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
        const srcDate = new Date(d.toLocaleString("en-US", { timeZone: sourceZone }));
        return utcDate.getTime() - srcDate.getTime();
      })();
      const utcMs = new Date(dateInput).getTime() + utcOffset;
      return new Date(utcMs);
    } catch {
      return null;
    }
  }, [dateInput, sourceZone]);

  const filteredZones = useMemo(() => {
    if (!zoneSearch.trim()) return POPULAR_ZONES;
    const q = zoneSearch.toLowerCase();
    return ALL_ZONES.filter((z) => z.toLowerCase().includes(q)).slice(0, 20);
  }, [zoneSearch]);

  const addZone = (zone: string) => {
    if (!targetZones.includes(zone)) {
      setTargetZones([...targetZones, zone]);
    }
    setZoneSearch("");
  };

  const removeZone = (zone: string) => {
    setTargetZones(targetZones.filter((z) => z !== zone));
  };

  const handleCopyAll = () => {
    if (!parsedDate) return;
    const lines = [
      `Source (${sourceZone}): ${formatInZone(parsedDate, sourceZone)}`,
      ...targetZones.map((tz) => `${tz}: ${formatInZone(parsedDate, tz)} (${getOffset(parsedDate, tz)})`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast({ title: "Copied!", description: "All timezone results copied to clipboard." });
  };

  return (
    <MiniToolLayout
      seoTitle="Time Zone Converter Online Free — Convert Time Between Time Zones"
      seoDescription="Convert time between any time zones instantly. Supports all IANA timezones including daylight saving time. Free, no signup, 100% browser-side."
      icon={Clock}
      badge="Developer Tool"
      title="Time Zone Converter"
      description="Pick a date, time, and source timezone — instantly see the equivalent time in any timezone worldwide. Supports all IANA timezones with accurate DST handling."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-5">
        {/* Source input */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-4">
          <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Source Date & Time</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Date & Time</label>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Source Timezone</label>
              <select
                value={sourceZone}
                onChange={(e) => setSourceZone(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                {ALL_ZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {parsedDate && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{sourceZone} · {getOffset(parsedDate, sourceZone)}</p>
                <p className="text-sm font-semibold">{formatInZone(parsedDate, sourceZone)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Target zones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Converted Timezones</p>
            {targetZones.length > 0 && parsedDate && (
              <Button variant="outline" size="sm" onClick={handleCopyAll} className="text-xs border-border/60 gap-1.5">
                <Copy className="h-3 w-3" />
                Copy All
              </Button>
            )}
          </div>

          {parsedDate ? (
            <div className="space-y-2">
              {targetZones.map((tz) => (
                <div
                  key={tz}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/30 px-4 py-3 group"
                >
                  <Clock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{tz} · {getOffset(parsedDate, tz)}</p>
                    <p className="text-sm font-semibold truncate">{formatInZone(parsedDate, tz)}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(formatInZone(parsedDate, tz));
                      toast({ title: "Copied!", description: `${tz} time copied.` });
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted/60 transition-all"
                    title="Copy"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => removeZone(tz)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all text-muted-foreground/40 hover:text-destructive"
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 py-10 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground/50">Enter a date and source timezone above</p>
            </div>
          )}
        </div>

        {/* Add timezone */}
        <div className="rounded-xl border border-border/60 bg-card/30 p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Timezone
          </p>
          <input
            type="text"
            placeholder="Search timezones... (e.g. London, Tokyo, New_York)"
            value={zoneSearch}
            onChange={(e) => setZoneSearch(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/40"
          />
          <div className="flex flex-wrap gap-2">
            {filteredZones.map((tz) => (
              <button
                key={tz}
                onClick={() => addZone(tz)}
                disabled={targetZones.includes(tz)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  targetZones.includes(tz)
                    ? "border-border/30 text-muted-foreground/30 cursor-not-allowed bg-muted/20"
                    : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5 cursor-pointer"
                }`}
              >
                {tz}
              </button>
            ))}
          </div>
        </div>

        {/* SEO content */}
        <div className="space-y-8 pt-6 border-t border-border/40">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Free Online Time Zone Converter</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This <strong>free time zone converter</strong> instantly converts any date and time to equivalent
              times in other timezones around the world. It uses the browser's built-in{" "}
              <code className="bg-muted/60 rounded px-1 py-0.5 text-xs font-mono">Intl.DateTimeFormat</code> API
              with the full IANA timezone database — so daylight saving time is always accounted for correctly.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Perfect for scheduling meetings across timezones, converting event times, planning international
              releases, and understanding what time it is anywhere in the world for a specific moment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Common Timezone Use Cases</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { title: "Remote team meetings", desc: "Schedule calls across New York, London, and Singapore without confusion." },
                { title: "Product launches", desc: "Coordinate global launch times so every region gets the right local time." },
                { title: "Deadline tracking", desc: "Convert deadline times from a client's timezone to your local time instantly." },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-1.5">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MiniToolLayout>
  );
}
