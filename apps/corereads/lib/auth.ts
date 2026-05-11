import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "corereads_admin";

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE_NAME)?.value;
  return value === "1";
}
