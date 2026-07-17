import {
  CalendarDays,
  ScanLine,
  LineChart,
  Calculator,
  type LucideIcon,
} from "lucide-react"

export type CommodityTrend = {
  id: string
  name: string
  unit: string
  price: number
  currency: string
  changePct: number
  source: string
  // last ~10 data points for the sparkline
  history: { label: string; value: number }[]
}

// Category-header rows from the PIHPS Nasional pasar tradisional table (the
// "No" column is a Roman numeral for these, an Arabic number for sub-variants).
export const FEATURED_COMMODITIES = ["Beras", "Cabai Merah", "Bawang Merah"]

export const MAX_SEARCH_RESULTS = 12

// The dashboard grid tops out at 3 across; past a couple of rows the prices
// section crowds out everything below it, and "View all" already covers the
// rest.
export const MAX_DASHBOARD_COMMODITIES = 6

export type PriceRow = { commodity: string; date: string; price: number }

// Number of points in a sparkline — one per week, so the card's "last 10 weeks"
// is literally true.
const TREND_POINTS = 10

/**
 * PIHPS reports daily, and these prices barely move day to day — beras sat at
 * exactly Rp 14,200 for twelve consecutive days in Jawa Tengah. Ten daily
 * points would draw a flat line and a permanent 0% change, so bucket to one
 * point per week and keep the newest reading in each.
 */
function toWeekly(rows: PriceRow[]): PriceRow[] {
  const byWeek = new Map<number, PriceRow>()

  for (const row of rows) {
    const timestamp = Date.parse(row.date)
    if (Number.isNaN(timestamp)) continue
    const week = Math.floor(timestamp / (7 * 24 * 60 * 60 * 1000))
    // Rows arrive date-ascending, so the last write per bucket is that week's
    // most recent price.
    byWeek.set(week, row)
  }

  return [...byWeek.entries()].sort(([a], [b]) => a - b).map(([, row]) => row)
}

export function groupIntoTrends(rows: PriceRow[], names: string[]): CommodityTrend[] {
  return names.map((name) => {
    const commodityRows = toWeekly(rows.filter((row) => row.commodity === name)).slice(
      -TREND_POINTS,
    )
    const history = commodityRows.map((row) => ({ label: row.date, value: row.price }))
    const latest = commodityRows.at(-1)
    const windowStart = commodityRows[0]
    const changePct =
      latest && windowStart
        ? ((latest.price - windowStart.price) / windowStart.price) * 100
        : 0

    return {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      unit: "per kg",
      price: latest?.price ?? 0,
      currency: "Rp",
      changePct: Math.round(changePct * 10) / 10,
      source: "PIHPS Nasional (Bank Indonesia)",
      history,
    }
  })
}

export type Feature = {
  id: string
  module: string
  name: string
  short: string
  description: string
  aggregates: string
  href: string
  icon: LucideIcon
  phase: "timeline" | "planning" | "deciding" | "growing"
  stage: string
  status?: "live" | "beta" | "soon"
}

export const features: Feature[] = [
  {
    id: "planting-calendar",
    module: "Module 1",
    name: "Planting Calendar",
    short: "Calendar",
    description:
      "Cross-references BMKG weather + nowcast alerts with your crop to recommend planting windows and harvest timing.",
    aggregates: "Weather data · BMKG",
    href: "/planting-calendar",
    icon: CalendarDays,
    phase: "deciding",
    stage: "Deciding when to plant",
    status: "live",
  },
  {
    id: "market-prices",
    module: "Module 3",
    name: "Market Price Board",
    short: "Prices",
    description:
      "Search national average traditional-market prices from PIHPS Nasional, see the last 10 weeks of movement, and pin the commodities you grow to your dashboard.",
    aggregates: "Pricing data · PIHPS Nasional",
    href: "/prices",
    icon: LineChart,
    phase: "planning",
    stage: "Before planting",
    status: "live",
  },
  {
    id: "dosage-calculator",
    module: "Module 4",
    name: "Dosage Calculator",
    short: "Dosage",
    description:
      "Turns the concentration on your pesticide label into how much goes in each sprayer tank, and how many tanks your plot needs.",
    aggregates: "Agronomic guidance",
    href: "/dosage-calculator",
    icon: Calculator,
    phase: "growing",
    stage: "During growing season",
    status: "live",
  },
  {
    id: "plant-health-scanner",
    module: "Module 2",
    name: "Plant Health Scanner",
    short: "Scan",
    description:
      "Photo-based pest & disease detection via image classification. Part of the full aggregator vision.",
    aggregates: "Diagnostic expertise",
    href: "/plant-health-scanner",
    icon: ScanLine,
    phase: "growing",
    stage: "During growing season",
    status: "soon",
  },
]
