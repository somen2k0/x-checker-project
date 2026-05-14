import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

// ─── Helmet: Security Headers ────────────────────────────────────────────────

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://pbs.twimg.com", "https://abs.twimg.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: "deny" },
  noSniff: true,
  dnsPrefetchControl: { allow: false },
  permittedCrossDomainPolicies: false,
  crossOriginEmbedderPolicy: false,
});

// ─── Rate Limiters ───────────────────────────────────────────────────────────

const RATE_LIMIT_MESSAGE = { error: "Too many requests, try again later." };

/** Global: 100 requests per IP per 15 minutes — applied to the entire server */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: RATE_LIMIT_MESSAGE,
});

/** API routes: 20 requests per IP per minute — applied to all /api/* routes */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: RATE_LIMIT_MESSAGE,
});

/** AI tools: 10 requests per IP per hour — applied to bio + ai-detector routes */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: RATE_LIMIT_MESSAGE,
});

// ─── XSS Clean (custom, Express 5 compatible) ────────────────────────────────
// xss-clean@0.1.4 is incompatible with Express 5 because it tries to reassign
// req.query, which is a read-only getter. This custom version mutates
// object properties in-place, which works correctly with Express 5.

const XSS_CHARS_RE = /[&<>"']/g;
const XSS_CHARS_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

function escapeHtml(str: string): string {
  return str.replace(XSS_CHARS_RE, (ch) => XSS_CHARS_MAP[ch] ?? ch);
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") return escapeHtml(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      obj[key] = sanitizeValue(obj[key]);
    }
    return obj;
  }
  return value;
}

/** Strips XSS characters from req.body and mutates req.query / req.params
 *  in-place (compatible with Express 5's read-only req.query getter). */
export function xssCleanMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.body && typeof req.body === "object") {
    sanitizeValue(req.body);
  }
  // Mutate query/params properties in-place — never reassign the object itself
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      (req.query as Record<string, unknown>)[key] = sanitizeValue(
        req.query[key],
      );
    }
  }
  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      req.params[key] = sanitizeValue(req.params[key]) as string;
    }
  }
  next();
}

// ─── HPP (custom, Express 5 compatible) ──────────────────────────────────────
// hpp@0.2.3 also reassigns req.query (broken in Express 5). This custom
// version keeps only the last value for duplicate query params, in-place.

export function hppMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      const val = req.query[key];
      if (Array.isArray(val)) {
        // Keep only the last submitted value to prevent parameter pollution
        (req.query as Record<string, unknown>)[key] = val[val.length - 1];
      }
    }
  }
  next();
}

// ─── Input Length Validator ──────────────────────────────────────────────────
// Rejects requests where any string value exceeds MAX_STRING_LENGTH characters.

const MAX_STRING_LENGTH = 1000;

function exceedsMaxLength(value: unknown): boolean {
  if (typeof value === "string") return value.length > MAX_STRING_LENGTH;
  if (Array.isArray(value)) return value.some(exceedsMaxLength);
  if (value !== null && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(
      exceedsMaxLength,
    );
  }
  return false;
}

export function inputLengthValidator(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (
    exceedsMaxLength(req.body) ||
    exceedsMaxLength(req.query) ||
    exceedsMaxLength(req.params)
  ) {
    res.status(400).json({
      error: `Input too long. Maximum ${MAX_STRING_LENGTH} characters per field.`,
    });
    return;
  }
  next();
}

// ─── SQL Injection Blocker ───────────────────────────────────────────────────
// xssCleanMiddleware escapes HTML; this catches SQL injection patterns.

const SQL_INJECTION_RE =
  /('|;|--)\s*(OR|AND|SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|CAST|CONVERT|DECLARE)\b/i;

function hasSqlInjection(value: unknown): boolean {
  if (typeof value === "string") return SQL_INJECTION_RE.test(value);
  if (Array.isArray(value)) return value.some(hasSqlInjection);
  if (value !== null && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(hasSqlInjection);
  }
  return false;
}

export function sqlInjectionBlocker(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (
    hasSqlInjection(req.body) ||
    hasSqlInjection(req.query) ||
    hasSqlInjection(req.params)
  ) {
    res.status(400).json({ error: "Invalid input detected." });
    return;
  }
  next();
}
