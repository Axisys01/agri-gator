import { headers } from "next/headers";
import { TriangleAlert } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { CommodityPriceCharts } from "@/components/commodity-price-charts";
import { FeatureGrid } from "@/components/feature-grid";
import { getCommodityPrices } from "@/lib/get-commodity-prices";

export default async function HomePage() {
  const commodities = await getCommodityPrices();

  // Verified once in proxy.ts and forwarded via headers — see dashboard-header.tsx.
  const headerList = await headers();
  const userEmail = headerList.get("x-supabase-user-email");
  const userName = headerList.get("x-supabase-user-name");
  const greetingName = userName || userEmail;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {greetingName ? `Good morning, ${greetingName}` : "Good morning"}
          </p>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl">
            Everything your farm needs, aggregated.
          </h1>
        </div>

        {/* BMKG nowcast / extreme weather alert (Module 1) */}
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4"
        >
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <TriangleAlert className="size-4" aria-hidden="true" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              Active extreme-weather warning for Jawa Tengah
            </p>
            <p className="mt-0.5 text-muted-foreground">
              BMKG nowcast flags heavy rainfall in the next 24h. Consider delaying fertilizer
              application — see the Planting Calendar for adjusted windows.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <CommodityPriceCharts commodities={commodities} />
          <FeatureGrid />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground md:px-6">
        Agri-Gator aggregates BMKG, PIHPS Nasional, Bapanas &amp; Kementan Cybex into one place.
      </footer>
    </div>
  );
}
