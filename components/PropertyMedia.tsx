"use client";

import { useEffect, useRef, useState } from "react";

type PropertyMediaProps = {
  videoUrl: string | null;
  posterUrl: string | null;
  /** Describes what the clip shows. Used as the video's accessible name. */
  caption: string;
};

// The only client component in the card. Everything else stays server-rendered.
//
// Three things this has to survive, all of which happen in reality:
//   1. Ten cards on screen — so nothing loads until it is near the viewport.
//   2. Autoplay refused — iOS low-power mode rejects play(). The poster has to
//      remain the visible state rather than a black rectangle.
//   3. prefers-reduced-motion — then the clip never plays at all, and the
//      poster is the whole experience.
export function PropertyMedia({
  videoUrl,
  posterUrl,
  caption,
}: PropertyMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !videoUrl) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // poster only, deliberately
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            // Rejected autoplay is an expected outcome, not an error: the
            // poster simply stays put.
            void element.play().catch(() => {});
          } else {
            element.pause();
          }
        }
      },
      // Start fetching slightly before the card is actually visible.
      { rootMargin: "200px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [videoUrl]);

  // Nothing to show but the caption — the state the styleguide exercises.
  if (!videoUrl && !posterUrl) {
    return (
      <div className="flex aspect-[9/16] w-full items-end bg-ink p-4">
        <p className="text-caption text-paper uppercase">{caption}</p>
      </div>
    );
  }

  if (!videoUrl && posterUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={posterUrl}
        alt={caption}
        loading="lazy"
        decoding="async"
        className="aspect-[9/16] w-full object-cover"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? (videoUrl ?? undefined) : undefined}
      poster={posterUrl ?? undefined}
      aria-label={caption}
      muted
      playsInline
      loop
      preload="none"
      tabIndex={-1}
      onCanPlay={(event) => void event.currentTarget.play().catch(() => {})}
      className="aspect-[9/16] w-full object-cover"
    >
      {caption}
    </video>
  );
}
