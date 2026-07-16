import { ShieldCheck, TriangleAlert, MapPin } from "lucide-react";
import type { WeatherAlert } from "@/lib/bmkg";
import type { LocationResult } from "@/lib/wilayah";

export function WeatherAlertCard({
  location,
  alerts,
}: {
  location: LocationResult | null;
  alerts: WeatherAlert[];
}) {
  if (!location) {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <MapPin className="size-4" aria-hidden="true" />
        </span>
        <div className="text-sm">
          <p className="font-semibold text-foreground">Set your location</p>
          <p className="mt-0.5 text-muted-foreground">
            Pick your village from the header to get BMKG extreme-weather warnings for where
            you actually farm.
          </p>
        </div>
      </div>
    );
  }

  // Most of the time BMKG has nothing for a given village, and saying so plainly
  // beats inventing a warning — a farmer who learns the banner cries wolf will
  // ignore the one that matters.
  if (alerts.length === 0) {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <div className="text-sm">
          <p className="font-semibold text-foreground">
            No active warnings for {location.desa}
          </p>
          <p className="mt-0.5 text-muted-foreground">
            BMKG has no extreme-weather warning for {location.kecamatan}, {location.kotkab}{" "}
            right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="mt-5 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4"
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <TriangleAlert className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-foreground">
          {alerts.length === 1
            ? alerts[0].title
            : `${alerts.length} active weather warnings near ${location.desa}`}
        </p>
        {alerts.length === 1 ? (
          <p className="mt-0.5 text-muted-foreground">{alerts[0].description}</p>
        ) : (
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            {alerts.map((alert) => (
              <li key={alert.link || alert.title}>{alert.title}</li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Source: BMKG ·{" "}
          <a
            href={alerts[0].link || "https://www.bmkg.go.id/alerts/nowcast/id"}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Read the bulletin
          </a>
        </p>
      </div>
    </div>
  );
}
