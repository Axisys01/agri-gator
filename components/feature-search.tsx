"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { features, type Feature } from "@/lib/dashboard-data";

// Match on everything a farmer might type, not just the name — "weather" should
// surface the planting calendar even though its name never says the word.
function haystack(feature: Feature) {
  return [
    feature.name,
    feature.short,
    feature.module,
    feature.description,
    feature.aggregates,
    feature.stage,
  ]
    .join(" ")
    .toLowerCase();
}

export function FeatureSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived straight from query on every render: the feature list is a handful
  // of local rows, so filtering costs nothing. The location search needs a
  // debounce because it hits /api/locations; this doesn't.
  const q = query.trim().toLowerCase();
  const results = q
    ? features.filter((feature) => haystack(feature).includes(q))
    : [];

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

  const showPanel = open && q.length > 0;

  return (
    <div
      ref={containerRef}
      className="relative ml-auto hidden md:block md:w-72"
    >
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search modules"
          aria-label="Search modules"
          className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {results.length > 0 ? (
            <ul>
              {results.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.id}>
                    <Link
                      href={feature.href}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {feature.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {feature.stage}
                        </span>
                      </span>
                      {feature.status === "soon" && (
                        <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                          Under Development
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No modules found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
