import "client-only"
import { createClient } from "@/lib/supabase/client"
import { NATIONAL_PROVINCE, PRICE_TYPES, type PriceTypeKey } from "@/lib/pihps"
import {
  MAX_SEARCH_RESULTS,
  groupIntoTrends,
  type CommodityTrend,
  type PriceRow,
} from "@/lib/dashboard-data"

export interface PriceSearchResult {
  commodities: CommodityTrend[]
  /** The province asked for — individual commodities may still be national. */
  province: string
  /** Commodities with no local figure, shown at the national average instead. */
  nationalFallbacks: string[]
}

async function fetchRows(query: string, province: string, priceType: string): Promise<PriceRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commodity_prices")
    .select("commodity, date, price")
    // Without both filters each commodity returns a row per province per price
    // type for every date, and the trend blends them into nonsense.
    .eq("province", province)
    .eq("price_type", priceType)
    .ilike("commodity", `%${query}%`)
    .order("date", { ascending: true })

  if (error || !data) {
    console.error("Failed to search commodity prices:", error)
    return []
  }

  return data as PriceRow[]
}

export async function searchCommodityPrices(
  query: string,
  options: { province?: string; priceType?: PriceTypeKey } = {},
): Promise<PriceSearchResult> {
  const requested = options.province ?? NATIONAL_PROVINCE
  const priceTypeLabel = PRICE_TYPES[options.priceType ?? "produsen"]

  // Per commodity, not all-or-nothing — same reasoning as the dashboard. A
  // search for "b" matches beras (grown in Kalimantan Tengah) and bawang (not),
  // so checking rows.length === 0 never fires and the national-only matches
  // vanish from the results entirely rather than falling back.
  const [localRows, nationalRows] = await Promise.all([
    fetchRows(query, requested, priceTypeLabel),
    requested === NATIONAL_PROVINCE
      ? Promise.resolve([] as PriceRow[])
      : fetchRows(query, NATIONAL_PROVINCE, priceTypeLabel),
  ])

  const localNames = new Set(localRows.map((row) => row.commodity))
  const fallbackRows = nationalRows.filter((row) => !localNames.has(row.commodity))
  const rows = [...localRows, ...fallbackRows]

  const names = [...new Set(rows.map((row) => row.commodity))].slice(0, MAX_SEARCH_RESULTS)
  const fallbackNames = new Set(fallbackRows.map((row) => row.commodity))

  return {
    commodities: groupIntoTrends(rows, names),
    province: requested,
    // Only report fallbacks that survived the MAX_SEARCH_RESULTS cut, so the
    // badges line up with the cards actually on screen.
    nationalFallbacks: names.filter((name) => fallbackNames.has(name)),
  }
}
