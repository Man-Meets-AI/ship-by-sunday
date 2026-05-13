import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-4xl border border-zinc-200/80 bg-white/80 px-6 py-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.45)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 md:flex md:items-end md:justify-between md:gap-6 lg:px-8",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-zinc-400/40 to-transparent dark:via-zinc-600/40"
      />
      <div className="space-y-3">
        {eyebrow ? (
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-10 bg-zinc-300 dark:bg-zinc-700" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              {eyebrow}
            </p>
          </div>
        ) : null}
        <div className="space-y-2">
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-[2.15rem]">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex items-center gap-3 md:pb-1">{actions}</div> : null}
    </div>
  );
}
