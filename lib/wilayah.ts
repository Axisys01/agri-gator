// Indonesian administrative region codes (Permendagri 72/2019), the same
// adm1-adm4 hierarchy BMKG uses to key its weather data. Lets farmers search
// for their village by name instead of needing to know a raw adm4 code.
const WILAYAH_CSV_URL =
  "https://raw.githubusercontent.com/kodewilayah/permendagri-72-2019/main/dist/base.csv";

interface VillageEntry {
  adm4: string;
  desa: string;
  kecamatan: string;
  kotkab: string;
  provinsi: string;
}

export interface LocationResult extends VillageEntry {
  label: string;
}

let indexPromise: Promise<VillageEntry[]> | null = null;

async function buildIndex(): Promise<VillageEntry[]> {
  const res = await fetch(WILAYAH_CSV_URL);
  if (!res.ok) {
    throw new Error(`Failed to load wilayah dataset: ${res.status}`);
  }
  const text = await res.text();

  const provinces = new Map<string, string>();
  const regencies = new Map<string, string>();
  const districts = new Map<string, string>();
  const villages: { code: string; name: string }[] = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const commaIndex = trimmed.indexOf(",");
    if (commaIndex === -1) continue;

    const code = trimmed.slice(0, commaIndex).trim();
    const name = trimmed.slice(commaIndex + 1).trim();
    const depth = code.split(".").length;

    if (depth === 1) provinces.set(code, name);
    else if (depth === 2) regencies.set(code, name);
    else if (depth === 3) districts.set(code, name);
    else if (depth === 4) villages.push({ code, name });
  }

  return villages.map(({ code, name }) => {
    const [p, r, d] = code.split(".");
    return {
      adm4: code,
      desa: name,
      kecamatan: districts.get(`${p}.${r}.${d}`) ?? "",
      kotkab: regencies.get(`${p}.${r}`) ?? "",
      provinsi: provinces.get(p) ?? "",
    };
  });
}

function getIndex(): Promise<VillageEntry[]> {
  if (!indexPromise) {
    // Cache the parsed ~90k-row dataset for the life of the server process
    // instead of re-downloading/re-parsing it on every search request.
    indexPromise = buildIndex().catch((error) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

export async function searchLocations(
  query: string,
  limit = 15
): Promise<LocationResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const entries = await getIndex();
  const matches: LocationResult[] = [];

  for (const entry of entries) {
    const haystack =
      `${entry.desa} ${entry.kecamatan} ${entry.kotkab} ${entry.provinsi}`.toLowerCase();
    if (haystack.includes(q)) {
      matches.push({
        ...entry,
        label: `${entry.desa}, ${entry.kecamatan}, ${entry.kotkab}, ${entry.provinsi}`,
      });
      if (matches.length >= limit * 8) break; // cap scan cost once we have plenty of candidates
    }
  }

  matches.sort((a, b) => {
    const aStarts = a.desa.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.desa.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts;
  });

  return matches.slice(0, limit);
}
