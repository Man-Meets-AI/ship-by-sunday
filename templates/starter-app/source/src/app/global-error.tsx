"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            The error was captured for debugging. Try the action again, or return
            after refreshing the page.
          </p>
          <Button onClick={reset} type="button">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
