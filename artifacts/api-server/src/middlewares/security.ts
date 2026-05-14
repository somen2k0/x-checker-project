import type { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";

// ─── Security Headers ────────────────────────────────────────────────────────

export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://pbs.twimg.com https://abs.twimg.com",
    "connect-src 'self'",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  res.setHeader("Content-Security-Policy", csp);
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  );
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.removeHeader("X-Powered-By");

  next();
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
// 100 requests per IP per minute on all /api routes

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: { error: "Too many requests. Please try again in a minute." },
});

// ─── Input Sanitization ──────────────────────────────────────────────────────
// Blocks SQL injection and XSS patterns in all request inputs.
// Uses non-global regexes to avoid lastIndex state issues.

const SQL_INJECTION_RE =
  /('|;|--)\s*(OR|AND|SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|CAST|CONVERT|DECLARE)\b/i;

const XSS_RE =
  /<script|javascript:|data:text\/html|vbscript:|onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=|onfocus\s*=|<iframe|<embed|<object|<svg\s/i;

function isMalicious(value: unknown): boolean {
  if (typeof value === "string") {
    return SQL_INJECTION_RE.test(value) || XSS_RE.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(isMalicious);
  }
  if (value !== null && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(isMalicious);
  }
  return false;
}

export function inputSanitizer(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (
    isMalicious(req.body) ||
    isMalicious(req.query) ||
    isMalicious(req.params)
  ) {
    res.status(400).json({ error: "Invalid input detected." });
    return;
  }
  next();
}
