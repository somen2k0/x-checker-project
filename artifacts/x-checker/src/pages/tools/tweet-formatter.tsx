import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Copy, Trash2, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrack, useToolView } from "@/hooks/use-track";

const CHAR_LIMIT = 280;

function splitIntoTweets(text: string, limit: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const tweets: string[] = [];
  let current = "";

  for (const word of words) {
    const separator = current ? " " : "";
    const candidate = current + separator + word;
    if (candidate.length <= limit - 6) {
      current = candidate;
    } else {
      if (current) tweets.push(current.trim());
      current = word;
    }
  }
  if (current.trim()) tweets.push(current.trim());

  return tweets.map((t, i) => `${t} ${i + 1}/${tweets.length}`);
}

const faqs = [
  { q: "What is a tweet thread?", a: "A tweet thread is a series of connected tweets from the same account. Each tweet in the thread is a reply to the previous one, creating a chain. Threads are used to share longer stories, explanations, or content that exceeds the 280-character limit." },
  { q: "How do I post a tweet thread?", a: "On Twitter/X, click the '+' button after typing your first tweet to add another tweet to the thread before posting. Alternatively, post the first tweet, then reply to it with the next tweet in the series. This tool helps you prepare all the text in advance." },
  { q: "What does the tweet numbering (1/5) mean?", a: "The format '1/5' means 'tweet 1 of 5 total'. This is a common convention to help readers know they're in a thread and how many tweets to expect. Our formatter automatically appends this numbering." },
  { q: "Can I remove the tweet numbers?", a: "The formatter adds tweet numbers (1/3, 2/3, etc.) by default since they're a standard thread convention. If you prefer no numbers, you can manually edit each tweet after copying." },
  { q: "What is the character limit for Twitter threads?", a: "Each individual tweet in a thread still has a 280-character limit. Twitter Blue / X Premium users have a 25,000-character limit per tweet. This formatter defaults to 280 characters, leaving 6 characters for the numbering (e.g., ' 3/10')." },
  { q: "Is there a limit to how many tweets a thread can have?", a: "Twitter doesn't publish a strict limit on thread length, but very long threads (25+ tweets) often see sharply declining engagement. For best results, keep threads to 5-15 tweets and make every tweet count." },
];

const relatedTools = [
  { title: "Character Counter", href: "/tools/character-counter", description: "Count characters in real time against Twitter's limits." },
  { title: "Hashtag Formatter", href: "/tools/hashtag-formatter", description: "Convert words to properly formatted #hashtags." },
  { title: "Twitter Font Preview", href: "/tools/font-preview", description: "Preview text in Unicode font styles." },
  { title: "Bio Generator", href: "/tools/bio-ideas", description: "Generate Twitter bio ideas for any niche." },
];

const EXAMPLE = `Twitter threads are one of the best ways to share long-form content on X. Instead of writing a blog post that nobody reads, you can break your ideas into connected tweets that people will actually engage with.

The key to a great thread is having a strong opening tweet that makes people want to keep reading. Your first tweet should hook the reader immediately.

End with a clear takeaway or call to action. Ask a question, share a resource, or tell people what to do next. Threads that end with engagement prompts get significantly more replies and retweets.`;

export default function TweetFormatter() {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const track = useTrack("tweet-formatter");
  useToolView("tweet-formatter");

  const tweets = input.trim() ? splitIntoTweets(input, CHAR_LIMIT) : [];

  const loadExample = () => {
    setInput(EXAMPLE);
    track("format_tweet", { label: "example" });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(tweets.join("\n\n---\n\n"));
    track("copy_tweet", { label: "all", value: tweets.length });
    toast({ title: "All tweets copied!", description: `${tweets.length} tweets copied as a block.` });
  };

  const copyTweet = (tweet: string, idx: number) => {
    navigator.clipboard.writeText(tweet);
    track("copy_tweet", { label: "single", value: idx + 1 });
    toast({ title: "Copied!", description: "Tweet copied to clipboard." });
  };

  return (
    <MiniToolLayout
      seoTitle="Tweet Thread Formatter — Split Long Text into Twitter Threads"
      seoDescription="Automatically split long text into a numbered tweet thread. Each tweet stays under 280 characters. Perfect for creating Twitter threads from articles or notes."
      icon={MessageSquare}
      badge="Free Tool"
      title="Tweet Thread Formatter"
      description="Paste any long text and automatically split it into a numbered tweet thread. Each tweet is kept under 280 characters with thread numbering (1/5, 2/5, etc.) added automatically."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="scheduling"
    >
      <div className="space-y-5">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Long Text Input</label>
            <button onClick={loadExample} className="text-xs text-primary hover:underline">Load example</button>
          </div>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your long text, article draft, or notes here. It will be split into a numbered tweet thread automatically..."
            className="min-h-[180px] text-sm bg-background/60 border-border/60 resize-y focus-visible:ring-primary/40"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{input.length} characters · {input.trim() ? input.trim().split(/\s+/).length : 0} words</span>
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input} className="text-xs border-border/60 h-7">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          </div>
        </div>

        {/* Output */}
        {tweets.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Thread Preview</h3>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/8">
                  {tweets.length} tweet{tweets.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={copyAll} className="text-xs border-border/60 h-7">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy All
              </Button>
            </div>
            <div className="space-y-3">
              {tweets.map((tweet, i) => (
                <div key={i} className="group relative rounded-xl border border-border/60 bg-card/50 p-4 hover:border-primary/25 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary font-mono">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed text-foreground">{tweet}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-mono ${tweet.length > 270 ? "text-yellow-500" : "text-muted-foreground/60"}`}>
                          {tweet.length} / {CHAR_LIMIT} chars
                        </span>
                        <button
                          onClick={() => copyTweet(tweet, i)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" /> Thread tips
          </h3>
          <ul className="space-y-1">
            {[
              "Open with your strongest insight or a compelling hook.",
              "Each tweet should deliver value on its own.",
              "End the thread with a question or CTA to boost replies.",
              "Add hashtags to the last tweet for discoverability.",
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
