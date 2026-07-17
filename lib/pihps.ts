// Shared vocabulary between the PIHPS importer (scripts/import-prices.mts) and
// the app. commodity_prices stores province and price_type exactly as PIHPS
// spells them, so these strings are the contract between the two.

export const NATIONAL_PROVINCE = "Nasional";

export const PRICE_TYPES = {
  // What a farmer is actually paid at the farm gate — the number worth holding
  // against a buyer's offer, and so the app's default.
  produsen: "Produsen",
  // What shoppers pay at the pasar. The gap between the two is roughly the
  // margin taken between the field and the market stall.
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

// user_locations.provinsi comes from the Permendagri wilayah dataset, which
// spells provinces in caps ("JAWA TENGAH") where PIHPS uses title case ("Jawa
// Tengah"). 33 of the 34 line up on case alone; Yogyakarta is the sole
// exception and needs an explicit alias, or every Yogya farmer would quietly
// fall back to national prices with nothing to indicate why.
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
