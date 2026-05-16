import { BlogLayout } from "@/components/layout/BlogLayout";
import { Mail, Shield, EyeOff, Hash } from "lucide-react";

export default function TempGmailExplained() {
  return (
    <BlogLayout
      seoTitle="Temp Gmail Explained — Gmail Dot Trick, Plus Trick & Real Temp Addresses"
      seoDescription="What is a temp Gmail? How the Gmail dot trick and plus trick work, how to get a real temporary Gmail address, and when each method is useful. 2025 guide."
      title="Temp Gmail Explained"
      description="How to get a temporary Gmail-style address using the dot trick, plus trick, or a real Gmail-linked disposable inbox — and when each approach is the right choice."
      icon={Mail}
      readTime="4 min read"
      publishDate="2025"
      category="Email & Privacy"
      relatedArticles={[
        { title: "Temp Mail vs Gmail", href: "/blog/temp-mail-vs-gmail", description: "Full comparison of temporary email and real Gmail.", readTime: "5 min" },
        { title: "What Is Disposable Email?", href: "/blog/what-is-disposable-email", description: "Complete guide to disposable addresses.", readTime: "6 min" },
        { title: "Is Temp Mail Safe?", href: "/blog/is-temp-mail-safe", description: "Security analysis of throwaway email.", readTime: "4 min" },
      ]}
      relatedTools={[
        { title: "Temp Gmail", href: "/tools/temp-mail/tempgmail", description: "Generate a real temporary Gmail address.", icon: Mail },
        { title: "Gmail Tricks", href: "/tools/temp-mail/gmail-tricks", description: "Generate dot & plus-tag Gmail variants.", icon: Hash },
        { title: "Masked Email Generator", href: "/tools/masked-email-generator", description: "Create anonymous Gmail-compatible aliases.", icon: EyeOff },
        { title: "Email Privacy Checker", href: "/tools/email-privacy-checker", description: "Score your Gmail address for privacy.", icon: Shield },
      ]}
    >
      <h2>What Is "Temp Gmail"?</h2>
      <p>
        "Temp Gmail" refers to several different techniques for getting a temporary or disposable Gmail-style address. They range from simple username tricks built into Gmail itself, to services that generate actual real Gmail addresses you can use temporarily.
      </p>
      <p>There are three main approaches, each with different capabilities and tradeoffs:</p>
      <ol>
        <li>The <strong>Gmail dot trick</strong> — built-in Gmail behavior, no service needed</li>
        <li>The <strong>Gmail plus trick</strong> — built-in Gmail behavior for filtering and tracking</li>
        <li><strong>Real temp Gmail addresses</strong> — via services like Gmailnator that generate actual working Gmail addresses</li>
      </ol>

      <h2>The Gmail Dot Trick</h2>
      <p>Gmail ignores dots (periods) in usernames. This means:</p>
      <ul>
        <li><code>johnsmith@gmail.com</code></li>
        <li><code>john.smith@gmail.com</code></li>
        <li><code>j.o.h.n.s.m.i.t.h@gmail.com</code></li>
      </ul>
      <p>...all deliver to exactly the same inbox. The recipient — that's you — doesn't see multiple inboxes. You just get one inbox receiving everything.</p>

      <h3>What the dot trick is good for</h3>
      <p>The primary use case: <strong>registering on sites that check for duplicate email addresses</strong>. If you've already registered on a site and want to create a second account, using a dot variant of your Gmail passes their uniqueness check (since the site treats <code>john.smith@gmail.com</code> and <code>johnsmith@gmail.com</code> as different addresses).</p>
      <p>A secondary use: setting up Gmail filters. You can create a filter that applies a label to all emails sent to <code>john.shopping@gmail.com</code>, for example — even though Gmail delivers it normally.</p>

      <h3>What the dot trick doesn't do</h3>
      <p>It <em>doesn't</em> hide your real address from the recipient. Anyone who receives an email from a dot-variant address can see the base username. Your privacy is not protected.</p>

      <h2>The Gmail Plus Trick</h2>
      <p>Adding <code>+anything</code> after your Gmail username still delivers to your main inbox. Examples:</p>
      <ul>
        <li><code>you+shopping@gmail.com</code> → delivers to <code>you@gmail.com</code></li>
        <li><code>you+newsletters@gmail.com</code> → delivers to <code>you@gmail.com</code></li>
        <li><code>you+amazon@gmail.com</code> → delivers to <code>you@gmail.com</code></li>
      </ul>

      <h3>What the plus trick is good for</h3>
      <ul>
        <li><strong>Inbox filtering:</strong> Create a Gmail filter to automatically label, archive, or delete emails sent to <code>you+newsletters@gmail.com</code></li>
        <li><strong>Spam source tracking:</strong> Use a unique plus tag per site, and when spam arrives, the To header tells you which site sold your address</li>
        <li><strong>Temporary address for trials:</strong> Give a company <code>you+trial@gmail.com</code> and filter all their emails to a "Trials" label</li>
      </ul>

      <h3>What the plus trick doesn't do</h3>
      <p>Like the dot trick, it <strong>doesn't hide your real address</strong>. Anyone who receives email from <code>you+shopping@gmail.com</code> can trivially infer your real address (<code>you@gmail.com</code>) by stripping the plus tag. Major services are aware of this and some strip plus tags from their databases.</p>

      <h2>Real Temporary Gmail Addresses</h2>
      <p>A "real" temp Gmail refers to an actual <code>@gmail.com</code> inbox that you can use temporarily. Services like <strong>Gmailnator</strong> use the Gmail dot trick under the hood to generate real Gmail addresses across thousands of existing accounts, making those inboxes publicly accessible.</p>
      <p>Our <strong>Temp Gmail</strong> tool uses this approach to give you a working temporary Gmail address. The inbox is real — verification emails from services that check Gmail domains will accept it.</p>

      <h3>Why this matters</h3>
      <p>Many services specifically reject non-Gmail domains. They'll accept <code>@gmail.com</code> but block known disposable domains. A real temp Gmail address passes these checks because it uses the actual <code>@gmail.com</code> domain.</p>

      <h3>Important limitation</h3>
      <p>These inboxes are <strong>shared</strong> — they're based on existing Gmail accounts using the dot trick. You should never use them for anything sensitive. They're appropriate for email verification only, not for receiving password reset emails or any private communication.</p>

      <h2>Which Method Should You Use?</h2>
      <ul>
        <li><strong>Dot trick:</strong> When you need a second registration on a site you already use with your real Gmail, and the site doesn't accept completely different domains.</li>
        <li><strong>Plus trick:</strong> When you want to track which services share your address and apply inbox filters — but you're comfortable with your real address being technically visible.</li>
        <li><strong>Real temp Gmail:</strong> When a service specifically requires a <code>@gmail.com</code> domain and you don't want to use your actual Gmail address.</li>
        <li><strong>Standard temp mail:</strong> When any domain is accepted and you want maximum privacy. 16 domains available through our Temp Mail tool.</li>
        <li><strong>Permanent alias:</strong> When you need ongoing access to the account without privacy compromises.</li>
      </ul>

      <h2>Try It Now</h2>
      <p>Our <strong>Temp Gmail</strong> tool generates a real temporary Gmail address for verification purposes. Our <strong>Gmail Tricks</strong> generator shows all possible dot and plus variants for any Gmail username. Both are free, require no signup, and work directly in your browser.</p>
    </BlogLayout>
  );
}
