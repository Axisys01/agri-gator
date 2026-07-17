// Shared vocabulary between the PIHPS importer (scripts/import-prices.mts) and the app:
// commodity_prices stores province and price_type exactly as PIHPS spells them.

export const NATIONAL_PROVINCE = "Nasional";

export const PRICE_TYPES = {
  // What a farmer is paid at the farm gate: the number worth holding against a buyer's offer, and the app's default.
  produsen: "Produsen",
  // What shoppers pay at the pasar; the gap between the two is roughly the margin between field and market stall.
  tradisional: "Pasar Tradisional",
} as const;

export type PriceTypeKey = keyof typeof PRICE_TYPES;

export function isPriceTypeKey(value: unknown): value is PriceTypeKey {
  return value === "produsen" || value === "tradisional";
}

// The 34 provinces PIHPS publishes (GetRefProvince).
const PIHPS_PROVINCES = [
  "Aceh",
  "Bali",
  "Banten",
  "Bengkulu",
  "DI Yogyakarta",
  "DKI Jakarta",
  "Gorontalo",
  "Jambi",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Kalimantan Barat",
  "Kalimantan Selatan",
  "Kalimantan Tengah",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Kepulauan Bangka Belitung",
  "Kepulauan Riau",
  "Lampung",
  "Maluku",
  "Maluku Utara",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Papua",
  "Papua Barat",
  "Riau",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tengah",
  "Sulawesi Tenggara",
  "Sulawesi Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Sumatera Utara",
] as const;

// user_locations spells provinces in caps ("JAWA TENGAH"), PIHPS in title case; only
// Yogyakarta needs an explicit alias, or its farmers would silently fall back to national prices.
const BY_UPPERCASE = new Map<string, string>(
  PIHPS_PROVINCES.map((name) => [name.toUpperCase(), name]),
);
BY_UPPERCASE.set("DAERAH ISTIMEWA YOGYAKARTA", "DI Yogyakarta");

/**
 * Maps a saved location's provinsi onto the province name PIHPS uses, falling
 * back to the national average when there's no location or no match.
 */
export function pihpsProvinceFor(provinsi: string | null | undefined): string {
  if (!provinsi) return NATIONAL_PROVINCE;
  return BY_UPPERCASE.get(provinsi.trim().toUpperCase()) ?? NATIONAL_PROVINCE;
}
