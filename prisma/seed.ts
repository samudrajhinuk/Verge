import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import type { PropertyType, City } from "../lib/property-options";

// Plain `dotenv/config` only reads `.env`. The database secret lives in
// `.env.local` instead, so it's loaded explicitly, same as in prisma.config.ts.
config({ path: ".env.local" });

// Everything below is fixed: no random ids, no `new Date()`, no shuffling.
// Running the seed twice produces a byte-identical database, which is what
// makes "reset and reseed" a safe thing to tell someone to run.

type SeedProperty = {
  id: string;
  slug: string;
  name: string;
  locality: string;
  city: City;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  priceInr: number;
  areaSqft: number;
  floor: string | null;
  facing: string;
  possession: string;
  description: string;
  // The clip this property is shown with: /videos/<clip>.mp4 and
  // /posters/<clip>.jpg. Chosen per property so the room on screen suits the
  // property's type and size.
  clip: string;
  videoCaption: string;
  createdAt: Date;
};

// Spread across city, type, bedroom count and price on purpose, so that any
// filter combination visibly changes the result set rather than returning
// everything.
const properties: SeedProperty[] = [
  {
    id: "verge-001",
    slug: "pali-hill-14th-floor-bandra-west",
    name: "Pali Hill, 14th Floor",
    locality: "Pali Hill, Bandra West",
    city: "Mumbai",
    propertyType: "Apartment",
    bedrooms: 3,
    bathrooms: 3,
    priceInr: 64_000_000,
    areaSqft: 2180,
    floor: "14th of 22",
    facing: "West-facing",
    possession: "Ready to move",
    description:
      "Three bedrooms on the 14th of 22 floors, west-facing. The sea shows from the west elevation. 2,180 sq ft. Ready to move.",
    clip: "property-06",
    videoCaption: "Living room",
    createdAt: new Date("2026-01-06T09:00:00.000Z"),
  },
  {
    id: "verge-002",
    slug: "worli-sea-face-penthouse",
    name: "Worli Sea Face Penthouse",
    locality: "Worli Sea Face",
    city: "Mumbai",
    propertyType: "Penthouse",
    bedrooms: 5,
    bathrooms: 5,
    priceInr: 185_000_000,
    areaSqft: 5400,
    floor: "41st and 42nd of 42",
    facing: "West-facing",
    possession: "December 2026",
    description:
      "A duplex across the top two floors, 41 and 42 of 42. Five bedrooms, 5,400 sq ft, west-facing over the sea. Handover December 2026.",
    clip: "property-10",
    videoCaption: "Living and dining areas",
    createdAt: new Date("2026-01-07T09:00:00.000Z"),
  },
  {
    id: "verge-003",
    slug: "hundred-feet-road-indiranagar",
    name: "100 Feet Road, Second Floor",
    locality: "Indiranagar",
    city: "Bengaluru",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    priceInr: 13_500_000,
    areaSqft: 1120,
    floor: "2nd of 4",
    facing: "North-East facing",
    possession: "Ready to move",
    description:
      "Two bedrooms in Indiranagar, second of four floors, north-east facing. 1,120 sq ft. Ready to move.",
    clip: "property-08",
    videoCaption: "Kitchen",
    createdAt: new Date("2026-01-08T09:00:00.000Z"),
  },
  {
    id: "verge-004",
    slug: "palm-meadows-villa-27-whitefield",
    name: "Palm Meadows, Villa 27",
    locality: "Whitefield",
    city: "Bengaluru",
    propertyType: "Villa",
    bedrooms: 4,
    bathrooms: 4,
    priceInr: 52_000_000,
    areaSqft: 3600,
    floor: null,
    facing: "North-facing",
    possession: "Ready to move",
    description:
      "A four-bedroom villa in Whitefield, north-facing, 3,600 sq ft across its own plot. Four bathrooms. Ready to move.",
    clip: "property-01",
    videoCaption: "Dining area, natural light",
    createdAt: new Date("2026-01-09T09:00:00.000Z"),
  },
  {
    id: "verge-005",
    slug: "vasant-vihar-block-c",
    name: "Vasant Vihar, Block C",
    locality: "Vasant Vihar",
    city: "Delhi",
    propertyType: "Apartment",
    bedrooms: 4,
    bathrooms: 4,
    priceInr: 97_500_000,
    areaSqft: 3200,
    floor: "1st of 3",
    facing: "South-facing",
    possession: "Ready to move",
    description:
      "Four bedrooms on the first floor of three, south-facing. 3,200 sq ft in Vasant Vihar. Ready to move.",
    clip: "property-04",
    videoCaption: "Reception room",
    createdAt: new Date("2026-01-10T09:00:00.000Z"),
  },
  {
    id: "verge-006",
    slug: "lane-7-koregaon-park",
    name: "Lane 7, Fourth Floor",
    locality: "Koregaon Park",
    city: "Pune",
    propertyType: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    priceInr: 8_500_000,
    areaSqft: 620,
    floor: "4th of 4",
    facing: "North-facing",
    possession: "Ready to move",
    description:
      "One bedroom in Koregaon Park, top floor of four, north-facing. 620 sq ft. Ready to move.",
    clip: "property-09",
    videoCaption: "Bedroom",
    createdAt: new Date("2026-01-11T09:00:00.000Z"),
  },
  {
    id: "verge-007",
    slug: "baner-row-house-unit-9",
    name: "Baner Row House, Unit 9",
    locality: "Baner",
    city: "Pune",
    propertyType: "Row House",
    bedrooms: 3,
    bathrooms: 3,
    priceInr: 24_000_000,
    areaSqft: 1850,
    floor: null,
    facing: "West-facing",
    possession: "Ready to move",
    description:
      "A three-bedroom row house in Baner, west-facing, 1,850 sq ft over its own floors. Ready to move.",
    clip: "property-02",
    videoCaption: "Entrance hallway",
    createdAt: new Date("2026-01-12T09:00:00.000Z"),
  },
  {
    id: "verge-008",
    slug: "road-45-jubilee-hills",
    name: "Road No. 45, Jubilee Hills",
    locality: "Jubilee Hills",
    city: "Hyderabad",
    propertyType: "Villa",
    bedrooms: 5,
    bathrooms: 5,
    priceInr: 71_000_000,
    areaSqft: 4800,
    floor: null,
    facing: "East-facing",
    possession: "Ready to move",
    description:
      "A five-bedroom villa in Jubilee Hills, east-facing, 4,800 sq ft. Five bathrooms. Ready to move.",
    clip: "property-03",
    videoCaption: "Living room, marble detailing",
    createdAt: new Date("2026-01-13T09:00:00.000Z"),
  },
  {
    id: "verge-009",
    slug: "besant-avenue-adyar",
    name: "Besant Avenue, Third Floor",
    locality: "Adyar",
    city: "Chennai",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    priceInr: 19_000_000,
    areaSqft: 1340,
    floor: "3rd of 5",
    facing: "East-facing",
    possession: "March 2027",
    description:
      "Two bedrooms in Adyar, third of five floors, east-facing. 1,340 sq ft. Handover March 2027.",
    clip: "property-05",
    videoCaption: "Principal bedroom",
    createdAt: new Date("2026-01-14T09:00:00.000Z"),
  },
  {
    // Deliberate edge case: the longest name and locality in the set, to prove
    // the card and detail layouts hold without truncating into nonsense.
    id: "verge-010",
    slug: "coconut-grove-assagao-phase-two",
    name: "The Coconut Grove Residences at Assagao Heritage Estate, Phase Two",
    locality: "Assagao–Anjuna Village Panchayat Ward 4",
    city: "Goa",
    propertyType: "Villa",
    bedrooms: 4,
    bathrooms: 4,
    priceInr: 46_000_000,
    areaSqft: 2950,
    floor: null,
    facing: "West-facing",
    possession: "August 2026",
    description:
      "A four-bedroom villa in Assagao, west-facing, 2,950 sq ft. Handover August 2026.",
    clip: "property-07",
    videoCaption: "Bedroom, west-facing",
    createdAt: new Date("2026-01-15T09:00:00.000Z"),
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  // Clear first so the seed is idempotent rather than additive.
  // Enquiries go first because they reference properties.
  await prisma.enquiry.deleteMany();
  await prisma.property.deleteMany();

  for (const { clip, ...property } of properties) {
    // `clip` is a seed-only shorthand, not a column: it expands into the two
    // real fields below so the file names appear in exactly one place.
    await prisma.property.create({
      data: {
        ...property,
        videoUrl: `/videos/${clip}.mp4`,
        posterUrl: `/posters/${clip}.jpg`,
      },
    });
  }

  console.log(`Seeded ${properties.length} properties.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
