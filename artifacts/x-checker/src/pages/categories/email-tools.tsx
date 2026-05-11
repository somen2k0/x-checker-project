import {
  Mail, Shield, AtSign, FilterX, Clock,
  Zap, Lock, Sparkles, Users, Code2, TrendingUp,
  Pencil, Hash, FileText,
} from "lucide-react";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { CategoryLandingPage, type CategoryPageConfig } from "./CategoryLandingPage";

const tools = ALL_TOOLS.filter((t) => t.category === "email" && !t.isComingSoon);

const config: CategoryPageConfig = {
  path: "/email-tools",
  seoTitle: "Free Email Tools — Subject Line Generator, Signature Builder, Validator | X Toolkit",
  seoDescription:
    "Free browser-based email utilities: subject line generator, email signature builder, plain text formatter, character counter, username generator, and address validator. No signup.",
  title: "Email Tools",
  tagline: "Email utilities that save time and improve deliverability",
  description:
    "Browser-based email tools for generating subject lines, building professional signatures, formatting plain text emails, counting characters, and validating addresses — all free, no account required, nothing stored.",
  icon: Mail,
  color: "text-cyan-400",
  bg: "bg-cyan-400/10 border-cyan-400/20",
  heroGradient: "bg-gradient-to-br from-cyan-500/8 via-cyan-500/3 to-transparent",
  tools,

  whatIs:
    "Email tools are browser-based utilities that help marketers, developers, and everyday users work with email more efficiently. The Subject Line Generator produces proven subject line templates for promotional, newsletter, welcome, re-engagement, transactional, and announcement campaigns. The Email Signature Generator builds professional HTML and plain text signatures with live preview — ready to paste into Gmail, Outlook, or Apple Mail. The Email Character Counter shows exactly how your subject line and preview text will be truncated in Gmail, Outlook, Apple Mail, and iPhone Mail. The Plain Text Formatter strips HTML email markup into clean, readable plain text for multi-part MIME emails. The Email Address Validator checks format syntax for one or hundreds of addresses at once.",

  benefits: [
    {
      icon: Pencil,
      title: "Write subject lines that get opened",
      description:
        "The subject line generator gives you proven templates for every campaign type — promotional, newsletter, re-engagement, and more.",
    },
    {
      icon: FilterX,
      title: "Never get truncated in the inbox again",
      description:
        "The character counter shows exactly how your subject line displays in Gmail, Outlook, Apple Mail, and iPhone Mail before you send.",
    },
    {
      icon: Zap,
      title: "Signatures that work everywhere",
      description:
        "Build HTML or plain text signatures with a live preview. Choose minimal, professional, or bold styles — copy and paste in seconds.",
    },
    {
      icon: Mail,
      title: "Better deliverability with plain text",
      description:
        "Most email platforms require a plain text version alongside your HTML. The formatter converts any HTML email to clean plain text instantly.",
    },
    {
      icon: Lock,
      title: "Validate address lists before sending",
      description:
        "Catch invalid email syntax before importing lists into your ESP — reducing hard bounces and protecting sender reputation.",
    },
    {
      icon: Clock,
      title: "All tools work in your browser",
      description:
        "No uploads, no accounts, no API keys. Everything runs locally in your browser — your email content never touches a server.",
    },
  ],

  useCases: [
    {
      title: "Email marketers writing campaigns",
      description:
        "Use the subject line generator and character counter together to write subject lines that display perfectly across every major email client.",
    },
    {
      title: "Developers testing email flows",
      description:
        "Validate test addresses, format HTML transactional emails as plain text, and generate professional-looking signatures for test accounts.",
    },
    {
      title: "Freelancers setting up their email identity",
      description:
        "Use the email username generator to pick the right address format, then the signature generator to build a professional signature for client communications.",
    },
    {
      title: "Marketers cleaning email lists",
      description:
        "Bulk-validate imported lists before a campaign to remove invalid syntax — catching obvious formatting errors before the first send.",
    },
    {
      title: "Small business owners new to email marketing",
      description:
        "Get proven subject line templates for your first campaign, understand preview text, and set up a professional signature — all without paying for a tool.",
    },
    {
      title: "Content creators building newsletters",
      description:
        "Write subject lines with the right character length, ensure your newsletter has a proper plain text version, and track word count for the body.",
    },
  ],

  faqs: [
    {
      q: "What subject line length gets the best open rates?",
      a: "Research consistently shows subject lines of 30–50 characters perform best on mobile, where most email is now read. Short enough to display in full, specific enough to set clear expectations. The Email Character Counter shows exactly where each client truncates.",
    },
    {
      q: "Should I use HTML or plain text email signatures?",
      a: "For most modern email clients (Gmail, Outlook, Apple Mail), HTML signatures render well and look more professional. However, some corporate IT systems strip HTML. Set up an HTML signature as your primary and keep a plain text version as a backup — the signature generator provides both.",
    },
    {
      q: "Why do I need a plain text version of my HTML email?",
      a: "Major email platforms (Mailchimp, Klaviyo, etc.) require a plain text version because some clients and email proxies display plain text only. The presence of a multi-part MIME message (HTML + text) is also a positive spam filter signal.",
    },
    {
      q: "What is email syntax validation?",
      a: "Syntax validation checks whether an email address follows the correct format: a valid local part (before @), an @ symbol, a valid domain, and a TLD of at least two characters. It does not verify that the mailbox actually exists or that the domain has MX records.",
    },
    {
      q: "What is preview text (preheader) in email?",
      a: "Preview text is the short snippet shown after the subject line in the inbox list view. It's either a hidden <span> element at the top of your HTML or pulled from the first visible text. Aim for 40–100 characters. The Email Character Counter tracks both subject and preview text limits.",
    },
    {
      q: "Are all email tools free?",
      a: "Yes — all tools on X Toolkit are 100% free with no account, subscription, or trial required. Your email content is processed entirely in your browser and is never stored or transmitted.",
    },
  ],

  relatedCategories: [
    {
      title: "Social Media Tools",
      href: "/social-media-tools",
      description: "Bulk X account checker, profile link generator, and @ formatter.",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/20",
    },
    {
      title: "SEO Tools",
      href: "/seo-tools",
      description: "Meta tag generator, keyword density checker, URL slug generator.",
      icon: TrendingUp,
      color: "text-pink-400",
      bg: "bg-pink-400/10 border-pink-400/20",
    },
    {
      title: "Text & Formatting",
      href: "/text-format-tools",
      description: "Character counter, tweet formatter, hashtag formatter.",
      icon: Hash,
      color: "text-green-400",
      bg: "bg-green-400/10 border-green-400/20",
    },
  ],
};

export default function EmailToolsPage() {
  return <CategoryLandingPage config={config} />;
}
