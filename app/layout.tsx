import type { Metadata } from "next";
import { DM_Serif_Display, Lexend_Deca } from "next/font/google";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { VergeIcon } from "@/components/VergeIcon";

import "./globals.css";

// Explicit fallbacks on both faces. next/font measures the real font and
// generates a size-adjusted fallback, so the swap does not shift the layout.
const dmSerifDisplay = DM_Serif_Display({
  weight: "400", // the only weight this face has
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-serif",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend-deca",
  fallback: ["-apple-system", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  // The base every relative URL in metadata resolves against — canonical
  // links, Open Graph images. Without this, Next.js falls back to
  // http://localhost:3000 even in production, which is exactly the bug this
  // fixes: it's set once, here, rather than every page hardcoding the domain.
  metadataBase: new URL("https://verge.whoisneel.in"),
  title: {
    default: "Verge — Property",
    template: "%s — Verge",
  },
  description:
    "Ten residences in Mumbai, Bengaluru, Delhi, Pune, Hyderabad, Chennai and Goa. Each one shown on video before anything else.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${lexendDeca.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="focus-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:text-meta"
        >
          Skip to content
        </a>

        <header className="border-b border-hairline">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-12"
          >
            {/* Icon only in the nav — the wordmark lives in the footer, the
                page title and the enquiry confirmation. */}
            <Link href="/" className="focus-ring flex items-center text-ink" aria-label="Verge, home">
              {/* Size control lives on the wrapper: VergeIcon sets its own
                  display inline, which would beat a `hidden` utility class. */}
              <span className="flex md:hidden">
                <VergeIcon size={20} />
              </span>
              <span className="hidden md:flex">
                <VergeIcon size={22} />
              </span>
            </Link>

            <ul className="flex items-center gap-6 text-caption uppercase md:gap-8">
              <li>
                <Link href="/properties" className="focus-ring text-ink hover:text-muted">
                  Properties
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main id="main">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
