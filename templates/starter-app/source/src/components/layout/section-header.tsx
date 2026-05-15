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
        "border-b pb-5 md:flex md:items-end md:justify-between md:gap-6",
        className,
      )}
    >
      <div className="space-y-3">
        {eyebrow ? (
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-8 bg-border" />
            <p className="text-xs font-semibold text-muted-foreground">
              {eyebrow}
            </p>
          </div>
        ) : null}
        <div className="space-y-2">
          <h1 className="max-w-3xl text-2xl font-semibold text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex items-center gap-3 md:pb-1">{actions}</div> : null}
    </div>
  );
}
