import "server-only";

import { createClient } from "@/lib/supabase/server";

// RLS limits select to auth.uid() = user_id, so an unfiltered query already returns just
// this user's rows, same reasoning as getUserLocation.
export async function getUserCommodities(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_commodities")
    .select("commodity")
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Failed to load pinned commodities:", error);
    return [];
  }

  return data.map((row) => row.commodity as string);
}
