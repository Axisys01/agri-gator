import { headers } from "next/headers";
import { Bell, MapPin, Search } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserMenu } from "@/components/auth/user-menu";

export async function DashboardHeader() {
  // The session was already verified once in proxy.ts (which must run on
  // every request to refresh the auth cookie) — it forwards the result here
  // via headers so we don't pay for a second round trip to Supabase's Auth
  // server just to render sign-in state.
  const headerList = await headers();
  const userEmail = headerList.get("x-supabase-user-email");
  const userName = headerList.get("x-supabase-user-name");
  const userLabel = userName || userEmail;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
        <a
          href="/home"
          className="flex items-center gap-2"
          aria-label="Agri-Gator home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="size-9 shrink-0" aria-hidden="true" />
          <span className="font-serif text-lg font-bold tracking-tight text-foreground">
            Agri<span className="text-primary">-Gator</span>
          </span>
        </a>

        <div className="ml-auto hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:flex md:w-72">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search crops, prices, guides..."
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            aria-label="Search"
          />
        </div>

        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary sm:flex"
        >
          <MapPin className="size-4 text-primary" aria-hidden="true" />
          Sragen, Jawa Tengah
        </button>

        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-full border border-border bg-card text-secondary-foreground transition-colors hover:bg-secondary"
          aria-label="Notifications"
        >
          <Bell className="size-5" aria-hidden="true" />
          <span
            className="absolute right-2 top-2 size-2 rounded-full bg-accent"
            aria-hidden="true"
          />
        </button>

        {userLabel ? <UserMenu label={userLabel} /> : <SignInButton />}
      </div>
    </header>
  );
}
