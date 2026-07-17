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
    // BMKG names provinsi in the alert title and kecamatan in the description but never
    // kabupaten/kota, so kecamatan gives the precise match and provinsi is the broad fallback;
    // over-warning beats under-warning here.
    const alerts = await getActiveWeatherAlerts([
      location.kecamatan,
      location.kotkab,
      location.provinsi,
    ]);
    return { location, alerts };
  } catch (error) {
    // This feeds the header, which renders on every page, so a BMKG outage must not throw and take the app down with it.
    console.error("Failed to load BMKG alerts:", error);
    return { location, alerts: [] };
  }
}
