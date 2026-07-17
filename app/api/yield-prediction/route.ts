import { NextRequest, NextResponse } from "next/server";
import { CROP_OPTIONS, predictYield } from "@/lib/yield-model/predict";

const VALID_CROPS = new Set(CROP_OPTIONS.map((c) => c.id));

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { crop, yearPlanted, rainfallMmPerYear, pesticidesTonnes, avgTempC } = body ?? {};

  if (typeof crop !== "string" || !VALID_CROPS.has(crop)) {
    return NextResponse.json({ error: "Unknown or missing crop" }, { status: 400 });
  }
  const numericFields = { yearPlanted, rainfallMmPerYear, pesticidesTonnes, avgTempC };
  for (const [key, value] of Object.entries(numericFields)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return NextResponse.json({ error: `${key} must be a number` }, { status: 400 });
    }
  }
  if (pesticidesTonnes < 0 || rainfallMmPerYear < 0) {
    return NextResponse.json({ error: "Rainfall and pesticide use cannot be negative" }, { status: 400 });
  }

  try {
    console.log("[yield-prediction] predicting", { crop, yearPlanted, rainfallMmPerYear, pesticidesTonnes, avgTempC });
    const prediction = predictYield({ crop, yearPlanted, rainfallMmPerYear, pesticidesTonnes, avgTempC });
    console.log("[yield-prediction] result", prediction);
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("[yield-prediction] FAILED:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
