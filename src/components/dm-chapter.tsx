"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { AsciiBackground } from "@/components/ascii-background";
import { EmailCopyLink } from "@/components/email-copy-link";
import { site } from "@/content/site";
import {
  cycleScriptTint,
  DM_CORNER_TINTS,
  type ScriptTint,
} from "@/lib/script-tint";

/** Full-viewport DM chapter — fixed beneath the photo curtain */
export function DmLayer() {
  const [tint, setTint] = useState<ScriptTint>("default");
  const [isHovering, setIsHovering] = useState(false);

  const nextTint = cycleScriptTint(tint, DM_CORNER_TINTS);
  const displayTint = isHovering ? nextTint : tint;

  const cycleTint = useCallback(() => {
    setTint((current) => cycleScriptTint(current, DM_CORNER_TINTS));
  }, []);

  return (
    <div
      className="dm-layer"
      data-tint={displayTint}
      aria-label="DM monogram"
    >
      <AsciiBackground />
      <div className="dm-layer-inner">
        <div className="dm-mark-area">
          <button
            type="button"
            className="dm-mark"
            aria-label={`DM monogram, ${tint} tint. Click to change color.`}
            onClick={cycleTint}
            onPointerEnter={() => setIsHovering(true)}
            onPointerLeave={() => setIsHovering(false)}
          >
            <Image
              src="/dm-corner.png"
              alt=""
              width={408}
              height={314}
              className="dm-mark__image"
              unoptimized
              draggable={false}
            />
          </button>
        </div>
        <div className="dm-layer-footer">
          <p className="dm-layer-footer-copy">&copy; 2026 {site.name}</p>
          <div className="dm-layer-footer-links">
            {site.social.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="dm-layer-footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ))}
            <EmailCopyLink
              email={site.email}
              className="dm-layer-footer-link email-copy-link"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
