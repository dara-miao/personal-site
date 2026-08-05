"use client";

import { useEffect, type RefObject } from "react";

/** Drives self-flowing aurora drift on `.reveal-layer` via CSS custom properties. */
export function useRevealOmbreAmbient(
  layerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    let rafId = 0;

    const tick = (time: number) => {
      const t = time / 1000;

      const d1x = Math.sin(t * 0.18) * 9 + Math.sin(t * 0.07) * 4.5;
      const d1y = Math.cos(t * 0.15) * 7.5 + Math.cos(t * 0.11) * 3.5;
      const d2x = Math.sin(t * 0.12 + 1.2) * 11 + Math.sin(t * 0.05) * 5;
      const d2y = Math.cos(t * 0.14 + 0.8) * 9 + Math.cos(t * 0.08) * 4;
      const d3x = Math.sin(t * 0.09 + 2.1) * 13 + Math.cos(t * 0.06 + 0.5) * 6;
      const d3y = Math.cos(t * 0.11 + 1.5) * 10 + Math.sin(t * 0.04 + 1.8) * 5;
      const d4x = Math.sin(t * 0.07 + 3.2) * 10 + Math.sin(t * 0.03) * 4.5;
      const d4y = Math.cos(t * 0.1 + 2.4) * 8.5 + Math.cos(t * 0.05 + 0.9) * 4;

      layer.style.setProperty("--reveal-drift-1-x", `${d1x.toFixed(2)}%`);
      layer.style.setProperty("--reveal-drift-1-y", `${d1y.toFixed(2)}%`);
      layer.style.setProperty("--reveal-drift-2-x", `${d2x.toFixed(2)}%`);
      layer.style.setProperty("--reveal-drift-2-y", `${d2y.toFixed(2)}%`);
      layer.style.setProperty("--reveal-drift-3-x", `${d3x.toFixed(2)}%`);
      layer.style.setProperty("--reveal-drift-3-y", `${d3y.toFixed(2)}%`);
      layer.style.setProperty("--reveal-drift-4-x", `${d4x.toFixed(2)}%`);
      layer.style.setProperty("--reveal-drift-4-y", `${d4y.toFixed(2)}%`);

      const angle =
        155 + Math.sin(t * 0.08) * 6 + Math.cos(t * 0.05 + 1.1) * 4;
      layer.style.setProperty("--reveal-drift-angle", `${angle.toFixed(2)}deg`);

      const pulse = 0.82 + Math.sin(t * 0.25) * 0.1;
      layer.style.setProperty("--reveal-ombre-pulse", pulse.toFixed(3));

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [layerRef]);
}
