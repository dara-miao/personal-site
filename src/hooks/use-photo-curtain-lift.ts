"use client";

import { useEffect, type RefObject } from "react";

/** Scroll-linked lift for the fixed photo layer — mirrors bio curtain revealing DM underneath. */
export function usePhotoCurtainLift(layerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const layer = layerRef.current;
    const dmSpacer = document.querySelector(".dm-scroll-spacer");
    if (!layer || !dmSpacer) return;

    function liftMetrics() {
      // Lift begins when the DM spacer enters the document flow (after bio + photo spacer).
      const liftStart = (dmSpacer as HTMLElement).offsetTop;
      // One viewport of travel lifts the fixed photo layer fully; spacer is taller to allow it.
      const liftDistance = window.innerHeight;
      return { liftStart, liftDistance };
    }

    function onScroll() {
      if (!layer) return;

      const { liftStart, liftDistance } = liftMetrics();
      const raw = (window.scrollY - liftStart) / liftDistance;
      const progress = Math.max(0, Math.min(1, raw));
      const liftPx = progress * window.innerHeight;

      if (progress <= 0) {
        layer.style.transform = "";
        layer.classList.remove("reveal-layer--lifting");
        layer.style.pointerEvents = "";
        return;
      }

      layer.style.transform = `translateY(${-liftPx}px)`;
      layer.classList.add("reveal-layer--lifting");
      layer.style.pointerEvents = progress >= 1 ? "none" : "";
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      layer.style.transform = "";
      layer.classList.remove("reveal-layer--lifting");
      layer.style.pointerEvents = "";
    };
  }, [layerRef]);
}
