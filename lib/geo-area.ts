// Geodesic polygon area via spherical excess — the same approach turf.js uses,
// reimplemented because it's ~15 lines and turf is a large dependency for one
// function.
//
// Treating lat/lng as flat X/Y would be wrong: a degree of longitude is ~110km
// at the equator and shrinks toward the poles, so a naive planar calculation
// skews with latitude. This number multiplies through into a pesticide dose, so
// it has to be right rather than close.
const EARTH_RADIUS_M = 6378137; // WGS84 equatorial radius

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** Area in m² of a ring of [lat, lng] points (Leaflet's coordinate order). */
export function polygonAreaM2(ring: [number, number][]): number {
  if (ring.length < 3) return 0;

  let total = 0;
  for (let i = 0; i < ring.length; i++) {
    const lower = ring[i];
    const middle = ring[(i + 1) % ring.length];
    const upper = ring[(i + 2) % ring.length];

    total +=
      (toRadians(upper[1]) - toRadians(lower[1])) * Math.sin(toRadians(middle[0]));
  }

  return Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

export const M2_PER_HA = 10000;
