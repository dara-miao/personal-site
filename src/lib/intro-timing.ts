import { site } from "@/content/site";

/** Matches TypewriterText props on the intro splash. */
export const INTRO_TYPEWRITER_START_DELAY_MS = 500;
export const INTRO_TYPEWRITER_CHAR_DELAY_MS = 80;
export const INTRO_SPLASH_MIN_EXIT_MS = 1600;
export const INTRO_SPLASH_EXIT_TRANSITION_MS = 1000;

/** Beat after splash begins exit before dm fades in — noticeable but still synced. */
export const DM_CORNER_REVEAL_AFTER_SPLASH_MS = 400;

/** When intro splash begins exit (ms after mount). Keeps corner fade in sync. */
export function getIntroSplashExitMs(): number {
  const typingMs =
    INTRO_TYPEWRITER_START_DELAY_MS +
    site.name.length * INTRO_TYPEWRITER_CHAR_DELAY_MS;
  return Math.max(typingMs + 300, INTRO_SPLASH_MIN_EXIT_MS);
}

/** Absolute ms from mount when dm corner should begin fading in. */
export function getDmCornerRevealMs(): number {
  return getIntroSplashExitMs() + DM_CORNER_REVEAL_AFTER_SPLASH_MS;
}
