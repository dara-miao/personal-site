"use client";

import { createContext, useContext } from "react";

const IntroRevealContext = createContext(false);

export function IntroRevealProvider({
  revealed,
  children,
}: {
  revealed: boolean;
  children: React.ReactNode;
}) {
  return (
    <IntroRevealContext.Provider value={revealed}>
      {children}
    </IntroRevealContext.Provider>
  );
}

export function useIntroRevealed(): boolean {
  return useContext(IntroRevealContext);
}
