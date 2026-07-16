import { DashboardHeader } from "@/components/dashboard-header";
import { PriceSearch } from "@/components/price-search";

export default function PricesPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <PriceSearch />
      </main>
    </div>
  );
}
