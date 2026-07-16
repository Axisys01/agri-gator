import { DashboardHeader } from "@/components/dashboard-header";
import { PriceSearch } from "@/components/price-search";
import { getUserCommodities } from "@/lib/user-commodities";

export default async function PricesPage() {
  const pinned = await getUserCommodities();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <PriceSearch pinned={pinned} />
      </main>
    </div>
  );
}
