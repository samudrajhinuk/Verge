type VideoPlayerProps = {
  videoUrl: string;
  posterUrl: string;
  /** What the clip shows, e.g. "Dining area, natural light". */
  caption: string;
};

// A Server Component, deliberately. An earlier design had a shot list whose
// lines seeked the video, which would have required browser JavaScript and so
// a Client Component. With that cut, everything this needs — controls, poster,
// a caption — the plain HTML <video> element already does, so this page ships
// no JavaScript for its main feature.
//
// No autoplay here, unlike the cards: this clip is the thing the visitor came
// to watch, so starting it is their decision (CLAUDE.md 5.11 — autoplay on
// cards and hero, controls on the detail page).
export function VideoPlayer({ videoUrl, posterUrl, caption }: VideoPlayerProps) {
  return (
    <figure>
      {/* If the clip 404s or the codec is unsupported, the poster stays put
          and the caption below still says what the room is — the failure
          state is a described still, never a blank box. */}
      <video
        src={videoUrl}
        poster={posterUrl}
        aria-label={caption}
        controls
        muted
        playsInline
        preload="metadata"
        className="aspect-[9/16] w-full object-cover"
      >
        {caption}
      </video>
      <figcaption className="mt-4 text-meta text-muted">{caption}</figcaption>
    </figure>
  );
}
