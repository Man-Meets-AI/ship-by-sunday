import type { ReactNode } from "react";
import Link from "next/link";

import { BrandLockup } from "@/components/layout/brand-lockup";

type PublicHeaderLink = {
  label: string;
  href: string;
};

type PublicHeaderProps = {
  links: PublicHeaderLink[];
  actions?: ReactNode;
};

export function PublicHeader({ links, actions }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex flex-col gap-3 py-3 sm:gap-4 sm:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4 lg:gap-8">
              <BrandLockup href="/" />
              <nav
                aria-label="Primary"
                className="hidden min-w-0 items-center gap-2 lg:flex lg:flex-wrap"
              >
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            {actions ? (
              <div className="flex w-full items-center md:w-auto md:justify-end">
                {actions}
              </div>
            ) : null}
          </div>
        </div>
        <div className="lg:hidden">
          <nav
            aria-label="Section shortcuts"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-md border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
