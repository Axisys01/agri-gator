"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { PriceCard } from "@/components/commodity-price-charts"
import { searchCommodityPrices } from "@/lib/search-commodity-prices"
import { type CommodityTrend } from "@/lib/dashboard-data"

type Status = "idle" | "loading" | "done"

export function PriceSearch({ pinned }: { pinned: string[] }) {
  const [query, setQuery] = useState("")
  const [searchedTerm, setSearchedTerm] = useState("")
  const [results, setResults] = useState<CommodityTrend[]>([])
  const [status, setStatus] = useState<Status>("idle")

  // Seeds which hearts start filled. The buttons own their state after that, so
  // this doesn't need to track toggles made during the session.
  const pinnedSet = new Set(pinned)

  async function runSearch(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setStatus("loading")
    setSearchedTerm(trimmed)
    const data = await searchCommodityPrices(trimmed)
    setResults(data)
    setStatus("done")
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground text-balance text-center md:text-3xl">
        Search market prices
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Look up national reference prices for any commodity in the Bapanas Panel Harga.
      </p>

      <form onSubmit={runSearch} className="mt-6 flex w-full max-w-md items-center justify-center gap-2">
        <div className="flex w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:w-72">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search crops, prices, guides..."
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
