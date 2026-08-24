// Used on every page — rendered once, from app/layout.tsx.
export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-12">
        <p className="font-display text-heading text-ink">Verge</p>
        <p className="mt-6 text-meta text-muted">
          <a
            href="mailto:hello@verge.property"
            className="focus-ring text-ink underline underline-offset-4"
          >
            hello@verge.property
          </a>
          <span className="mx-2 text-muted">·</span>
          +91 98765 43210
        </p>
        <p className="mt-3 text-meta text-muted">© 2026 Verge</p>
      </div>
    </footer>
  );
}
