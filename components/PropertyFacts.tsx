type PropertyFactsData = {
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  floor: string | null;
  facing: string;
  possession: string;
};

export function PropertyFacts({ property }: { property: PropertyFactsData }) {
  const facts: Array<[string, string]> = [
    ["Size", `${property.areaSqft.toLocaleString("en-IN")} sq ft`],
    ["Bedrooms", String(property.bedrooms)],
    ["Bathrooms", String(property.bathrooms)],
    ...(property.floor ? ([["Floor", property.floor]] as [string, string][]) : []),
    ["Facing", property.facing],
    ["Possession", property.possession],
  ];

  return (
    <dl className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
      {facts.map(([label, value]) => (
        <div
          key={label}
          className="flex items-baseline justify-between gap-4 border-b border-hairline py-3"
        >
          <dt className="text-meta text-muted">{label}</dt>
          <dd className="text-body text-ink tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
