"use client"

import { useState } from "react"
import Link from "next/link"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChevronDown, TrendingDown, TrendingUp } from "lucide-react"
import { FavoriteCommodityButton } from "@/components/favorite-commodity-button"
import { type CommodityTrend } from "@/lib/dashboard-data"

function formatRupiah(currency: string, value: number) {
  return `${currency} ${value.toLocaleString("id-ID")}`
}

function formatDateLabel(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function trendColor(isUp: boolean) {
  return isUp ? "var(--color-chart-1)" : "var(--color-destructive)"
}

function Sparkline({ commodity, showTooltip }: { commodity: CommodityTrend; showTooltip?: boolean }) {
  const isUp = commodity.changePct >= 0
  const strokeColor = trendColor(isUp)
  const gradientId = `grad-${commodity.id}`

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={commodity.history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.28} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" hide />
        <YAxis domain={["dataMin - 500", "dataMax + 500"]} hide />
        {showTooltip && (
          <Tooltip
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-popover)",
              color: "var(--color-popover-foreground)",
              fontSize: 12,
              boxShadow: "0 6px 20px rgb(0 0 0 / 0.08)",
            }}
            labelStyle={{ color: "var(--color-muted-foreground)" }}
            labelFormatter={(label) => formatDateLabel(String(label))}
            formatter={(value) => [
              formatRupiah(commodity.currency, Number(value) || 0),
              "Price",
            ]}
          />
        )}
        <Area type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function ChangeBadge({ commodity }: { commodity: CommodityTrend }) {
  const isUp = commodity.changePct >= 0
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        isUp ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
      }`}
    >
      {isUp ? <TrendingUp className="size-3.5" aria-hidden="true" /> : <TrendingDown className="size-3.5" aria-hidden="true" />}
      {isUp ? "+" : ""}
      {commodity.changePct}%
    </span>
  )
}

/* Desktop / tablet full card */
export function PriceCard({
  commodity,
  isPinned,
}: {
  commodity: CommodityTrend
  /* Omitted where there's no signed-in user to pin for — the heart is hidden. */
  isPinned?: boolean
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-sm font-semibold leading-tight text-foreground text-balance">
            {commodity.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{commodity.unit}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ChangeBadge commodity={commodity} />
          {isPinned !== undefined && (
            <FavoriteCommodityButton commodity={commodity.name} initialPinned={isPinned} />
          )}
        </div>
      </div>

      <p className="mt-3 font-serif text-2xl font-bold tracking-tight text-foreground">
        {formatRupiah(commodity.currency, commodity.price)}
      </p>

      <div className="mt-3 h-24 w-full">
        <Sparkline commodity={commodity} showTooltip />
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">Source: {commodity.source}</p>
    </article>
  )
}

/* Mobile compact, expandable row */
function PriceRow({ commodity, isPinned }: { commodity: CommodityTrend; isPinned?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* The heart sits beside the expand button rather than inside it — nesting
          one button in another is invalid and breaks keyboard navigation. */}
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2.5 p-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-serif text-sm font-semibold text-foreground">{commodity.name}</h3>
              <ChangeBadge commodity={commodity} />
            </div>
            <p className="mt-0.5 font-serif text-lg font-bold leading-none tracking-tight text-foreground">
              {formatRupiah(commodity.currency, commodity.price)}
              <span className="ml-1 text-[11px] font-normal text-muted-foreground">{commodity.unit}</span>
            </p>
          </div>

          {/* small graph preview on the right */}
          <div className="h-10 w-16 shrink-0">
            <Sparkline commodity={commodity} />
          </div>

          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        {isPinned !== undefined && (
          <FavoriteCommodityButton commodity={commodity.name} initialPinned={isPinned} />
        )}
      </div>

      {open && (
        <div className="border-t border-border p-3">
          <div className="h-28 w-full">
            <Sparkline commodity={commodity} showTooltip />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Source: {commodity.source} · Last 10 weeks</p>
        </div>
      )}
    </div>
  )
}

export function CommodityPriceCharts({
  commodities,
  pinned,
}: {
  commodities: CommodityTrend[]
  pinned: string[]
}) {
  const pinnedSet = new Set(pinned)
  // Nothing pinned yet means these are the stock defaults, not the farmer's
  // pick — say so, otherwise the list silently changing on the first heart
  // looks like a bug.
  const showingDefaults = pinned.length === 0

  return (
    <section aria-labelledby="prices-heading">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 id="prices-heading" className="font-serif text-lg font-bold text-foreground">
            Market Prices
          </h2>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {showingDefaults
              ? "Default picks · tap a heart to pin your own"
              : "Last 10 weeks · national reference prices"}
          </p>
        </div>
        <Link href="/prices" className="text-sm font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>

      {/* Mobile: compact expandable rows */}
      <div className="flex flex-col gap-3 sm:hidden">
        {commodities.map((commodity) => (
          <PriceRow key={commodity.id} commodity={commodity} isPinned={pinnedSet.has(commodity.name)} />
        ))}
      </div>

      {/* Tablet / desktop: full cards */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {commodities.map((commodity) => (
          <PriceCard key={commodity.id} commodity={commodity} isPinned={pinnedSet.has(commodity.name)} />
        ))}
      </div>
    </section>
  )
}
