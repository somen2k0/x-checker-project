export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const OTP_PATTERNS: RegExp[] = [
  /(?:verification|confirm(?:ation)?|one.?time|security|access|login|sign.?in|auth(?:entication)?)\s*(?:code|pin|otp|number|token)[^a-z0-9]*([A-Z0-9]{4,8})/i,
  /(?:code|otp|pin)[^a-z0-9:\s]*[:\s]+([A-Z0-9]{4,8})\b/i,
  /\b([0-9]{6})\b/,
  /\b([0-9]{4})\b/,
  /\b([0-9]{8})\b/,
  /\b([A-Z0-9]{6})\b/,
];

export function extractOTP(text: string): string | null {
  for (const pattern of OTP_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function isVerificationEmail(subject: string, from: string): boolean {
  const combined = `${subject} ${from}`.toLowerCase();
  return /verif|confirm|otp|code|pin|login|sign.?in|security|authent|one.?time|activate|reset|password/.test(combined);
}

export function formatDate(dateStr: string): string {
  try {
    if (!dateStr) return "—";
    // Guerrilla Mail (and some others) return Unix timestamps as numeric strings.
    // If the whole string is a number, treat it as seconds-since-epoch.
    const asNumber = Number(dateStr);
    const d = !isNaN(asNumber) && dateStr.trim() !== ""
      ? new Date(asNumber * 1000)
      : new Date(dateStr);

    if (isNaN(d.getTime())) return "—";

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
}

export function getIntro(text: string, maxLen = 80): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) + "…" : clean;
}
