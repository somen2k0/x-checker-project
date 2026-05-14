import { useState } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { useToolView } from "@/hooks/use-track";

const faqs = [
  { q: "What is a healthy follower-to-following ratio?", a: "A ratio above 1.0 (more followers than following) generally signals influence. Accounts with a ratio of 2:1 or higher are considered well-established. New accounts naturally start below 1.0 while growing." },
  { q: "What is a good engagement rate on X?", a: "Average engagement rate on X is 0.5–1%. Rates above 1% are considered good, above 3% are excellent. Niche accounts often achieve higher rates than large mass-market accounts." },
  { q: "How do I increase my follower growth rate?", a: "Post consistently (1–3 times daily), engage with replies and quote tweets, use relevant hashtags, participate in trending topics in your niche, and collaborate with accounts of similar size." },
  { q: "What does a low engagement rate mean?", a: "Low engagement often means your content isn't resonating, you may have accumulated inactive followers, or your posting times don't match when your audience is online. Audit your content and posting schedule." },
  { q: "How often should I audit my X account metrics?", a: "Monthly audits are ideal for growing accounts. Track follower count, engagement rate, and ratio over time to spot trends early and adjust your strategy accordingly." },
];

const relatedTools = [
  { title: "Profile Audit", href: "/tools/profile-audit", description: "Get a full audit score for your X profile." },
  { title: "Tweet Scheduler", href: "/tools/tweet-scheduler", description: "Plan and schedule your tweet content calendar." },
  { title: "Account Checker", href: "/tools/x-account-checker", description: "Bulk-check X account statuses in seconds." },
];

function getRatioRating(ratio: number) {
  if (ratio >= 5) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30", icon: TrendingUp };
  if (ratio >= 2) return { label: "Good", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30", icon: TrendingUp };
  if (ratio >= 1) return { label: "Average", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", icon: Minus };
  return { label: "Needs Work", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30", icon: TrendingDown };
}

function getEngagementRating(rate: number) {
  if (rate >= 3) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" };
  if (rate >= 1) return { label: "Good", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" };
  if (rate >= 0.5) return { label: "Average", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" };
  return { label: "Low", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" };
}

export default function FollowerAnalyzer() {
  const [followers, setFollowers] = useState("");
  const [following, setFollowing] = useState("");
  const [likes, setLikes] = useState("");
  const [tweets, setTweets] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  useToolView("follower-analyzer");

  const followerNum = parseInt(followers.replace(/,/g, "")) || 0;
  const followingNum = parseInt(following.replace(/,/g, "")) || 0;
  const likesNum = parseInt(likes.replace(/,/g, "")) || 0;
  const tweetsNum = parseInt(tweets.replace(/,/g, "")) || 0;

  const ratio = followingNum > 0 ? followerNum / followingNum : followerNum;
  const engagementRate = followerNum > 0 && tweetsNum > 0 ? (likesNum / tweetsNum / followerNum) * 100 : 0;
  const tweetsPerFollower = followerNum > 0 ? tweetsNum / followerNum : 0;

  const ratioRating = getRatioRating(ratio);
  const engRating = getEngagementRating(engagementRate);
  const RatioIcon = ratioRating.icon;

  const tips: string[] = [];
  if (ratio < 1) tips.push("Your following count exceeds followers. Unfollow inactive accounts to improve your ratio.");
  if (engagementRate < 0.5 && followerNum > 0) tips.push("Engagement is low. Try posting polls, asking questions, and replying to comments.");
  if (tweetsPerFollower < 0.001) tips.push("You have very few tweets per follower. Consistent posting builds authority.");
  if (followingNum > 5000 && ratio < 2) tips.push("You're following many accounts. Consider doing a periodic cleanup to stay focused.");
  if (engagementRate > 3) tips.push("Your engagement rate is excellent! Keep doing what you're doing.");
  if (ratio >= 5) tips.push("Great follower ratio! You've built real authority in your space.");

  return (
    <MiniToolLayout
      seoTitle="X Follower Analyzer — Check Your Follower Ratio & Engagement Rate"
      seoDescription="Analyze your X (Twitter) account metrics instantly. Check your follower-to-following ratio, engagement rate, and get personalized tips to grow faster. Free, no login."
      icon={Users}
      badge="X Tool"
      title="Follower Analyzer"
      description="Enter your X account stats below to get an instant analysis of your follower ratio, engagement rate, and personalized growth tips — no login required."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="growth"
    >
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Followers", value: followers, set: setFollowers, placeholder: "e.g. 12500" },
            { label: "Following", value: following, set: setFollowing, placeholder: "e.g. 800" },
            { label: "Total Likes Received (last 30 tweets)", value: likes, set: setLikes, placeholder: "e.g. 340" },
            { label: "Total Tweets (all time)", value: tweets, set: setTweets, placeholder: "e.g. 4200" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">{label}</label>
              <Input
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40"
              />
            </div>
          ))}
        </div>

        <Button
          onClick={() => setAnalyzed(true)}
          disabled={!followerNum}
          className="w-full"
        >
          <Users className="h-4 w-4 mr-2" /> Analyze My Account
        </Button>

        {analyzed && followerNum > 0 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className={`rounded-xl border p-4 text-center ${ratioRating.bg}`}>
                <RatioIcon className={`h-5 w-5 mx-auto mb-1 ${ratioRating.color}`} />
                <div className={`text-2xl font-bold ${ratioRating.color}`}>{ratio >= 1000 ? "1000+" : ratio.toFixed(1)}x</div>
                <div className="text-xs text-muted-foreground mt-0.5">Follower Ratio</div>
                <div className={`text-xs font-semibold mt-1 ${ratioRating.color}`}>{ratioRating.label}</div>
              </div>
              {tweetsNum > 0 && (
                <div className={`rounded-xl border p-4 text-center ${engRating.bg}`}>
                  <TrendingUp className={`h-5 w-5 mx-auto mb-1 ${engRating.color}`} />
                  <div className={`text-2xl font-bold ${engRating.color}`}>{engagementRate.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Engagement Rate</div>
                  <div className={`text-xs font-semibold mt-1 ${engRating.color}`}>{engRating.label}</div>
                </div>
              )}
              <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-bold text-foreground">{followerNum.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Total Followers</div>
                <div className="text-xs font-semibold mt-1 text-primary">
                  {followerNum < 1000 ? "Growing" : followerNum < 10000 ? "Established" : "Authority"}
                </div>
              </div>
            </div>

            {tips.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/30 p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Personalized Tips
                </h3>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-bold shrink-0 mt-0.5">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-border/60 bg-card/30 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Benchmark Comparison</h3>
              <div className="space-y-2 text-sm">
                {[
                  { metric: "Follower Ratio", yours: `${ratio.toFixed(1)}x`, avg: "1.0x", good: "2.0x+", ok: ratio >= 1 },
                  { metric: "Engagement Rate", yours: `${engagementRate.toFixed(2)}%`, avg: "0.5%", good: "1.0%+", ok: engagementRate >= 0.5 },
                ].map(({ metric, yours, avg, good, ok }) => (
                  <div key={metric} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{metric}</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground/60">Avg: {avg}</span>
                      <span className="text-muted-foreground/60">Good: {good}</span>
                      <span className={`font-semibold ${ok ? "text-green-400" : "text-red-400"}`}>You: {yours}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MiniToolLayout>
  );
}
