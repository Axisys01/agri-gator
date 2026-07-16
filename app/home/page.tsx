import { headers } from "next/headers";
import { TriangleAlert } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { CommodityPriceCharts } from "@/components/commodity-price-charts";
import { FeatureGrid } from "@/components/feature-grid";
import { getCommodityPrices } from "@/lib/get-commodity-prices";

// The server clock is UTC on Vercel, which would greet a farmer opening the app
// at 9am WIB with "Selamat malam". Pin it to Jakarta so the greeting matches
// the user's day rather than the datacentre's.
//
// These are Indonesian day boundaries, not the English ones translated: siang
// is the middle of the day and sore is late afternoon, so the cutoffs sit
// earlier than morning/afternoon/evening would.
function greetingFor(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hourCycle: "h23",
    }).format(now),
  );

  if (hour < 5) return "Selamat malam";
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default async function HomePage() {
  const commodities = await getCommodityPrices();

  // Verified once in proxy.ts and forwarded via headers — see dashboard-header.tsx.
  const headerList = await headers();
  const userEmail = headerList.get("x-supabase-user-email");
  const userName = headerList.get("x-supabase-user-name");

  // Google hands back a full name, but a heading reads better with just the
  // first — and falls back to the email's local part rather than rendering a
  // whole address at h1 size.
  const firstName = userName?.split(" ")[0] || userEmail?.split("@")[0];
  const greeting = greetingFor(new Date());

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl">
            {firstName ? `${greeting}, ${firstName}` : greeting}
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
