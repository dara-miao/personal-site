"use client";

import { useEffect } from "react";

/** Always start at bio top — browsers otherwise restore scroll to the photo layer */
export function ScrollToTop() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}
