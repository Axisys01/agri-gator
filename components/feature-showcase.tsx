"use client";

import { useState } from "react";
import Image from "next/image";
import { features } from "@/lib/dashboard-data";

// Explicit map, not a `/${id}-mock.png` convention, since screenshots aren't named after feature ids; a missing file would 400 through the image optimizer, so shots can land one at a time.
const MOCKUPS: Record<string, string> = {
  "planting-calendar": "/planting-mock.png",
  "plant-health-scanner": "/scanner-mock.png",
  "market-prices": "/marketprices-mock.png",
  "dosage-calculator": "/dosage-mock.png",
  "crop-yield-prediction": "/yield-mock.png",
  "agriculture-news": "/news-mock.png",
};

// Default view is the dashboard, the whole pitch of every feed in one place; modules are what you drill into.
const HOME_MOCKUP = "/home-mock.png";

// Every shot uses the same phone-frame size, reserved up front, so swapping tabs doesn't reflow the page.
const MOCKUP_WIDTH = 1419;
const MOCKUP_HEIGHT = 2796;

export function FeatureShowcase() {
  const shown = features.filter((feature) => MOCKUPS[feature.id]);
  // null means the dashboard: no module selected yet.
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = shown.find((feature) => feature.id === activeId) ?? null;

  const frames = [
    {
      key: "__dashboard__",
      src: HOME_MOCKUP,
      alt: "The Agri-Gator dashboard on a phone",
      visible: activeId === null,
    },
    ...shown.map((feature) => ({
      key: feature.id,
      src: MOCKUPS[feature.id],
      alt: `${feature.name} running on a phone`,
      visible: feature.id === activeId,
    })),
  ];

  return (
    <div className="mt-14 flex w-full flex-col items-center">
      <div className="relative w-full max-w-[260px] md:max-w-[300px]">
        {/* All frames stay mounted and cross-fade; swapping a single src would blank the phone until the new file downloaded. */}
        {frames.map((frame) => (
          <Image
            key={frame.key}
            src={frame.src}
            alt={frame.alt}
            width={MOCKUP_WIDTH}
            height={MOCKUP_HEIGHT}
            // Only the dashboard is visible at load (it's the LCP); the rest can wait until a tab asks for them.
            preload={frame.key === "__dashboard__"}
            className={`h-auto w-full transition-opacity duration-300 ${
              frame.visible
                ? "opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          />
        ))}
      </div>

      <div
        role="tablist"
        aria-label="Explore the modules"
        className="mt-8 flex flex-wrap items-center justify-center gap-2"
      >
        {shown.map((feature) => {
          const Icon = feature.icon;
          const isActive = feature.id === activeId;

          return (
            <button
              key={feature.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              // Tapping the open tab again returns to the dashboard, since there'd otherwise be no way back without reloading.
              onClick={() => setActiveId(isActive ? null : feature.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-secondary-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {feature.short}
            </button>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className="mt-4 min-h-10 max-w-md text-center text-sm text-muted-foreground text-pretty"
      >
        {active ? (
          <>
            <span className="font-semibold text-foreground">{active.name}</span>{" "}
            - {active.description}
          </>
        ) : (
          "Every feed a farmer needs, on one screen. Tap a module to see it."
        )}
      </p>
    </div>
  );
}
