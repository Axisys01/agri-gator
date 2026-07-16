import { NextRequest, NextResponse } from "next/server";
import { getActiveWeatherAlerts, getWeatherForecast } from "@/lib/bmkg";
import { getCropById } from "@/lib/crops";
import { getPlantingAdvice } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const adm4 = body?.adm4;
  const cropId = body?.cropId;

  if (typeof adm4 !== "string" || typeof cropId !== "string") {
    return NextResponse.json(
      { error: "adm4 and cropId are required" },
      { status: 400 }
    );
  }

  const crop = getCropById(cropId);
  if (!crop) {
    return NextResponse.json({ error: "Unknown cropId" }, { status: 400 });
  }

  try {
    const forecast = await getWeatherForecast(adm4);
    const alerts = await getActiveWeatherAlerts(
      [forecast.location.kotkab, forecast.location.provinsi].filter(Boolean)
    );
    const advice = await getPlantingAdvice({ crop, forecast, alerts });

    return NextResponse.json({ forecast, alerts, advice });
  } catch (error) {
    console.error("Planting advice generation failed", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
