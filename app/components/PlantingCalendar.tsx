"use client";

import { useState } from "react";
import LocationSearch from "./LocationSearch";
import WeatherWidget from "./WeatherWidget";
import AlertBanner from "./AlertBanner";
import PlantingAdviceCard from "./PlantingAdviceCard";
import { CROPS } from "@/lib/crops";
import type { LocationResult } from "@/lib/wilayah";
import type { WeatherForecast, WeatherAlert } from "@/lib/bmkg";
import type { PlantingAdvice } from "@/lib/gemini";

interface AdviceResponse {
  forecast: WeatherForecast;
  alerts: WeatherAlert[];
  advice: PlantingAdvice;
}

export default function PlantingCalendar() {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [cropId, setCropId] = useState(CROPS[0].id);
  const [result, setResult] = useState<AdviceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!location) {
      setError("Choose your village first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    console.log("[planting-calendar] requesting advice", { adm4: location.adm4, cropId });

    try {
      const res = await fetch("/api/planting-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adm4: location.adm4, cropId }),
      });

      const data = await res.json().catch((parseErr) => {
        console.error("[planting-calendar] response wasn't valid JSON", parseErr);
        return null;
      });

      console.log("[planting-calendar] response", { status: res.status, data });

      if (!res.ok || !data) {
        throw new Error(data?.error ?? `Request failed with status ${res.status}`);
      }
      setResult(data);
    } catch (err) {
      console.error("[planting-calendar] request failed", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <LocationSearch onSelect={setLocation} />

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Crop
          </label>
          <select
            value={cropId}
            onChange={(e) => setCropId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {CROPS.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.nameId} ({crop.name})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !location}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Checking forecast..." : "Get planting advice"}
        </button>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {result && (
        <div className="space-y-4">
          <AlertBanner alerts={result.alerts} />
          <WeatherWidget forecast={result.forecast} />
          <PlantingAdviceCard advice={result.advice} />
        </div>
      )}
    </div>
  );
}
