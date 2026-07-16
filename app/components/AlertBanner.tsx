import type { WeatherAlert } from "@/lib/bmkg";

export default function AlertBanner({ alerts }: { alerts: WeatherAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
          Active BMKG extreme weather warning{alerts.length > 1 ? "s" : ""}
        </h3>
      </div>
      <ul className="mt-2 space-y-2">
        {alerts.map((alert, i) => (
          <li key={i} className="text-sm text-red-900 dark:text-red-200">
            <p className="font-medium">{alert.title}</p>
            <p className="text-red-700 dark:text-red-300/90">{alert.description}</p>
            {alert.pubDate && (
              <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-400/70">
                {alert.pubDate}
              </p>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-red-600/70 dark:text-red-400/60">
        Source: BMKG nowcast/CAP early warning feed
      </p>
    </div>
  );
}
