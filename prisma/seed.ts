import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../lib/generated/prisma/client";
import type { PropertyType, City } from "../lib/property-options";

// Plain `dotenv/config` only reads `.env`. The database secret lives in
// `.env.local` instead, so it's loaded explicitly, same as in prisma.config.ts.
config({ path: ".env.local" });

// Everything below is fixed: no random ids, no `new Date()`, no shuffling.
// Running the seed twice produces a byte-identical database, which is what
// makes "reset and reseed" a safe thing to tell someone to run.

type ShotListEntry = { time: string; label: string };

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
  shotList: ShotListEntry[];
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
      "Open on three sides, with the sea visible from the west elevation. 2,180 sq ft carpet. IPS-finished concrete floors, full-height glazing along the living room. Built 2019. Eight minutes to Bandra station on foot. Two covered parking bays.",
    shotList: [
      { time: "0:00", label: "Entrance and hallway" },
      { time: "0:09", label: "Living and dining, west glazing" },
      { time: "0:19", label: "Kitchen" },
      { time: "0:27", label: "Principal bedroom" },
    ],
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
      "A duplex across the top two floors. 5,400 sq ft with a 900 sq ft private terrace facing the sea link. Italian marble on the lower level, teak above. Four covered bays and a service lift landing inside the unit.",
    shotList: [
      { time: "0:00", label: "Entrance, lower level" },
      { time: "0:10", label: "Living room, Italian marble" },
      { time: "0:20", label: "Staircase to upper level" },
      { time: "0:29", label: "Terrace, sea link view" },
    ],
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
      "1,120 sq ft in a 1998 building, stripped and retrofitted in 2021. Rewired, replumbed, original mosaic floors kept and polished. Corner unit with cross-ventilation on two sides. 400 m from the metro. One parking bay.",
    shotList: [
      { time: "0:00", label: "Entrance" },
      { time: "0:08", label: "Living room, corner windows" },
      { time: "0:17", label: "Kitchen" },
      { time: "0:25", label: "Principal bedroom" },
    ],
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
      "3,600 sq ft built on a 6,000 sq ft plot. Four bedrooms, all en suite, three facing the rear garden. Kota stone on the ground floor, oak above. Borewell plus a Cauvery connection. Built 2011, roof waterproofed 2023.",
    shotList: [
      { time: "0:00", label: "Approach and porch" },
      { time: "0:09", label: "Living room, Kota stone" },
      { time: "0:19", label: "Kitchen" },
      { time: "0:28", label: "Garden-facing bedroom" },
    ],
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
      "First-floor builder unit of 3,200 sq ft with an independent entrance and 1,100 sq ft of terrace rights. South-facing. Servant quarter with a separate stair. Freehold title. Two covered parking spaces.",
    shotList: [
      { time: "0:00", label: "Independent entrance" },
      { time: "0:10", label: "Living room" },
      { time: "0:20", label: "Kitchen" },
      { time: "0:29", label: "Terrace" },
    ],
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
      "620 sq ft, one bedroom, on the top floor. Single-loaded corridor, so the whole unit takes north light. 1994 shell with interiors redone in 2022. No lift. Ten minutes on foot to Bund Garden Road.",
    shotList: [
      { time: "0:00", label: "Entrance" },
      { time: "0:07", label: "Living room, north light" },
      { time: "0:15", label: "Kitchen, galley layout" },
      { time: "0:22", label: "Bedroom" },
    ],
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
      "1,850 sq ft over three levels with a 300 sq ft rear court. End unit, so one long wall stays open. Concrete frame, completed 2016. Gated lane of eleven houses. Two parking bays in the forecourt.",
    shotList: [
      { time: "0:00", label: "Ground floor, entrance" },
      { time: "0:09", label: "Living room" },
      { time: "0:18", label: "Rear court" },
      { time: "0:27", label: "Bedroom, second level" },
    ],
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
      "4,800 sq ft on a 9,000 sq ft plot, built 2008 and taken back to the frame in 2022. Five bedrooms, two of them on the ground floor. Granite plinth, lime-plastered walls. Mature rain trees along the north boundary.",
    shotList: [
      { time: "0:00", label: "Approach, garden" },
      { time: "0:10", label: "Dining room" },
      { time: "0:20", label: "Kitchen" },
      { time: "0:30", label: "Principal bedroom, ground floor" },
    ],
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
      "1,340 sq ft, east-facing, 1.2 km from Elliot's Beach. The Madras terrace roof over the living room was retained in the 2019 refit. Ceiling height 11 ft. Covered parking for one car and two two-wheelers.",
    shotList: [
      { time: "0:00", label: "Entrance" },
      { time: "0:09", label: "Living room, Madras terrace roof" },
      { time: "0:18", label: "Kitchen" },
      { time: "0:26", label: "Principal bedroom, east-facing" },
    ],
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
      "2,950 sq ft on a 12,000 sq ft plot holding 31 existing coconut palms. Laterite walls and a Mangalore tile roof, restored in 2021 to the original 1962 footprint. Well water with a municipal backup. 4 km to Anjuna, 9 km to Mapusa.",
    shotList: [
      { time: "0:00", label: "Approach, coconut grove" },
      { time: "0:11", label: "Living room, laterite walls" },
      { time: "0:22", label: "Kitchen" },
      { time: "0:32", label: "Bedroom, Mangalore tile roof" },
    ],
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

  for (const property of properties) {
    await prisma.property.create({
      data: {
        ...property,
        shotList: property.shotList as unknown as Prisma.InputJsonValue,
        videoUrl: `/videos/${property.slug}.mp4`,
        posterUrl: `/posters/${property.slug}.jpg`,
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
