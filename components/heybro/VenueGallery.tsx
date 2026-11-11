"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ImageIcon, Sparkles } from "lucide-react";

/**
 * Premium detail gallery — curated masked staff + lounge highlights only.
 * No lingerie stock banners or empty-room thumbnail rows.
 */
export function VenueGallery({
  images,
  alt,
  staffPreview,
}: {
  images: string[];
  alt: string;
  /** Optional staff portraits prepended for high-converting thumbs. */
  staffPreview?: string[];
}) {
  const gallery = useMemo(() => {
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const src of [...(staffPreview || []), ...images]) {
      const value = src?.trim();
      if (!value || seen.has(value)) continue;
      if (/banner|lingerie|underwear|\/images\/directory\//i.test(value)) continue;
      seen.add(value);
      merged.push(value);
    }
    return merged.length
      ? merged
      : ["/images/lounges/mood-01-velvet.jpg"];
  }, [images, staffPreview]);

  const [active, setActive] = useState(0);
  const current = gallery[Math.min(active, gallery.length - 1)];
  const isPortrait =
    /\/images\/staff\//i.test(current) || /portrait|masked/i.test(current);

  return (
    <div className="venue-gallery venue-gallery-premium" data-gallery="staff-lounge">
      <div
        className={
          isPortrait
            ? "venue-gallery-hero is-portrait relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10]"
            : "venue-gallery-hero is-lounge relative aspect-[16/10] w-full overflow-hidden"
        }
      >
        <Image
          src={current}
          alt={alt}
          fill
          priority
          quality={82}
          decoding="async"
          className={
            isPortrait
              ? "object-cover object-[center_18%]"
              : "object-cover object-center"
          }
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 1100px"
        />
        <div className="venue-gallery-fade" />
        <div className="venue-gallery-count">
          <ImageIcon className="h-3.5 w-3.5" />
          {active + 1} / {gallery.length}
        </div>
        <div className="venue-gallery-caption">
          <Sparkles className="h-3.5 w-3.5" />
          {isPortrait ? "Masked roster preview" : "Luxury lounge highlight"}
        </div>
      </div>
      <div className="venue-gallery-thumbs" role="list">
        {gallery.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            role="listitem"
            className={
              index === active
                ? "venue-gallery-thumb is-active"
                : "venue-gallery-thumb"
            }
            onClick={() => setActive(index)}
            aria-label={`Show photo ${index + 1}`}
          >
            <Image
              src={src}
              alt=""
              fill
              loading="lazy"
              decoding="async"
              quality={70}
              className="object-cover object-[center_20%]"
              sizes="(max-width: 640px) 22vw, 120px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
