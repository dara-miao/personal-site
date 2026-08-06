"use client";

import { useEffect, type RefObject } from "react";

/** Scroll-linked lift for the fixed photo layer — mirrors bio curtain revealing DM underneath. */
export function usePhotoCurtainLift(layerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const layer = layerRef.current;
    const dmSpacer = document.querySelector(".dm-scroll-spacer");
    if (!layer || !dmSpacer) return;

    const spacer = dmSpacer as HTMLElement;
    let liftStart = 0;
    let liftDistance = 0;
    let raf = 0;
    let lastLiftPx = -1;
    let lastProgress = -1;
    let isLifting = false;
    let pointerEventsNone = false;

    function measure() {
      // Lift begins when the DM spacer enters the document flow (after bio + photo spacer).
      liftStart = spacer.offsetTop;
      // One viewport of travel lifts the fixed photo layer fully; spacer is taller to allow it.
      liftDistance = window.innerHeight;
    }

    function applyLift() {
      // One scroll/layout read per frame — avoid thrashing with other scroll listeners.
      const scrollY = window.scrollY;
      const viewportH = liftDistance || window.innerHeight;
      const distance = Math.max(viewportH, 1);
      const raw = (scrollY - liftStart) / distance;
      const progress = Math.max(0, Math.min(1, raw));
      const liftPx = progress * viewportH;

      // Skip DOM writes when nothing meaningful changed.
      if (
        progress === lastProgress &&
        Math.abs(liftPx - lastLiftPx) < 0.25
      ) {
        return;
      }
      lastProgress = progress;
      lastLiftPx = liftPx;

      if (progress <= 0) {
        if (isLifting) {
          layer!.style.transform = "";
          layer!.classList.remove("reveal-layer--lifting");
          isLifting = false;
        }
        if (pointerEventsNone) {
          layer!.style.pointerEvents = "";
          pointerEventsNone = false;
        }
        return;
      }

      // Transform-only compositor update during lift.
      layer!.style.transform = `translateY(${-liftPx}px)`;
      if (!isLifting) {
        layer!.classList.add("reveal-layer--lifting");
        isLifting = true;
      }

      const shouldBlock = progress >= 1;
      if (shouldBlock !== pointerEventsNone) {
        layer!.style.pointerEvents = shouldBlock ? "none" : "";
        pointerEventsNone = shouldBlock;
      }
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        applyLift();
      });
    }

    function onResize() {
      measure();
      applyLift();
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    applyLift();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      layer.style.transform = "";
      layer.classList.remove("reveal-layer--lifting");
      layer.style.pointerEvents = "";
    };
  }, [layerRef]);
}
