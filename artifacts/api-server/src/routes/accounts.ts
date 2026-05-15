import { Router, type IRouter } from "express";
import { CheckAccountsBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// X's own public app bearer token (same one their website uses for logged-out visitors)
const PUBLIC_BEARER =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

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

// ─── Method 2: oEmbed fallback (works from any IP, no JS parsing needed) ─────
//
// publish.twitter.com is Twitter's official public oEmbed endpoint, accessible
// from any IP (designed for third-party websites to embed Twitter content).
//   200 → active
//   403 → suspended
//   404 → not found

async function checkViaOEmbed(username: string): Promise<AccountCheckResult> {
  const base: AccountCheckResult = {
    username, status: "unknown", displayName: null, profileImageUrl: null,
    followerCount: null, followingCount: null, isVerified: null, createdAt: null, error: null,
  };

  try {
    const url = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
      `https://twitter.com/${username}`
    )}&omit_script=true`;

    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": UA },
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 200) return { ...base, status: "active" };
    if (res.status === 403) return { ...base, status: "suspended" };
    if (res.status === 404) return { ...base, status: "not_found" };
    return { ...base, status: "unknown", error: `oEmbed HTTP ${res.status}` };
  } catch (err) {
    return {
      ...base, status: "unknown",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Unified check: tries GraphQL first, falls back to oEmbed ────────────────

async function checkXAccount(
  username: string,
  guestToken: string | null,
): Promise<AccountCheckResult> {
  if (guestToken) {
    try {
      return await checkViaGraphQL(username, guestToken);
    } catch (err) {
      // GraphQL failed — most likely IP-blocked on this hosting provider.
      // Fall through to the oEmbed fallback.
      logger.warn({ username, err: err instanceof Error ? err.message : err },
        "GraphQL check failed, falling back to oEmbed");
    }
  }

  return checkViaOEmbed(username);
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
