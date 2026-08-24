import { PropertyCard, type PropertyCardData } from "@/components/PropertyCard";

export function PropertyGrid({ properties }: { properties: PropertyCardData[] }) {
  return (
    <div className="property-grid gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.slug} property={property} />
      ))}
    </div>
  );
}
