import "server-only"
import { createClient } from "@/lib/supabase/server"
import {
  FEATURED_COMMODITIES,
  MAX_DASHBOARD_COMMODITIES,
  groupIntoTrends,
  type CommodityTrend,
} from "@/lib/dashboard-data"

// `pinned` is what the farmer hearted. Falling back to the stock list when it's
// empty keeps a new account's dashboard looking like it does today rather than
// blank.
export async function getCommodityPrices(pinned: string[] = []): Promise<CommodityTrend[]> {
  const names =
    pinned.length > 0 ? pinned.slice(0, MAX_DASHBOARD_COMMODITIES) : FEATURED_COMMODITIES

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("commodity_prices")
    .select("commodity, date, price")
    .in("commodity", names)
    .order("date", { ascending: true })

  if (error || !data) {
    console.error("Failed to load commodity prices:", error)
    return []
  }

  return groupIntoTrends(data, names)
}
