import { useEffect, useCallback } from "react";
import { trackEvent, trackPageView, type EventName, type TrackParams } from "@/lib/analytics";
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
  useEffect(() => {
    trackPageView(location);
  }, [location]);
}

export function useToolView(tool: string) {
  useEffect(() => {
    trackEvent("tool_view", { tool });
  }, [tool]);
}
