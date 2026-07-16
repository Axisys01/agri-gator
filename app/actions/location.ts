"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { USER_LOCATION_FIELDS } from "@/lib/user-location";
import type { LocationResult } from "@/lib/wilayah";

function parseLocation(input: unknown): LocationResult | null {
  if (typeof input !== "object" || input === null) return null;

  const record = input as Record<string, unknown>;
  const invalid = USER_LOCATION_FIELDS.some(
    (field) => typeof record[field] !== "string" || record[field] === "",
  );
  if (invalid) return null;

  return Object.fromEntries(
    USER_LOCATION_FIELDS.map((field) => [field, record[field]]),
  ) as unknown as LocationResult;
}

export async function saveUserLocation(input: unknown): Promise<{ error?: string }> {
  const location = parseLocation(input);
  if (!location) return { error: "Invalid location" };

  const supabase = await createClient();

  // Server Functions are POSTs to the calling route rather than routes of their
  // own, so proxy.ts auth can't be relied on here — verify the session
  // ourselves. user_id comes from that session and never from the caller, so a
  // client can't write a row onto someone else's account.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase.from("user_locations").upsert({
    user_id: user.id,
    ...location,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to save location:", error);
    return { error: "Could not save location" };
  }

  // The header renders the saved location on every page, so refresh the layout.
  revalidatePath("/", "layout");
  return {};
}
