"use client";

import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

/**
 * Density ramp — sparse to flowing (warm minimal, not matrix).
 * Leading spaces keep the cream page visible between bands.
 */
const GLYPHS = [" ", " ", " ", "·", ".", "∘", "─", "~", "≈", "∿"] as const;
const STAR_GLYPHS = ["'", "+", "*"] as const;
/** Field values below this render as empty — raises bar for visible glyphs */
const DENSITY_FLOOR = 0.4;
const PEAK_THRESHOLD = 0.97;

const CELL_PX = 13;
const BASE_ALPHA = 0.11;
const ALPHA_SCALE = 0.72;
/** Fraction of viewport width for bio text legibility fade */
const TEXT_ZONE_RADIUS = 0.34;
const CURSOR_RADIUS = 130;
/** Faint cursor nudge on bio only — displacement, no color bloom */
const CURSOR_BOOST = 0.025;
const CURSOR_PUSH = 4;
const FLOW_STRENGTH = 2.8;
const SCROLL_DRIFT = 0.012;

type Rgb = { r: number; g: number; b: number };

const OMBRE_VERTICAL_START = 0.22;
const OMBRE_VERTICAL_END = 0.38;
const OMBRE_VERTICAL_ACCENT = 0.28;
const OMBRE_HOVER_BLOOM = 0.4;
const OMBRE_HOVER_ACCENT = 0.32;
const OMBRE_MID_BELL_WIDTH = 0.075;
const OMBRE_PEAK_ACCENT = 0.45;
/** Boost ombre wash on self-drifting aurora bands (temporal + flow activity) */
const OMBRE_MOTION_TINT = 0.2;
const OMBRE_MOTION_ACCENT = 0.08;
const MOTION_SAMPLE_MS = 32;
const MOTION_FIELD_SCALE = 11;
const MOTION_FLOW_SCALE = 2.4;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function parseHexColor(hex: string): Rgb {
  const normalized = hex.trim().replace("#", "");
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0]! + normalized[0], 16),
      g: parseInt(normalized[1]! + normalized[1], 16),
      b: parseInt(normalized[2]! + normalized[2], 16),
    };
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(from: Rgb, to: Rgb, t: number): Rgb {
  const mix = clamp01(t);
  return {
    r: Math.round(lerp(from.r, to.r, mix)),
    g: Math.round(lerp(from.g, to.g, mix)),
    b: Math.round(lerp(from.b, to.b, mix)),
  };
}

function readOmbrePalette(): {
  base: Rgb;
  accent: Rgb;
  ombreAccent: Rgb;
  accentMix: number;
  start: Rgb;
  end: Rgb;
} {
  const style = getComputedStyle(document.documentElement);
  const accentMixRaw = parseFloat(
    style.getPropertyValue("--ascii-ombre-accent-mix").trim(),
  );
  return {
    base: parseHexColor(
      style.getPropertyValue("--ascii-color").trim() || "#1a1a18",
    ),
    accent: parseHexColor(
      style.getPropertyValue("--color-text-secondary").trim() || "#6e6d68",
    ),
    ombreAccent: parseHexColor(
      style.getPropertyValue("--ascii-ombre-accent").trim() || "#c4b5a0",
    ),
    accentMix: Number.isFinite(accentMixRaw) ? accentMixRaw : 0.12,
    start: parseHexColor(
      style.getPropertyValue("--ascii-ombre-start").trim() || "#fdfdfb",
    ),
    end: parseHexColor(
      style.getPropertyValue("--ascii-ombre-end").trim() || "#d4a574",
    ),
  };
}

