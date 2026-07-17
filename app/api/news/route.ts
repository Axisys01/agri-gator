import { NextRequest, NextResponse } from "next/server";
import { getAgricultureNews } from "@/lib/news";

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1") || 1;

  try {
    const result = await getAgricultureNews(page);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[news] route failed", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
