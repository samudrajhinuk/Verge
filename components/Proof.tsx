const FACTS = ["Ten residences", "Four cities", "Possession within eighteen months"];

// Plain text, set large, left-anchored. No icons, no cards, no three-column
// grid with a symbol above each item — CLAUDE.md §5.15 names that pattern
// directly as the clearest signature of templated design. The hairline
// divider between items is the one repeating gesture doing the work here.
export function Proof() {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-[1440px] divide-y divide-hairline px-6 py-16 md:flex md:divide-y-0 md:divide-x md:px-12 md:py-24">
        {FACTS.map((fact) => (
          <p
            key={fact}
            className="py-6 pl-0 font-display text-heading text-ink first:pt-0 md:flex-1 md:py-0 md:pl-12 md:first:pl-0"
          >
            {fact}
          </p>
        ))}
      </div>
    </section>
  );
}
