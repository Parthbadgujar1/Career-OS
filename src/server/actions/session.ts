import { signOut } from "@/auth";

export async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}
