// Agriculture news feed backed by NewsAPI.org's `/v2/everything` endpoint.
// Free-tier "Developer" keys are restricted to localhost/non-production use —
// see https://newsapi.org/pricing before deploying this anywhere public.
const NEWS_API_URL = "https://newsapi.org/v2/everything";
const DEFAULT_QUERY = "agriculture OR farming OR pertanian OR petani OR crop";
const PAGE_SIZE = 12;

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string;
}

export interface NewsPage {
  articles: NewsArticle[];
  page: number;
  hasMore: boolean;
}

interface RawArticle {
  title?: string;
  description?: string | null;
  url?: string;
  urlToImage?: string | null;
  publishedAt?: string;
  source?: { name?: string };
}

export async function getAgricultureNews(
  page = 1,
  query = DEFAULT_QUERY
): Promise<NewsPage> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("NEWS_API_KEY is not configured");
  }

  const url = new URL(NEWS_API_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(PAGE_SIZE));

  console.log(`[news] fetching page=${page} query="${query}"`);

  const res = await fetch(url, {
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(`[news] request failed — status=${res.status}:`, errText);
    throw new Error(`News API request failed: ${res.status} ${errText}`);
  }

  const json = await res.json();
  const rawArticles: RawArticle[] = json?.articles ?? [];
  const totalResults: number = json?.totalResults ?? 0;

  const articles: NewsArticle[] = rawArticles
    .filter((raw) => raw?.title && raw.title !== "[Removed]")
    .map((raw, i) => ({
      id: `${page}-${i}-${raw.url ?? i}`,
      title: raw.title ?? "Untitled",
      description: raw.description ?? null,
      url: raw.url ?? "#",
      imageUrl: raw.urlToImage ?? null,
      sourceName: raw.source?.name ?? "Unknown source",
      publishedAt: raw.publishedAt ?? "",
    }));

  return {
    articles,
    page,
    hasMore: page * PAGE_SIZE < totalResults,
  };
}
