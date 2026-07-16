import { NextRequest, NextResponse } from "next/server";
import { getWeatherForecast } from "@/lib/bmkg";

export async function GET(request: NextRequest) {
  const adm4 = request.nextUrl.searchParams.get("adm4");
  if (!adm4) {
    return NextResponse.json(
      { error: "Missing adm4 query parameter" },
      { status: 400 }
    );
  }

  try {
    const forecast = await getWeatherForecast(adm4);
    return NextResponse.json(forecast);
  } catch (error) {
    console.error("BMKG weather fetch failed", error);
    return NextResponse.json(
      { error: "Failed to fetch BMKG weather data" },
      { status: 502 }
    );
  }
}
