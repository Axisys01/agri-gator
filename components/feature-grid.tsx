import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { features, type Feature } from "@/lib/dashboard-data"

const statusLabel: Record<NonNullable<Feature["status"]>, string> = {
  live: "Live",
  beta: "Beta",
  soon: "Phase 2",
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon
  const isSoon = feature.status === "soon"

  return (
    <Link
      href={feature.href}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isSoon ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
          }`}
        >
          {feature.status ? statusLabel[feature.status] : feature.module}
        </span>
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{feature.module}</p>
      <h3 className="mt-1 flex items-center gap-1 font-serif text-base font-bold text-foreground">
        {feature.name}
        <ArrowUpRight
          className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
        <span className="font-medium text-secondary-foreground">{feature.aggregates}</span>
      </div>
    </Link>
  )
}

function FeatureIcon({ feature }: { feature: Feature }) {
  const Icon = feature.icon
  const isSoon = feature.status === "soon"

  return (
    <Link href={feature.href} className="group flex flex-col items-center gap-2 text-center">
      <span className="relative flex aspect-square w-full items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm transition-colors group-active:bg-primary/10">
        <Icon className="size-7" aria-hidden="true" />
        {isSoon && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" aria-hidden="true" />
        )}
      </span>
      <span className="text-xs font-semibold text-foreground">{feature.short}</span>
    </Link>
  )
}

export function FeatureGrid() {
  return (
    <section aria-labelledby="features-heading">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 id="features-heading" className="font-serif text-lg font-bold text-foreground">
            Your farming toolkit
          </h2>
          <p className="hidden text-sm text-muted-foreground sm:block">
            One app across the whole season — before planting, deciding when to plant, and during growth.
          </p>
        </div>
      </div>

      {/* Mobile: icon + one-word title */}
      <div className="grid grid-cols-4 gap-3 sm:hidden">
        {features.map((feature) => (
          <FeatureIcon key={feature.id} feature={feature} />
        ))}
      </div>

      {/* Tablet / desktop: full cards */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  )
}
