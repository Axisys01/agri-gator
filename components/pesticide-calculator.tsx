"use client";

import { useState } from "react";
import { Info } from "lucide-react";

// Smallholders measure plots in local units far more often than in hectares —
// a tumbak (also called bata or ru) is ~14 m². Mixing these up is a 100x error,
// so every unit the farmer might actually use gets an explicit conversion.
const AREA_UNITS = {
  ha: { label: "Hektar", toHa: 1 },
  are: { label: "Are (100 m²)", toHa: 0.01 },
  tumbak: { label: "Tumbak / bata / ru (14 m²)", toHa: 0.0014 },
  m2: { label: "Meter persegi (m²)", toHa: 0.0001 },
} as const;

type AreaUnit = keyof typeof AREA_UNITS;

// Volume semprot — the spray volumes per hectare normally recommended.
const SPRAY_VOLUMES = [300, 400, 500];

// Knapsack sprayer sizes farmers actually carry.
const TANK_SIZES = [14, 15, 16];

function format(value: number, digits = 1) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: digits }).format(value);
}

export function PesticideCalculator() {
  const [area, setArea] = useState("");
  const [unit, setUnit] = useState<AreaUnit>("ha");
  const [concentration, setConcentration] = useState("");
  const [sprayVolume, setSprayVolume] = useState(400);
  const [tankSize, setTankSize] = useState(15);

  const areaValue = Number(area);
  const concentrationValue = Number(concentration);
  const ready =
    Number.isFinite(areaValue) &&
    areaValue > 0 &&
    Number.isFinite(concentrationValue) &&
    concentrationValue > 0;

  // dosis = konsentrasi x volume semprot, so the product needed for the plot is
  // just the concentration applied across the whole spray volume.
  const areaHa = areaValue * AREA_UNITS[unit].toHa;
  const totalSprayL = areaHa * sprayVolume;
  const tanks = totalSprayL / tankSize;
  const perTankMl = concentrationValue * tankSize;
  const totalProductMl = concentrationValue * totalSprayL;
  const dosePerHaMl = concentrationValue * sprayVolume;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="area"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Land area
            </label>
            <div className="flex gap-2">
              <input
                id="area"
                type="number"
                inputMode="decimal"
                min="0"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              />
              <select
                aria-label="Area unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value as AreaUnit)}
                className="shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.entries(AREA_UNITS).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="concentration"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Concentration from the product label
            </label>
            <div className="flex items-center gap-2">
              <input
                id="concentration"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={concentration}
                onChange={(event) => setConcentration(event.target.value)}
                placeholder="2"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              />
              <span className="shrink-0 text-sm text-muted-foreground">ml or g per litre</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="spray-volume"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Spray volume
            </label>
            <select
              id="spray-volume"
              value={sprayVolume}
              onChange={(event) => setSprayVolume(Number(event.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              {SPRAY_VOLUMES.map((volume) => (
                <option key={volume} value={volume}>
                  {volume} litres per hektar
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tank-size"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Sprayer tank size
            </label>
            <select
              id="tank-size"
              value={tankSize}
              onChange={(event) => setTankSize(Number(event.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              {TANK_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} litres
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div
        aria-live="polite"
        className="mt-4 rounded-2xl border border-border bg-card p-5 md:p-6"
      >
        {ready ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-primary/10 p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Product per tank
                </p>
                <p className="mt-1 font-serif text-3xl font-bold text-primary">
                  {format(perTankMl)} ml
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  in each {tankSize} L tank
                </p>
              </div>
              <div className="rounded-xl bg-secondary p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tanks needed
                </p>
                <p className="mt-1 font-serif text-3xl font-bold text-secondary-foreground">
                  {format(Math.ceil(tanks), 0)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(tanks)} tanks to cover the plot
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Total product</dt>
                <dd className="font-medium text-foreground">
                  {format(totalProductMl)} ml ({format(totalProductMl / 1000, 2)} L)
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Total spray liquid</dt>
                <dd className="font-medium text-foreground">{format(totalSprayL)} L</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Dose per hektar</dt>
                <dd className="font-medium text-foreground">{format(dosePerHaMl)} ml/ha</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Plot size</dt>
                <dd className="font-medium text-foreground">{format(areaHa, 3)} ha</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Enter your land area and the concentration printed on the product label to see
            how much to mix.
          </p>
        )}
      </div>

      <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Always follow the concentration on your product&apos;s label — it varies by product
          and pest. This calculator only converts that figure to your plot and sprayer.
        </span>
      </p>
    </div>
  );
}
