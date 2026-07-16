import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let refreshedCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          refreshedCookies = cookiesToSet;
        },
      },
    }
  );

  // Refreshes the session cookie if it's expired. Required because Server
  // Components can read cookies but can't write them. This is also the only
  // place that should ever call getUser() — it's forwarded to Server
  // Components via headers below so they don't need to verify it again.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Clone + overwrite (never trust-passthrough) so a client can't spoof
  // these by sending them on the original request.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-supabase-user-email", user?.email ?? "");
  requestHeaders.set("x-supabase-user-name", user?.user_metadata?.name ?? "");

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  refreshedCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));

  return response;
}
