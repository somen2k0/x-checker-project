/**
 * Vercel Edge Function for X account checking.
 *
 * WHY EDGE?
 * Regular Vercel serverless functions run on AWS Lambda — IP ranges that
 * Twitter/X blocks from their API endpoints. Edge functions run on
 * Cloudflare's CDN network, which uses different IPs that are not blocked.
 * This lets us use the same guest token + GraphQL method that works on Replit.
 *
 * FALLBACK:
 * If the guest token still fails (e.g. rate limiting), we fall back to
 * Twitter's oEmbed API (publish.twitter.com) which works from any IP:
 *   200 → active
 *   403 → suspended
 *   404 → not found
 */

export const config = { runtime: "edge" };

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const PUBLIC_BEARER =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I%2FeLDgiU%3DEUifiRBkKG5E2XzMDjRfl76ZoRheOfeat6k%2FqiVWrv7sdG7V0ByZ83Dw2R";

const GRAPHQL_FEATURES = JSON.stringify({
  hidden_profile_subscriptions_enabled: true,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
});

interface AccountCheckResult {
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

type GQLBody = {
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

// ─── Guest token ──────────────────────────────────────────────────────────────

async function getGuestToken(bearer: string): Promise<string> {
  const res = await fetch("https://api.twitter.com/1.1/guest/activate.json", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      Origin: "https://x.com",
      Referer: "https://x.com/",
      "x-twitter-active-user": "yes",
      "x-twitter-client-language": "en",
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`guest_activate HTTP ${res.status}`);
  const data = (await res.json()) as { guest_token?: string };
  if (!data.guest_token) throw new Error("No guest_token in response");
  return data.guest_token;
}

// ─── Method 1: GraphQL UserByScreenName (full data) ──────────────────────────

async function checkViaGraphQL(
  username: string,
  guestToken: string,
  bearer: string
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
      Authorization: `Bearer ${bearer}`,
      "x-guest-token": guestToken,
      "User-Agent": UA,
      "x-twitter-active-user": "yes",
      "x-twitter-client-language": "en",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    if (res.status === 429) {
      return { ...base, status: "unknown", error: "Rate limited — try again shortly" };
    }
    throw new Error(`GraphQL HTTP ${res.status}`);
  }

  const body = (await res.json()) as GQLBody;
  const result = body?.data?.user?.result;
  const errors = body?.errors;

  if (result?.__typename === "User") {
    const legacy = result.legacy;
    return {
      ...base,
      status: "active",
      displayName: legacy?.name ?? null,
      profileImageUrl: legacy?.profile_image_url_https ?? null,
      followerCount: legacy?.followers_count ?? null,
      followingCount: legacy?.friends_count ?? null,
      isVerified: result.is_blue_verified ?? legacy?.verified ?? null,
      createdAt: legacy?.created_at ? new Date(legacy.created_at).toISOString() : null,
    };
  }

  if (result?.__typename === "UserUnavailable") {
    return { ...base, status: "suspended" };
  }

  if (errors?.length) {
    const msg = errors[0].message?.toLowerCase() ?? "";
    const code = errors[0].code;
    if (msg.includes("not found") || code === 50) return { ...base, status: "not_found" };
    if (msg.includes("suspend") || code === 63) return { ...base, status: "suspended" };
    return { ...base, status: "unknown", error: errors[0].message };
  }

  if (!result) return { ...base, status: "not_found" };
  return { ...base, status: "unknown", error: "Unexpected response shape" };
}

// ─── Method 2: oEmbed fallback (works from any IP, limited data) ──────────────
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
}

// ─── Unified check ────────────────────────────────────────────────────────────

async function checkAccount(
  username: string,
  guestToken: string | null,
  bearer: string
): Promise<AccountCheckResult> {
  if (guestToken) {
    try {
      return await checkViaGraphQL(username, guestToken, bearer);
    } catch {
      // GraphQL failed — fall through to oEmbed
    }
  }
  return checkViaOEmbed(username);
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: { usernames?: unknown };
  try {
    body = (await req.json()) as { usernames?: unknown };
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body?.usernames) || body.usernames.length === 0) {
    return Response.json({ error: "usernames must be a non-empty array" }, { status: 400 });
  }

  const usernames = (body.usernames as unknown[])
    .map((u) => String(u).trim().replace(/^@/, ""))
    .filter((u) => u.length > 0)
    .slice(0, 100);

  if (usernames.length === 0) {
    return Response.json({ error: "No valid usernames provided" }, { status: 400 });
  }

  const bearer =
    (process.env.TWITTER_BEARER_TOKEN as string | undefined) ?? PUBLIC_BEARER;

  // Try guest token (works on Edge/Cloudflare IPs; may fail on standard Lambda IPs)
  let guestToken: string | null = null;
  try {
    guestToken = await getGuestToken(bearer);
  } catch {
    // Guest token unavailable — each account will use oEmbed fallback
  }

  const results = await Promise.all(
    usernames.map((u) => checkAccount(u, guestToken, bearer))
  );

  return Response.json({ results });
}
