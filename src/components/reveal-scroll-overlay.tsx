"use client";

import { useEffect, useRef } from "react";

export function RevealScrollOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const pageContent = document.querySelector(".page-content");
    if (!overlay || !pageContent) return;

    const content = pageContent;

    function onScroll() {
      if (!overlay) return;

      const bottom = content.getBoundingClientRect().bottom;
      const viewport = window.innerHeight;

      if (bottom >= viewport) {
        overlay.style.opacity = "0";
        return;
      }

      const progress = Math.max(0, Math.min(1, (viewport - bottom) / viewport));
      overlay.style.opacity = String(0.08 * Math.max(0, (progress - 0.15) / 0.85));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <div ref={overlayRef} className="reveal-overlay" aria-hidden />;
}
