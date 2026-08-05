import Image from "next/image";
import { AsciiBackground } from "@/components/ascii-background";
import { AsciiCorner } from "@/components/ascii-corner";
import { EmailCopyLink } from "@/components/email-copy-link";
import { IntroSplash } from "@/components/intro-splash";
import { RevealPhotoLayer } from "@/components/reveal-photo-layer";
import { WorkParagraph } from "@/components/work-paragraph";
import { site } from "@/content/site";

export default function Home() {
  return (
    <>
      <IntroSplash>
        <div className="page-content">
          <AsciiBackground />
          <AsciiCorner />
          <main className="page-main">
            <div className="page-inner">
              <div className="mb-14">
                <div className="mb-6 h-[108px] w-[90px] overflow-hidden rounded-[14px] bg-[var(--color-bg-subtle)]">
                  <Image
                    src="/headshot.png"
                    alt={site.name}
                    width={790}
                    height={894}
                    priority
                    unoptimized
                    className="h-full w-full object-cover object-[center_45%]"
                  />
                </div>
                <h1 className="m-0 text-[16px] font-medium leading-[2] tracking-[-0.3px] text-[#1a1a18]">
                  {site.name}
                </h1>
                <p className="-mt-1.5 m-0 text-[16px] font-medium tracking-[-0.3px] text-[var(--color-text-primary)]">
                  {site.role}
                </p>
              </div>

              <section className="home-section">
                {site.paragraphs.map((paragraph, index) => (
                  <WorkParagraph key={index} parts={paragraph} />
                ))}
              </section>

              <section className="mt-auto pt-2">
                <div className="flex min-h-[44px] flex-wrap items-center gap-x-5 gap-y-3">
                  {site.social.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  ))}
                  <EmailCopyLink email={site.email} />
                </div>
              </section>
            </div>
          </main>
        </div>
      </IntroSplash>

      <div className="reveal-scroll-spacer" aria-hidden />

      <RevealPhotoLayer />
    </>
  );
}
