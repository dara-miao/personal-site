"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { AsciiBackground } from "@/components/ascii-background";
import { usePhotoCurtainLift } from "@/hooks/use-photo-curtain-lift";
import { useRevealOmbreAmbient } from "@/components/reveal-ombre-ambient";
import { RevealScrollOverlay } from "@/components/reveal-scroll-overlay";
import {
  collageCanvas,
  collageContentInsets,
  photoRevealStaggerMs,
  site,
} from "@/content/site";

const CAPTION_AUTO_HIDE_MS = 2800;

function CollageHoverCaption({ caption }: { caption: string }) {
  const separator = " · ";
  const splitIndex = caption.indexOf(separator);

  if (splitIndex === -1) {
    return <p className="collage-hover-caption">{caption}</p>;
  }

  const primary = caption.slice(0, splitIndex);
  const secondary = caption.slice(splitIndex + separator.length);

  return (
    <p className="collage-hover-caption">
      <span className="collage-hover-caption-primary">{primary}</span>
      <span className="collage-hover-caption-secondary">{secondary}</span>
    </p>
  );
}

export function RevealPhotoLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hideCaptionTimerRef = useRef<number | null>(null);
  const coarsePointerRef = useRef(false);
  const [visiblePhotos, setVisiblePhotos] = useState<Set<number>>(new Set());
  const [activeCaptionIndex, setActiveCaptionIndex] = useState<number | null>(
    null,
  );

  useRevealOmbreAmbient(layerRef);
  usePhotoCurtainLift(layerRef);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const sync = () => {
      coarsePointerRef.current = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

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

  useEffect(() => {
    if (activeCaptionIndex === null) return;

    hideCaptionTimerRef.current = window.setTimeout(() => {
      setActiveCaptionIndex(null);
      hideCaptionTimerRef.current = null;
    }, CAPTION_AUTO_HIDE_MS);

    return () => {
      if (hideCaptionTimerRef.current !== null) {
        window.clearTimeout(hideCaptionTimerRef.current);
        hideCaptionTimerRef.current = null;
      }
    };
  }, [activeCaptionIndex]);

  const handleCellActivate = (index: number) => {
    if (!coarsePointerRef.current) return;
    setActiveCaptionIndex((current) => (current === index ? null : index));
  };

  return (
    <div ref={layerRef} className="reveal-layer">
      <AsciiBackground variant="reveal" />
      <RevealScrollOverlay />
      <div className="reveal-layer-inner">
        <div
          className="reveal-collage-column"
          style={
            {
              "--collage-w": collageCanvas.width,
              "--collage-h": collageCanvas.height,
              "--collage-content-left": collageContentInsets.left,
              "--collage-content-right-inset": collageContentInsets.rightInset,
            } as CSSProperties
          }
        >
          <div ref={gridRef} className="collage-grid">
            {site.photos.map((photo, index) => (
              <div
                key={photo.src}
                className={`collage-cell group ${visiblePhotos.has(index) ? "collage-cell--visible" : ""}${activeCaptionIndex === index ? " collage-cell--caption-active" : ""}`}
                style={
                  {
                    "--layout-x": photo.layout.x,
                    "--layout-y": photo.layout.y,
                    "--layout-w": photo.layout.w,
                    "--layout-h": photo.layout.h,
                    "--stagger": `${photoRevealStaggerMs[index]}ms`,
                  } as CSSProperties
                }
                onClick={() => handleCellActivate(index)}
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
                <div
                  className={`collage-hover-overlay${"captionPosition" in photo && photo.captionPosition === "top" ? " collage-hover-overlay--top" : ""}`}
                  aria-hidden
                >
                  <CollageHoverCaption caption={photo.caption} />
                </div>
              </div>
            ))}
          </div>
          <div className="reveal-footer-bar">
            <p className="reveal-footer-copy">&copy; 2026 {site.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
