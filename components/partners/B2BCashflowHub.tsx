"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Megaphone,
  MessageCircle,
  Send,
  Sparkles,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VIP_MONTHLY_PRICE } from "@/lib/listing-tier";
import { buildWhatsAppHref } from "@/lib/booking-links";

const PARTNER_WHATSAPP =
  process.env.NEXT_PUBLIC_PARTNER_WHATSAPP || "61400000000";
const PARTNER_TELEGRAM =
  process.env.NEXT_PUBLIC_PARTNER_TELEGRAM || "heybro_partners";

type ChannelId = "vip" | "retail" | "partnership";

const CHANNELS: Array<{
  id: ChannelId;
  eyebrow: string;
  title: string;
  body: string;
  price: string;
  bullets: string[];
  icon: typeof Building2;
  cta: string;
}> = [
  {
    id: "vip",
    eyebrow: "Venue Management",
    title: `Managed VIP Upgrade · ${VIP_MONTHLY_PRICE}`,
    body: "Pin your venue above free listings with neon VIP chrome, verified elite badge, live roster, and unlocked WhatsApp / WeChat / Call CTAs.",
    price: VIP_MONTHLY_PRICE,
    bullets: [
      "Priority placement above Free listings",
      "VERIFIED ELITE / MANAGED VIP badge",
      "Direct WhatsApp + WeChat QR messaging",
      "OP hook banners + highlight widgets",
    ],
    icon: BadgeCheck,
    cta: "Apply for Managed VIP",
  },
  {
    id: "retail",
    eyebrow: "Adult Retail & Sex Shops",
    title: "Display Ads & Sponsorship Listings",
    body: "Put your boutique or adult retail brand in front of high-intent nightlife traffic with sponsored cards and category takeovers.",
    price: "From $120/wk",
    bullets: [
      "Homepage & category sponsorship slots",
      "Geo-targeted Sydney / Melbourne packs",
      "Tracked enquiry links for staff",
      "Optional WeChat / Alipay landing blocks",
    ],
    icon: Store,
    cta: "Book retail sponsorship",
  },
  {
    id: "partnership",
    eyebrow: "Commercial Partnerships",
    title: "Bespoke Banners & Sponsored Articles",
    body: "Run campaign takeovers, partner features, and direct business inquiries with a dedicated account path for agencies and venues.",
    price: "Custom retainer",
    bullets: [
      "Hero / sidebar banner inventory",
      "Sponsored partner features",
      "Co-branded campaign landers",
      "Direct Telegram + WhatsApp sales desk",
    ],
    icon: Megaphone,
    cta: "Talk to partnerships",
  },
];

function buildLeadMessage(options: {
  channel: ChannelId;
  name: string;
  business: string;
  contact: string;
  note: string;
}) {
  return [
    `Hey Bro B2B lead · ${options.channel.toUpperCase()}`,
    `Name: ${options.name || "—"}`,
    `Business: ${options.business || "—"}`,
    `Contact: ${options.contact || "—"}`,
    options.note ? `Note: ${options.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function B2BCashflowHub({ locale }: { locale: "en" | "zh" }) {
  const [active, setActive] = useState<ChannelId>("vip");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [sentHint, setSentHint] = useState<string | null>(null);

  const channel = useMemo(
    () => CHANNELS.find((item) => item.id === active) || CHANNELS[0],
    [active],
  );

  const whatsappHref = buildWhatsAppHref(
    PARTNER_WHATSAPP,
    buildLeadMessage({ channel: active, name, business, contact, note }),
  );
  const telegramHref = `https://t.me/${PARTNER_TELEGRAM.replace(/^@/, "")}`;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = buildLeadMessage({
      channel: active,
      name,
      business,
      contact,
      note,
    });
    if (whatsappHref) {
      window.open(whatsappHref, "_blank", "noopener,noreferrer");
      setSentHint(
        locale === "zh"
          ? "已打开 WhatsApp 销售对话。"
          : "Opened WhatsApp sales chat with your lead details.",
      );
      return;
    }
    window.open(
      `${telegramHref}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSentHint(
      locale === "zh"
        ? "已打开 Telegram 合作咨询。"
        : "Opened Telegram partner desk with your lead details.",
    );
  }

  return (
    <div className="b2b-hub" data-hub="cashflow">
      <section className="b2b-hero">
        <div className="eyebrow">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          {locale === "zh" ? "B2B 变现中心" : "B2B & Partner Solutions"}
        </div>
        <h1>
          {locale === "zh"
            ? "把目录流量变成持续现金流水"
            : "Turn directory traffic into recurring cashflow"}
        </h1>
        <p>
          {locale === "zh"
            ? `托管 VIP（${VIP_MONTHLY_PRICE}）、成人零售赞助与品牌合作——直接对接销售渠道。`
            : `Managed VIP upgrades (${VIP_MONTHLY_PRICE}), adult retail sponsorships, and bespoke partnerships — with direct sales CTAs.`}
        </p>
        <div className="b2b-hero-pills">
          <span>
            <Sparkles className="h-3.5 w-3.5" />
            VIP ranking boost
          </span>
          <span>
            <Store className="h-3.5 w-3.5" />
            Retail display ads
          </span>
          <span>
            <Megaphone className="h-3.5 w-3.5" />
            Sponsored features
          </span>
        </div>
      </section>

      <div className="b2b-grid">
        {CHANNELS.map((item) => {
          const Icon = item.icon;
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              id={item.id === "vip" ? "vip-upgrade" : undefined}
              className={selected ? "b2b-card is-active" : "b2b-card"}
              onClick={() => setActive(item.id)}
            >
              <div className="b2b-card-kicker">
                <Icon className="h-4 w-4" />
                {item.eyebrow}
              </div>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              <strong className="b2b-price">{item.price}</strong>
              <ul>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <section className="b2b-lead" aria-label="Partner lead capture">
        <div>
          <div className="eyebrow">Lead desk</div>
          <h2>{channel.cta}</h2>
          <p>
            {locale === "zh"
              ? "留下联系方式，我们会通过 WhatsApp 或 Telegram 跟进。"
              : "Share your details — we’ll follow up on WhatsApp or Telegram."}
          </p>
          <div className="b2b-direct-ctas">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="b2b-direct whatsapp"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp sales
              </a>
            ) : null}
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="b2b-direct telegram"
            >
              <Send className="h-4 w-4" />
              Telegram @{PARTNER_TELEGRAM.replace(/^@/, "")}
            </a>
          </div>
        </div>
        <form className="b2b-form" onSubmit={onSubmit}>
          <label>
            <span>{locale === "zh" ? "联系人" : "Your name"}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex"
              required
            />
          </label>
          <label>
            <span>{locale === "zh" ? "场所 / 品牌" : "Venue or brand"}</span>
            <input
              value={business}
              onChange={(event) => setBusiness(event.target.value)}
              placeholder="Sydney CBD boutique"
              required
            />
          </label>
          <label>
            <span>WhatsApp / WeChat / Email</span>
            <input
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="+61… / WeChat ID / email"
              required
            />
          </label>
          <label>
            <span>{locale === "zh" ? "需求备注" : "What do you need?"}</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                locale === "zh"
                  ? "例如：开通 Managed VIP、零售赞助档期…"
                  : "e.g. Managed VIP upgrade, retail ad flight…"
              }
              rows={3}
            />
          </label>
          <Button type="submit" className="b2b-submit">
            <Send className="h-4 w-4" />
            {channel.cta}
          </Button>
          {sentHint ? <p className="b2b-sent">{sentHint}</p> : null}
        </form>
      </section>
    </div>
  );
}
