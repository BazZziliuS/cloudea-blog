import { cookies } from "next/headers";

export const PREVIEW_COOKIE = "preview_mode";

/** Whether the current request is in draft preview mode (see /api/preview). */
export async function isPreviewMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(PREVIEW_COOKIE)?.value === "true";
}
