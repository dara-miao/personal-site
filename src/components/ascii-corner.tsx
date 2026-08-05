"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const CURSOR_RADIUS = 280;

/** Italianno script "dm" — decorative corner watermark with ombre bloom */
export function AsciiCorner() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.45;
      const cy = rect.top + rect.height * 0.55;
      const dist = Math.hypot(event.clientX - cx, event.clientY - cy);

      const bloom =
        dist < CURSOR_RADIUS ? (1 - dist / CURSOR_RADIUS) ** 2 : 0;
      root.style.setProperty("--ascii-corner-bloom", bloom.toFixed(3));
    };

    const onPointerLeave = () => {
      root.style.setProperty("--ascii-corner-bloom", "0");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="ascii-corner" aria-hidden="true">
      <Image
        src="/dm-corner.png"
        alt=""
        width={408}
        height={314}
        className="ascii-corner__image"
        unoptimized
      />
    </div>
  );
}
