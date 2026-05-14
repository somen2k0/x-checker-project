const GA_ID = "G-0544DCZ399";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    _gaLoaded?: boolean;
  }
}

export type EventName =
  | "copy_bio"
  | "copy_hashtag"
  | "copy_tweet"
  | "copy_font"
  | "copy_username"
  | "copy_name"
  | "generate_bio"
  | "generate_username"
  | "format_hashtag"
  | "format_tweet"
  | "preview_font"
  | "counter_type"
  | "tool_view"
  | "email_capture"
  | "upgrade_click"
  | "affiliate_click"
  | "cookie_accept"
  | "cookie_decline"
  | "format_json"
  | "validate_json"
  | "copy_json"
  | "download_json"
  | "encode_base64"
  | "decode_base64"
  | "copy_base64"
  | "download_base64"
  | "tool_search"
  | "category_click"
  | "related_tool_click"
  | "popular_tool_click"
  | "new_tool_click"
  | "ai_detect"
  | "ai_humanize"
  | "bio_generate"
  | "account_check";

export interface TrackParams {
  tool?: string;
  label?: string;
  value?: number;
  [key: string]: string | number | undefined;
}

function hasConsent(): boolean {
  return localStorage.getItem("analytics_consent") === "true";
}

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function loadGA(): void {
  if (typeof window === "undefined") return;
  if (window._gaLoaded) return;
  window._gaLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    anonymize_ip: true,
    send_page_view: true,
  });
}

export function trackEvent(event: EventName, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;
  if (!hasConsent()) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  if (!hasConsent()) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("config", GA_ID, { page_path: path });
}

export function getConsentStatus(): "accepted" | "declined" | "pending" {
  const stored = localStorage.getItem("analytics_consent");
  if (stored === "true") return "accepted";
  if (stored === "false") return "declined";
  return "pending";
}

export function setConsent(accepted: boolean): void {
  localStorage.setItem("analytics_consent", String(accepted));
  if (accepted) {
    loadGA();
    trackEvent(accepted ? "cookie_accept" : "cookie_decline");
  }
}
