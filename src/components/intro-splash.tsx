"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { TypewriterText } from "@/components/typewriter-text";
import { IntroRevealProvider } from "@/components/intro-reveal-context";
import {
  INTRO_TYPEWRITER_CHAR_DELAY_MS,
  INTRO_TYPEWRITER_START_DELAY_MS,
  getIntroSplashExitMs,
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
  const [showSplash, setShowSplash] = useState(true);
  const [revealContent, setRevealContent] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setShowSplash(false);
      setRevealContent(true);
      return;
    }

    const unlock = lockDocumentScroll();
    const exitAt = getIntroSplashExitMs();

    const revealTimer = window.setTimeout(() => {
      unlock();
      setShowSplash(false);
      setRevealContent(true);
    }, exitAt);

    return () => {
      window.clearTimeout(revealTimer);
      unlock();
    };
  }, []);

  return (
    <>
      <div
        className={`intro-splash ${showSplash ? "" : "intro-splash--exit"}`}
        aria-hidden={!showSplash}
      >
        <h1 className="intro-splash-title">
          <TypewriterText
            text={site.name}
            charDelay={INTRO_TYPEWRITER_CHAR_DELAY_MS}
            startDelay={INTRO_TYPEWRITER_START_DELAY_MS}
          />
        </h1>
      </div>

      <IntroRevealProvider revealed={revealContent}>
        <div
          className={`intro-content ${revealContent ? "intro-content--visible" : ""}`}
        >
          {children}
        </div>
      </IntroRevealProvider>
    </>
  );
}
