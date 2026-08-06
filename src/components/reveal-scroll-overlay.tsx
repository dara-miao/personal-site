"use client";

import { useEffect, useRef } from "react";

export function RevealScrollOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const pageContent = document.querySelector(".page-content");
    if (!overlay || !pageContent) return;

    const content = pageContent;
    let raf = 0;
    let lastOpacity = "";

    function applyOpacity() {
      if (!overlay) return;

      const bottom = content.getBoundingClientRect().bottom;
      const viewport = window.innerHeight;

      let next = "0";
      if (bottom < viewport) {
        const progress = Math.max(0, Math.min(1, (viewport - bottom) / viewport));
        next = String(0.08 * Math.max(0, (progress - 0.15) / 0.85));
      }

      if (next === lastOpacity) return;
      lastOpacity = next;
      overlay.style.opacity = next;
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        applyOpacity();
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    applyOpacity();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <div ref={overlayRef} className="reveal-overlay" aria-hidden />;
}
