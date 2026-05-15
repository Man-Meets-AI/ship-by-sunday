"use client";

import type { ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";

import { useUserBootstrapStatus } from "@/components/providers/user-bootstrap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ConvexReadyGate({
  children,
  loadingMessage = "Preparing your workspace...",
}: {
  children: ReactNode;
  loadingMessage?: string;
}) {
  const { isLoaded, user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { errorMessage, retry, status } = useUserBootstrapStatus();

  if (isLoaded && user && !isLoading && !isAuthenticated) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Protected product data is not ready yet. Verify the Clerk `convex` JWT
          template and the `CLERK_JWT_ISSUER_DOMAIN` env before using protected
          Convex features.
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !isAuthenticated || status === "idle" || status === "syncing") {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          {loadingMessage}
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 py-10">
          <p className="text-sm text-muted-foreground">
            {errorMessage ?? "We couldn't finish setting up your workspace yet."}
          </p>
          <div>
            <Button onClick={retry} type="button" variant="outline">
              Retry workspace setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
