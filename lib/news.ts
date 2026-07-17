// Agriculture news via APITube, scoped to industry.agriculture_news. Trial keys redact
// href/image/source.domain behind an "[Upgrade subscription plan]" placeholder; those
// come through as null here instead of rendering as broken links.
const NEWS_API_URL = "https://api.apitube.io/v1/news/everything";
const AGRICULTURE_TOPIC_ID = "industry.agriculture_news";
const PAGE_SIZE = 12;
const REDACTED_MARKER = "[Upgrade subscription plan]";

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  publishedAt: string;
}

export interface NewsPage {
  articles: NewsArticle[];
  page: number;
  hasMore: boolean;
}

interface RawArticle {
  id?: number;
  href?: string;
  title?: string;
  description?: string | null;
  published_at?: string;
  image?: string | null;
  source?: { domain?: string };
}

function redactedToNull(value: string | null | undefined): string | null {
  if (!value || value.includes(REDACTED_MARKER)) return null;
  return value;
}

export async function getAgricultureNews(page = 1): Promise<NewsPage> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("NEWS_API_KEY is not configured");
  }

  const url = new URL(NEWS_API_URL);
  url.searchParams.set("topic.id", AGRICULTURE_TOPIC_ID);
  url.searchParams.set("language.code", "en");
  url.searchParams.set("sort.by", "published_at");
  url.searchParams.set("sort.order", "desc");
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(PAGE_SIZE));

  console.log(`[news] fetching page=${page} topic=${AGRICULTURE_TOPIC_ID}`);

  const res = await fetch(url, {
    headers: { "X-API-Key": apiKey },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json || json.status !== "ok") {
    const message =
      json?.errors?.[0]?.message ?? `${res.status} ${res.statusText}`;
    console.error("[news] request failed:", message);
    throw new Error(`APITube request failed: ${message}`);
  }

  const rawArticles: RawArticle[] = json.results ?? [];

  const articles: NewsArticle[] = rawArticles
    .filter((raw) => raw?.title)
    .map((raw) => ({
      id: String(raw.id ?? `${page}-${raw.title}`),
      title: raw.title ?? "Untitled",
      description: redactedToNull(raw.description ?? null),
      url: redactedToNull(raw.href ?? null),
      imageUrl: redactedToNull(raw.image ?? null),
      sourceName: redactedToNull(raw.source?.domain ?? null),
      publishedAt: raw.published_at ?? "",
    }));

  return {
    articles,
    page,
    hasMore: Boolean(json.has_next_pages),
  };
}
