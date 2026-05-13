import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  secondaryLink: {
    href: string;
    label: string;
    external?: boolean;
  };
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  points,
  secondaryLink,
  children,
}: AuthShellProps) {
  return (
    <main
      id="main-content"
      className="relative overflow-hidden px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 dark:bg-zinc-950"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.16),transparent_45%),radial-gradient(circle_at_top_right,rgba(24,24,27,0.08),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_40%),radial-gradient(circle_at_top_right,rgba(244,244,245,0.08),transparent_30%)]"
      />
      <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,32rem)] lg:items-start xl:gap-16">
        <section className="space-y-8 pt-4 lg:pt-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
              {eyebrow}
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {description}
            </p>
          </div>
          <ul className="grid list-none gap-3 p-0 sm:grid-cols-3">
            {points.map((point) => (
              <li
                key={point}
                className="rounded-3xl border border-zinc-200/80 bg-white/90 p-4 text-sm leading-6 text-zinc-700 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300"
              >
                {point}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              {secondaryLink.external ? (
                <a href={secondaryLink.href} rel="noreferrer" target="_blank">
                  {secondaryLink.label}
                </a>
              ) : (
                <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
              )}
            </Button>
          </div>
        </section>

        <Card className="border-zinc-200/80 bg-white/95 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-center p-6 sm:p-8">
            {children}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
