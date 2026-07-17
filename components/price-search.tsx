"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { PriceCard } from "@/components/commodity-price-charts"
import { searchCommodityPrices } from "@/lib/search-commodity-prices"
import { PRICE_TYPES, type PriceTypeKey } from "@/lib/pihps"
import { type CommodityTrend } from "@/lib/dashboard-data"

type Status = "idle" | "loading" | "done"

const PRICE_TYPE_TABS: { key: PriceTypeKey; label: string; hint: string }[] = [
  { key: "produsen", label: "What I get", hint: "Produsen: the farm-gate price" },
  { key: "tradisional", label: "What it sells for", hint: "Pasar Tradisional: the market price" },
]

export function PriceSearch({ pinned, province }: { pinned: string[]; province: string }) {
  const [query, setQuery] = useState("")
  const [searchedTerm, setSearchedTerm] = useState("")
  const [results, setResults] = useState<CommodityTrend[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [priceType, setPriceType] = useState<PriceTypeKey>("produsen")
  const [shownProvince, setShownProvince] = useState(province)
  const [nationalFallbacks, setNationalFallbacks] = useState<string[]>([])

  // Seeds which hearts start filled; the buttons own their state after that.
  const pinnedSet = new Set(pinned)

  async function search(term: string, type: PriceTypeKey) {
    setStatus("loading")
    setSearchedTerm(term)
    const result = await searchCommodityPrices(term, { province, priceType: type })
    setResults(result.commodities)
    setShownProvince(result.province)
    setNationalFallbacks(result.nationalFallbacks)
    setStatus("done")
  }

  async function runSearch(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    await search(trimmed, priceType)
  }

  // Switching tabs re-runs the last search so stale numbers don't sit under the new label.
  async function selectPriceType(key: PriceTypeKey) {
    setPriceType(key)
    if (searchedTerm) await search(searchedTerm, key)
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground text-balance text-center md:text-3xl">
        Search market prices
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Look up any commodity tracked by PIHPS Nasional (Bank Indonesia): what you&apos;d be
        paid for it, and what it sells for at the pasar.
      </p>

      <div
        role="tablist"
        aria-label="Price type"
        className="mt-5 inline-flex rounded-full border border-border bg-card p-1"
      >
        {PRICE_TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={priceType === tab.key}
            title={tab.hint}
            onClick={() => selectPriceType(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              priceType === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {PRICE_TYPES[priceType]} · {shownProvince}
      </p>

      <form onSubmit={runSearch} className="mt-6 flex w-full max-w-md items-center justify-center gap-2">
        <div className="flex w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:w-72">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a commodity: beras, cabai, bawang…"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            aria-label="Search commodity"
          />
        </div>
        <button
          type="submit"
          aria-label="Search"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <Search className="size-4" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-10 w-full">
        {status === "idle" && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Start searching for a commodity
          </p>
        )}

        {status === "loading" && (
          <p className="py-16 text-center text-sm text-muted-foreground">Searching…</p>
        )}

        {status === "done" && results.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No commodities found for &ldquo;{searchedTerm}&rdquo;
          </p>
        )}

        {status === "done" && results.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((commodity) => (
              <PriceCard
                key={commodity.id}
                commodity={commodity}
                isPinned={pinnedSet.has(commodity.name)}
                isNational={nationalFallbacks.includes(commodity.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
