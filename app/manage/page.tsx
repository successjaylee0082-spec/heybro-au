import { redirect } from "next/navigation";

/** Unprefixed `/manage` → English venue picker. */
export default function ManageRootRedirect() {
  redirect("/en/manage");
}
