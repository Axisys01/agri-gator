import "server-only"
import { createClient } from "@/lib/supabase/server"
import { NATIONAL_PROVINCE, PRICE_TYPES, type PriceTypeKey } from "@/lib/pihps"
import {
  FEATURED_COMMODITIES,
  MAX_DASHBOARD_COMMODITIES,
  groupIntoTrends,
  type CommodityTrend,
  type PriceRow,
} from "@/lib/dashboard-data"

export interface PriceBoard {
  commodities: CommodityTrend[]
  /** The province asked for — individual commodities may still be national. */
  province: string
  priceTypeLabel: string
  /** Commodities with no local figure, shown at the national average instead. */
  nationalFallbacks: string[]
}

async function fetchRows(
  names: string[],
  province: string,
  priceType: string,
): Promise<PriceRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("commodity_prices")
    .select("commodity, date, price")
    // Without both filters every commodity carries a row per province per price
    // type for each date, and groupIntoTrends would blend Aceh, Papua and the
    // national average into one meaningless line.
    .eq("province", province)
    .eq("price_type", priceType)
    .in("commodity", names)
    .order("date", { ascending: true })

  if (error || !data) {
    console.error("Failed to load commodity prices:", error)
    return []
  }

  return data as PriceRow[]
}

export async function getCommodityPrices(
  pinned: string[] = [],
  options: { province?: string; priceType?: PriceTypeKey } = {},
): Promise<PriceBoard> {
  const requested = options.province ?? NATIONAL_PROVINCE
  const priceTypeLabel = PRICE_TYPES[options.priceType ?? "produsen"]
  const names =
    pinned.length > 0 ? pinned.slice(0, MAX_DASHBOARD_COMMODITIES) : FEATURED_COMMODITIES

  let rows = await fetchRows(names, requested, priceTypeLabel)
  let nationalFallbacks: string[] = []

  // A province only reports what it actually grows: Kalimantan Tengah has no
  // shallot farms, so Bawang Merah has no producer price there at all.
  //
  // This has to be per commodity, not all-or-nothing. Checking rows.length === 0
  // never fires when *some* of the pinned commodities have local data — the
  // uncovered ones just fall through to `latest?.price ?? 0` and render as
  // Rp 0, which reads as "worthless" rather than "not grown here".
  if (requested !== NATIONAL_PROVINCE) {
    const covered = new Set(rows.map((row) => row.commodity))
    const missing = names.filter((name) => !covered.has(name))

    if (missing.length > 0) {
      const nationalRows = await fetchRows(missing, NATIONAL_PROVINCE, priceTypeLabel)
      if (nationalRows.length > 0) {
        rows = [...rows, ...nationalRows]
        nationalFallbacks = [...new Set(nationalRows.map((row) => row.commodity))]
      }
    }
  }

  return {
    commodities: groupIntoTrends(rows, names),
    province: requested,
    priceTypeLabel,
    nationalFallbacks,
  }
}
