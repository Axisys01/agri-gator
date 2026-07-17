"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NewsArticle } from "@/lib/news";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function NewsCard({ article }: { article: NewsArticle }) {
  // The current NEWS_API_KEY's plan redacts article URLs/images/source domain
  // (see lib/news.ts) — those come through as null, so this renders as a
  // plain non-clickable card instead of a link to nowhere.
  const Wrapper = article.url ? "a" : "div";

  return (
    <Wrapper
      {...(article.url
        ? { href: article.url, target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      {article.imageUrl && (
        <div className="hidden size-24 shrink-0 overflow-hidden rounded-xl bg-secondary sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl}
            alt=""
            className="size-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {article.sourceName && (
            <span className="font-semibold text-secondary-foreground">{article.sourceName}</span>
          )}
          {article.publishedAt && <span>· {formatDate(article.publishedAt)}</span>}
        </div>
        <h3 className="mt-1 line-clamp-2 font-serif text-base font-bold text-foreground group-hover:text-primary">
          {article.title}
        </h3>
        {article.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.description}</p>
        )}
      </div>
    </Wrapper>
  );
}

export function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const nextPageRef = useRef(1);
  const loadedPagesRef = useRef(new Set<number>());
  const loadingRef = useRef(false);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current) return;
    const pageToLoad = nextPageRef.current;
    if (loadedPagesRef.current.has(pageToLoad)) return;
    loadedPagesRef.current.add(pageToLoad);

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    console.log("[news-feed] loading page", pageToLoad);

    try {
      const res = await fetch(`/api/news?page=${pageToLoad}`);
      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        throw new Error(data?.error ?? `Request failed with status ${res.status}`);
      }

      console.log("[news-feed] loaded page", pageToLoad, `(${data.articles.length} articles)`);
      setArticles((prev) => [...prev, ...data.articles]);
      setHasMore(data.hasMore);
      nextPageRef.current = pageToLoad + 1;
    } catch (err) {
      console.error("[news-feed] failed to load page", pageToLoad, err);
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNextPage();
  }, [loadNextPage]);

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: "600px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}

      {loading && (
        <p className="py-4 text-center text-sm text-muted-foreground">Loading more news...</p>
      )}
      {error && (
        <p className="py-4 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {!hasMore && articles.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
