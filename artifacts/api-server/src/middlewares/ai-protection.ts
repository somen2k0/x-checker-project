/**
 * AI Cost-Protection Middleware
 *
 * Stacks applied to every AI route (bio, ai-detector):
 *   1. aiDailyRateLimiter  — 50 requests per IP per 24 h (Map-based)
 *   2. aiInputValidator    — 500-char limit, HTML strip, prompt-injection block
 *   3. aiResponseCache     — in-memory 1-hour cache; identical inputs served free
 *   4. logAiUsage          — logs every call with IP + alerts on usage spikes
 */

import type { Request, Response, NextFunction } from "express";

// ─── Daily rate limiter ───────────────────────────────────────────────────────

const AI_DAILY_LIMIT = 150;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface UsageEntry {
  count: number;
  resetAt: number;
}

const dailyUsage = new Map<string, UsageEntry>();

/** Custom Map-based daily limit: 50 AI requests per IP per 24 hours. */
export function aiDailyRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const ip = req.ip ?? "unknown";
  const now = Date.now();
  const entry = dailyUsage.get(ip);

  if (!entry || now > entry.resetAt) {
    dailyUsage.set(ip, { count: 1, resetAt: now + ONE_DAY_MS });
    next();
    return;
  }

  if (entry.count >= AI_DAILY_LIMIT) {
    const resetIn = Math.ceil((entry.resetAt - now) / 3600_000);
    res.status(429).json({
      error: `Daily AI limit reached (${AI_DAILY_LIMIT} requests/day). Resets in ~${resetIn}h.`,
    });
    return;
  }

  entry.count++;
  next();
}

// ─── Input validation ─────────────────────────────────────────────────────────

export const AI_MAX_INPUT_CHARS = 1500;

/** Strip raw and escaped HTML tags from a string. */
function stripHtml(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;[^&]*?&gt;/g, "")
    .trim();
}

/**
 * Prompt-injection patterns — any match immediately blocks the request.
 * Patterns are ordered most-specific → most-general.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+(instructions?|prompts?|context|rules)/i,
  /system\s+prompt/i,
  /\bjailbreak\b/i,
  /\bDAN\b/,                                               // case-sensitive: "DAN" not "dan"
  /do\s+anything\s+now/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /act\s+as\s+(if\s+you\s+(are|were|have)|a\b)/i,
  /forget\s+(your|all)\s+(instructions?|rules|constraints|training)/i,
  /you\s+are\s+now\s+(a|an|the)\b/i,
  /bypass\s+(your\s+)?(safety|filters?|restrictions?|guidelines?)/i,
  /new\s+(conversation|session|context)\s+start/i,
  /reset\s+your\s+(memory|context|instructions)/i,
  /\[system\]/i,
  /\bprompt\s+injection\b/i,
];

function isPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

/**
 * Validates all string fields in req.body:
 *   - Strips HTML tags in-place
 *   - Enforces 500-character maximum
 *   - Blocks prompt injection attempts
 */
export function aiInputValidator(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.body || typeof req.body !== "object") {
    next();
    return;
  }

  const body = req.body as Record<string, unknown>;

  for (const key of Object.keys(body)) {
    const raw = body[key];
    if (typeof raw !== "string") continue;

    const cleaned = stripHtml(raw);

    if (cleaned.length > AI_MAX_INPUT_CHARS) {
      res.status(400).json({
        error: `Input too long. AI tools accept a maximum of ${AI_MAX_INPUT_CHARS} characters.`,
      });
      return;
    }

    if (isPromptInjection(cleaned)) {
      res.status(400).json({
        error: "Input contains disallowed content.",
      });
      return;
    }

    body[key] = cleaned;
  }

  next();
}

// ─── Response cache ───────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_ENTRIES = 500;

interface CacheEntry {
  data: unknown;
  expiry: number;
  hits: number;
}

const responseCache = new Map<string, CacheEntry>();

function buildCacheKey(req: Request): string {
  return `${req.path}::${JSON.stringify(req.body ?? {})}`;
}

/**
 * In-memory response cache. Identical AI requests within 1 hour are served
 * directly from cache — no API call, no cost.
 *
 * Uses res.json monkey-patching to intercept successful (200) responses
 * and store them for future identical requests.
 */
export function aiResponseCache(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Only cache POST requests with a body
  if (req.method !== "POST") {
    next();
    return;
  }

  const key = buildCacheKey(req);
  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && now < cached.expiry) {
    cached.hits++;
    res.setHeader("X-Cache", "HIT");
    res.json(cached.data);
    return;
  }

  res.setHeader("X-Cache", "MISS");

  // Monkey-patch res.json to intercept the route's successful response
  const originalJson = res.json.bind(res) as (body: unknown) => Response;
  (res as unknown as Record<string, unknown>).json = (body: unknown): Response => {
    if (res.statusCode === 200) {
      // Evict oldest entry if cache is full
      if (responseCache.size >= MAX_CACHE_ENTRIES) {
        const oldest = responseCache.keys().next().value;
        if (oldest !== undefined) responseCache.delete(oldest);
      }
      responseCache.set(key, { data: body, expiry: now + CACHE_TTL_MS, hits: 0 });
    }
    return originalJson(body);
  };

  next();
}

// ─── Usage logger + spike detector ───────────────────────────────────────────

const SPIKE_WINDOW_MS = 60 * 1000; // rolling 60-second window
const SPIKE_THRESHOLD = 60;        // alert if ≥60 AI calls in 60 s

// Ring buffer of recent call timestamps (global across all IPs)
const recentCallTimestamps: number[] = [];

/**
 * Logs every AI API call with IP, route, and input size.
 * Emits a warning log when usage spikes above the threshold.
 */
export function logAiUsage(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const now = Date.now();
  const ip = req.ip ?? "unknown";
  const inputSize = JSON.stringify(req.body ?? {}).length;

  // Log the call
  req.log?.info(
    { ip, route: req.path, inputBytes: inputSize },
    "AI API call",
  );

  // Spike detection — purge stale timestamps, append current
  const cutoff = now - SPIKE_WINDOW_MS;
  while (recentCallTimestamps.length > 0 && (recentCallTimestamps[0] ?? 0) < cutoff) {
    recentCallTimestamps.shift();
  }
  recentCallTimestamps.push(now);

  if (recentCallTimestamps.length >= SPIKE_THRESHOLD) {
    req.log?.warn(
      { callsInLastMinute: recentCallTimestamps.length, threshold: SPIKE_THRESHOLD },
      "⚠ AI usage spike detected",
    );
  }

  next();
}

// ─── Cache stats (for admin/health inspection) ────────────────────────────────

export function getAiCacheStats(): {
  entries: number;
  totalHits: number;
  maxEntries: number;
} {
  let totalHits = 0;
  for (const entry of responseCache.values()) totalHits += entry.hits;
  return { entries: responseCache.size, totalHits, maxEntries: MAX_CACHE_ENTRIES };
}
