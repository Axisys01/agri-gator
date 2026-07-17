// Geodesic polygon area via spherical excess (same approach turf.js uses, reimplemented since
// it's ~15 lines and turf is a large dependency for one function). Lat/lng aren't flat X/Y: a
// degree of longitude shrinks toward the poles, and this number feeds into a pesticide dose, so
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
