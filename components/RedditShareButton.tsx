"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RedditLogo } from "@/components/RedditLogo";

function sanitizeShareUrl(href: string): string | null {
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    const path = url.pathname;
    if (
      path.startsWith("/api") ||
      path.includes("/admin") ||
      (!path.startsWith("/en") && !path.startsWith("/zh"))
    ) {
      return null;
    }
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function RedditShareButton({ title }: { title: string }) {
  const pathname = usePathname();
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    const current = sanitizeShareUrl(window.location.href);
    if (!current) {
      setHref(null);
      return;
    }
    setHref(
      `https://www.reddit.com/submit?url=${encodeURIComponent(current)}&title=${encodeURIComponent(title)}`,
    );
  }, [pathname, title]);

  if (!href) {
    return (
      <button type="button" className="reddit-share-button" disabled>
        <RedditLogo size={18} />
        Reddit
      </button>
    );
  }

  return (
    <a
      className="reddit-share-button"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <RedditLogo size={18} />
      Reddit
    </a>
  );
}
