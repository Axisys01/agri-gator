import { ScanLine } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { PlantHealthScannerForm } from "@/components/plant-health-scanner-form";

export default function PlantHealthScannerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 z-0 mx-auto max-w-6xl border-x border-border"
        aria-hidden="true"
      />
      <DashboardHeader />

      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:px-6">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ScanLine className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Plant Health Scanner
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Photo-based pest &amp; disease detection via image classification,
          running right in your browser.
        </p>

        <div className="mt-10 w-full">
          <PlantHealthScannerForm />
        </div>
      </main>
    </div>
  );
}
