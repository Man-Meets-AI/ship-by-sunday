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
      <body className="flex min-h-screen items-center justify-center bg-background px-6 font-sans text-foreground">
        <div className="max-w-md space-y-4 rounded-lg border bg-card p-6 text-center text-card-foreground">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm leading-6 text-muted-foreground">
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
