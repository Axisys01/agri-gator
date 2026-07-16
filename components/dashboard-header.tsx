import { headers } from "next/headers";
import { Bell } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserMenu } from "@/components/auth/user-menu";
import { FeatureSearch } from "@/components/feature-search";
import { HeaderLocationPicker } from "@/components/header-location-picker";
import { getUserLocation } from "@/lib/user-location";

export async function DashboardHeader() {
  // The session was already verified once in proxy.ts (which must run on
  // every request to refresh the auth cookie) — it forwards the result here
  // via headers so we don't pay for a second round trip to Supabase's Auth
  // server just to render sign-in state.
  const headerList = await headers();
  const userEmail = headerList.get("x-supabase-user-email");
  const userName = headerList.get("x-supabase-user-name");
  const userLabel = userName || userEmail;
  const location = userLabel ? await getUserLocation() : null;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 md:gap-4 md:px-6">
        <a
          href="/home"
          className="flex shrink-0 items-center gap-2"
          aria-label="Agri-Gator home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="size-9 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap font-serif text-lg font-bold tracking-tight text-foreground">
            Agri<span className="text-primary">-Gator</span>
          </span>
        </a>

        <FeatureSearch />

        {/* The search bar carries the ml-auto that pushes this group right, but
            it's hidden below md — so the group needs its own until then. */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* Only signed-in users get the picker — the choice is saved per account. */}
          {userLabel && <HeaderLocationPicker initial={location} />}

          <button
            type="button"
            className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-secondary-foreground transition-colors hover:bg-secondary"
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
      </div>
    </header>
  );
}
