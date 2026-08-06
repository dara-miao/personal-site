import { Fragment } from "react";
import Image from "next/image";
import { AsciiBackground } from "@/components/ascii-background";
import { DmLayer } from "@/components/dm-chapter";
import { EmailCopyLink } from "@/components/email-copy-link";
import { IntroSplash } from "@/components/intro-splash";
import { ProfileScriptMark } from "@/components/profile-script-mark";
import { RevealPhotoLayer } from "@/components/reveal-photo-layer";
import { WorkParagraph } from "@/components/work-paragraph";
import { site } from "@/content/site";

export default function Home() {
  return (
    <>
      <IntroSplash>
        <div className="page-content">
          <AsciiBackground />
          <main className="page-main">
            <div className="page-inner">
              <div className="profile-card">
                <div className="profile-card__row">
                  <div className="profile-card__headshot">
                    <Image
                      src="/headshot.png"
                      alt=""
                      width={790}
                      height={894}
                      priority
                      unoptimized
                      className="h-full w-full object-cover object-[center_45%]"
                    />
                  </div>
                  <div className="profile-card__identity">
                    <h1 className="profile-card__name-sr">{site.name}</h1>
                    <ProfileScriptMark />
                  </div>
                </div>
              </div>

              <section className="home-section">
                {site.paragraphs.map((paragraph, index) => (
                  <Fragment key={index}>
                    {index > 0 ? (
                      <div className="prose-divider" aria-hidden="true">
                        · · · · ·
                      </div>
                    ) : null}
                    <WorkParagraph parts={paragraph} />
                  </Fragment>
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

      <DmLayer />

      <div className="dm-scroll-spacer" aria-hidden />
    </>
  );
}
