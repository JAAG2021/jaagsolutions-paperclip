import { useEffect } from "react";
import { trackEvent } from "./analytics.ts";

const THRESHOLDS = [25, 50, 75, 100] as const;

export function useScrollDepth(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fired = new Set<number>();

    function check() {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);
      for (const threshold of THRESHOLDS) {
        if (pct >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          trackEvent("scroll_depth", { event_label: `${threshold}%`, value: threshold });
        }
      }
    }

    window.addEventListener("scroll", check, { passive: true });
    // Check on mount in case the page is short and already past a threshold
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);
}
