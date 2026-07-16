"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleUserCommodity } from "@/app/actions/commodities";

export function FavoriteCommodityButton({
  commodity,
  initialPinned,
}: {
  commodity: string;
  initialPinned: boolean;
}) {
  const [pinned, setPinned] = useState(initialPinned);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !pinned;
    setPinned(next);

    startTransition(async () => {
      const { error } = await toggleUserCommodity(commodity, next);
      if (error) setPinned(!next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={pinned}
      aria-label={
        pinned ? `Unpin ${commodity} from your dashboard` : `Pin ${commodity} to your dashboard`
      }
      title={pinned ? "Unpin from dashboard" : "Pin to dashboard"}
      className="flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-secondary"
    >
      <Heart
        className={`size-4 transition-colors ${
          pinned ? "fill-primary text-primary" : "text-muted-foreground"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
