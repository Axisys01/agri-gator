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
    console.log(`[planting-advice] fetching BMKG forecast for adm4=${adm4}`);
    const forecast = await getWeatherForecast(adm4);

    console.log(
      `[planting-advice] fetching alerts for regions=${[
        forecast.location.kotkab,
        forecast.location.provinsi,
      ].join(", ")}`
    );
    const alerts = await getActiveWeatherAlerts(
      [forecast.location.kotkab, forecast.location.provinsi].filter(Boolean)
    );

    console.log(`[planting-advice] calling Gemini for crop=${cropId}`);
    const advice = await getPlantingAdvice({ crop, forecast, alerts });

    console.log("[planting-advice] success");
    return NextResponse.json({ forecast, alerts, advice });
  } catch (error) {
    console.error("[planting-advice] FAILED:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
