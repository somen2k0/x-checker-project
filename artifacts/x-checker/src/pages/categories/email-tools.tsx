import {
  Mail, Shield, Inbox, AtSign, FilterX, Clock,
  Zap, Lock, Sparkles, Users, Code2, TrendingUp,
} from "lucide-react";
import { CategoryLandingPage, type CategoryPageConfig } from "./CategoryLandingPage";

const config: CategoryPageConfig = {
  path: "/email-tools",
  seoTitle: "Free Email Tools — Address Validator, Temp Mail Generator | X Toolkit",
  seoDescription:
    "Free browser-based email utilities: email address validator, disposable address generator, and email format checker. No signup required.",
  title: "Email Tools",
  tagline: "Email utilities that protect your privacy and save your time",
  description:
    "Browser-based email tools for validating addresses, checking formats, generating disposable addresses for testing, and analyzing email deliverability — all free, with nothing stored on our servers.",
  icon: Mail,
  color: "text-cyan-400",
  bg: "bg-cyan-400/10 border-cyan-400/20",
  heroGradient: "bg-gradient-to-br from-cyan-500/8 via-cyan-500/3 to-transparent",
  tools: [],
  comingSoon: true,

  whatIs:
    "Email tools are browser-based utilities that help developers, marketers, and regular users work with email addresses more efficiently and safely. An email address validator checks whether an address is syntactically correct and whether the domain has properly configured MX records — preventing sending to obviously invalid addresses before a single email is dispatched. A disposable address generator creates temporary, random email addresses you can use for sign-ups, testing, or one-time registrations without exposing your real inbox. Format checkers ensure lists of addresses follow consistent formatting (lowercase, no leading or trailing spaces) before import into an email service provider. These tools handle the tedious, error-prone parts of email workflow so you can focus on the message.",

  benefits: [
    {
      icon: Shield,
      title: "Protect your real email address",
      description:
        "Use a temporary address for sign-ups, free trials, or one-time verifications — keeping your inbox clean and private.",
    },
    {
      icon: FilterX,
      title: "Remove invalid addresses before you send",
      description:
        "Validate bulk email lists before importing them into your ESP to reduce bounce rates and protect sender reputation.",
    },
    {
      icon: Zap,
      title: "Instant format checking",
      description:
        "Verify whether an address is structurally valid in milliseconds — no DNS lookup needed for basic format validation.",
    },
    {
      icon: Inbox,
      title: "Better deliverability",
      description:
        "Cleaner lists mean lower bounce rates, fewer spam complaints, and higher deliverability scores with providers like SendGrid and Mailchimp.",
    },
    {
      icon: Lock,
      title: "Privacy-first by design",
      description:
        "Email addresses you enter are processed locally or via stateless API calls — never stored, logged, or associated with your identity.",
    },
    {
      icon: Clock,
      title: "Save hours of list cleaning",
      description:
        "Bulk-validate hundreds of addresses at once rather than manually reviewing each one for obvious formatting errors.",
    },
  ],

  useCases: [
    {
      title: "Developers testing email flows",
      description:
        "Generate disposable addresses to test registration emails, password resets, and transactional notifications without cluttering a real inbox.",
    },
    {
      title: "Marketers cleaning email lists",
      description:
        "Validate and deduplicate imported lists before a campaign to reduce hard bounces and keep your sender reputation healthy.",
    },
    {
      title: "Users signing up for one-time services",
      description:
        "Use a temporary address for sites you don't fully trust, keeping your primary inbox free from spam and promotional emails.",
    },
    {
      title: "Freelancers collecting client lists",
      description:
        "Run a client's contact list through the validator before importing it into a new email platform to catch obvious errors immediately.",
    },
    {
      title: "QA engineers testing form validation",
      description:
        "Use the format checker to generate edge-case email addresses — valid and invalid — for testing your own form validation logic.",
    },
    {
      title: "Journalists protecting their identity",
      description:
        "Register for public records, FOIA databases, or research portals using a temporary address that can't be traced back to your primary account.",
    },
  ],

  faqs: [
    {
      q: "When will the email tools be available?",
      a: "Email tools are currently in development. We'll announce the launch on our homepage and social channels when they're ready.",
    },
    {
      q: "Will the email tools be free?",
      a: "Yes — all tools on X Toolkit are 100% free with no account, subscription, or trial required.",
    },
    {
      q: "What is email address validation?",
      a: "Email validation checks two things: (1) format validity — does the address have the correct syntax like user@domain.tld? and (2) domain validity — does the domain have MX records that can receive email? Format checking is instant and local; MX checking requires a DNS lookup.",
    },
    {
      q: "What is a disposable email address?",
      a: "A disposable (or temporary) email address is a randomly generated address that forwards messages to a temporary inbox for a limited time. It's useful for sign-ups you don't want associated with your real email, testing scenarios, or one-time verifications.",
    },
    {
      q: "Will my email addresses be stored or sold?",
      a: "No. Addresses you enter into the tools are used only for the validation or generation request and are immediately discarded. We do not build contact databases, sell data, or share it with third parties.",
    },
    {
      q: "What email tools are planned?",
      a: "The initial launch will include an email format validator, bulk list cleaner, disposable address generator, and MX record checker. More tools will follow based on user demand.",
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
      title: "Developer Tools",
      href: "/developer-tools",
      description: "JSON formatter, Base64 encoder, and browser-based dev utilities.",
      icon: Code2,
      color: "text-orange-400",
      bg: "bg-orange-400/10 border-orange-400/20",
    },
    {
      title: "SEO Tools",
      href: "/seo-tools",
      description: "Meta tag analysis, keyword density checking, and URL slug generation.",
      icon: TrendingUp,
      color: "text-pink-400",
      bg: "bg-pink-400/10 border-pink-400/20",
    },
  ],
};

export default function EmailToolsPage() {
  return <CategoryLandingPage config={config} />;
}
