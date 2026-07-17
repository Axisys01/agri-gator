"use client";

import { useEffect, useRef, useState } from "react";
import type { LocationResult } from "@/lib/wilayah";

export default function LocationSearch({
  onSelect,
  initial,
}: {
  onSelect: (location: LocationResult) => void;
  initial?: LocationResult | null;
}) {
  const [query, setQuery] = useState(initial?.label ?? "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  // Matches query so a prefilled location counts as already selected, skipping
  // the search and keeping the dropdown closed on load.
  const [selectedLabel, setSelectedLabel] = useState<string | null>(initial?.label ?? null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2 || query === selectedLabel) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
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

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedLabel]);

  const showResults =
    results.length > 0 && query.trim().length >= 2 && query !== selectedLabel;

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Your village / desa
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedLabel(null);
        }}
        placeholder="Search for your desa, kecamatan, or kabupaten..."
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      {loading && <p className="mt-1 text-xs text-zinc-500">Searching...</p>}
      {showResults && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {results.map((r) => (
            <li key={r.adm4}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r);
                  setQuery(r.label);
                  setSelectedLabel(r.label);
                  setResults([]);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-emerald-50 dark:hover:bg-zinc-800"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
