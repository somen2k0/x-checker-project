import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  helmetMiddleware,
  globalRateLimiter,
  apiRateLimiter,
  xssCleanMiddleware,
  hppMiddleware,
  inputLengthValidator,
  sqlInjectionBlocker,
} from "./middlewares/security";

const app: Express = express();

// Trust the first hop from a reverse proxy (Vercel, nginx) so that
// express-rate-limit reads the real client IP from X-Forwarded-For.
app.set("trust proxy", 1);

// ─── Security headers (Helmet) ───────────────────────────────────────────────
app.use(helmetMiddleware);

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Production: only https://xtoolkit.live
// Development: also allow localhost origins for direct API testing
const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "production"
    ? ["https://xtoolkit.live"]
    : [
        "https://xtoolkit.live",
        "http://localhost:5000",
        "http://localhost:3000",
        "http://127.0.0.1:5000",
      ];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      // Pass null (not an Error) so Express doesn't 500 — the missing
      // Access-Control-Allow-Origin header is enough to block the browser.
      callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-password"],
    credentials: false,
  }),
);

// ─── Body parsing (10 kb limit) ──────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Input sanitization (XSS + HPP) ─────────────────────────────────────────
app.use(xssCleanMiddleware);
app.use(hppMiddleware);

// ─── API routes (global 100/15min + 20/min per-route + length check + SQLi) ───
app.use("/api", globalRateLimiter, apiRateLimiter, inputLengthValidator, sqlInjectionBlocker, router);

// ─── Static frontend (production only) ───────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const staticDir = path.resolve(__dirname, "../../x-checker/dist/public");
  app.use(express.static(staticDir));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
