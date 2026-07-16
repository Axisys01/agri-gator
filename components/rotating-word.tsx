"use client";

import { useEffect, useState } from "react";

export function RotatingWord({
  words,
  intervalMs = 2000,
}: {
  words: string[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  // Stack every word in the same grid cell so the box sizes to the longest
  // word and the surrounding text never reflows as words swap.
  return (
    <span className="relative inline-grid text-primary">
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden={i !== index}
          className={`col-start-1 row-start-1 transition-all duration-500 ${
            i === index
              ? "translate-y-0 opacity-100 blur-0"
              : "pointer-events-none translate-y-1 opacity-0 blur-sm"
          }`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
