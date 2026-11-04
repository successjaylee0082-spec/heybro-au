import { NextRequest, NextResponse } from "next/server";
import { feedVenues } from "@/lib/feed";
import { isLocale, isSystemPath, stripLocalePath } from "@/lib/i18n";

function missingLocalePage() {
  return new NextResponse("Not found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (isSystemPath(path)) return NextResponse.next();
  const segment = path.split("/")[1];
  if (!isLocale(segment)) {
    if (/^[a-z]{2}$/i.test(segment)) return missingLocalePage();
    // Existing pages have relative redirects in next.config.ts, before middleware.
    // Unmatched unprefixed paths cannot choose or forge a locale request header.
    return missingLocalePage();
  }
  const clean = stripLocalePath(path);
  if (
    isSystemPath(clean) ||
    isLocale(clean.split("/")[1]) ||
    /%2f|%5c|\\|\/\//i.test(clean)
  )
    return missingLocalePage();
  // With no connected database, only existing demo slugs can resolve. Reject
  // missing slugs before React loading boundaries turn a later notFound into 200.
  // Configured live Supabase profiles continue through the existing server resolver.
  const databaseConfigured = Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
  if (
    clean.startsWith("/venue/") &&
    !databaseConfigured &&
    !feedVenues.some((venue) => venue.id === clean.split("/")[2])
  )
    return missingLocalePage();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-heybro-locale", segment);
  requestHeaders.set("x-heybro-page-path", clean);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(
    "Content-Language",
    segment === "zh" ? "zh-Hans" : "en-AU",
  );
  if (clean === "/admin" || clean.startsWith("/admin/") || clean === "/saved") {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}
export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next(?:/|$)|manus-storage(?:/|$)|.*\\.[^/]+$).*)",
  ],
};
