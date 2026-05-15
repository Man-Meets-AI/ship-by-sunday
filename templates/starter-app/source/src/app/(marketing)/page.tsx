import Link from "next/link";
import { CheckCircle2, CreditCard, MessageSquare, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const workflowSteps = [
  "Create the workspace",
  "Invite the team",
  "Run chat, billing, and updates from one place",
];

const proofCards = [
  {
    title: "Shared context",
    description:
      "Keep requests, ownership, and decisions in one product workspace.",
    icon: MessageSquare,
  },
  {
    title: "Billing visibility",
    description:
      "Read billing state from the same app model that powers protected routes.",
    icon: CreditCard,
  },
  {
    title: "Provider-ready",
    description:
      "Start in no-provider mode, then connect Clerk, Convex, Stripe, and OpenAI deliberately.",
    icon: ShieldCheck,
  },
];

const scopeItems = [
  "Authenticated app shell",
  "Convex-backed chat state",
  "Stripe-ready billing model",
  "Agent-friendly setup plans",
];

export default function MarketingHomePage() {
  return (
    <main
      id="main-content"
      className="flex flex-col gap-12 px-4 py-8 sm:px-6 lg:px-12 lg:py-12 xl:px-16 2xl:px-20"
    >
      <section
        id="hero"
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)] lg:items-start"
      >
        <div className="max-w-3xl space-y-6">
          <p className="text-sm font-medium text-muted-foreground">
            Operations for small teams
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Run work, billing, and client updates from one calm workspace.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Northstar gives teams a serious product foundation with compact
              app surfaces, provider boundaries, and a chat workflow ready to
              extend.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#workflow">View workflow</Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <p className="text-sm font-medium text-muted-foreground">
              Northstar workspace
            </p>
            <CardTitle className="text-2xl">
              See the operating picture at a glance.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {workflowSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-foreground">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="features" className="grid gap-4 md:grid-cols-3">
        {proofCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section
        id="workflow"
        className="grid gap-8 border-t pt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      >
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Why Northstar
          </p>
          <h2 className="text-3xl font-semibold text-foreground">
            Replace scattered tools with one steady system for the team.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Use the generated source as a working product, then customize the
            workflow with the setup plans and local primitives already in place.
          </p>
        </div>
        <div className="grid gap-3">
          {scopeItems.map((item) => (
            <div key={item} className="rounded-lg border bg-card p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="rounded-lg border bg-card p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Pricing</p>
            <h2 className="text-3xl font-semibold text-foreground">
              Start simple, then add structure as the team grows.
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              This starter keeps product, billing, and setup states visible from
              the first screen.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/sign-up">Create your workspace</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
