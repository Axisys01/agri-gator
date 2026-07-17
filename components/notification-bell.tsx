"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import type { WeatherAlert } from "@/lib/bmkg";

export function NotificationBell({
  alerts,
  placeName,
}: {
  alerts: WeatherAlert[];
  placeName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          alerts.length > 0
            ? `${alerts.length} active weather warning${alerts.length > 1 ? "s" : ""}`
            : "No active weather warnings"
        }
        className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-secondary-foreground transition-colors hover:bg-secondary"
      >
        <Bell className="size-5" aria-hidden="true" />
        {/* Only shown when BMKG has something; a dot that's always lit is just noise the farmer learns to ignore. */}
        {alerts.length > 0 && (
          <span
            className="absolute right-2 top-2 size-2 rounded-full bg-accent"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        // Anchoring to the button would overflow the left edge on a phone, so use a full-width sheet under the header below sm.
        <div className="fixed inset-x-4 top-16 z-30 rounded-xl border border-border bg-card p-3 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            BMKG early warnings
          </p>

          {alerts.length > 0 ? (
            <ul className="max-h-80 space-y-2 overflow-auto">
              {alerts.map((alert) => (
                <li
                  key={alert.link || alert.title}
                  className="rounded-lg border border-accent/30 bg-accent/10 p-3"
                >
                  <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {alert.description}
                  </p>
                  {alert.link && (
                    <a
                      href={alert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                    >
                      Read the BMKG bulletin
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-1 pb-1 text-sm text-muted-foreground">
              {placeName
                ? `No active warnings for ${placeName}.`
                : "Set your location to get warnings for your village."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
