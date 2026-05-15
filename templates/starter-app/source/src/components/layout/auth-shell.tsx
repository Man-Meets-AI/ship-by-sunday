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
      className="px-4 py-8 sm:px-6 lg:px-12 xl:px-16 2xl:px-20"
    >
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,32rem)] lg:items-start xl:gap-12">
        <section className="space-y-6 pt-2 lg:pt-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          <ul className="grid list-none gap-3 p-0 sm:grid-cols-3">
            {points.map((point) => (
              <li
                key={point}
                className="rounded-lg border bg-card p-4 text-sm leading-6 text-muted-foreground"
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

        <Card>
          <CardContent className="flex items-center justify-center p-6 sm:p-8">
            {children}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
