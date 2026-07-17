"use client"

import { useState } from "react"
import { Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CropOption {
  id: string
  label: string
}

interface PredictionResult {
  yieldHgHa: number
  yieldTonnesPerHa: number
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
const labelClass = "mb-1 block text-sm font-medium text-foreground"

export function CropYieldPredictionForm({
  cropOptions,
  trainingYearRange,
}: {
  cropOptions: CropOption[]
  trainingYearRange: { min: number; max: number }
}) {
  const [crop, setCrop] = useState(cropOptions[0]?.id ?? "")
  const [yearPlanted, setYearPlanted] = useState(String(trainingYearRange.max))
  const [rainfall, setRainfall] = useState("")
  const [pesticides, setPesticides] = useState("")
  const [avgTemp, setAvgTemp] = useState("")
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    setResult(null)

    const yearPlantedNum = Number(yearPlanted)
    const rainfallNum = Number(rainfall)
    const pesticidesNum = Number(pesticides)
    const avgTempNum = Number(avgTemp)

    if (![yearPlantedNum, rainfallNum, pesticidesNum, avgTempNum].every(Number.isFinite)) {
      setError("Fill in every field with a valid number.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/yield-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          yearPlanted: yearPlantedNum,
          rainfallMmPerYear: rainfallNum,
          pesticidesTonnes: pesticidesNum,
          avgTempC: avgTempNum,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data) {
        throw new Error(data?.error ?? `Request failed with status ${res.status}`)
      }
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <label className={labelClass}>Crop</label>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputClass}>
            {cropOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Year planted</label>
            <input
              type="number"
              value={yearPlanted}
              onChange={(e) => setYearPlanted(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Avg. temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              value={avgTemp}
              onChange={(e) => setAvgTemp(e.target.value)}
              placeholder="e.g. 26.5"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Avg. rainfall (mm/year)</label>
            <input
              type="number"
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
              placeholder="e.g. 1800"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Pesticides used (tonnes)</label>
            <input
              type="number"
              step="0.1"
              value={pesticides}
              onChange={(e) => setPesticides(e.target.value)}
              placeholder="e.g. 30"
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Model trained on historical data from {trainingYearRange.min}–{trainingYearRange.max};
          predictions for years outside that range lean on the closest pattern the model learned
          rather than a true extrapolation.
        </p>

        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
          {loading ? "Predicting..." : "Predict yield"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {result && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Predicted yield</p>
            <p className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground">
              {result.yieldHgHa.toLocaleString("en-US", { maximumFractionDigits: 0 })} hg/ha
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ {result.yieldTonnesPerHa.toLocaleString("en-US", { maximumFractionDigits: 2 })} tonnes/ha
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
