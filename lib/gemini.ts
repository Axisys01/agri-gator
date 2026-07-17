import type { Crop } from "./crops";
import type { WeatherAlert, WeatherForecast } from "./bmkg";

const INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";
const DEFAULT_MODEL = "gemini-3.5-flash";

export interface PlantingAdvice {
  plantingWindow: string;
  estimatedHarvestWindow: string;
  riskLevel: "low" | "medium" | "high";
  reasoning: string;
  actionItems: string[];
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    plantingWindow: { type: "string" },
    estimatedHarvestWindow: { type: "string" },
    riskLevel: { type: "string", enum: ["low", "medium", "high"] },
    reasoning: { type: "string" },
    actionItems: { type: "array", items: { type: "string" } },
  },
  required: [
    "plantingWindow",
    "estimatedHarvestWindow",
    "riskLevel",
    "reasoning",
    "actionItems",
  ],
};

function summarizeForecast(forecast: WeatherForecast): string {
  return forecast.entries
    .map(
      (e) =>
        `${e.localDatetime}: ${e.tempC}°C, humidity ${e.humidityPct}%, ${
          e.weatherDescEn || e.weatherDesc
        }, wind ${e.windSpeedKmh}km/h`
    )
    .join("\n");
}

export async function getPlantingAdvice(params: {
  crop: Crop;
  forecast: WeatherForecast;
  alerts: WeatherAlert[];
}): Promise<PlantingAdvice> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const { crop, forecast, alerts } = params;
  const { location } = forecast;

  const prompt = `You are an agricultural extension advisor for smallholder farmers in Indonesia.

Location: ${location.desa}, ${location.kecamatan}, ${location.kotkab}, ${location.provinsi}
Crop: ${crop.nameId} (${crop.name})
Typical growth duration: ${crop.growthDurationDays[0]}-${crop.growthDurationDays[1]} days
Water need: ${crop.waterNeed}
Crop notes: ${crop.notes}

BMKG 3-day forecast (3-hour steps):
${summarizeForecast(forecast) || "No forecast data available."}

Active BMKG extreme weather warnings for this region:
${
  alerts.length > 0
    ? alerts.map((a) => `- ${a.title}: ${a.description}`).join("\n")
    : "None reported."
}

Based on this forecast, this crop's water needs, and any active warnings, advise the farmer:
1. Whether now is a good planting window, and if not, what to wait for.
2. An estimated harvest window if planted within the recommended window.
3. An overall risk level for planting now.
4. A short reasoning paragraph in plain language a farmer can understand.
5. 3-5 concrete action items.

Note the forecast only covers 3 days; be explicit when longer-term timing should
also consider the regional wet/dry season pattern rather than the short-term forecast alone.`;

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  console.log(`[gemini] requesting advice, model=${model} endpoint=${INTERACTIONS_URL}`);

  const res = await fetch(INTERACTIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      system_instruction:
        "Respond only with JSON matching the provided schema. Be concrete and practical; avoid hedging language a farmer can't act on.",
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: RESPONSE_SCHEMA,
      },
      generation_config: { temperature: 0.4 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (res.status === 429) {
      console.error(`[gemini] 429 RATE LIMITED (model=${model}):`, errText);
      throw new Error(
        `Gemini rate limit reached (429) for model "${model}". You've hit your quota: check usage at aistudio.google.com or wait for it to reset.`
      );
    }
    console.error(`[gemini] request failed, status=${res.status} model=${model}:`, errText);
    throw new Error(`Gemini request failed: ${res.status} ${errText}`);
  }

  console.log("[gemini] response OK, parsing output...");
  const json = await res.json();
  // steps can include non-output entries (e.g. type: "thought") before model_output, so find it
  // rather than assume steps[0].
  const modelOutputStep = (json?.steps ?? [])
    .filter((step: { type?: string }) => step?.type === "model_output")
    .pop();
  const text: string | undefined =
    json?.output_text ??
    modelOutputStep?.content?.find((part: { type?: string }) => part?.type === "text")?.text;

  if (!text) {
    throw new Error("Gemini response did not include any output text");
  }

  return JSON.parse(text) as PlantingAdvice;
}
