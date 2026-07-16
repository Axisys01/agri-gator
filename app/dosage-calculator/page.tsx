import { Calculator } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DosageCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:px-6">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Calculator className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Dosage Calculator
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Enter land size, crop type and plant age to get land-specific fertilizer and pesticide
          dosage and schedules.
        </p>
        <span className="mt-6 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
          Coming soon
        </span>
      </main>
    </div>
  );
}
