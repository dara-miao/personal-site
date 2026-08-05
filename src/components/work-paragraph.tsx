import type { ReactNode } from "react";
import type { WorkPart } from "@/content/site";

export function WorkLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="work-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

export function WorkParagraph({ parts }: { parts: readonly WorkPart[] }) {
  return (
    <p className="prose">
      {parts.map((part, index) =>
        part.type === "text" ? (
          <span key={index}>{part.value}</span>
        ) : (
          <WorkLink key={index} href={part.href}>
            {part.label}
          </WorkLink>
        ),
      )}
    </p>
  );
}
