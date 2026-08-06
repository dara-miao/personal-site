import type { Metadata } from "next";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dara Miao",
  description:
    "Business and AI at USC Marshall. GTM at MindFort AI (YC X25).",
  icons: {
    icon: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Dara Miao",
    description:
      "Business and AI at USC Marshall. GTM at MindFort AI (YC X25).",
    type: "website",
    url: "https://daramiao.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dara Miao",
    description:
      "Business and AI at USC Marshall. GTM at MindFort AI (YC X25).",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
