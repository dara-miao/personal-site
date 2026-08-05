type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="link-arrow inline-flex items-center gap-1"
    >
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
