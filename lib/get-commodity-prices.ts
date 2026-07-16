import "server-only"
import { createClient } from "@/lib/supabase/server"
import { FEATURED_COMMODITIES, groupIntoTrends, type CommodityTrend } from "@/lib/dashboard-data"

export async function getCommodityPrices(): Promise<CommodityTrend[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("commodity_prices")
    .select("commodity, date, price")
    .in("commodity", FEATURED_COMMODITIES)
    .order("date", { ascending: true })

  if (error || !data) {
    console.error("Failed to load commodity prices:", error)
    return []
  }

  return groupIntoTrends(data, FEATURED_COMMODITIES)
}
