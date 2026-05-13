import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10 lg:px-10 lg:py-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
