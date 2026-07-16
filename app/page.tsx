import PlantingCalendar from "@/app/components/PlantingCalendar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          🌾 AgriGator — Planting Calendar
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pick your village and crop to get a BMKG-backed planting window, harvest
          estimate, and any active extreme weather warnings for your area.
        </p>
      </div>
      <div className="mt-8">
        <PlantingCalendar />
      </div>
    </div>
  );
}
