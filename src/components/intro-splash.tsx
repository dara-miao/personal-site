"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { site } from "@/content/site";
import { TypewriterText } from "@/components/typewriter-text";
import { IntroRevealProvider } from "@/components/intro-reveal-context";
import {
  INTRO_SPLASH_HOLD_AFTER_TYPEWRITER_MS,
  INTRO_TYPEWRITER_CHAR_DELAY_MS,
  INTRO_TYPEWRITER_START_DELAY_MS,
} from "@/lib/intro-timing";

type IntroSplashProps = {
  children: React.ReactNode;
};

const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

function lockDocumentScroll(): () => void {
  const html = document.documentElement;
  const body = document.body;
  const prevHtmlOverflow = html.style.overflow;
  const prevBodyOverflow = body.style.overflow;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  window.scrollTo(0, 0);

  const preventDefault = (event: Event) => {
    event.preventDefault();
  };

  const preventKeyScroll = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) {
      event.preventDefault();
    }
  };

  const forceTop = () => {
    if (window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
    }
  };

  window.addEventListener("wheel", preventDefault, { passive: false });
  window.addEventListener("touchmove", preventDefault, { passive: false });
  window.addEventListener("keydown", preventKeyScroll);
  window.addEventListener("scroll", forceTop, { passive: true });

  return () => {
    html.style.overflow = prevHtmlOverflow;
    body.style.overflow = prevBodyOverflow;
    window.removeEventListener("wheel", preventDefault);
    window.removeEventListener("touchmove", preventDefault);
    window.removeEventListener("keydown", preventKeyScroll);
    window.removeEventListener("scroll", forceTop);
  };
}

export function IntroSplash({ children }: IntroSplashProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showSplash, setShowSplash] = useState(true);
  const [revealContent, setRevealContent] = useState(false);
  const unlockRef = useRef<(() => void) | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const exitingRef = useRef(false);

  const splashActive = !prefersReducedMotion && showSplash;
  const contentRevealed = prefersReducedMotion || revealContent;

  useEffect(() => {
    if (prefersReducedMotion) return;

    unlockRef.current = lockDocumentScroll();

    return () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      unlockRef.current?.();
      unlockRef.current = null;
    };
  }, [prefersReducedMotion]);

  const beginExit = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;

    unlockRef.current?.();
    unlockRef.current = null;
    setShowSplash(false);
    setRevealContent(true);
  };

  const handleTypewriterComplete = () => {
    if (exitingRef.current || holdTimerRef.current !== null) return;

    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null;
      beginExit();
    }, INTRO_SPLASH_HOLD_AFTER_TYPEWRITER_MS);
  };

  return (
    <>
      <div
        className={`intro-splash ${splashActive ? "" : "intro-splash--exit"}`}
        aria-hidden={!splashActive}
      >
        <h1 className="intro-splash-title">
          {prefersReducedMotion ? (
            site.name
          ) : (
            <TypewriterText
              text={site.name}
              charDelay={INTRO_TYPEWRITER_CHAR_DELAY_MS}
              startDelay={INTRO_TYPEWRITER_START_DELAY_MS}
              onComplete={handleTypewriterComplete}
            />
          )}
        </h1>
      </div>

      <IntroRevealProvider revealed={contentRevealed}>
        <div
          className={`intro-content ${contentRevealed ? "intro-content--visible" : ""}`}
        >
          {children}
        </div>
      </IntroRevealProvider>
    </>
  );
}
