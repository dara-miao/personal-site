"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIntroRevealed } from "@/components/intro-reveal-context";
import { DM_CORNER_REVEAL_AFTER_SPLASH_MS } from "@/lib/intro-timing";
import {
  cycleScriptTint,
  DM_CORNER_TINTS,
  type ScriptTint,
} from "@/lib/script-tint";

const CURSOR_RADIUS = 280;
const DRAG_THRESHOLD_PX = 6;
/** Scroll past ~⅓ viewport = headed to gallery */
const GALLERY_SCROLL_THRESHOLD_RATIO = 0.35;
/** Back near top = bio home */
const BIO_HOME_SCROLL_PX = 40;
const RETURN_HOME_MS = 300;

/** Italianno script "dm" — drag to reposition; returns home when scrolling back to bio */
export function AsciiCorner() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    originX: 0,
    originY: 0,
    startX: 0,
    startY: 0,
    moved: false,
  });
  const scrolledToGalleryRef = useRef(false);
  const [tint, setTint] = useState<ScriptTint>("gold");
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [returningHome, setReturningHome] = useState(false);
  const introRevealed = useIntroRevealed();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!introRevealed) {
      setVisible(false);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const revealTimer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    }, DM_CORNER_REVEAL_AFTER_SPLASH_MS);

    return () => window.clearTimeout(revealTimer);
  }, [introRevealed]);

  const applyTransform = useCallback((x: number, y: number) => {
    dragOffsetRef.current = { x, y };
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty("--ascii-corner-drag-x", `${x}px`);
    root.style.setProperty("--ascii-corner-drag-y", `${y}px`);
  }, []);

  const resetHome = useCallback(
    (animate: boolean) => {
      if (animate) {
        setReturningHome(true);
        window.setTimeout(() => setReturningHome(false), RETURN_HOME_MS);
      }
      applyTransform(0, 0);
    },
    [applyTransform],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const galleryThreshold = () =>
      window.innerHeight * GALLERY_SCROLL_THRESHOLD_RATIO;

    const onPointerMove = (event: PointerEvent) => {
      const state = dragRef.current;

      if (state.active && event.pointerId === state.pointerId) {
        const dx = event.clientX - state.startX;
        const dy = event.clientY - state.startY;

        if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
          state.moved = true;
        }

        applyTransform(state.originX + dx, state.originY + dy);
        return;
      }

      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.45;
      const cy = rect.top + rect.height * 0.55;
      const dist = Math.hypot(event.clientX - cx, event.clientY - cy);
      const bloom =
        dist < CURSOR_RADIUS ? (1 - dist / CURSOR_RADIUS) ** 2 : 0;
      root.style.setProperty("--ascii-corner-bloom", bloom.toFixed(3));
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const state = dragRef.current;
      state.active = true;
      state.pointerId = event.pointerId;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.originX = dragOffsetRef.current.x;
      state.originY = dragOffsetRef.current.y;
      state.moved = false;
      setDragging(true);
      setReturningHome(false);
      root.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const onPointerUp = (event: PointerEvent) => {
      const state = dragRef.current;
      if (!state.active || event.pointerId !== state.pointerId) return;

      state.active = false;
      setDragging(false);

      if (root.hasPointerCapture(event.pointerId)) {
        root.releasePointerCapture(event.pointerId);
      }

      if (!state.moved) {
        setTint((t) => cycleScriptTint(t, DM_CORNER_TINTS));
      }
    };

    const onScroll = () => {
      const y = window.scrollY;

      if (y > galleryThreshold()) {
        scrolledToGalleryRef.current = true;
        return;
      }

      if (scrolledToGalleryRef.current && y <= BIO_HOME_SCROLL_PX) {
        scrolledToGalleryRef.current = false;
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        resetHome(!reducedMotion);
      }
    };

    const onPointerLeaveWindow = () => {
      root.style.setProperty("--ascii-corner-bloom", "0");
    };

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerleave", onPointerLeaveWindow);
    onScroll();

    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerleave", onPointerLeaveWindow);
    };
  }, [applyTransform, resetHome]);

  return (
    <div
      ref={rootRef}
      className={`ascii-corner${visible ? " ascii-corner--visible" : ""}${dragging ? " ascii-corner--dragging" : ""}${returningHome ? " ascii-corner--returning" : ""}`}
      data-tint={tint}
      aria-hidden="true"
    >
      <Image
        src="/dm-corner.png"
        alt=""
        width={408}
        height={314}
        className="ascii-corner__image"
        unoptimized
        draggable={false}
      />
    </div>
  );
}
