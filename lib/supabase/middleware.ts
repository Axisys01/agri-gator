import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let refreshedCookies: {
    name: string;
    value: string;
    options: Record<string, unknown>;
  }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          refreshedCookies = cookiesToSet;
        },
      },
    },
  );

  // Refreshes the session cookie if it's expired. Required because Server
  // Components can read cookies but can't write them. This is also the only
  // place that should ever call getUser() — it's forwarded to Server
  // Components via headers below so they don't need to verify it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Attach any cookies Supabase rotated during getUser() to the outgoing
  // response. Must run on *every* response we return — including redirects —
  // or a session refreshed on this request never reaches the browser, which
  // leaves it holding an already-used refresh token and causes intermittent
  // "randomly logged out" failures.
  const withRefreshedCookies = (response: NextResponse) => {
    refreshedCookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options),
    );
    return response;
  };

  // Routes that don't require authentication
  const publicRoutes = ["/", "/login", "/auth/callback"];

  // If not logged in and trying to access a protected page
  if (!user && !publicRoutes.includes(pathname)) {
    return withRefreshedCookies(
      NextResponse.redirect(new URL("/", request.url)),
    );
  }

  // If already logged in, don't let them stay on landing/login
  if (user && (pathname === "/" || pathname === "/login")) {
    return withRefreshedCookies(
      NextResponse.redirect(new URL("/home", request.url)),
    );
  }

  // Clone + overwrite (never trust-passthrough) so a client can't spoof
  // these by sending them on the original request.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-supabase-user-email", user?.email ?? "");
  requestHeaders.set("x-supabase-user-name", user?.user_metadata?.name ?? "");

  return withRefreshedCookies(
    NextResponse.next({ request: { headers: requestHeaders } }),
  );
}
