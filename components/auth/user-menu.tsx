"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function initialsFrom(label: string) {
  return label.slice(0, 2).toUpperCase();
}

export function UserMenu({ label }: { label: string }) {
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-sm font-bold text-secondary-foreground"
        title={label}
        aria-label="User avatar"
      >
        {initialsFrom(label)}
      </div>
      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-secondary-foreground transition-colors hover:bg-secondary"
      >
        <LogOut className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
