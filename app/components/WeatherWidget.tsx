import type { WeatherForecast } from "@/lib/bmkg";

function formatTime(datetime: string) {
  const d = new Date(datetime.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return datetime;
  return d.toLocaleString("id-ID", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WeatherWidget({ forecast }: { forecast: WeatherForecast }) {
  const { location, entries } = forecast;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {location.desa || "Selected location"}
        </h3>
        <span className="text-xs text-zinc-500">
          {location.kecamatan}, {location.kotkab}
        </span>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {entries.slice(0, 8).map((entry) => (
          <div
            key={entry.localDatetime}
            className="flex min-w-[92px] flex-col items-center rounded-lg bg-zinc-50 px-3 py-2 text-center dark:bg-zinc-800/60"
          >
            <span className="text-xs text-zinc-500">{formatTime(entry.localDatetime)}</span>
            {entry.iconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entry.iconUrl} alt={entry.weatherDesc} className="my-1 h-8 w-8" />
            )}
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {entry.tempC !== null ? `${Math.round(entry.tempC)}°C` : "N/A"}
            </span>
            <span className="text-[11px] text-zinc-500">{entry.weatherDesc}</span>
            <span className="text-[11px] text-zinc-400">
              💧{entry.humidityPct ?? "N/A"}%
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-zinc-400">
        Source: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
      </p>
    </div>
  );
}
