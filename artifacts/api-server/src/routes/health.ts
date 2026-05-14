import { Router, type IRouter } from "express";
import { getGroqKeys } from "../lib/groq-keys";
import { getRapidApiKeys } from "../lib/rapidapi-keys";
import { getAiCacheStats } from "../middlewares/ai-protection";

const router: IRouter = Router();

const startedAt = Date.now();

// Simple liveness check (used by Vercel health probes)
router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * Full status endpoint — shows which tools are enabled, uptime, and cache stats.
 * Safe to expose publicly: returns only boolean flags, counts, and descriptions.
 * No key values or sensitive data are ever included.
 */
router.get("/health", (_req, res) => {
  const groqKeys    = getGroqKeys().length;
  const rapidKeys   = getRapidApiKeys().length;
  const twitterSet  = !!process.env.TWITTER_BEARER_TOKEN;
  const groqSet     = groqKeys > 0;
  const rapidSet    = rapidKeys > 0;
  const web3Set     = !!process.env.WEB3FORMS_KEY;
  const adminSet    = !!process.env.ADMIN_PASSWORD;

  const uptimeMs    = Date.now() - startedAt;
  const uptimeSec   = Math.floor(uptimeMs / 1000);
  const uptimeMin   = Math.floor(uptimeSec / 60);
  const uptimeHr    = Math.floor(uptimeMin / 60);
  const uptimeLabel =
    uptimeHr > 0
      ? `${uptimeHr}h ${uptimeMin % 60}m`
      : uptimeMin > 0
      ? `${uptimeMin}m ${uptimeSec % 60}s`
      : `${uptimeSec}s`;

  res.json({
    status: "ok",
    uptime: { ms: uptimeMs, label: uptimeLabel },
    timestamp: new Date().toISOString(),

    tools: {
      xAccountChecker: {
        enabled: twitterSet,
        label: "X Account Checker",
        note: "Checks up to 100 X/Twitter accounts in parallel",
        requires: "TWITTER_BEARER_TOKEN",
      },

      // ── AI tools (Groq) ──────────────────────────────────────────────────
      bioGenerator: {
        enabled: groqSet,
        label: "AI Bio Generator",
        note: "Generates 3 X bios from a topic using Groq LLM",
        requires: "GROQ_API_KEY",
        keyCount: groqKeys,
      },
      aiDetector: {
        enabled: groqSet,
        label: "AI Text Detector",
        note: "Detects AI-generated text with a 0-100 score",
        requires: "GROQ_API_KEY",
        keyCount: groqKeys,
      },
      aiHumanizer: {
        enabled: groqSet,
        label: "AI Text Humanizer",
        note: "Rewrites AI text to sound human",
        requires: "GROQ_API_KEY",
        keyCount: groqKeys,
      },

      // ── Free tools (no API key needed) ──────────────────────────────────
      tempMail: {
        enabled: true,
        label: "Temp Mail",
        note: "Disposable inbox via 1secmail + Guerrilla Mail (free, no key needed)",
        requires: null,
      },
      tempGmail: {
        enabled: true,
        label: "Temp Gmail",
        note: "Disposable Gmail-style address via temp.tf (free, no key needed)",
        requires: null,
      },
      ogPreview: {
        enabled: true,
        label: "OG Image Preview",
        note: "Fetches Open Graph metadata from any URL (no key needed)",
        requires: null,
      },

      // ── Optional integrations ────────────────────────────────────────────
      gmailnator: {
        enabled: rapidSet,
        label: "Gmailnator (RapidAPI)",
        note: "Optional Gmailnator integration via RapidAPI",
        requires: "RAPIDAPI_KEYS",
        keyCount: rapidKeys,
      },
      contactForm: {
        enabled: web3Set,
        label: "Contact / Feedback Form",
        note: "Server-side contact form via Web3Forms",
        requires: "WEB3FORMS_KEY",
      },
      adminPanel: {
        enabled: adminSet,
        label: "Admin Panel",
        note: "API key management and diagnostics panel",
        requires: "ADMIN_PASSWORD",
      },
    },

    aiCache: getAiCacheStats(),
  });
});

export default router;
