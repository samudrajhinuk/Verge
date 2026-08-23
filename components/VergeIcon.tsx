type VergeIconProps = {
  /** Rendered box in px. The mark is centred inside a square viewBox. */
  size?: number;
  className?: string;
};

// The supplied mark is a traced file of 91 paths (~36 KB). Inlining that into
// every page's HTML would cost 36 KB per request, so it stays a cached file and
// is drawn as a CSS mask filled with `currentColor`. That keeps the colour
// inheritance the brief asks for — the icon is whatever colour its parent text
// is — without the weight.
export function VergeIcon({ size = 20, className }: VergeIconProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        flex: "none",
        width: size,
        height: size,
        backgroundColor: "currentColor",
        maskImage: "url(/verge-icon.svg)",
        WebkitMaskImage: "url(/verge-icon.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
