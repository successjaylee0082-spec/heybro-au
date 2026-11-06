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
import {
  BASIC_MONTHLY_PRICE,
  ENTERPRISE_MONTHLY_PRICE,
  VIP_MONTHLY_PRICE,
} from "@/lib/listing-tier";
import { buildWhatsAppHref } from "@/lib/booking-links";

const PARTNER_WHATSAPP =
  process.env.NEXT_PUBLIC_PARTNER_WHATSAPP || "61400000000";
const PARTNER_TELEGRAM =
  process.env.NEXT_PUBLIC_PARTNER_TELEGRAM || "heybro_partners";

type ChannelId = "basic" | "vip" | "enterprise";

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
    id: "basic",
    eyebrow: "Basic Listing",
    title: `Basic Directory Listing · ${BASIC_MONTHLY_PRICE}`,
    body: "Get your venue on the Sydney & Melbourne directory with a clean profile, maps link, and call-to-confirm discovery.",
    price: BASIC_MONTHLY_PRICE,
    bullets: [
      "Standard directory card & detail page",
      "City + category discovery filters",
      "Call venue CTA for patrons",
      "Upgrade path to Managed VIP Elite",
    ],
    icon: Store,
    cta: "Start with Basic",
  },
  {
    id: "vip",
    eyebrow: "Managed VIP Elite",
    title: `Managed VIP Elite · ${VIP_MONTHLY_PRICE}`,
    body: "Pin your venue above Basic listings with rose-gold elite chrome, verified badge, live roster, and unlocked WhatsApp / WeChat / Call CTAs.",
    price: VIP_MONTHLY_PRICE,
    bullets: [
      "Priority placement above Basic listings",
      "VERIFIED ELITE badge + Active Now status",
      "Direct WhatsApp + WeChat QR messaging",
      "Promo hooks + highlight widgets",
    ],
    icon: BadgeCheck,
    cta: "Apply for Managed VIP Elite",
  },
  {
    id: "enterprise",
    eyebrow: "Enterprise Ultimate",
    title: `Enterprise Ultimate · ${ENTERPRISE_MONTHLY_PRICE}`,
    body: "Top-of-feed placement with dedicated concierge support, multi-channel booking, and campaign-ready Ultimate branding for flagship venues.",
    price: ENTERPRISE_MONTHLY_PRICE,
    bullets: [
      "Top placement across Sydney & Melbourne",
      "ULTIMATE badge + dedicated concierge",
      "Multi-channel booking desk",
      "Campaign landers & partner features",
    ],
    icon: Megaphone,
    cta: "Talk to Enterprise sales",
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
  const [active, setActive] = useState<ChannelId>("basic");
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
            ? `基础 ${BASIC_MONTHLY_PRICE} · 托管 VIP Elite ${VIP_MONTHLY_PRICE} · 企业 Ultimate ${ENTERPRISE_MONTHLY_PRICE}——直接对接销售渠道。`
            : `Basic ${BASIC_MONTHLY_PRICE}, Managed VIP Elite ${VIP_MONTHLY_PRICE}, and Enterprise Ultimate ${ENTERPRISE_MONTHLY_PRICE} — with direct sales CTAs for Sydney & Melbourne venues.`}
        </p>
        <div className="b2b-hero-pills">
          <span>
            <Store className="h-3.5 w-3.5" />
            Basic {BASIC_MONTHLY_PRICE}
          </span>
          <span>
            <Sparkles className="h-3.5 w-3.5" />
            VIP Elite {VIP_MONTHLY_PRICE}
          </span>
          <span>
            <Megaphone className="h-3.5 w-3.5" />
            Ultimate {ENTERPRISE_MONTHLY_PRICE}
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
