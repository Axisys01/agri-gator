import { DashboardHeader } from "@/components/dashboard-header";
import { PriceSearch } from "@/components/price-search";
import { getUserCommodities } from "@/lib/user-commodities";
import { getUserLocation } from "@/lib/user-location";
import { pihpsProvinceFor } from "@/lib/pihps";

export default async function PricesPage() {
  const pinned = await getUserCommodities();
  const location = await getUserLocation();

  return (
    <div className="min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 z-0 mx-auto max-w-6xl border-x border-border"
        aria-hidden="true"
      />
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <PriceSearch
          pinned={pinned}
          province={pihpsProvinceFor(location?.provinsi)}
        />
      </main>
    </div>
  );
}
