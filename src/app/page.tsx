import { ExternalLink } from "@/components/external-link";
import { ProfileCard } from "@/components/profile-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/content/site";

function SectionBlock({
  title,
  items,
  delay = 0,
}: {
  title: string;
  items: readonly string[];
  delay?: number;
}) {
  return (
    <ScrollReveal delay={delay}>
      <section className="home-section">
        <h2 className="section-title">{title}</h2>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item} className="body-text m-0">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </ScrollReveal>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-[740px] px-6 pb-16 pt-24">
        <ScrollReveal>
          <ProfileCard name={site.name} headline={site.headline} />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="mb-14 max-w-[560px] space-y-4">
            {site.intro.map((paragraph) => (
              <p key={paragraph} className="body-text m-0">
                {paragraph}
              </p>
            ))}
          </div>
        </ScrollReveal>

        <div className="space-y-14">
          <SectionBlock title="what i'm up to" items={site.upTo} />
          <SectionBlock
            title="what i think about"
            items={site.thinkAbout}
            delay={80}
          />
          <SectionBlock
            title="what i like to create"
            items={site.create}
            delay={80}
          />

          <ScrollReveal delay={120}>
            <footer className="home-section border-t border-border pt-12">
              <h2 className="section-title">find me elsewhere</h2>
              <p className="body-text m-0 mb-4">
                <ExternalLink href={`mailto:${site.email}`}>
                  {site.email}
                </ExternalLink>
              </p>
              <ul className="flex min-h-[44px] flex-wrap items-center gap-x-5 gap-y-3">
                {site.social.map(({ label, href }) => (
                  <li key={label}>
                    <ExternalLink href={href}>{label}</ExternalLink>
                  </li>
                ))}
              </ul>
              <p className="body-text m-0 pt-8 text-muted">{site.footer}</p>
            </footer>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
