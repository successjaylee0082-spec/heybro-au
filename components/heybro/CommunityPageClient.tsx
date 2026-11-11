"use client";

import { ExternalLink } from "lucide-react";
import { RedditLogo } from "@/components/RedditLogo";
import { RedditShareButton } from "@/components/RedditShareButton";
import { useCopy } from "@/components/i18n/LocaleProvider";

const sources = [
  {
    city: "Sydney",
    subreddit: "sydney",
    href: "https://www.reddit.com/r/sydney/",
  },
  {
    city: "Melbourne",
    subreddit: "melbourne",
    href: "https://www.reddit.com/r/melbourne/",
  },
];

export function CommunityPageClient() {
  const { t } = useCopy();

  return (
    <div className="community-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <RedditLogo size={16} />
            REDDIT
          </div>
          <h1 style={{ fontSize: 32 }}>Community Discussions & Reddit Threads</h1>
          <p>{t("communityBody")}</p>
        </div>
        <RedditShareButton title="Community Discussions & Reddit Threads" />
      </div>

      <div className="demo-note">{t("unavailableCommunity")}</div>

      <div className="thread-list">
        {sources.map((source) => (
          <article key={source.subreddit} className="thread-card">
            <div className="thread-meta">
              <span>{source.city}</span>
              <span>r/{source.subreddit}</span>
            </div>
            <h3>{`Open r/${source.subreddit} for public discussions`}</h3>
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Reddit
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
