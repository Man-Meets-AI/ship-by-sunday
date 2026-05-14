import Link from "next/link";
import {
  BellDot,
  CheckCheck,
  ChevronDown,
  CreditCard,
  Layers3,
  PanelTop,
  Users,
  Waypoints,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const heroHighlights = [
  "Shared workspace",
  "Built-in billing",
  "Customer updates",
  "Team visibility",
];

const heroMetrics = [
  {
    label: "Open work",
    value: "12",
    detail: "Across four active accounts",
    icon: Layers3,
  },
  {
    label: "Billing alerts",
    value: "2",
    detail: "Plan follow-ups due today",
    icon: CreditCard,
  },
  {
    label: "Updates due",
    value: "5",
    detail: "Ready for customer send-off",
    icon: BellDot,
  },
];

const heroQueue = [
  {
    title: "Monday kickoff",
    description:
      "Team priorities, recent account context, and next actions stay aligned in one queue.",
    badge: "Ready",
    icon: CheckCheck,
  },
  {
    title: "Client renewal",
    description:
      "Billing context and account history stay attached to the work instead of buried in another tool.",
    badge: "Billing",
    icon: CreditCard,
  },
  {
    title: "Weekly summary",
    description:
      "Customer update drafts already reflect the latest workspace activity and ownership changes.",
    badge: "Update",
    icon: Users,
  },
];

const features = [
  {
    title: "Centralize team and client work",
    description:
      "Keep requests, context, and handoffs in one shared workspace instead of scattering them across tools.",
    icon: PanelTop,
  },
  {
    title: "Track activity and follow-ups",
    description:
      "See what changed recently, what still needs attention, and who owns the next move.",
    icon: BellDot,
  },
  {
    title: "Keep billing visible",
    description:
      "Give teams one place to review plan details, renewal timing, and account status alongside the work.",
    icon: CreditCard,
  },
  {
    title: "Move faster with shared context",
    description:
      "Make decisions with the full customer and project picture already attached to each conversation.",
    icon: Users,
  },
  {
    title: "Reduce tool sprawl",
    description:
      "Replace status spreadsheets, handoff docs, and disconnected updates with one operational home.",
    icon: Layers3,
  },
  {
    title: "Keep teams aligned",
    description:
      "Everyone works from the same priorities, customer updates, and plan context without extra coordination.",
    icon: Waypoints,
  },
];

const benefits = [
  {
    title: "One system for daily operations",
    description:
      "Replace scattered docs, inboxes, and billing tabs with a workspace the whole team can rely on.",
  },
  {
    title: "Clear ownership at every stage",
    description:
      "Make handoffs, follow-ups, and customer communication visible before anything slips.",
  },
  {
    title: "Less tab-switching, more momentum",
    description:
      "Stay focused because the context for work, plans, and updates already lives together.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29/mo",
    description: "For small teams getting their workspace in place.",
    features: [
      "Up to 5 teammates",
      "Shared work tracking",
      "Billing overview",
      "Customer update timeline",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "$99/mo",
    description: "For growing teams that need tighter coordination.",
    features: [
      "Unlimited teammates",
      "Advanced workspace views",
      "Priority billing visibility",
      "Cross-team updates",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description:
      "For organizations rolling out one operating system across teams.",
    features: [
      "Custom onboarding",
      "Admin controls",
      "Process planning support",
      "Dedicated success partner",
    ],
    featured: false,
  },
];

const faqs = [
  {
    question: "Who is Northstar for?",
    answer:
      "Northstar is designed for small teams that run ongoing client work and need one place for tasks, billing context, and updates.",
  },
  {
    question: "Can teams collaborate in the same workspace?",
    answer:
      "Yes. Teams share context, track ownership, and stay aligned from a single workspace instead of passing information between tools.",
  },
  {
    question: "Is billing included?",
    answer:
      "Billing visibility is built into the product experience so teams can see plan details and account status without leaving the workspace.",
  },
  {
    question: "Is setup fast?",
    answer:
      "The product is built for a quick start, so teams can create a workspace, invite collaborators, and begin organizing work right away.",
  },
];

const sectionPadding = "px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20";

export default function MarketingHomePage() {
  return (
    <main
      id="main-content"
      className="relative flex w-full flex-col gap-16 overflow-hidden pb-20 sm:gap-20 sm:pb-24 lg:gap-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.18),transparent_32%),radial-gradient(circle_at_75%_15%,rgba(24,24,27,0.09),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_30%),radial-gradient(circle_at_75%_15%,rgba(244,244,245,0.08),transparent_18%),linear-gradient(180deg,rgba(9,9,11,0.35),rgba(9,9,11,0))]"
      />

      <section
        id="hero"
        className={`${sectionPadding} scroll-mt-32 pt-6 sm:pt-10 lg:pt-14`}
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(249,246,240,0.88))] p-5 shadow-[0_32px_90px_-54px_rgba(15,23,42,0.4)] backdrop-blur sm:rounded-[2.5rem] sm:p-6 lg:p-10 dark:bg-[linear-gradient(135deg,rgba(24,24,27,0.94),rgba(12,12,14,0.92))]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.06),transparent_55%)] dark:bg-[radial-gradient(circle_at_center,rgba(244,244,245,0.1),transparent_55%)]"
          />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(20rem,27rem)] lg:items-center xl:grid-cols-[minmax(0,1.08fr)_minmax(24rem,32rem)]">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <p className="inline-flex items-center rounded-full border border-zinc-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-600 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.35)] dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-300">
                  Operations for small teams
                </p>
                <h1 className="max-w-[11.5ch] text-[clamp(2.6rem,6vw,5.15rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-zinc-950 dark:text-zinc-50">
                  Run work, billing, and client updates from one calm workspace.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
                  Northstar gives teams a single place to organize ongoing work,
                  stay on top of follow-ups, and keep billing context close to
                  the conversations that move accounts forward.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/sign-up">Get started</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Link href="#pricing">View pricing</Link>
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:max-w-2xl">
                {heroHighlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-zinc-200/80 bg-white/75 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border-zinc-950 bg-zinc-950 text-white shadow-[0_32px_90px_-54px_rgba(15,23,42,0.65)] dark:border-white dark:bg-white dark:text-zinc-950">
              <CardHeader className="gap-6 p-5 sm:p-6">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-200 dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-700">
                      Northstar workspace
                    </p>
                    <CardTitle className="mt-3 max-w-xs text-[1.9rem] tracking-tight text-white dark:text-zinc-950">
                      See the whole operating picture at a glance.
                    </CardTitle>
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-medium text-zinc-100 dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-700">
                    Live overview
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {heroMetrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                      <div
                        key={metric.label}
                        className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 dark:border-zinc-200 dark:bg-zinc-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-300 dark:text-zinc-600">
                            {metric.label}
                          </p>
                        </div>
                        <p className="mt-3 text-3xl font-semibold tracking-tight text-white dark:text-zinc-950">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-300 dark:text-zinc-600">
                          {metric.detail}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-4 dark:border-zinc-200 dark:bg-zinc-100">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-300 dark:text-zinc-600">
                      Today&apos;s queue
                    </p>
                    <span className="text-xs font-medium text-zinc-300 dark:text-zinc-600">
                      4 items moving
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {heroQueue.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className="flex gap-3 rounded-[1.35rem] bg-white/10 p-3.5 dark:bg-white"
                        >
                          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-white dark:text-zinc-950">
                                {item.title}
                              </p>
                              <span className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-medium text-zinc-200 dark:border-zinc-200 dark:text-zinc-600">
                                {item.badge}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-zinc-300 dark:text-zinc-600">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-white p-4 text-zinc-950 dark:bg-zinc-950 dark:text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">
                      Billing visibility
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      Plans, renewals, and account status stay next to the work
                      they influence.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 p-4 dark:border-zinc-200">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zinc-300 dark:text-zinc-600">
                      Shared context
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-300 dark:text-zinc-600">
                      Everyone works from the same timeline, owners, and next
                      steps.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className={`${sectionPadding} scroll-mt-32`}>
        <div className="grid gap-10 xl:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)]">
          <div className="space-y-4 xl:pr-8">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Features
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              The core pieces teams need to stay coordinated
            </h2>
            <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              Northstar brings the daily operational flow into one workspace so
              teams can move faster without building new habits around more
              tools.
            </p>
          </div>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))]">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="h-full bg-white/90">
                  <CardHeader className="gap-3">
                    <div className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="why-northstar" className={`${sectionPadding} scroll-mt-32`}>
        <div className="grid gap-8 rounded-[2.5rem] border border-zinc-200/80 bg-zinc-50/80 p-8 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.45)] dark:border-zinc-800 dark:bg-zinc-900/60 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Why Northstar
            </p>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Replace scattered tools with one steady system for the team.
            </h2>
            <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              Small teams rarely struggle because the work is unclear. They
              struggle because the context is spread across too many places.
              Northstar brings tasks, billing context, and customer updates into
              one workspace so everyone sees the same picture and can act on it
              quickly.
            </p>
            <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              Instead of piecing together status from multiple tabs, teams can
              run the operational rhythm from one place that feels calm,
              current, and easy to scan.
            </p>
          </div>

          <div className="grid gap-4">
            {benefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="h-full bg-white/90 dark:bg-zinc-950/70"
              >
                <CardHeader className="gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                    <CheckCheck className="h-5 w-5" />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className={`${sectionPadding} scroll-mt-32 space-y-6`}
      >
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Pricing
          </p>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Start simple, then add structure as the team grows.
          </h2>
          <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Choose a plan that fits the stage of your team today. The pricing
            below is simple placeholder marketing content.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-[0_28px_70px_-48px_rgba(15,23,42,0.65)] dark:border-white dark:bg-white dark:text-zinc-950"
                  : ""
              }
            >
              <CardHeader className="gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle
                      className={
                        plan.featured
                          ? "text-white dark:text-zinc-950"
                          : undefined
                      }
                    >
                      {plan.name}
                    </CardTitle>
                    {plan.featured ? (
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-950">
                        Recommended
                      </span>
                    ) : null}
                  </div>

                  <p
                    className={
                      plan.featured
                        ? "text-3xl font-semibold tracking-tight text-white dark:text-zinc-950"
                        : "text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
                    }
                  >
                    {plan.price}
                  </p>

                  <CardDescription
                    className={
                      plan.featured
                        ? "text-zinc-100 dark:text-zinc-700"
                        : undefined
                    }
                  >
                    {plan.description}
                  </CardDescription>
                </div>

                <ul className="list-none space-y-3 p-0 text-sm leading-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={
                        plan.featured
                          ? "text-zinc-100 dark:text-zinc-700"
                          : "text-zinc-700 dark:text-zinc-300"
                      }
                    >
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={
                    plan.featured
                      ? "bg-white text-zinc-950 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800"
                      : undefined
                  }
                  variant={plan.featured ? "default" : "outline"}
                >
                  <Link href="/sign-up">Get started</Link>
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className={`${sectionPadding} scroll-mt-32 space-y-6`}>
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            FAQ
          </p>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Questions teams usually ask before getting started
          </h2>
        </div>

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(18rem,1fr))]">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              open={index === 0}
              className="group rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.3)] dark:border-zinc-800 dark:bg-zinc-950/80"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl text-lg font-semibold tracking-tight text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-zinc-50 dark:focus-visible:ring-white [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180 dark:text-zinc-400" />
              </summary>
              <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className={sectionPadding}>
        <div className="rounded-[2.5rem] border border-zinc-200/80 bg-white/90 p-8 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.45)] dark:border-zinc-800 dark:bg-zinc-950/80 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Start now
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                Create your workspace today and give the team one place to run.
              </h2>
              <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
                Bring work, billing visibility, and customer updates together
                from the first day instead of stitching them together later.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up">Create your workspace</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
