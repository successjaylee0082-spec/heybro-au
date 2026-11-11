import { redirect } from "next/navigation";

/**
 * Root `/` uses the localized shell (`ApplicationShell` + NavigationProvider)
 * so client hooks hydrate against the same provider tree as `/en`.
 * Directory-first landing lives at `app/[locale]/page.tsx`.
 */
export default function RootPage() {
  redirect("/en");
}
