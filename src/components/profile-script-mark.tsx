"use client";

import Image from "next/image";
import { useState } from "react";
import {
  cycleScriptTint,
  PROFILE_SCRIPT_TINTS,
  type ScriptTint,
} from "@/lib/script-tint";

export function ProfileScriptMark() {
  const [tint, setTint] = useState<ScriptTint>("default");

  return (
    <button
      type="button"
      className="profile-script-mark"
      data-tint={tint}
      onClick={() =>
        setTint((t) => cycleScriptTint(t, PROFILE_SCRIPT_TINTS))
      }
      aria-label="Cycle name script color"
    >
      <Image
        src="/dara-miao-script.png"
        alt=""
        width={658}
        height={121}
        priority
        unoptimized
        className="profile-script-mark__image"
        aria-hidden
        draggable={false}
      />
    </button>
  );
}
