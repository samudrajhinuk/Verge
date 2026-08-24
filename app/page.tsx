import type { Metadata } from "next";

import { Hero } from "@/components/Hero";
import { Proof } from "@/components/Proof";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s — Verge" template — this title
  // is already complete and shouldn't get a second " — Verge" appended.
  title: { absolute: "Verge — Property, on video" },
  description:
    "Ten residential developments across four Indian cities, each presented on a single vertical video.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Proof />
    </>
  );
}
