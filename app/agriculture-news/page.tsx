import { Newspaper } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { NewsFeed } from "@/app/components/NewsFeed";

export default function AgricultureNewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 z-0 mx-auto max-w-6xl border-x border-border"
        aria-hidden="true"
      />
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Newspaper className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Agriculture News
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            The latest farming, crop, and agriculture policy news, aggregated
            into one feed. Scroll for more.
          </p>
        </div>

        <NewsFeed />
      </main>
    </div>
  );
}
