"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { TypewriterText } from "@/components/typewriter-text";

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

    const nameLength = site.name.length;
    const typingMs = 400 + nameLength * 70;
    const exitAt = Math.max(typingMs + 300, 1600);

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
          <TypewriterText text={site.name} charDelay={80} startDelay={500} />
        </h1>
      </div>

      <div
        className={`intro-content ${revealContent ? "intro-content--visible" : ""}`}
      >
        {children}
      </div>
    </>
  );
}
