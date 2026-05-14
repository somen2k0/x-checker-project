/**
 * Validates required and optional environment variables at server startup.
 *
 * Required vars  → crash immediately with a clear error message.
 * Optional vars  → print a warning; the feature will be disabled at runtime.
 *
 * Call this BEFORE app.listen() so misconfigured deployments fail fast
 * instead of silently serving broken responses.
 */

interface EnvVar {
  name: string;
  description: string;
}

const REQUIRED: EnvVar[] = [
  {
    name: "TWITTER_BEARER_TOKEN",
    description:
      "Twitter/X bearer token used to authenticate all account-check requests. " +
      "Get one at https://developer.twitter.com or use X's public app token.",
  },
];

const OPTIONAL: EnvVar[] = [
  {
    name: "GROQ_API_KEY",
    description:
      "Groq API key for AI-powered features (bio generator, AI detector). " +
      "Without it those tools will return 503. Get one at https://console.groq.com",
  },
  {
    name: "RAPIDAPI_KEYS",
    description:
      "Comma-separated RapidAPI keys for the optional Gmailnator integration " +
      "(gmailnator.p.rapidapi.com). The frontend Temp Gmail tool uses temp.tf instead " +
      "and does NOT require this key. Get keys at https://rapidapi.com",
  },
  {
    name: "WEB3FORMS_KEY",
    description:
      "Web3Forms access key for the server-side contact form endpoint (/api/contact). " +
      "Without it, contact form submissions will return 503. Get one at https://web3forms.com",
  },
  {
    name: "ADMIN_PASSWORD",
    description:
      "Password protecting the admin panel (/api/admin). " +
      "Without it the admin panel is disabled entirely.",
  },
];

export function checkEnv(): void {
  const missing: EnvVar[] = REQUIRED.filter((v) => !process.env[v.name]);

  if (missing.length > 0) {
    const lines = missing
      .map((v) => `  • ${v.name}\n      ${v.description}`)
      .join("\n\n");

    console.error(
      "\n" +
        "╔══════════════════════════════════════════════════════════╗\n" +
        "║          MISSING REQUIRED ENVIRONMENT VARIABLES          ║\n" +
        "╚══════════════════════════════════════════════════════════╝\n\n" +
        "The following required variables are not set:\n\n" +
        lines +
        "\n\n" +
        "Set them in your .env file (local dev) or in the Vercel\n" +
        "dashboard under Settings → Environment Variables (production).\n" +
        "See .env.example for the full list of available variables.\n",
    );

    process.exit(1);
  }

  const unset = OPTIONAL.filter((v) => !process.env[v.name]);
  if (unset.length > 0) {
    for (const v of unset) {
      console.warn(`[env] OPTIONAL not set: ${v.name} — ${v.description}`);
    }
  }
}
