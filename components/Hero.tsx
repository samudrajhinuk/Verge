"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// Client Component for one reason only: prefers-reduced-motion has to be
// checked before deciding whether to call play(), and that check only exists
// in the browser. Nothing else here needs JavaScript — same boundary as
// PropertyMedia on the listing cards.
export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // stays on the poster — the held moment, not the crossing.
    }
    void video.play().catch(() => {});
  }, []);

  return (
    <section className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden bg-ink">
      {/* No autoplay attribute — see the effect above. The poster still makes
          the page look complete immediately, and stays put if the clip never
          loads or motion is reduced. Black and white by intent: brand
          surfaces are monochrome, property footage is in colour. */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        poster="/posters/hero.jpg"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Scrim: ink at up to 65% opacity, strongest where the text sits and
          fading to nothing by the upper two-thirds of the frame. Measured
          against the lower-left region of the brightest sampled frame
          (t=0, the poster itself): 65% ink over that region composites to
          #202020, which is 12.5:1 against paper text — well past the 4.5:1
          minimum for the button's caption-sized text, the strictest element
          in the block. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/35 via-40% to-transparent to-75%"
      />

      <div className="absolute inset-x-0 bottom-0 px-6 pb-16 md:px-12 md:pb-24">
        <div className="max-w-[34rem]">
          <p className="font-display text-sub text-paper md:text-sub-lg">Verge</p>
          <h1 className="mt-4 max-w-[18ch] font-display text-display text-paper md:text-display-lg">
            Ten residences. See the room before you stand in it.
          </h1>
          <p className="mt-10">
            <Link
              href="/properties"
              className="focus-ring inline-block border border-paper px-6 py-4 text-caption text-paper uppercase"
            >
              See the properties
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
