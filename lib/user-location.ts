import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { LocationResult } from "@/lib/wilayah";

export const USER_LOCATION_FIELDS = [
  "adm4",
  "label",
  "desa",
  "kecamatan",
  "kotkab",
  "provinsi",
] as const;

// RLS limits SELECT to auth.uid() = user_id, so an unfiltered select already returns just this
// user's row with no extra lookup; cache() dedupes it since the header and alert lookups both
// need that same one row per render.
export const getUserLocation = cache(async (): Promise<LocationResult | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_locations")
    .select(USER_LOCATION_FIELDS.join(", "))
    .maybeSingle<LocationResult>();

  if (error) {
    console.error("Failed to load saved location:", error);
    return null;
  }

  return data;
});
