import Link from "next/link";
import { ArrowRight, MessageSquare, Orbit, ShieldCheck } from "lucide-react";

import { areDebugToolsEnabled } from "@/lib/app/debug-tools";
import { DebugToolsPanel } from "@/components/app/debug-tools-panel";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const extensionRules = [
  "Start new product models in Convex so conversations stay coherent.",
  "Keep route protection inside Clerk middleware and internal auth helpers.",
  "Add analytics events to the shared registry before components capture them.",
  "Sync Stripe into Convex first, then let product UI read normalized billing state.",
];

const workspaceSignals = [
  {
    label: "Real app shell",
    description:
      "Protected navigation, user bootstrap, and the chat route are already connected.",
    icon: MessageSquare,
  },
  {
    label: "Clear boundaries",
    description: "Each provider has a lane so the product model stays readable as features grow.",
    icon: Orbit,
  },
  {
    label: "Safe extension points",
    description:
      "Chat, billing, and provider gates are ready to copy, replace, and pressure-test.",
    icon: ShieldCheck,
  },
];

export default function DashboardPage() {
  const debugToolsEnabled = areDebugToolsEnabled();

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Workspace"
        title="Your product starts here"
        description="Use this authenticated shell as the base for real product routes. Navigation, workspace bootstrapping, role-aware billing, and a Convex-backed chat workflow are already connected."
        actions={
          <Button asChild>
            <Link href="/chat">Open chat</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {workspaceSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <Card
              key={signal.label}
              className="transition-colors hover:bg-accent/40"
            >
              <CardHeader className="gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{signal.label}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-6 text-muted-foreground">
                  {signal.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Patterns worth copying</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {extensionRules.map((rule) => (
              <div
                key={rule}
                className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
              >
                {rule}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Platform already connected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Each integration has a clear lane so you can add new features
              without spreading provider-specific logic through every screen.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge>Next.js App Router</Badge>
              <Badge variant="secondary">Convex</Badge>
              <Badge variant="secondary">Clerk</Badge>
              <Badge variant="secondary">Stripe</Badge>
              <Badge variant="secondary">OpenAI</Badge>
              <Badge variant="secondary">Resend</Badge>
              <Badge variant="secondary">PostHog</Badge>
              <Badge variant="secondary">Sentry</Badge>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/billing">
                Review billing implementation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {debugToolsEnabled ? <DebugToolsPanel /> : null}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
