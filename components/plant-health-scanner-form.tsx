"use client"

import { useRef, useState } from "react"
import { Leaf, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

const MODEL_URL = "/models/plant-disease.onnx"
const CLASSES_URL = "/models/plant-disease-classes.json"
const IMG_SIZE = 128
const ORT_VERSION = "1.27.0"

interface Prediction {
  label: string
  confidence: number
}

let ortModulePromise: Promise<typeof import("onnxruntime-web")> | null = null
async function getOrt() {
  if (!ortModulePromise) {
    ortModulePromise = import("onnxruntime-web").then((ort) => {
      ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`
      return ort
    })
  }
  return ortModulePromise
}

let sessionPromise: Promise<import("onnxruntime-web").InferenceSession> | null = null
async function getSession() {
  if (!sessionPromise) {
    sessionPromise = getOrt().then((ort) => ort.InferenceSession.create(MODEL_URL))
  }
  return sessionPromise
}

let classesPromise: Promise<string[]> | null = null
async function getClasses() {
  if (!classesPromise) {
    classesPromise = fetch(CLASSES_URL).then((res) => res.json())
  }
  return classesPromise
}

async function preprocessImage(file: File): Promise<Float32Array> {
  const bitmap = await createImageBitmap(file)
  const scale = IMG_SIZE / Math.min(bitmap.width, bitmap.height)
  const scaledW = Math.round(bitmap.width * scale)
  const scaledH = Math.round(bitmap.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = IMG_SIZE
  canvas.height = IMG_SIZE
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")

  const offsetX = (scaledW - IMG_SIZE) / 2
  const offsetY = (scaledH - IMG_SIZE) / 2
  ctx.drawImage(bitmap, -offsetX, -offsetY, scaledW, scaledH)

  const { data } = ctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE)
  const chw = new Float32Array(3 * IMG_SIZE * IMG_SIZE)
  const plane = IMG_SIZE * IMG_SIZE
  for (let i = 0; i < plane; i++) {
    chw[i] = data[i * 4] / 255
    chw[plane + i] = data[i * 4 + 1] / 255
    chw[2 * plane + i] = data[i * 4 + 2] / 255
  }
  return chw
}

function formatLabel(raw: string): string {
  return raw.replace(/_/g, " ").trim()
}

export function PlantHealthScannerForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPredictions(null)
    setError(null)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleScan() {
    if (!file) return
    setLoading(true)
    setError(null)
    setPredictions(null)
    try {
      const [ort, session, classes, chw] = await Promise.all([
        getOrt(),
        getSession(),
        getClasses(),
        preprocessImage(file),
      ])

      const tensor = new ort.Tensor("float32", chw, [1, 3, IMG_SIZE, IMG_SIZE])
      const inputName = session.inputNames[0]
      const outputName = session.outputNames[0]
      const results = await session.run({ [inputName]: tensor })
      const probs = results[outputName].data as Float32Array

      const ranked = Array.from(probs)
        .map((confidence, index) => ({ label: formatLabel(classes[index] ?? `class_${index}`), confidence }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)

      setPredictions(ranked)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while scanning")
    } finally {
      setLoading(false)
    }
  }

  const top = predictions?.[0]
  const isHealthy = top?.label.toLowerCase().includes("healthy")

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/50 px-4 py-10 text-center transition-colors hover:border-primary/50"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Selected leaf" className="max-h-48 rounded-lg object-contain" />
          ) : (
            <>
              <Upload className="size-8 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">
                Tap to upload or take a photo of a leaf
              </span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button className="w-full" size="lg" onClick={handleScan} disabled={!file || loading}>
          {loading ? "Scanning..." : "Scan leaf"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {predictions && top && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-5 ${
            isHealthy ? "border-primary/30 bg-primary/10" : "border-accent/30 bg-accent/10"
          }`}
        >
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Most likely</p>
            <p className="mt-1 font-serif text-xl font-bold tracking-tight text-foreground">
              {top.label}
            </p>
            <p className="text-sm text-muted-foreground">
              {(top.confidence * 100).toFixed(1)}% confidence
            </p>

            {predictions.length > 1 && (
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {predictions.slice(1).map((p) => (
                  <li key={p.label}>
                    {p.label}: {(p.confidence * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
