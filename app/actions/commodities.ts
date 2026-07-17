"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleUserCommodity(
  commodity: unknown,
  pinned: unknown,
): Promise<{ error?: string }> {
  if (typeof commodity !== "string" || commodity.trim() === "") {
    return { error: "Invalid commodity" };
  }
  if (typeof pinned !== "boolean") {
    return { error: "Invalid state" };
  }

  const supabase = await createClient();

  // Server Functions POST to the calling route, so proxy.ts auth doesn't apply here;
  // user_id comes from the session, not the caller, so nobody can pin another account.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = pinned
    ? await supabase
        .from("user_commodities")
        .upsert({ user_id: user.id, commodity })
    : await supabase
        .from("user_commodities")
        .delete()
        .eq("user_id", user.id)
        .eq("commodity", commodity);

  if (error) {
    console.error("Failed to toggle pinned commodity:", error);
    return { error: "Could not save" };
  }

  // The dashboard renders from this list, so it has to re-read after a change.
  revalidatePath("/home");
  return {};
}
