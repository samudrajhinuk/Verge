import Link from "next/link";

// Holding page. The landing page is Phase 6.
export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12">
      <h1 className="max-w-[20ch] font-display text-display md:text-display-lg">
        Ten residences, shown on video first.
      </h1>
      <p className="mt-8 max-w-[34rem] text-body text-muted">
        Mumbai, Bengaluru, Delhi, Pune, Hyderabad, Chennai and Goa. The landing
        page is built in Phase 6 — until then the design system is under review.
      </p>
      <p className="mt-10">
        <Link
          href="/styleguide"
          className="focus-ring inline-block border border-ink px-6 py-4 text-caption text-ink uppercase"
        >
          Open the styleguide
        </Link>
      </p>
    </div>
  );
}
