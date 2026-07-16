import "client-only"
import { createClient } from "@/lib/supabase/client"
import { MAX_SEARCH_RESULTS, groupIntoTrends, type CommodityTrend } from "@/lib/dashboard-data"

export async function searchCommodityPrices(query: string): Promise<CommodityTrend[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commodity_prices")
    .select("commodity, date, price")
    .ilike("commodity", `%${query}%`)
    .order("date", { ascending: true })

  if (error || !data) {
    console.error("Failed to search commodity prices:", error)
    return []
  }

  const names = [...new Set(data.map((row) => row.commodity))].slice(0, MAX_SEARCH_RESULTS)
  return groupIntoTrends(data, names)
}
