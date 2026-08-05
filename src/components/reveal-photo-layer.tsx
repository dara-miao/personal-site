"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { EmailCopyLink } from "@/components/email-copy-link";
import { RevealScrollOverlay } from "@/components/reveal-scroll-overlay";
import { collageCanvas, site } from "@/content/site";

export function RevealPhotoLayer() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visiblePhotos, setVisiblePhotos] = useState<Set<number>>(new Set());

  useEffect(() => {
    const grid = gridRef.current;
    const spacer = document.querySelector(".reveal-scroll-spacer");
    if (!grid || !spacer) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function revealAll() {
      setVisiblePhotos(new Set(site.photos.map((_, index) => index)));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          revealAll();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(spacer);

    if (reducedMotion) {
      revealAll();
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="reveal-layer">
      <RevealScrollOverlay />
      <div className="reveal-layer-inner">
        <div
          ref={gridRef}
          className="collage-grid"
          style={
            {
              "--collage-w": collageCanvas.width,
              "--collage-h": collageCanvas.height,
            } as CSSProperties
          }
        >
          {site.photos.map((photo, index) => (
            <div
              key={photo.src}
              className={`collage-cell group ${visiblePhotos.has(index) ? "collage-cell--visible" : ""}`}
              style={
                {
                  "--layout-x": photo.layout.x,
                  "--layout-y": photo.layout.y,
                  "--layout-w": photo.layout.w,
                  "--layout-h": photo.layout.h,
                  "--stagger": `${(index % 4) * 100}ms`,
                } as CSSProperties
              }
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                unoptimized
                className="collage-image"
                style={{ objectPosition: photo.objectPosition }}
              />
              <div className="collage-hover-overlay" aria-hidden />
            </div>
          ))}
        </div>
        <div className="reveal-footer-bar">
          <p className="reveal-footer-copy">&copy; 2026 {site.name}</p>
          <div className="reveal-footer-links">
            {site.social.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="reveal-footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ))}
            <EmailCopyLink
              email={site.email}
              className="reveal-footer-link email-copy-link"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
