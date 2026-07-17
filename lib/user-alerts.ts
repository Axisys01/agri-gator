import "server-only";

import { getActiveWeatherAlerts, type WeatherAlert } from "@/lib/bmkg";
import { getUserLocation } from "@/lib/user-location";
import type { LocationResult } from "@/lib/wilayah";

export interface UserWeatherAlerts {
  location: LocationResult | null;
  alerts: WeatherAlert[];
}

export async function getUserWeatherAlerts(): Promise<UserWeatherAlerts> {
  const location = await getUserLocation();
  if (!location) return { location: null, alerts: [] };

  try {
    // BMKG names the provinsi in the alert title ("Hujan Lebat ... di Riau")
    // and lists kecamatan in the description, but never the kabupaten/kota —
    // so kecamatan is what gives a precise local match, and provinsi is a
    // deliberately broad fallback. Over-warning beats under-warning here.
    const alerts = await getActiveWeatherAlerts([
      location.kecamatan,
      location.kotkab,
      location.provinsi,
    ]);
    return { location, alerts };
  } catch (error) {
    // This feeds the header, which renders on every page — letting a BMKG
    // outage throw would take the entire app down with it.
    console.error("Failed to load BMKG alerts:", error);
    return { location, alerts: [] };
  }
}
