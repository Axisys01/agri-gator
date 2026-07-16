import { NextRequest, NextResponse } from "next/server";
import { getActiveWeatherAlerts } from "@/lib/bmkg";

export async function GET(request: NextRequest) {
  const regionsParam = request.nextUrl.searchParams.get("regions") ?? "";
  const regionNames = regionsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const alerts = await getActiveWeatherAlerts(regionNames);
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("BMKG alerts fetch failed", error);
    return NextResponse.json(
      { error: "Failed to fetch BMKG alerts" },
      { status: 502 }
    );
  }
}
