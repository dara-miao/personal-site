import { site } from "@/content/site";

/** Delay before the first character types. */
export const INTRO_TYPEWRITER_START_DELAY_MS = 300;
/** Milliseconds between characters. */
export const INTRO_TYPEWRITER_CHAR_DELAY_MS = 40;
/** Short beat after typing completes before splash exit begins. */
export const INTRO_SPLASH_HOLD_AFTER_TYPEWRITER_MS = 290;
export const INTRO_SPLASH_EXIT_TRANSITION_MS = 1000;

/** Beat after splash begins exit before dm fades in — noticeable but still synced. */
export const DM_CORNER_REVEAL_AFTER_SPLASH_MS = 400;

/** Time for the intro typewriter to finish (ms from mount). */
export function getIntroTypewriterDurationMs(): number {
  return (
    INTRO_TYPEWRITER_START_DELAY_MS +
    site.name.length * INTRO_TYPEWRITER_CHAR_DELAY_MS
  );
}

/**
 * Estimated ms from mount when intro splash begins exit.
 * Actual exit is driven by TypewriterText onComplete + hold (not this timer).
 */
export function getIntroSplashExitMs(): number {
  return getIntroTypewriterDurationMs() + INTRO_SPLASH_HOLD_AFTER_TYPEWRITER_MS;
}

/** Absolute ms from mount when dm corner should begin fading in (estimate). */
export function getDmCornerRevealMs(): number {
  return getIntroSplashExitMs() + DM_CORNER_REVEAL_AFTER_SPLASH_MS;
}
