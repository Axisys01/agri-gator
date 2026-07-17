"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import { saveUserLocation } from "@/app/actions/location";
import type { LocationResult } from "@/lib/wilayah";

// The dataset's label is "desa, kecamatan, kotkab, provinsi" — too long for a
// header chip, so show the village and its regency and keep the rest on hover.
function shortLabel(location: LocationResult) {
  return `${location.desa}, ${location.kotkab}`;
}

export function HeaderLocationPicker({ initial }: { initial: LocationResult | null }) {
  const [location, setLocation] = useState(initial);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/locations?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

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

  function select(result: LocationResult) {
    const previous = location;
    setLocation(result);
    setOpen(false);
    setQuery("");
    setResults([]);
    setSaveError(null);

    startTransition(async () => {
      const { error } = await saveUserLocation(result);
      if (error) {
        setLocation(previous);
        setSaveError(error);
      }
    });
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Icon-only circle on mobile (matching the bell), widening to a labelled
          pill from sm up where there's room for the village name. */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={location ? `Location: ${location.label}` : "Set location"}
        title={location?.label ?? undefined}
        className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary sm:size-auto sm:max-w-56 sm:justify-start sm:gap-1.5 sm:px-3 sm:py-2"
      >
        <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="hidden truncate sm:inline">
          {location ? shortLabel(location) : "Set location"}
        </span>
      </button>

      {open && (
        // Anchoring right-0 to the button would overflow the left edge on a
        // phone, so drop to a full-width sheet under the header below sm.
        <div className="fixed inset-x-4 top-16 z-30 rounded-xl border border-border bg-card p-3 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your desa, kecamatan, or kabupaten..."
            aria-label="Search location"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />

          {loading && <p className="mt-2 text-xs text-muted-foreground">Searching...</p>}

          {query.trim().length >= 2 && results.length > 0 && (
            <ul className="mt-2 max-h-64 overflow-auto">
              {results.map((result) => (
                <li key={result.adm4}>
                  <button
                    type="button"
                    onClick={() => select(result)}
                    className="block w-full rounded-md px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    {result.label}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">No matching villages.</p>
          )}
        </div>
      )}

      {saveError && (
        <p role="status" className="absolute right-0 mt-1 text-xs text-destructive">
          {saveError}
        </p>
      )}
    </div>
  );
}
