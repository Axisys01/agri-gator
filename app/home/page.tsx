import { headers } from "next/headers";
import { DashboardHeader } from "@/components/dashboard-header";
import { CommodityPriceCharts } from "@/components/commodity-price-charts";
import { FeatureGrid } from "@/components/feature-grid";
import { WeatherAlertCard } from "@/components/weather-alert-card";
import { getCommodityPrices } from "@/lib/get-commodity-prices";
import { getUserCommodities } from "@/lib/user-commodities";
import { getUserWeatherAlerts } from "@/lib/user-alerts";
import { pihpsProvinceFor } from "@/lib/pihps";

// Pinned to Jakarta time so the greeting matches the farmer's day, not UTC's.
// Indonesian day boundaries (siang/sore) sit earlier than English morning/afternoon/evening.
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
  // Fetched here, not inside getCommodityPrices, since the charts also need this list to render filled hearts.
  const pinned = await getUserCommodities();
  // Same lookup as the header's bell; getUserLocation is cache()d and the BMKG feed is fetch-cached, so this is free.
  const { location: alertLocation, alerts } = await getUserWeatherAlerts();
  const board = await getCommodityPrices(pinned, {
    province: pihpsProvinceFor(alertLocation?.provinsi),
  });

  // Verified once in proxy.ts and forwarded via headers. See dashboard-header.tsx.
  const headerList = await headers();
  const userEmail = headerList.get("x-supabase-user-email");
  const userName = headerList.get("x-supabase-user-name");

  // Google returns a full name, but the heading uses just the first, falling
  // back to the email's local part rather than rendering a full address at h1 size.
  const firstName = userName?.split(" ")[0] || userEmail?.split("@")[0];
  const greeting = greetingFor(new Date());

  return (
    // relative is load-bearing: without it, the hairlines' inset-0 resolves against
    // the viewport and stops after one screen instead of the full scroll height.
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 z-0 mx-auto max-w-6xl border-x border-border"
        aria-hidden="true"
      />
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl">
            {firstName ? `${greeting}, ${firstName}` : greeting}
          </h1>
        </div>

        <WeatherAlertCard location={alertLocation} alerts={alerts} />

        <div className="mt-8 flex flex-col gap-8">
          <CommodityPriceCharts
            commodities={board.commodities}
            pinned={pinned}
            province={board.province}
            priceTypeLabel={board.priceTypeLabel}
            nationalFallbacks={board.nationalFallbacks}
          />
          <FeatureGrid />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground md:px-6">
        Agri-Gator aggregates all your farmer needs!
      </footer>
    </div>
  );
}
