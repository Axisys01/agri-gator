import { DashboardHeader } from "@/components/dashboard-header";
import { PesticideCalculator } from "@/components/pesticide-calculator";

export default function DosageCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl">
            Pesticide Dosage Calculator
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground text-pretty">
            Turn the concentration on your product label into how much to pour into each
            sprayer tank, and how many tanks your plot needs.
          </p>
        </div>

        <div className="mt-8">
          <PesticideCalculator />
        </div>
      </main>
    </div>
  );
}
