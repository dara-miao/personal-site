export const SCRIPT_TINTS = ["default", "gold", "blue"] as const;
export type ScriptTint = (typeof SCRIPT_TINTS)[number];

/** Profile name — natural black + blue only */
export const PROFILE_SCRIPT_TINTS = ["default", "blue"] as const satisfies readonly ScriptTint[];

/** dm corner — starts gold, then blue, then natural */
export const DM_CORNER_TINTS = ["gold", "blue", "default"] as const satisfies readonly ScriptTint[];

export function cycleScriptTint(
  current: ScriptTint,
  tints: readonly ScriptTint[] = SCRIPT_TINTS,
): ScriptTint {
  const index = tints.indexOf(current);
  const startIndex = index === -1 ? 0 : index;
  return tints[(startIndex + 1) % tints.length]!;
}
