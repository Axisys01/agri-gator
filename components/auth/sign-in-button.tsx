"use client";

import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

// The header chip. Callers that need a different shape (the landing hero) pass
// their own className rather than this being restyled per usage.
const HEADER_CLASS =
  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80";

export function SignInButton({
  children,
  className = HEADER_CLASS,
}: {
  children?: ReactNode;
  className?: string;
}) {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button type="button" onClick={signInWithGoogle} className={className}>
      {children ?? "Sign in with Google"}
    </button>
  );
}
