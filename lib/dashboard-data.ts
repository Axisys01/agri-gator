import {
  CalendarDays,
  ScanLine,
  LineChart,
  Calculator,
  GraduationCap,
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

// Category-header rows from the Bapanas Panel Harga Pangan table (the "No"
// column is a Roman numeral for these, an Arabic number for sub-variants).
export const FEATURED_COMMODITIES = ["Beras", "Cabai Merah", "Bawang Merah"]

export const MAX_SEARCH_RESULTS = 12

export type PriceRow = { commodity: string; date: string; price: number }

export function groupIntoTrends(rows: PriceRow[], names: string[]): CommodityTrend[] {
  return names.map((name) => {
    const commodityRows = rows.filter((row) => row.commodity === name).slice(-10)
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
      source: "Bapanas Panel Harga",
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
      "Live fair-market commodity prices pulled from PIHPS Nasional and Bapanas so you never sell blind to middlemen.",
    aggregates: "Pricing data · PIHPS / Bapanas",
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
    id: "learning-hub",
    module: "Module 5",
    name: "Learning Hub",
    short: "Learn",
    description:
      "Official Kementan Cybex & government videos curated into one categorized library for young and new farmers.",
    aggregates: "Government education content",
    href: "/learning-hub",
    icon: GraduationCap,
    phase: "planning",
    stage: "Before planting",
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
