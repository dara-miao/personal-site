"use client";

import { useEffect, useState } from "react";

type TypewriterTextProps = {
  text: string;
  charDelay?: number;
  startDelay?: number;
  className?: string;
};

export function TypewriterText({
  text,
  charDelay = 70,
  startDelay = 400,
  className = "",
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setStarted(true), startDelay);
    return () => window.clearTimeout(timer);
  }, [startDelay]);

  useEffect(() => {
    if (!started || index >= text.length) return;

    const timer = window.setTimeout(() => {
      setDisplayed((current) => current + text[index]);
      setIndex((current) => current + 1);
    }, charDelay);

    return () => window.clearTimeout(timer);
  }, [started, index, text, charDelay]);

  useEffect(() => {
    if (!started || index < text.length) return;

    let blinkCount = 0;
    const timer = window.setInterval(() => {
      setShowCursor((current) => !current);
      blinkCount += 1;
      if (blinkCount >= 4) {
        window.clearInterval(timer);
        setShowCursor(false);
      }
    }, 400);

    return () => window.clearInterval(timer);
  }, [started, index, text.length]);

  return (
    <span className={className}>
      {displayed}
      {started && index < text.length && showCursor ? (
        <span className="typewriter-cursor">|</span>
      ) : null}
    </span>
  );
}
