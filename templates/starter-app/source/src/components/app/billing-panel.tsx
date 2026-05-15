"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

import { ConvexReadyGate } from "@/components/app/convex-ready-gate";
import { canManageBillingRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function BillingPanel({
  billingConfigured,
  billingStatus,
}: {
  billingConfigured: boolean;
  billingStatus?: string;
}) {
  return (
    <ConvexReadyGate loadingMessage="Loading workspace billing...">
      <BillingPanelContent
        billingConfigured={billingConfigured}
        billingStatus={billingStatus}
      />
    </ConvexReadyGate>
  );
}

function BillingPanelContent({
  billingConfigured,
  billingStatus,
}: {
  billingConfigured: boolean;
  billingStatus?: string;
}) {
  const billingState = useQuery(api.billing.currentWorkspaceState);
  const canManageBilling = billingState
    ? canManageBillingRole(billingState.membership.role)
    : false;

  if (billingState === undefined) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Loading workspace billing...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <Card>
        <CardHeader>
          <CardTitle>Current workspace plan</CardTitle>
          <CardDescription>
            This page reads the billing snapshot your product actually uses after
            verified Stripe webhooks synchronize customer, subscription, and
            entitlement data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="font-medium text-foreground">
              Workspace
            </p>
            <p className="text-muted-foreground">
              {billingState.workspace.name}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="font-medium text-foreground">
              Plan status
            </p>
            <p className="text-muted-foreground">
              {billingState.subscription?.status ?? "free"}
            </p>
            {billingState.subscription?.currentPeriodEnd ? (
              <p className="mt-1 text-muted-foreground">
                Current period ends{" "}
                {formatDate(billingState.subscription.currentPeriodEnd)}
              </p>
            ) : null}
          </div>
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="font-medium text-foreground">
              Entitlements
            </p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {billingState.entitlements.length === 0 ? (
                <li>No paid features are enabled yet.</li>
              ) : (
                billingState.entitlements.map((entitlement) => (
                  <li key={entitlement._id}>
                    {entitlement.key}: {entitlement.enabled ? "enabled" : "disabled"}
                  </li>
                ))
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage billing</CardTitle>
          <CardDescription>
            Start with Stripe Checkout and Customer Portal, then add custom plan
            UI only when the product really needs it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!billingConfigured ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Stripe billing is not configured for this environment yet. Add the
              billing env values before using checkout or the billing portal.
            </p>
          ) : canManageBilling ? (
            <>
              {billingStatus === "unconfigured" ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Billing actions stay disabled until Stripe is configured for this
                  environment.
                </p>
              ) : null}
              <form action="/api/billing/checkout" method="post">
                <Button className="w-full" type="submit">
                  Start checkout
                </Button>
              </form>
              <form action="/api/billing/portal" method="post">
                <Button className="w-full" type="submit" variant="outline">
                  Open billing portal
                </Button>
              </form>
            </>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Only workspace owners and admins can change billing.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
