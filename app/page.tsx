import { ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { RotatingWord } from "@/components/rotating-word";
import { features } from "@/lib/dashboard-data";
import { SignInButton } from "@/components/auth/sign-in-button";
import { FeatureShowcase } from "@/components/feature-showcase";

export default function LandingPage() {
  const rotatingWords = features.map((f) => f.short);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Swiss-style hairlines framing the max-w-6xl (1152px) content column, running the full page height. */}
      <div
        className="pointer-events-none absolute inset-0 z-0 mx-auto max-w-6xl border-x border-border"
        aria-hidden="true"
      />

      <DashboardHeader />

      <main className="relative overflow-hidden">
        <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-16 text-center md:px-6 md:pb-24 md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            For every Indonesian farmer....
          </span>

          <h1 className="mt-6 font-serif text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground text-balance sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block">Agriculture,</span>
            <span className="block text-primary">Agrigated.</span>
          </h1>

          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
            <span>One app for your</span>
            <RotatingWord words={rotatingWords} />
          </p>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Weather, market prices, dosage guidance and learning: every tool a
            farmer needs, aggregated into one place.
          </p>

          {/* Google OAuth makes signup and signin the same action, so one button covers both. */}
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <SignInButton className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
              Sign up free
              <ArrowRight className="size-4" aria-hidden="true" />
            </SignInButton>
          </div>

          {/* Shows the modules exist via tabs of real screenshots, rather than just asserting it. */}
          <FeatureShowcase />
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground md:px-6">
        Agri-Gator aggregates all your farmer needs!
      </footer>
    </div>
  );
}
