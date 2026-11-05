import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "brothels.com.au" },
      { protocol: "https", hostname: "*.brothels.com.au" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  poweredByHeader: false,
  async redirects() {
    // Next config supports relative destinations; middleware response constructors
    // require absolute redirect URLs, which are unsafe to infer from a proxy Host.
    return [
      { source: "/", destination: "/en", permanent: true },
      { source: "/saved", destination: "/en/saved", permanent: true },
      { source: "/blog", destination: "/en/partners", permanent: true },
      { source: "/blog/:slug", destination: "/en/partners", permanent: true },
      { source: "/partners", destination: "/en/partners", permanent: true },
      { source: "/community", destination: "/en/community", permanent: true },
      {
        source: "/venue/:slug",
        destination: "/en/venue/:slug",
        permanent: true,
      },
      {
        source: "/admin/:path*",
        destination: "/en/admin/:path*",
        permanent: true,
      },
      {
        source:
          "/:city(sydney|melbourne|brisbane|perth|gold-coast|adelaide)/:suburb/:category",
        destination: "/en/:city/:suburb/:category",
        permanent: true,
      },
    ].map((redirect) => ({
      ...redirect,
      // The trusted middleware request header marks an already-localized rewrite.
      missing: [{ type: "header" as const, key: "x-heybro-locale" }],
    }));
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
      {
        key: "Permissions-Policy",
        value:
          "geolocation=(self), camera=(), microphone=(), payment=(), usb=()",
      },
      // A compatible baseline, not a strict nonce-based script policy. Next hydration
      // and platform-injected inline/CDN scripts must keep working in embedded Preview.
      {
        key: "Content-Security-Policy",
        value: "base-uri 'self'; object-src 'none'; form-action 'self' https:",
      },
    ];
    const privateHeaders = [
      { key: "Cache-Control", value: "private, no-store, max-age=0" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    const communityHeaders = [
      { key: "Cache-Control", value: "private, no-store, max-age=0" },
      { key: "X-Robots-Tag", value: "noindex, follow" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: privateHeaders },
      { source: "/en/admin/:path*", headers: privateHeaders },
      { source: "/zh/admin/:path*", headers: privateHeaders },
      { source: "/api/admin/:path*", headers: privateHeaders },
      { source: "/en/community", headers: communityHeaders },
      { source: "/zh/community", headers: communityHeaders },
    ];
  },
};
export default nextConfig;
