import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, Trash2, AtSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FAQS = [
  { q: "What does this tool do?", a: "It bulk adds or removes the @ prefix from a list of X (Twitter) usernames in one click." },
  { q: "What separators are supported?", a: "One username per line works best. The tool handles any mix of usernames with or without @." },
  { q: "Is there a limit on how many usernames I can process?", a: "No — paste as many as you need. Everything runs locally in your browser." },
  { q: "Does any data get sent to a server?", a: "No. This tool runs entirely in your browser — no usernames are ever sent to our servers." },
  { q: "Can I copy just one username from the result?", a: "Yes — hover over any username in the result list and click the copy icon that appears." },
];

export default function AtFormatter() {
  const [atInput, setAtInput] = useState("");
  const [atMode, setAtMode] = useState<"add" | "remove">("add");
  const { toast } = useToast();

  const atLines = atInput.split(/\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const atOutput = atLines.map((u) =>
    atMode === "add" ? (u.startsWith("@") ? u : `@${u}`) : u.replace(/^@+/, "")
  );

  return (
    <MiniToolLayout
      seoTitle="@ Formatter — Bulk Add or Remove @ From X Usernames Free"
      seoDescription="Instantly add or remove the @ prefix from a list of X (Twitter) usernames. Paste your list and get formatted results in one click. Free, no signup."
      icon={AtSign}
      badge="Free Tool"
      title="@ Formatter"
      description="Bulk add or remove the @ prefix from username lists in one click. Paste one username per line."
      faqs={FAQS}
      affiliateCategory="growth"
      relatedTools={[
        { title: "X Account Checker", href: "/tools/x-account-checker", description: "Bulk-check if accounts are active, suspended, or deleted." },
        { title: "Profile Link Generator", href: "/tools/profile-link-generator", description: "Convert usernames to X profile links instantly." },
        { title: "Username Generator", href: "/tools/username-generator", description: "Generate unique X handle ideas for any niche." },
        { title: "Hashtag Formatter", href: "/tools/hashtag-formatter", description: "Clean, format, and deduplicate hashtag lists." },
      ]}
    >
      <div className="space-y-5">
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">@ Formatter</CardTitle>
            <CardDescription>Bulk add or remove the @ prefix from username lists.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(["add", "remove"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={atMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAtMode(mode)}
                  className={`flex-1 text-xs ${atMode !== mode ? "border-border/60" : ""}`}
                >
                  {mode === "add" ? "Add @" : "Remove @"}
                </Button>
              ))}
            </div>
            <Textarea
              value={atInput}
              onChange={(e) => setAtInput(e.target.value)}
              placeholder={"elonmusk\n@jack\nsama"}
              className="min-h-[150px] font-mono text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40 placeholder:text-muted-foreground/40"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{atLines.length} username{atLines.length !== 1 ? "s" : ""}</span>
              <Button variant="outline" size="sm" disabled={!atLines.length} onClick={() => setAtInput("")} className="text-xs border-border/60">
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {atOutput.length > 0 && (
          <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold">Result</CardTitle>
                <CardDescription className="text-xs">@ {atMode === "add" ? "added to" : "removed from"} {atOutput.length} username{atOutput.length !== 1 ? "s" : ""}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(atOutput.join("\n"));
                  toast({ title: "Copied!", description: `${atOutput.length} usernames copied.` });
                }}
                className="text-xs border-border/60"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/50 bg-background/40 p-4 max-h-72 overflow-y-auto">
                <ul className="space-y-1.5">
                  {atOutput.map((u, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 group">
                      <span className="font-mono text-sm text-foreground">{u}</span>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(u); toast({ title: "Copied!", description: u }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        title="Copy"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MiniToolLayout>
  );
}
