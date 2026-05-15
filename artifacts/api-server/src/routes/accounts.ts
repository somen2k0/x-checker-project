import { Router, type IRouter } from "express";
import { CheckAccountsBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Googlebot UA used for the HTML fallback — gets proper SSR from x.com
const CRAWLER_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

// X's own public app bearer token (same one their website uses for logged-out visitors)
const PUBLIC_BEARER =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I%2FeLDgiU%3DEUifiRBkKG5E2XzMDjRfl76ZoRheOfeat6k%2FqiVWrv7sdG7V0ByZ83Dw2R";

const BEARER = process.env.TWITTER_BEARER_TOKEN ?? PUBLIC_BEARER;

const GRAPHQL_FEATURES = JSON.stringify({
  hidden_profile_subscriptions_enabled: true,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
});

export interface AccountCheckResult {
  username: string;
  status: "active" | "suspended" | "not_found" | "unknown";
  displayName: string | null;
  profileImageUrl: string | null;
  followerCount: number | null;
  followingCount: number | null;
  isVerified: boolean | null;
  createdAt: string | null;
  error: string | null;
}

// ─── Guest token cache ────────────────────────────────────────────────────────

let cachedGuestToken: string | null = null;
let cachedGuestTokenAt = 0;
const GUEST_TOKEN_TTL_MS = 10 * 60 * 1000;

async function getGuestToken(): Promise<string> {
  const now = Date.now();
  if (cachedGuestToken && now - cachedGuestTokenAt < GUEST_TOKEN_TTL_MS) {
    return cachedGuestToken;
  }

  const res = await fetch("https://api.twitter.com/1.1/guest/activate.json", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BEARER}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Origin": "https://x.com",
      "Referer": "https://x.com/",
      "x-twitter-active-user": "yes",
      "x-twitter-client-language": "en",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Failed to activate guest token: HTTP ${res.status}`);
  }

  const data = await res.json() as { guest_token?: string };
  if (!data.guest_token) {
    throw new Error("No guest token in response");
  }

  cachedGuestToken = data.guest_token;
  cachedGuestTokenAt = now;
  logger.info("Refreshed X guest token");
  return cachedGuestToken;
}

// ─── Method 1: GraphQL UserByScreenName (preferred — rich data) ───────────────

async function checkViaGraphQL(
  username: string,
  guestToken: string,
): Promise<AccountCheckResult> {
  const base: AccountCheckResult = {
    username, status: "unknown", displayName: null, profileImageUrl: null,
    followerCount: null, followingCount: null, isVerified: null, createdAt: null, error: null,
  };

  const variables = encodeURIComponent(
    JSON.stringify({ screen_name: username, withSafetyModeUserFields: true })
  );
  const features = encodeURIComponent(GRAPHQL_FEATURES);
  const url = `https://twitter.com/i/api/graphql/G3KGOASz96M-Qu0nwmGXNg/UserByScreenName?variables=${variables}&features=${features}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${BEARER}`,
      "x-guest-token": guestToken,
      "User-Agent": UA,
      "x-twitter-active-user": "yes",
      "x-twitter-client-language": "en",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    if (res.status === 429) {
      cachedGuestToken = null;
      return { ...base, status: "unknown", error: "Rate limited — try again shortly" };
    }
    throw new Error(`GraphQL HTTP ${res.status}`);
  }

  const body = await res.json() as {
    data?: {
      user?: {
        result?: {
          __typename?: string;
          is_blue_verified?: boolean;
          legacy?: {
            name?: string;
            profile_image_url_https?: string;
            followers_count?: number;
            friends_count?: number;
            verified?: boolean;
            created_at?: string;
          };
        };
      };
    };
    errors?: Array<{ message: string; code?: number }>;
  };

  const result = body?.data?.user?.result;
  const errors = body?.errors;

  if (result?.__typename === "User") {
    const legacy = result.legacy;
    const createdAt = legacy?.created_at ? new Date(legacy.created_at).toISOString() : null;
    return {
      ...base, status: "active",
      displayName: legacy?.name ?? null,
      profileImageUrl: legacy?.profile_image_url_https ?? null,
      followerCount: legacy?.followers_count ?? null,
      followingCount: legacy?.friends_count ?? null,
      isVerified: result.is_blue_verified ?? legacy?.verified ?? null,
      createdAt,
    };
  }

  if (result?.__typename === "UserUnavailable") {
    return { ...base, status: "suspended" };
  }

  if (errors && errors.length > 0) {
    const msg = errors[0].message?.toLowerCase() ?? "";
    const code = errors[0].code;
    if (msg.includes("not found") || code === 50) return { ...base, status: "not_found" };
    if (msg.includes("suspend") || code === 63) return { ...base, status: "suspended" };
    return { ...base, status: "unknown", error: errors[0].message };
  }

  if (!result) return { ...base, status: "not_found" };
  return { ...base, status: "unknown", error: "Unexpected response shape" };
}

