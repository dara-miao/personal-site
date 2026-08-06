"use client";

import { useEffect, useRef, useState } from "react";

type TypewriterTextProps = {
  text: string;
  charDelay?: number;
  startDelay?: number;
  className?: string;
  /** Fires once when the full string has been typed. */
  onComplete?: () => void;
};

export function TypewriterText({
  text,
  charDelay = 40,
  startDelay = 300,
  className = "",
  onComplete,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [started, setStarted] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = window.setTimeout(() => setStarted(true), startDelay);
    return () => window.clearTimeout(timer);
  }, [startDelay]);

  useEffect(() => {
    if (!started || visibleCount >= text.length) return;

    const timer = window.setTimeout(() => {
      setVisibleCount((current) => current + 1);
    }, charDelay);

    return () => window.clearTimeout(timer);
  }, [started, visibleCount, text.length, charDelay]);

  useEffect(() => {
    if (!started || visibleCount < text.length || completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current?.();
  }, [started, visibleCount, text.length]);

  const chars = text.slice(0, visibleCount).split("");
  const typing = started && visibleCount < text.length;

  return (
    <span className={className}>
      {chars.map((char, index) => (
        <span key={`${index}-${char}`} className="typewriter-char">
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
      {typing ? <span className="typewriter-cursor">|</span> : null}
    </span>
  );
}
