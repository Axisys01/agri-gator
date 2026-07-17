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

// user_locations holds one row per user (user_id is the primary key) and RLS
// limits SELECT to auth.uid() = user_id, so an unfiltered select returns just
// this user's row — no need to resolve the user id first, which keeps the
// header off the extra Supabase Auth round trip it already avoids.
//
// cache() dedupes this within a single render: the header wants it for the
// location picker, and the alert lookups want it too, but that's one row and
// should be one query.
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
