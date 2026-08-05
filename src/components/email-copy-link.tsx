"use client";

import { useState } from "react";

type EmailCopyLinkProps = {
  email: string;
  className?: string;
};

export function EmailCopyLink({
  email,
  className = "social-link email-copy-link",
}: EmailCopyLinkProps) {
  const [tooltip, setTooltip] = useState("Click to copy");

  async function handleCopy() {
    await navigator.clipboard.writeText(email);
    setTooltip("Copied!");
    window.setTimeout(() => setTooltip("Click to copy"), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
    >
      {email}
      <span className={`email-tooltip ${tooltip === "Copied!" ? "show" : ""}`}>
        {tooltip}
      </span>
    </button>
  );
}
