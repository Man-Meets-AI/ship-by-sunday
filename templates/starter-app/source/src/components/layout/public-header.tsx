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
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-[rgba(244,241,234,0.82)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-[rgba(9,9,11,0.82)]">
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
                    className="rounded-full px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-white/80 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-zinc-400 dark:hover:bg-zinc-950/60 dark:hover:text-zinc-50 dark:focus-visible:ring-white"
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
                className="whitespace-nowrap rounded-full border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:text-zinc-50 dark:focus-visible:ring-white"
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
