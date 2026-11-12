import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Unprefixed owner entry — mirrors `/venue/:slug` → `/en/venue/:slug`.
 * Canonical UI lives at `app/[locale]/manage/[venueId]/page.tsx`.
 */
export default async function ManageVenueRedirectPage({
  params,
}: {
  params: Promise<{ venueId: string }>;
}) {
  const { venueId } = await params;
  redirect(`/en/manage/${encodeURIComponent(venueId)}`);
}
