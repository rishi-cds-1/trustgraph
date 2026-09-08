import { media } from "@/constants/media";
import { cn } from "@/lib/utils";

/**
 * Full-bleed, muted, looping hero background video. Decorative only
 * (aria-hidden, pointer-events-none) so it never traps focus or clicks — the
 * caller layers real content above it at a higher z-index. Autoplay works
 * because the video is muted + playsInline; a poster/scrim from the caller
 * keeps foreground text legible while it buffers.
 */
export function HeroVideoBackground({ className }: { className?: string }) {
  return (
    <video
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full object-cover",
        className,
      )}
      src={media.heroVideo}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}
