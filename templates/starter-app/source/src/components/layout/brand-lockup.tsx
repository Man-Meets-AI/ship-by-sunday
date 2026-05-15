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
        "inline-flex items-center gap-2 text-foreground transition-opacity hover:opacity-80 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:gap-3",
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:h-10 sm:w-10"
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
          <span className="mt-1 hidden truncate text-[11px] font-medium text-muted-foreground sm:block">
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
