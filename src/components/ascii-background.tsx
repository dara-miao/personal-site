"use client";

import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

/**
 * Density ramp — sparse to flowing (warm minimal, not matrix).
 * Leading space keeps the cream page visible between bands.
 */
const GLYPHS = [" ", "·", "·", ".", "∘", "─", "~", "≈", "∿"] as const;

const CELL_PX = 12;
const BASE_ALPHA = 0.1;
const CURSOR_RADIUS = 160;
const CURSOR_BOOST = 0.09;
const CURSOR_PUSH = 14;
const FLOW_STRENGTH = 2.8;
const SCROLL_DRIFT = 0.012;

/** Warm near-black and accent grays from site palette */
const GLYPH_COLOR = "26, 26, 24";
const GLYPH_ACCENT = "110, 109, 104";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function glyphIndex(field: number): number {
  const idx = Math.floor(clamp01(field) * GLYPHS.length);
  return Math.min(idx, GLYPHS.length - 1);
}

export function AsciiBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const noise3D = createNoise3D();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const opacityScale =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--ascii-opacity",
        ),
      ) || 0.15;
    const baseAlpha = BASE_ALPHA * (opacityScale / 0.15);
    const cursorBoost = CURSOR_BOOST * (opacityScale / 0.15);
    const maxAlpha = 0.2 * (opacityScale / 0.15);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let time = 0;
    let scrollOffset = 0;
    let pointer = { x: -9999, y: -9999, inside: false };
    let visible = !document.hidden;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Aurora-like layered noise — vertical bands with organic drift */
    const auroraField = (col: number, row: number, t: number): number => {
      const x = col * 0.55;
      const y = row * 0.38;

      const band1 = noise3D(x * 0.018, y * 0.008, t * 0.00014);
      const band2 = noise3D(x * 0.024 + 42, y * 0.011, t * 0.00011) * 0.65;
      const band3 =
        Math.sin(y * 0.09 + t * 0.00085 + band1 * 2.4) * 0.28;
      const ripple = noise3D(x * 0.045, y * 0.032, t * 0.0002) * 0.22;

      return clamp01((band1 + band2 + band3 + ripple + 1) * 0.5);
    };

    /** Flow-field displacement from noise gradient */
    const flowOffset = (
      col: number,
      row: number,
      t: number,
    ): { dx: number; dy: number } => {
      const x = col * 0.55;
      const y = row * 0.38;
      const eps = 0.35;
      const z = t * 0.00018;

      const n = noise3D(x * 0.028, y * 0.028, z);
      const nx =
        noise3D((x + eps) * 0.028, y * 0.028, z) -
        noise3D((x - eps) * 0.028, y * 0.028, z);
      const ny =
        noise3D(x * 0.028, (y + eps) * 0.028, z) -
        noise3D(x * 0.028, (y - eps) * 0.028, z);

      const angle = Math.atan2(ny, nx) + n * 0.4;
      return {
        dx: Math.cos(angle) * FLOW_STRENGTH,
        dy: Math.sin(angle) * FLOW_STRENGTH,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${CELL_PX}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cols = Math.ceil(width / CELL_PX) + 1;
      const rows = Math.ceil(height / CELL_PX) + 1;
      const cx = width * 0.5;
      const cy = height * 0.35;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = col * CELL_PX + CELL_PX * 0.5;
          const baseY = row * CELL_PX + CELL_PX * 0.5;

          const field = auroraField(col, row, time);
          const glyph = GLYPHS[glyphIndex(field)]!;
          if (glyph === " ") continue;

          const flow = reducedMotion ? { dx: 0, dy: 0 } : flowOffset(col, row, time);

          let dx = flow.dx;
          let dy = flow.dy;
          let boost = 0;

          if (pointer.inside) {
            const px = baseX - pointer.x;
            const py = baseY - pointer.y;
            const dist = Math.hypot(px, py);
            if (dist < CURSOR_RADIUS) {
              const falloff = (1 - dist / CURSOR_RADIUS) ** 2;
              boost = falloff * cursorBoost;
              const angle = Math.atan2(py, px);
              dx += Math.cos(angle) * falloff * CURSOR_PUSH;
              dy += Math.sin(angle) * falloff * CURSOR_PUSH;
            }
          }

          const ambient = reducedMotion
            ? 0
            : Math.sin(col * 0.22 + time * 0.0006) *
                Math.cos(row * 0.18 + time * 0.00045) *
                1.2;

          const x = baseX + dx;
          const y = baseY + dy + ambient + scrollOffset;

          const textZoneDist = Math.hypot(baseX - cx, baseY - cy);
          const textZoneFactor = Math.min(1, textZoneDist / (width * 0.28));
          const zoneAlpha = 0.5 + textZoneFactor * 0.5;

          const peakFactor = field > 0.62 ? (field - 0.62) / 0.38 : 0;
          const alpha = Math.min(maxAlpha, (baseAlpha + boost) * zoneAlpha);
          const rgb =
            peakFactor > 0.15 ? GLYPH_ACCENT : GLYPH_COLOR;
          const peakAlpha = alpha * (1 + peakFactor * 0.35);

          ctx.fillStyle = `rgba(${rgb}, ${peakAlpha})`;
          ctx.fillText(glyph, x, y);
        }
      }
    };

    const tick = () => {
      if (reducedMotion) {
        draw();
        return;
      }
      if (visible) {
        time += 16;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        inside:
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom,
      };
    };

    const onPointerLeave = () => {
      pointer = { x: -9999, y: -9999, inside: false };
    };

    const onScroll = () => {
      scrollOffset = window.scrollY * SCROLL_DRIFT;
    };

    const onVisibility = () => {
      visible = !document.hidden;
    };

    resize();
    tick();

    const ro = new ResizeObserver(resize);
    ro.observe(root);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={rootRef} className="ascii-background" aria-hidden="true">
      <canvas ref={canvasRef} className="ascii-background__canvas" />
    </div>
  );
}