/** Vertical ombre + optional cursor bloom — editorial warm tones, not neon */
function glyphRgb(
  x: number,
  y: number,
  width: number,
  height: number,
  pointer: { x: number; y: number; inside: boolean },
  peakFactor: number,
  motionFactor: number,
  palette: {
    base: Rgb;
    accent: Rgb;
    ombreAccent: Rgb;
    accentMix: number;
    start: Rgb;
    end: Rgb;
  },
  hoverBloom: boolean,
): string {
  const verticalT = clamp01(y / Math.max(height, 1));
  const topWash = (1 - verticalT) ** 1.4;
  const bottomWarm = verticalT ** 1.1;
  const accentMix = palette.accentMix;

  let color = palette.base;
  color = lerpColor(color, palette.start, topWash * OMBRE_VERTICAL_START);
  color = lerpColor(color, palette.end, bottomWarm * OMBRE_VERTICAL_END);

  if (accentMix > 0) {
    const midField =
      Math.exp(-((verticalT - 0.44) ** 2) / OMBRE_MID_BELL_WIDTH) * accentMix;
    color = lerpColor(
      color,
      palette.ombreAccent,
      midField * OMBRE_VERTICAL_ACCENT,
    );
  }

  if (hoverBloom && pointer.inside) {
    const dist = Math.hypot(x - pointer.x, y - pointer.y);
    if (dist < CURSOR_RADIUS) {
      const falloff = (1 - dist / CURSOR_RADIUS) ** 2;
      const bloomTarget =
        verticalT < 0.42
          ? lerpColor(
              palette.start,
              palette.end,
              0.32 + accentMix * OMBRE_HOVER_ACCENT,
            )
          : verticalT < 0.62
            ? lerpColor(
                palette.end,
                palette.start,
                accentMix * OMBRE_HOVER_ACCENT * 0.45,
              )
            : palette.end;
      color = lerpColor(color, bloomTarget, falloff * OMBRE_HOVER_BLOOM);
    }
  }

  if (motionFactor > 0.04) {
    const motionWash =
      verticalT < 0.38
        ? lerpColor(palette.start, palette.end, 0.38)
        : verticalT < 0.58
          ? lerpColor(palette.start, palette.end, 0.62)
          : lerpColor(palette.end, palette.start, 0.28);
    color = lerpColor(color, motionWash, motionFactor * OMBRE_MOTION_TINT);
    if (accentMix > 0) {
      color = lerpColor(
        color,
        palette.ombreAccent,
        motionFactor * OMBRE_MOTION_ACCENT * accentMix,
      );
    }
  }

  if (peakFactor > 0.15) {
    color = lerpColor(color, palette.accent, peakFactor * OMBRE_PEAK_ACCENT);
  }

  return `${color.r}, ${color.g}, ${color.b}`;
}

function effectiveField(field: number, densityFloor = DENSITY_FLOOR): number {
  if (field < densityFloor) return 0;
  return clamp01((field - densityFloor) / (1 - densityFloor));
}

function glyphIndex(field: number): number {
  const idx = Math.floor(clamp01(field) * GLYPHS.length);
  return Math.min(idx, GLYPHS.length - 1);
}

function pickGlyph(field: number, densityFloor = DENSITY_FLOOR): string {
  if (field >= PEAK_THRESHOLD) {
    const t = (field - PEAK_THRESHOLD) / (1 - PEAK_THRESHOLD);
    const idx = Math.floor(t * STAR_GLYPHS.length);
    return STAR_GLYPHS[Math.min(idx, STAR_GLYPHS.length - 1)]!;
  }
  const remapped = effectiveField(field, densityFloor);
  if (remapped === 0) return " ";
  return GLYPHS[glyphIndex(remapped)]!;
}

/** How much a cell is actively drifting — temporal field change + flow swing + density */
function motionActivity(
  field: number,
  fieldPrev: number,
  flow: { dx: number; dy: number },
  flowPrev: { dx: number; dy: number },
): number {
  const temporal = clamp01(Math.abs(field - fieldPrev) * MOTION_FIELD_SCALE);
  const flowDelta = Math.hypot(flow.dx - flowPrev.dx, flow.dy - flowPrev.dy);
  const flowSwing = clamp01(flowDelta / MOTION_FLOW_SCALE);
  const density = effectiveField(field);
  const glyphDensity = density * density;

  return clamp01(temporal * 0.52 + flowSwing * 0.33 + glyphDensity * 0.22);
}

type AsciiBackgroundProps = {
  /** Bio page (default) or photo reveal — reveal is sparser, no cursor */
  variant?: "bio" | "reveal";
};

