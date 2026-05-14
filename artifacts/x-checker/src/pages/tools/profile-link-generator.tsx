import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, ExternalLink, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FAQS = [
  { q: "What does this tool do?", a: "It converts a list of X (Twitter) usernames into clickable profile URLs — one per line, comma-separated, or space-separated." },
  { q: "Does it verify the accounts exist?", a: "No, it just builds the URLs. Use the X Account Checker tool if you also need to verify the accounts are active." },
  { q: "Can I include the @ symbol?", a: "Yes — the tool automatically strips the @ prefix before building the link." },
  { q: "How many usernames can I process at once?", a: "There is no hard limit — paste as many usernames as you need." },
  { q: "What format are the links in?", a: "Links are in the format https://x.com/username — the current canonical X profile URL." },
];

export default function ProfileLinkGenerator() {
  const [profileInput, setProfileInput] = useState("");
  const { toast } = useToast();

  const profileUsernames = profileInput
    .split(/[\s,\n]+/).map((u) => u.trim().replace(/^@/, "")).filter((u) => u.length > 0);
  const profileLinks = profileUsernames.map((u) => ({ username: u, url: `https://x.com/${u}` }));

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: url });
  };

  const handleCopyAllLinks = () => {
    if (!profileLinks.length) return;
    navigator.clipboard.writeText(profileLinks.map((l) => l.url).join("\n"));
    toast({ title: "Copied all links!", description: `${profileLinks.length} links copied.` });
  };

  return (
    <MiniToolLayout
      seoTitle="X Profile Link Generator — Convert Usernames to X Profile URLs Free"
      seoDescription="Instantly convert a list of X (Twitter) usernames into direct profile links. Paste multiple usernames and get all profile URLs in one click. Free."
      icon={Link2}
      badge="Free Tool"
      title="Profile Link Generator"
      description="Convert a list of X usernames into direct profile links instantly. Paste one per line, comma-separated, or space-separated."
      faqs={FAQS}
      affiliateCategory="growth"
      relatedTools={[
        { title: "X Account Checker", href: "/tools/x-account-checker", description: "Bulk-check if accounts are active, suspended, or deleted." },
        { title: "@ Formatter", href: "/tools/at-formatter", description: "Bulk add or remove the @ prefix from username lists." },
        { title: "Username Generator", href: "/tools/username-generator", description: "Generate unique X handle ideas for any niche." },
        { title: "AI Bio Generator", href: "/tools/bio-generator", description: "Generate professional X bios with AI." },
      ]}
    >
      <div className="space-y-5">
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Profile Link Generator</CardTitle>
            <CardDescription>Paste usernames to generate X profile links instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={profileInput}
              onChange={(e) => setProfileInput(e.target.value)}
              placeholder={"elonmusk\n@jack\nsama"}
              className="min-h-[120px] font-mono text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40 placeholder:text-muted-foreground/40"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{profileUsernames.length} username{profileUsernames.length !== 1 ? "s" : ""}</span>
              <Button variant="outline" size="sm" disabled={!profileLinks.length} onClick={handleCopyAllLinks} className="text-xs border-border/60">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy All
              </Button>
            </div>
          </CardContent>
        </Card>

        {profileLinks.length > 0 && (
          <Card className="border-border/60 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Generated Links</CardTitle>
              <CardDescription className="text-xs">{profileLinks.length} profile link{profileLinks.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/50 bg-background/40 divide-y divide-border/40 overflow-hidden">
                {profileLinks.map(({ username, url }) => (
                  <div key={username} className="flex items-center gap-3 px-3 py-2.5 group hover:bg-muted/30 transition-colors">
                    <span className="text-sm font-medium text-foreground/80 shrink-0 w-32 truncate">@{username}</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex-1 truncate">{url}</a>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleCopyLink(url)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" title="Copy link">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" title="Open profile">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MiniToolLayout>
  );
}
