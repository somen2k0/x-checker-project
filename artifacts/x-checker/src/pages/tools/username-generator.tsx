import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtSign, Copy, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";

const PREFIXES = ["the", "its", "hey", "real", "official", "im", "just", "only", "actual"];
const SUFFIXES = ["hq", "official", "real", "xyz", "io", "app", "co", "dev", "pro"];
const CONNECTORS = ["_", ".", ""];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateUsernames(keyword: string): string[] {
  if (!keyword.trim()) return [];
  const kw = keyword.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!kw) return [];
  const year = new Date().getFullYear();
  const digits = ["0", "1", "7", "99", "x", "2k", String(year).slice(2)];
  const results = new Set<string>();
  for (const d of digits) results.add(`${kw}${d}`);
  for (const d of digits) results.add(`${d}${kw}`);
  for (const p of shuffle(PREFIXES).slice(0, 5)) {
    for (const c of CONNECTORS) results.add(`${p}${c}${kw}`);
  }
  for (const s of shuffle(SUFFIXES).slice(0, 5)) {
    for (const c of CONNECTORS) results.add(`${kw}${c}${s}`);
  }
  if (keyword.trim().includes(" ")) {
    const parts = keyword.trim().toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, ""));
    for (const c of CONNECTORS) results.add(parts.join(c));
    results.add(parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(""));
  }
  results.add(`${kw}s`);
  results.add(`${kw}hq`);
  results.add(`${kw}bot`);
  results.add(`x${kw}`);
  results.add(`${kw}on_x`);
  results.add(`${kw}tweets`);
  results.add(`${kw}says`);
  return shuffle([...results]).slice(0, 20).filter(u => u.length >= 4 && u.length <= 15);
}

const faqs = [
  { q: "What makes a good Twitter username?", a: "A good Twitter username (@handle) is short (under 15 characters), easy to remember, easy to spell, and ideally matches your real name or brand. Avoid numbers unless they're meaningful, excessive underscores, or anything that looks like spam." },
  { q: "What is the character limit for Twitter usernames?", a: "Twitter usernames (@handles) can be between 4 and 15 characters long. They can only contain letters (A-Z), numbers (0-9), and underscores (_). Spaces, special characters, and hyphens are not allowed." },
  { q: "Can I change my Twitter username?", a: "Yes, you can change your Twitter username at any time from Settings → Your Account → Account information → Username. Your old username immediately becomes available for others to claim." },
  { q: "How do I check if a Twitter username is available?", a: "Use our Account Checker tool to check if a Twitter account with that username exists. If it shows 'Not Found', the username may be available. You can also simply try registering it at twitter.com." },
  { q: "Should my Twitter username match my name or brand?", a: "Ideally yes — consistency across platforms makes you easier to find and more memorable. If your exact name is taken, try adding your niche keyword (e.g., @johndev, @sarahdesigns) or a professional suffix like @nameHQ." },
  { q: "Are numbers in Twitter usernames bad?", a: "Numbers like '99', '2k', or a graduation year can be acceptable if they mean something. Random numbers (like 'user4829271') look spammy. If your name is taken, try adding a meaningful word rather than random numbers." },
];

const relatedTools = [
  { title: "Twitter Name Ideas", href: "/tools/name-ideas", description: "Curated display name ideas by niche." },
  { title: "Account Checker", href: "/tools/x-account-checker", description: "Check if specific X usernames are active on X." },
  { title: "@ Formatter", href: "/tools/at-formatter", description: "Bulk add or remove @ from username lists." },
  { title: "Profile Link Generator", href: "/tools/profile-link-generator", description: "Turn usernames into direct X profile links." },
];

export default function UsernameGenerator() {
  const [input, setInput] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const { toast } = useToast();
  const track = useTrack("username-generator");
  useToolView("username-generator");

  const generate = () => {
    const result = generateUsernames(input);
    setUsernames(result);
    setGenerated(true);
    track("generate_username", { label: input.trim().slice(0, 20) });
  };

  const regenerate = () => {
    const result = generateUsernames(input);
    setUsernames(result);
    track("generate_username", { label: "shuffle" });
  };

  const copy = (u: string) => {
    navigator.clipboard.writeText(`@${u}`);
    track("copy_username", { label: u });
    toast({ title: "Copied!", description: `@${u} copied.` });
  };

  return (
    <MiniToolLayout
      seoTitle="Twitter Username Generator — Find Unique @Handles in 2025"
      seoDescription="Generate unique Twitter username ideas based on your name or keyword. Get 20 creative @handle suggestions with prefixes, suffixes, and variations. Free tool."
      icon={AtSign}
      badge="Free Tool"
      title="Twitter Username Generator"
      description="Enter your name, brand, or keyword and instantly generate 20+ creative Twitter username ideas. Click any username to copy it, then check availability with our Account Checker."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">@</span>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              placeholder="yourname, brand, niche..."
              className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40 pl-8"
            />
          </div>
          <Button onClick={generate} disabled={!input.trim()} className="text-xs shadow-sm shadow-primary/20 min-w-[120px]">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate
          </Button>
        </div>

        {generated && usernames.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{usernames.length} Username Ideas</h3>
              <button onClick={regenerate} className="text-xs text-primary hover:underline flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Shuffle
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {usernames.map((u, i) => (
                <button
                  key={i}
                  onClick={() => copy(u)}
                  title="Click to copy"
                  className="group flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5 hover:border-primary/35 hover:bg-primary/5 transition-all text-left"
                >
                  <span className="font-mono text-sm font-medium text-foreground">@{u}</span>
                  <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-1 text-sm">
              <p className="font-semibold text-foreground/80 text-xs uppercase tracking-wide">Next step: Check availability</p>
              <p className="text-xs text-muted-foreground">
                Copy a username and use the <a href="/tools/x-account-checker" className="text-primary hover:underline">Account Checker</a> to see if it's already taken.
              </p>
            </div>
          </div>
        )}

        {generated && usernames.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No valid usernames generated. Try a different keyword (letters and numbers only).
          </p>
        )}

        <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground/80">Tips for a great username</h3>
          <ul className="space-y-1">
            {[
              "Keep it under 12 characters if possible — easier to remember and tag.",
              "Use your real name or brand name if available.",
              "Avoid random numbers — they look spammy.",
              "Check if the same handle is available on Instagram and TikTok for consistency.",
            ].map((tip, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MiniToolLayout>
  );
}
