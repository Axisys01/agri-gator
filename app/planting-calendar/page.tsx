import { CalendarDays } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import PlantingCalendar from "@/app/components/PlantingCalendar";
import { getUserLocation } from "@/lib/user-location";

export default async function PlantingCalendarPage() {
  const location = await getUserLocation();

  return (
    <div className="min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 z-0 mx-auto max-w-6xl border-x border-border"
        aria-hidden="true"
      />
      <DashboardHeader />

      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:px-6">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CalendarDays className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Planting Calendar
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Cross-references BMKG weather + nowcast alerts with your crop to
          recommend planting windows and harvest timing.
        </p>

        <div className="mt-8 w-full">
          {/* Keyed on the saved location: initialLocation only seeds state on
              first render, so without this, changing location from the header
              chip would leave a stale village in the input and advice for the
              old place still on screen. */}
          <PlantingCalendar
            key={location?.adm4 ?? "none"}
            initialLocation={location}
          />
        </div>
      </main>
    </div>
  );
}
