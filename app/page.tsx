import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { RotatingWord } from "@/components/rotating-word";
import { features } from "@/lib/dashboard-data";

export default function LandingPage() {
  const rotatingWords = features.map((f) => f.short);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Swiss-style hairlines framing the max-w-6xl (1152px) content column,
          running the full page height. */}
      <div
        className="pointer-events-none absolute inset-0 z-0 mx-auto max-w-6xl border-x border-border"
        aria-hidden="true"
      />

      <DashboardHeader />

      <main className="relative overflow-hidden">
        {/* Hero */}
        <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-16 text-center md:px-6 md:pb-24 md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            For every Indonesian farmer
          </span>

          {/* Motto — biggest text */}
          <h1 className="mt-6 font-serif text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground text-balance sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block">Agriculture,</span>
            <span className="block text-primary">Agrigated.</span>
          </h1>

          {/* Rotating feature word in place */}
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
            <span>One app for your</span>
            <RotatingWord words={rotatingWords} />
          </p>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Weather, market prices, dosage guidance and learning — every tool a farmer needs,
            aggregated into one place.
          </p>

          {/* Sign up button */}
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="/home"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Sign up free
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="/home"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-3.5 text-base font-semibold text-secondary-foreground transition-colors hover:bg-secondary"
            >
              I already farm here
            </a>
          </div>

          {/* Hero image */}
          <div className="relative mt-14 w-full overflow-hidden rounded-3xl border border-border shadow-sm">
            <Image
              src="/images/hero-farmland.png"
              alt="Aerial view of terraced green rice paddies in Indonesia at golden hour"
              width={1200}
              height={640}
              className="h-auto w-full object-cover"
              preload
            />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground md:px-6">
        Agri-Gator aggregates BMKG, PIHPS Nasional, Bapanas &amp; Kementan Cybex into one place.
      </footer>
    </div>
  );
}
