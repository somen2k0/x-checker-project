import { useEffect, useCallback, useRef } from "react";
import { trackEvent, trackPageView, type EventName, type TrackParams } from "@/lib/analytics";
import { clarityTrackPage } from "@/lib/clarity";
import { useLocation } from "wouter";

export function useTrack(tool: string) {
  const track = useCallback(
    (event: EventName, extra: TrackParams = {}) => {
      trackEvent(event, { tool, ...extra });
    },
    [tool]
  );
  return track;
}

export function usePageTracking() {
  const [location] = useLocation();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (location === lastTracked.current) return;
    lastTracked.current = location;

    // Send to GA4 (consent-gated)
    trackPageView(location);

    // Send to Microsoft Clarity (production-only, no-op otherwise)
    clarityTrackPage(location);

    // Send to our own backend (always — no PII stored)
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location }),
    }).catch(() => { /* non-critical */ });
  }, [location]);
}

export function useToolView(tool: string) {
  useEffect(() => {
    trackEvent("tool_view", { tool });
  }, [tool]);
}
