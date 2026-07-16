import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard-header";

export default function NotFound() {
  return (
    <div>
      <DashboardHeader />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Leaf className="size-7" aria-hidden="true" />
        </span>

        <p className="mt-6 font-serif text-7xl font-bold tracking-tight text-foreground md:text-8xl">
          404
        </p>
        <h1 className="mt-2 font-serif text-xl font-bold tracking-tight text-foreground text-balance md:text-2xl">
          This field doesn&apos;t exist.
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground text-balance">
          The page you&apos;re looking for isn&apos;t here. It may have been
          moved or the link might be wrong.
        </p>

        <Button
          className="mt-8"
          nativeButton={false}
          render={<Link href="/">Go back to home page</Link>}
        />
      </div>
    </div>
  );
}
