import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="page-shell app-main" style={{ paddingTop: 48 }}>
      <p style={{ color: "#f43f5e", letterSpacing: "0.16em", fontSize: 12, fontWeight: 700 }}>
        HEY BRO
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: 36,
          margin: "12px 0",
        }}
      >
        Page not found
      </h1>
      <p style={{ color: "#92929c", maxWidth: 420, lineHeight: 1.6 }}>
        That route is not in the nightlife directory. Head back to explore
        Sydney, Melbourne and more.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/en" style={{ color: "#f43f5e", fontWeight: 600 }}>
          Back to Hey Bro
        </Link>
      </p>
    </main>
  );
}
