"use client";

import { ConvexReadyGate } from "@/components/app/convex-ready-gate";
import { Button } from "@/components/ui/button";

export function DebugToolsPanel() {
  return (
    <ConvexReadyGate loadingMessage="Loading debug tools...">
      <div className="space-y-3">
        <form action="/api/email/test" method="post">
          <Button className="w-full" type="submit" variant="outline">
            Send test email
          </Button>
        </form>
        <form action="/api/debug/sentry" method="post">
          <Button className="w-full" type="submit" variant="outline">
            Trigger test Sentry capture
          </Button>
        </form>
      </div>
    </ConvexReadyGate>
  );
}
