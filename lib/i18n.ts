import type { Locale } from "@/types";

export const LOCALES: Locale[] = ["en", "zh"];

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "zh";
}

export function stripLocalePath(pathname: string): string {
  const parts = pathname.split("/");
  if (parts.length > 1 && isLocale(parts[1])) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

export function withLocale(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function isSystemPath(path: string): boolean {
  return (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/manus-storage") ||
    path === "/manifest.webmanifest" ||
    path === "/manifest.json" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path === "/sw.js" ||
    /\.[a-z0-9]+$/i.test(path)
  );
}

export function swapLocalePath(pathname: string, locale: Locale): string {
  const clean = stripLocalePath(pathname);
  return withLocale(locale, clean);
}

export const copy = {
  en: {
    brandTagline: "Premier Adult Nightlife Directory",
    heroEyebrow: "HEY BRO · AFTER DARK",
    heroTitleBefore: "Sydney & Melbourne's Premier",
    heroTitleAccent: "Adult Directory",
    heroDescription:
      "Real-time lineups, discreet venues and direct booking across Australia — built for guests who want clarity before they call.",
    searchPlaceholder: "Search venues, suburbs or ladies",
    explore: "Explore",
    communityTitle: "Community discussions",
    communityBody:
      "See what people are talking about in Sydney and Melbourne nightlife threads on Reddit.",
    communityCta: "Open community room",
    sydneyTag: "r/sydney",
    melbourneTag: "r/melbourne",
    nearby: "Near Me",
    saved: "Saved",
    map: "Map",
    list: "Explore",
    community: "Community",
    blog: "Journal",
    confirmAge: "Welcome to Hey Bro. Are you 18 years or older?",
    yes18: "Yes, I am 18+",
    exit: "Exit",
    ageNote: "This is a self-declaration for nightlife content. No ID is collected.",
    results: "Featured venues",
    resultsHint: "Live venue inventory from Supabase when connected.",
    emptyTitle: "No venues match",
    emptyBody: "Try another city, category or search term.",
    businessTitle: "List your venue on Hey Bro",
    businessBody:
      "Directory registration opens later. This preview keeps existing public paths and brand copy only.",
    footerSafety: "Stay safe online",
    joinReddit: "Join the discussion on Reddit",
    demoBadge: "DEMO",
    verified: "Bro Verified",
    call: "Quick Call",
    transit: "Transit",
    walking: "Walking",
    save: "Save",
    savedToast: "Saved locally on this device",
    removedToast: "Removed from saved places",
    backHome: "Back to explore",
    language: "中文",
    unavailableCommunity:
      "Reddit feed access is unavailable from this host. Open the community page for source links.",
  },
  zh: {
    brandTagline: "高端成人夜生活目录",
    heroEyebrow: "HEY BRO · 夜色专属",
    heroTitleBefore: "悉尼与墨尔本首选",
    heroTitleAccent: "成人目录",
    heroDescription:
      "实时出勤、私密场所与直聊预约——在拨打电话前先看清今天的阵容。",
    searchPlaceholder: "搜索场所、郊区或小姐",
    explore: "探索",
    communityTitle: "社区讨论",
    communityBody: "看看悉尼与墨尔本 Reddit 夜生活讨论在聊什么。",
    communityCta: "进入社区讨论",
    sydneyTag: "r/sydney",
    melbourneTag: "r/melbourne",
    nearby: "附近",
    saved: "收藏",
    map: "地图",
    list: "探索",
    community: "社区",
    blog: "专栏",
    confirmAge: "欢迎来到 Hey Bro。您是否已年满18岁？",
    yes18: "是的，我已满18岁",
    exit: "离开",
    ageNote: "这是夜生活内容的自我声明，不会收集身份证件。",
    results: "精选场所",
    resultsHint: "已连接时显示来自 Supabase 的实时场所数据。",
    emptyTitle: "没有匹配的场所",
    emptyBody: "请尝试其他城市、分类或搜索词。",
    businessTitle: "在 Hey Bro 上架您的场所",
    businessBody: "注册功能稍后开放。本预览仅保留公开路径与品牌文案。",
    footerSafety: "注意网络安全",
    joinReddit: "在Reddit上参与讨论",
    demoBadge: "演示",
    verified: "Bro 认证",
    call: "一键拨号",
    transit: "公交",
    walking: "步行",
    save: "收藏",
    savedToast: "已保存在本设备",
    removedToast: "已从收藏移除",
    backHome: "返回探索",
    language: "EN",
    unavailableCommunity:
      "当前主机无法访问 Reddit 动态。请打开社区页查看来源链接。",
  },
} as const;

export type CopyKey = keyof typeof copy.en;

export function t(locale: Locale, key: CopyKey): string {
  return copy[locale][key];
}
