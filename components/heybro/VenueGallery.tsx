"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function VenueGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const gallery = images.length ? images : ["/images/lounge.jpg"];
  const [active, setActive] = useState(0);
  const current = gallery[Math.min(active, gallery.length - 1)];

  return (
    <div className="venue-gallery">
      <div className="venue-gallery-hero">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 900px) 100vw, 900px"
        />
        <div className="venue-gallery-fade" />
        <div className="venue-gallery-count">
          <ImageIcon className="h-3.5 w-3.5" />
          {active + 1} / {gallery.length}
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
              className="object-cover"
              sizes="120px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
