/**
 * Pulls food prices from PIHPS Nasional (Bank Indonesia) into Supabase.
 *
 * This is the *only* thing that should ever call PIHPS. The app reads
 * commodity_prices and never touches bi.go.id, so a farmer opening the
 * dashboard costs Bank Indonesia nothing and doesn't wait on their uptime.
 * Run it once a day.
 *
 *   npx tsx scripts/import-prices.mts --dry-run   # fetch + parse, write nothing
 *   npx tsx scripts/import-prices.mts             # fetch + upsert
 *   npx tsx scripts/import-prices.mts --days=180  # longer backfill
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY: RLS blocks anon writes, and it must stay
 * server-side — it bypasses RLS entirely. Never expose it to the browser.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BASE = "https://www.bi.go.id/hargapangan/WebSite/TabelHarga";

// From GetRefPriceType. 1 is what shoppers pay at the pasar; 4 is what farmers
// actually receive, which is the number worth holding against a buyer's offer.
const PRICE_TYPES = [
  { id: 1, name: "Pasar Tradisional" },
  { id: 4, name: "Produsen" },
] as const;

const DEFAULT_DAYS = 90;
// Sequential with a pause — this is a government service doing us a favour.
const DELAY_MS = 400;
// ~70 calls in a row over a phone hotspot will drop connections and PIHPS
// pushes back if pressed; without retries a single blip silently loses a whole
// province.
const MAX_ATTEMPTS = 4;

interface ProvinceRef {
  id: number | string;
  name: string;
}

interface GridRow {
  no: string | number;
  name: string;
  level: number;
  [dateOrField: string]: unknown;
}

// A type alias, not an interface: GenericTable wants Row/Insert to satisfy
// Record<string, unknown>, and interfaces have no implicit index signature —
// so an interface here fails the constraint and collapses every insert to
// `never` with a error that points at the call site instead of the cause.
type PriceRow = {
  commodity: string;
  date: string;
  price: number;
  province: string;
  price_type: string;
};

// Without a schema generic supabase-js types every insert payload as `never`.
// This is the only table the script touches, so declaring it here beats
// generating types for the whole database.
interface Database {
  public: {
    Tables: {
      commodity_prices: {
        Row: PriceRow;
        Insert: PriceRow;
        Update: Partial<PriceRow>;
        Relationships: [];
      };
    };
    // GenericSchema wants Record<string, GenericView>; Record<string, never>
    // fails that constraint, which quietly collapses every insert type to
    // `never`. This is the empty-record form supabase's own codegen emits.
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
}

type PriceClient = SupabaseClient<Database>;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const days = Number(args.find((a) => a.startsWith("--days="))?.split("=")[1] ?? DEFAULT_DAYS);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** "14,200" -> 14200. Returns null for gaps ("-", "", null, junk). */
function parsePrice(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** "16/07/2026" -> "2026-07-16" */
function toIsoDate(ddmmyyyy: string): string | null {
  const m = ddmmyyyy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

async function getJson<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json, text/javascript, */*; q=0.01" },
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(`${path} returned ${res.status}`);
      return (await res.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) break;
      // Back off rather than hammer something that just reset on us.
      await sleep(DELAY_MS * 2 ** attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${path} failed`);
}

async function fetchGrid(
  priceTypeId: number,
  provinceId: string,
  startDate: string,
  endDate: string,
): Promise<GridRow[]> {
  const { data } = await getJson<{ data: GridRow[] }>("GetGridDataDaerah", {
    price_type_id: String(priceTypeId),
    comcat_id: "",
    province_id: provinceId,
    regency_id: "",
    market_id: "",
    tipe_laporan: "1",
    start_date: startDate,
    end_date: endDate,
  });
  return data ?? [];
}

/**
 * The grid comes back wide — each row is a commodity and every date is its own
 * key ("01/07/2026": "14,200") — so it has to be unpivoted into one row per
 * commodity/date to match the table.
 */
function toPriceRows(grid: GridRow[], province: string, priceType: string): PriceRow[] {
  const rows: PriceRow[] = [];

  for (const row of grid) {
    if (typeof row.name !== "string" || !row.name.trim()) continue;

    for (const [key, value] of Object.entries(row)) {
      const date = toIsoDate(key);
      if (!date) continue; // no/name/level and anything else non-date

      const price = parsePrice(value);
      if (price === null) continue; // unreported day — skip rather than store a 0

      rows.push({ commodity: row.name.trim(), date, price, province, price_type: priceType });
    }
  }

  return rows;
}

async function upsert(client: PriceClient, rows: PriceRow[]) {
  const CHUNK = 1000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await client
      .from("commodity_prices")
      .upsert(chunk, { onConflict: "commodity,date,province,price_type" });
    if (error) throw new Error(`upsert failed: ${error.message}`);
  }
}

async function main() {
  const startDate = isoDaysAgo(days);
  const endDate = isoDaysAgo(0);

  let client: PriceClient | null = null;
  if (!dryRun) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (RLS blocks anon writes).",
      );
    }
    client = createClient<Database>(url, key, { auth: { persistSession: false } });
  }

  const { data: provinceRefs } = await getJson<{ data: ProvinceRef[] }>("GetRefProvince");

  // province_id="" is every province at once — the national average, and the
  // sensible default for a user who hasn't set a location.
  const targets: ProvinceRef[] = [{ id: "", name: "Nasional" }, ...provinceRefs];

  console.log(
    `PIHPS -> Supabase | ${startDate}..${endDate} | ${targets.length} provinces x ${PRICE_TYPES.length} price types${dryRun ? " | DRY RUN" : ""}`,
  );

  let total = 0;
  const skipped: string[] = [];

  for (const priceType of PRICE_TYPES) {
    for (const province of targets) {
      const label = `${priceType.name} / ${province.name}`;
      try {
        const grid = await fetchGrid(priceType.id, String(province.id), startDate, endDate);
        const rows = toPriceRows(grid, province.name, priceType.name);

        if (rows.length === 0) {
          skipped.push(`${label} (no data)`);
        } else if (client) {
          await upsert(client, rows);
        }

        total += rows.length;
        console.log(`  ${label.padEnd(38)} ${String(rows.length).padStart(6)} rows`);
      } catch (error) {
        // One flaky province shouldn't lose the other 33.
        skipped.push(`${label} (${error instanceof Error ? error.message : "error"})`);
        console.log(`  ${label.padEnd(38)} FAILED`);
      }

      await sleep(DELAY_MS);
    }
  }

  console.log(`\n${dryRun ? "Parsed" : "Imported"} ${total} rows.`);
  if (skipped.length) console.log(`Skipped ${skipped.length}:\n  - ${skipped.join("\n  - ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
