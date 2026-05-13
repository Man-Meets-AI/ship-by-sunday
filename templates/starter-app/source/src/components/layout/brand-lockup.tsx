import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLockupProps = {
  href: string;
  title?: string;
  className?: string;
  subtitle?: string;
};

export function BrandLockup({
  href,
  title = "Northstar",
  className,
  subtitle,
}: BrandLockupProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-zinc-950 transition-opacity hover:opacity-80 focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-3 dark:text-zinc-50 dark:focus-visible:ring-white",
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.6)] sm:h-10 sm:w-10 sm:rounded-2xl dark:bg-white dark:text-zinc-950"
      >
        <span className="grid grid-cols-2 gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-45" />
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-45" />
        </span>
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-sm font-semibold tracking-tight sm:text-base">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-1 hidden truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400 sm:block">
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