export function AsciiBackground({ variant = "bio" }: AsciiBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReveal = variant === "reveal";

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

    const style = getComputedStyle(document.documentElement);
    const opacityVar = isReveal ? "--ascii-reveal-opacity" : "--ascii-opacity";
    const opacityScale =
      parseFloat(style.getPropertyValue(opacityVar)) ||
      (isReveal ? 0.11 : 0.11);
    const densityFloor = DENSITY_FLOOR;
    const baseAlpha = BASE_ALPHA * (opacityScale / 0.15) * ALPHA_SCALE;
    const cursorBoost = isReveal ? 0 : CURSOR_BOOST * (opacityScale / 0.15);
    const maxAlpha = 0.11 * (opacityScale / 0.15) * ALPHA_SCALE;
    const palette = readOmbrePalette();

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

    /** Static dot grid for prefers-reduced-motion — no frozen aurora frame */
    const drawStaticPattern = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${CELL_PX}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cols = Math.ceil(width / CELL_PX) + 1;
      const rows = Math.ceil(height / CELL_PX) + 1;
      const cx = width * 0.5;
      const cy = height * 0.35;
      const staticStride = 5;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if ((col + row) % staticStride !== 0) continue;

          const baseX = col * CELL_PX + CELL_PX * 0.5;
          const baseY = row * CELL_PX + CELL_PX * 0.5;

          const textZoneDist = Math.hypot(baseX - cx, baseY - cy);
          const textZoneFactor = isReveal
            ? 1
            : Math.min(1, textZoneDist / (width * TEXT_ZONE_RADIUS));
          const zoneAlpha = isReveal
            ? 1
            : 0.38 + textZoneFactor * 0.62;

          const hash = (col * 17 + row * 31) % 100;
          const alpha = baseAlpha * zoneAlpha * (0.55 + (hash / 100) * 0.45);
          const rgb = glyphRgb(
            baseX,
            baseY,
            width,
            height,
            pointer,
            0,
            0,
            palette,
            false,
          );

          ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
          ctx.fillText("·", baseX, baseY);
        }
      }
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
          const glyph = pickGlyph(field, densityFloor);
          if (glyph === " ") continue;

          const flow = flowOffset(col, row, time);
          const fieldPrev = auroraField(col, row, time - MOTION_SAMPLE_MS);
          const flowPrev = flowOffset(col, row, time - MOTION_SAMPLE_MS);
          const motionRaw = motionActivity(field, fieldPrev, flow, flowPrev);

          let dx = flow.dx;
          let dy = flow.dy;
          let boost = 0;

          if (!isReveal && pointer.inside) {
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

          const ambient =
            Math.sin(col * 0.22 + time * 0.0006) *
            Math.cos(row * 0.18 + time * 0.00045) *
            1.2;

          const x = baseX + dx;
          const y = baseY + dy + ambient + scrollOffset;

          const textZoneDist = Math.hypot(baseX - cx, baseY - cy);
          const textZoneFactor = isReveal
            ? 1
            : Math.min(1, textZoneDist / (width * TEXT_ZONE_RADIUS));
          const zoneAlpha = isReveal
            ? 1
            : 0.38 + textZoneFactor * 0.62;

          const peakFactor = field > 0.68 ? (field - 0.68) / 0.32 : 0;
          const motionFactor =
            motionRaw *
            (isReveal ? 0.2 : 0.12 + textZoneFactor * 0.28);
          const alpha = Math.min(maxAlpha, (baseAlpha + boost) * zoneAlpha);
          const rgb = glyphRgb(
            baseX,
            baseY,
            width,
            height,
            pointer,
            peakFactor,
            motionFactor,
            palette,
            false,
          );
          const peakAlpha = alpha * (1 + peakFactor * (isReveal ? 0.25 : 0.12));

          ctx.fillStyle = `rgba(${rgb}, ${peakAlpha})`;
          ctx.fillText(glyph, x, y);
        }
      }
    };

    const tick = () => {
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

    const render = () => {
      if (reducedMotion) drawStaticPattern();
      else draw();
    };

    resize();
    render();
    if (!reducedMotion) tick();

    const ro = new ResizeObserver(() => {
      resize();
      render();
    });
    ro.observe(root);

    if (!isReveal) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (!isReveal) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
      }
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [variant]);

  return (
    <div
      ref={rootRef}
      className={`ascii-background${isReveal ? " ascii-background--reveal" : ""}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="ascii-background__canvas" />
    </div>
  );
}
