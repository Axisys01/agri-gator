// Client for BMKG's public open-data feeds. Attribution to BMKG (Badan
// Meteorologi, Klimatologi, dan Geofisika) is required wherever this data
// is displayed — see https://data.bmkg.go.id/prakiraan-cuaca/.
const WEATHER_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca";
const NOWCAST_ALERTS_URL = "https://www.bmkg.go.id/alerts/nowcast/id";

export interface WeatherEntry {
  localDatetime: string;
  tempC: number | null;
  humidityPct: number | null;
  weatherDesc: string;
  weatherDescEn: string;
  windSpeedKmh: number | null;
  windDir: string;
  cloudCoverPct: number | null;
  iconUrl: string | null;
}

export interface WeatherForecast {
  location: {
    adm4: string;
    desa: string;
    kecamatan: string;
    kotkab: string;
    provinsi: string;
    lat: number | null;
    lon: number | null;
  };
  entries: WeatherEntry[];
}

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function getWeatherForecast(adm4: string): Promise<WeatherForecast> {
  const res = await fetch(`${WEATHER_URL}?adm4=${encodeURIComponent(adm4)}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`BMKG weather request failed: ${res.status}`);
  }

  const json = await res.json();
  const lokasi = json?.lokasi ?? json?.data?.[0]?.lokasi ?? {};
  const cuacaGroups: unknown[] = json?.data?.[0]?.cuaca ?? [];

  const entries: WeatherEntry[] = (cuacaGroups.flat() as Record<string, unknown>[])
    .map((raw) => ({
      localDatetime: String(raw?.local_datetime ?? ""),
      tempC: toNumber(raw?.t),
      humidityPct: toNumber(raw?.hu),
      weatherDesc: String(raw?.weather_desc ?? ""),
      weatherDescEn: String(raw?.weather_desc_en ?? ""),
      windSpeedKmh: toNumber(raw?.ws),
      windDir: String(raw?.wd ?? ""),
      cloudCoverPct: toNumber(raw?.tcc),
      iconUrl: (raw?.image as string) ?? null,
    }))
    .filter((entry) => entry.localDatetime)
    .sort((a, b) => a.localDatetime.localeCompare(b.localDatetime));

  return {
    location: {
      adm4: String(lokasi?.adm4 ?? adm4),
      desa: String(lokasi?.desa ?? ""),
      kecamatan: String(lokasi?.kecamatan ?? ""),
      kotkab: String(lokasi?.kotkab ?? ""),
      provinsi: String(lokasi?.provinsi ?? ""),
      lat: toNumber(lokasi?.lat),
      lon: toNumber(lokasi?.lon),
    },
    entries,
  };
}

export interface WeatherAlert {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return "";
  return match[1]
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1")
    .trim();
}

/**
 * Pulls BMKG's nowcast/CAP early-warning RSS feed (extreme weather alerts,
 * updated in near real time) and filters it down to items that mention any
 * of the given region names (e.g. a farmer's kabupaten/kota or provinsi).
 */
export async function getActiveWeatherAlerts(
  regionNames: string[]
): Promise<WeatherAlert[]> {
  const res = await fetch(NOWCAST_ALERTS_URL, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    // The header renders on every page, and Next doesn't cache fetch by
    // default — uncached, each navigation would put BMKG on the critical path
    // of the whole app, so an outage there would become an outage here. The
    // feed is national (identical bytes for every user; filtering happens
    // below), so one cached copy serves everyone.
    //
    // Kept deliberately short: observed nowcasts publish only ~10 minutes
    // ahead of the event, so a long window would eat the entire warning.
    next: { revalidate: 180 },
  });

  if (!res.ok) {
    throw new Error(`BMKG alerts request failed: ${res.status}`);
  }

  const xml = await res.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  const alerts: WeatherAlert[] = items.map((item) => ({
    title: extractTag(item, "title"),
    description: extractTag(item, "description"),
    link: extractTag(item, "link"),
    pubDate: extractTag(item, "pubDate"),
  }));

  const needles = regionNames.map((name) => name.trim().toLowerCase()).filter(Boolean);
  if (needles.length === 0) return alerts;

  return alerts.filter((alert) => {
    const haystack = `${alert.title} ${alert.description}`.toLowerCase();
    return needles.some((needle) => haystack.includes(needle));
  });
}