// ─── Method 2: HTML page fetch fallback (works from any IP / cloud provider) ──
//
// x.com is a public website accessible from cloud provider IPs (it needs to be
// crawled by Google, Bing, etc.).  X uses SSR via Next.js so the page HTML
// contains proper <title> and <meta> tags even without JS.
//
// Title patterns:
//   Active    → "Elon Musk (@elonmusk) / X"   or   "Elon Musk (@elonmusk) on X"
//   Suspended → "Account suspended / X"
//   Not found → "@username isn't available" or plain "X" after redirect to /
// ─────────────────────────────────────────────────────────────────────────────

function extractMeta(html: string, property: string): string | null {
  // Handles both name= and property= attributes
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const m = html.match(re) ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"));
  return m?.[1] ?? null;
}

async function checkViaPageFetch(username: string): Promise<AccountCheckResult> {
  const base: AccountCheckResult = {
    username, status: "unknown", displayName: null, profileImageUrl: null,
    followerCount: null, followingCount: null, isVerified: null, createdAt: null, error: null,
  };

  try {
    // Fetch with redirect following — we check both the final URL and the HTML content
    const res = await fetch(`https://x.com/${username}`, {
      method: "GET",
      headers: {
        "User-Agent": CRAWLER_UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    const finalUrl = (res.url || "").toLowerCase();

    // Redirect to suspended page
    if (finalUrl.includes("/account/suspended")) {
      return { ...base, status: "suspended" };
    }

    if (res.status === 404) {
      return { ...base, status: "not_found" };
    }

    if (!res.ok) {
      return { ...base, status: "unknown", error: `HTTP ${res.status}` };
    }

    // Landed on home page (e.g. redirected from a deleted account)
    const normalizedFinal = finalUrl.replace(/\/$/, "");
    if (normalizedFinal === "https://x.com" || normalizedFinal === "https://twitter.com") {
      return { ...base, status: "not_found" };
    }

    const html = await res.text();

    // Extract <title>
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = (titleMatch?.[1] ?? "").trim().toLowerCase();

    // Suspended check
    if (title.includes("account suspended")) {
      return { ...base, status: "suspended" };
    }

    // Not found checks
    if (
      title.includes("isn't available") ||
      title.includes("page doesn't exist") ||
      title.includes("page not found") ||
      title === "x" ||
      title === "twitter" ||
      title === ""
    ) {
      return { ...base, status: "not_found" };
    }

    // Active: title is "Display Name (@handle) / X" or "Display Name (@handle) on X"
    const rawTitle = (titleMatch?.[1] ?? "").trim();
    const nameMatch = rawTitle.match(/^(.+?)\s+\(@[^)]+\)\s*(?:\/|on)\s*X/i);
    const displayName = nameMatch?.[1]?.trim() ?? null;

    // Extract profile image from OG meta tag
    const profileImageUrl = extractMeta(html, "og:image");

    if (displayName || rawTitle.toLowerCase().includes(`@${username.toLowerCase()}`)) {
      return {
        ...base, status: "active",
        displayName,
        profileImageUrl: profileImageUrl?.startsWith("http") ? profileImageUrl : null,
      };
    }

    // Final fallback: if the URL still contains the username, consider active
    if (finalUrl.includes(`/${username.toLowerCase()}`)) {
      return { ...base, status: "active" };
    }

    return { ...base, status: "unknown", error: "Could not determine account status" };
  } catch (err) {
    return {
      ...base, status: "unknown",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Unified check: tries GraphQL first, falls back to page fetch ─────────────

async function checkXAccount(
  username: string,
  guestToken: string | null,
): Promise<AccountCheckResult> {
  if (guestToken) {
    try {
      return await checkViaGraphQL(username, guestToken);
    } catch (err) {
      // GraphQL failed — most likely IP-blocked on this hosting provider.
      // Fall through to the HTML page fetch fallback.
      logger.warn({ username, err: err instanceof Error ? err.message : err },
        "GraphQL check failed, falling back to page fetch");
    }
  }

  return checkViaPageFetch(username);
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/check-accounts", async (req, res): Promise<void> => {
  const parsed = CheckAccountsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { usernames } = parsed.data;
  const cleanedUsernames = usernames
    .map((u) => u.trim().replace(/^@/, ""))
    .filter((u) => u.length > 0);

  req.log.info({ count: cleanedUsernames.length }, "Checking X accounts");

  // Try to get a guest token (works on Replit, may fail on cloud providers)
  let guestToken: string | null = null;
  try {
    guestToken = await getGuestToken();
  } catch (err) {
    req.log.warn({ err: err instanceof Error ? err.message : err },
      "Guest token unavailable — using page-fetch fallback for all accounts");
  }

  const results = await Promise.all(
    cleanedUsernames.map((username) => checkXAccount(username, guestToken))
  );

  res.json({ results });
});

export default router;
