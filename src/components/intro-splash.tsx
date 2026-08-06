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

    const exitAt = getIntroSplashExitMs();

    const revealTimer = window.setTimeout(() => {
      setShowSplash(false);
      setRevealContent(true);
    }, exitAt);

    return () => window.clearTimeout(revealTimer);
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
