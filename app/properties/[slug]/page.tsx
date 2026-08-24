import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnquiryForm } from "@/components/EnquiryForm";
import { PropertyFacts } from "@/components/PropertyFacts";
import { VideoPlayer } from "@/components/VideoPlayer";
import { formatPriceInr } from "@/lib/format-price";
import { prisma } from "@/lib/prisma";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

async function getProperty(slug: string) {
  return prisma.property.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return {};

  const description = property.description.split(". ")[0] + ".";

  return {
    title: `${property.name} — ${property.locality}`,
    description,
    openGraph: {
      title: property.name,
      description,
      images: [{ url: property.posterUrl }],
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getProperty(slug);

  // A slug that doesn't match anything — mistyped, an old link, a bot
  // guessing URLs — gets Next's real 404 page, not a blank screen or a
  // crash. This is the one behaviour Phase 4 has to prove by testing it.
  if (!property) notFound();

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-12">
      <div className="lg:flex lg:items-start lg:gap-16">
        <div className="lg:w-1/3 lg:flex-none">
          <VideoPlayer
            videoUrl={property.videoUrl}
            posterUrl={property.posterUrl}
            caption={property.videoCaption}
          />
        </div>

        <div className="mt-10 lg:mt-0 lg:flex-1">
          <h1 className="font-display text-heading md:text-heading-lg">{property.name}</h1>
          <p className="mt-2 text-body text-muted">
            {property.locality}, {property.city}
          </p>
          <p className="mt-4 text-sub text-ink tabular-nums md:text-sub-lg">
            {formatPriceInr(property.priceInr)}
          </p>

          <div className="mt-10">
            <PropertyFacts property={property} />
          </div>

          <p className="mt-10 max-w-[34rem] text-body text-muted">{property.description}</p>

          <div className="mt-16">
            <EnquiryForm propertyId={property.id} propertyName={property.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
