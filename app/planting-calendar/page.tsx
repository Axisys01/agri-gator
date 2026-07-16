import { CalendarDays } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import PlantingCalendar from "@/app/components/PlantingCalendar";

export default function PlantingCalendarPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:px-6">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CalendarDays className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Planting Calendar
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Cross-references BMKG weather + nowcast alerts with your crop to recommend planting
          windows and harvest timing.
        </p>

        <div className="mt-8 w-full">
          <PlantingCalendar />
        </div>
      </main>
    </div>
  );
}
