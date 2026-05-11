import {
  Sparkles, Smile, Briefcase, Palette, Clock, Star, Layers,
  Zap, Users, Type, Code2, TrendingUp, Mail,
} from "lucide-react";
import { ALL_TOOLS } from "@/lib/tools-registry";
import { CategoryLandingPage, type CategoryPageConfig } from "./CategoryLandingPage";

const tools = ALL_TOOLS.filter((t) => t.category === "ai-writing");

const config: CategoryPageConfig = {
  path: "/ai-writing-tools",
  seoTitle: "Free AI Bio Generator & Writing Tools for X (Twitter) | X Toolkit",
  seoDescription:
    "Generate professional X (Twitter) bios instantly with free AI writing tools. Choose from funny, professional, and aesthetic styles. No signup required.",
  title: "AI Writing Tools",
  tagline: "Write better X bios in seconds — powered by AI",
  description:
    "Stop staring at a blank profile. Our AI writing tools generate polished X (Twitter) bios, suggest creative ideas, and help you craft the perfect 160-character profile — in any tone.",
  icon: Sparkles,
  color: "text-purple-400",
  bg: "bg-purple-400/10 border-purple-400/20",
  heroGradient: "bg-gradient-to-br from-purple-500/8 via-purple-500/3 to-transparent",
  tools,

  whatIs:
    "AI writing tools for X use machine learning to generate professional bio text, content ideas, and profile copy on demand. Instead of spending an hour agonizing over 160 characters, you describe your niche and tone, and the tool produces multiple polished options in seconds. Whether you need a witty one-liner, a corporate-clean professional bio, or a minimal aesthetic summary, these tools let you explore dozens of directions without the creative block. The bio ideas and template collections extend this further — curated examples organized by niche, style, and use case that you can copy, remix, or use as inspiration.",

  benefits: [
    {
      icon: Zap,
      title: "Results in seconds",
      description:
        "Generate multiple bio options the moment you hit submit — no waiting, no sign-up, no credit card.",
    },
    {
      icon: Layers,
      title: "Every tone covered",
      description:
        "Professional, funny, aesthetic, casual — pick the vibe that matches your brand or personality.",
    },
    {
      icon: Star,
      title: "Stand-out quality",
      description:
        "AI-crafted bios are optimized for character limits and hook readers in the first three words.",
    },
    {
      icon: Clock,
      title: "Saves hours of rewriting",
      description:
        "Stop tweaking the same sentence for 45 minutes. Get 10 strong options and pick your favourite.",
    },
    {
      icon: Users,
      title: "Works for any niche",
      description:
        "Creator, developer, startup founder, job seeker — the tools adapt to your specific audience and goals.",
    },
    {
      icon: Sparkles,
      title: "Fresh every time",
      description:
        "Each generation is unique. Run it again if you want different directions without losing previous results.",
    },
  ],

  useCases: [
    {
      title: "Job seekers updating their profile",
      description:
        "Craft a concise, credible bio that signals your role, expertise, and personality to hiring managers who scan profiles in under five seconds.",
    },
    {
      title: "Content creators building a brand",
      description:
        "Find a punchy hook that communicates your niche, follower value, and unique angle — turning profile visitors into followers.",
    },
    {
      title: "Businesses launching on X",
      description:
        "Generate brand-voice-aligned bios that describe what you do, who you serve, and what makes you different — all in 160 characters.",
    },
    {
      title: "Developers and makers showcasing projects",
      description:
        "Distill your stack, side projects, and builder identity into a short, memorable bio that attracts the right tech community.",
    },
    {
      title: "Students and early-career professionals",
      description:
        "Build a credible online presence with a bio that frames your ambitions and skills without overstating experience.",
    },
    {
      title: "Anyone refreshing a stale profile",
      description:
        "Your old bio was written three years ago. Get a fresh set of options that reflect who you are today in minutes.",
    },
  ],

  faqs: [
    {
      q: "How does the AI bio generator work?",
      a: "You enter your niche (e.g. 'frontend developer', 'fitness coach') and choose a tone. The tool sends this to an AI model that generates three distinct bio options optimized for X's 160-character limit. Each result is unique and ready to copy.",
    },
    {
      q: "Is the AI bio generator completely free?",
      a: "Yes — all AI Writing Tools on X Toolkit are 100% free. There is no subscription, trial period, or hidden cost. You can run as many generations as you like.",
    },
    {
      q: "Do I need to create an account?",
      a: "No. All tools work instantly in your browser with zero sign-up or login required.",
    },
    {
      q: "What's the difference between Bio Ideas and the AI Bio Generator?",
      a: "The AI Bio Generator creates brand-new bios based on your specific input using AI. Bio Ideas is a curated library of 100+ hand-crafted templates organized by niche and style — useful when you want to browse inspiration rather than generate fresh copy.",
    },
    {
      q: "Can I use these bios on other platforms too?",
      a: "Absolutely. While the tools are designed with X's 160-character limit in mind, the bios work equally well on LinkedIn, Instagram, TikTok, and other platforms. For longer bios just combine a few of the generated options.",
    },
    {
      q: "What tones can I choose from?",
      a: "The AI generator supports professional, casual, witty/funny, and minimal/aesthetic tones. The template collections (Funny Bios, Professional Bios, Aesthetic Bios) are each curated to a specific style.",
    },
    {
      q: "Will the generated bio be unique to me?",
      a: "Yes. The output is generated fresh from your specific niche and tone input. Two people with different niches will receive completely different bios. Even the same input can produce varied results on each run.",
    },
  ],

  relatedCategories: [
    {
      title: "Social Media Tools",
      href: "/social-media-tools",
      description: "Check account status, generate profile links, and manage X usernames in bulk.",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/20",
    },
    {
      title: "Text & Formatting Tools",
      href: "/text-format-tools",
      description: "Format tweet threads, preview Unicode fonts, and count characters precisely.",
      icon: Type,
      color: "text-green-400",
      bg: "bg-green-400/10 border-green-400/20",
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

export default function AiWritingToolsPage() {
  return <CategoryLandingPage config={config} />;
}
