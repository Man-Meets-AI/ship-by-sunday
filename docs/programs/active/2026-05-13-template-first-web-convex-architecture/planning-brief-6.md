---
title: Template First Web Convex Planning Brief 6
program_id: template-first-web-convex-architecture
brief_version: 6
status: current
summary: "Sixth planning brief for the public landing-page set and Worker Seal Team 6 route."
read_when:
  - "Writing or resuming the Worker Seal Team 6 public landing-page child ExecPlan."
  - "Changing public marketing navigation, robots, sitemap, or public route metadata for the Program."
  - "Checking what belongs on the service landing page before the Cal.com integration slice."
---

# Template First Web Convex Planning Brief 6

## Slice

Public landing-page set and Worker Seal Team 6 route.

## Desired Outcome

Add `/worker-seal-team-6` as the fourth public marketing route in the Program's target landing-page set. The page should present Worker Seal Team 6 as a $500 one-hour hands-on service for teams with an existing codebase, route through public navigation, appear in public metadata routes, and stay truthful about the current provider state.

This slice creates the public page and IA wiring only. It must not pretend the Cal.com booking flow is live, must not add an app-owned checkout button, and must not require Clerk sign-in. Until the Cal.com provider slice lands, the page should use a direct inquiry/scheduling CTA and document that the paid Cal.com embed, hosted fallback, webhooks, payment mirror, refund mirror, and emails remain follow-up work.

## Scope

In scope:

- Add `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx`.
- Use the existing public-site visual system, public header, shadcn button, lucide icons, and existing visual assets.
- Make "Worker Seal Team 6" a first-viewport product signal.
- Add the route to `routeConfig`.
- Add the route to primary public navigation with a compact label that does not break desktop nav.
- Add the route to `apps/web/src/app/robots.ts`.
- Add the route to `apps/web/src/app/sitemap.ts`.
- Update public metadata route tests for the four public landing pages.
- Update `apps/web/src/content/docs/configure-the-homepage.mdx` so future homepage/navigation work knows `/worker-seal-team-6` is part of the public IA and that Cal.com owns the eventual booking flow.
- Update the Program, architecture inventory, and design-pack documentation after implementation.
- Run focused public route validation, app static checks, Program/plan/docs lint, and desktop/mobile browser proof.

Out of scope:

- Cal.com embed script or iframe.
- Hosted Cal.com fallback URL configuration.
- Cal.com dashboard setup.
- Cal.com webhook verification or `/api/cal/webhook`.
- Stripe Checkout, Stripe Customer Portal, or app-owned Worker Seal Team 6 checkout.
- Convex booking mirror writes.
- Resend customer prep email or internal ops email.
- Sentry setup.
- Public homepage redesign beyond routing to the new service page where appropriate.
- Changing Starter or Workers checkout behavior.

## Inputs

- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/worker-seal-team-6-booking-research.md`
- `apps/web/AGENTS.md`
- `apps/web/ARCHITECTURE.md`
- `apps/web/CONVENTIONS.md`
- `apps/web/src/content/docs/configure-the-homepage.mdx`
- `DESIGN.md`
- `docs/ship-by-sunday/design-pack/AGENTS.md`
- `docs/ship-by-sunday/design-pack/surfaces/landing-page.md`
- `docs/openai/design-pack/surfaces/landing-page.md`
- `docs/exec-plans/PLANS.md`

## Acceptance

- The child ExecPlan records `program_id: "template-first-web-convex-architecture"` and this planning brief path.
- `/worker-seal-team-6` exists under `apps/web/src/app/(marketing)`.
- The page has metadata title and description specific to Worker Seal Team 6.
- The first viewport clearly names "Worker Seal Team 6", explains the $500 one-hour hands-on service, includes a primary direct-inquiry CTA, includes a secondary route to Workers, and uses a real visual asset.
- The page does not use `CheckoutButton`, does not include a fake Cal.com embed, and does not require Clerk sign-in.
- The public header includes the service page.
- Robots allow the service page.
- Sitemap includes the service page with a meaningful last-modified source.
- Public metadata route tests cover `/worker-seal-team-6`.
- The homepage configuration doc, Program, architecture inventory, and design-pack documentation reflect the route.
- Focused route tests, app lint/typecheck, Program lint, ExecPlan lint, markdown lint, whitespace checks, and desktop/mobile browser proof pass or record exact blockers.

## Watchpoints

- Do not introduce a false external setup contract. A hardcoded Cal.com URL or live booking copy would be misleading until provider setup is complete.
- Do not add a Stripe checkout button for Worker Seal Team 6. The Program decision is Cal.com-owned paid booking.
- Do not make the page look like a cheap iframe host. The later embed should sit inside a premium page; this slice should establish that frame without the embed.
- Keep `/workers` public and keep operational `/workers/*` routes protected.
- Do not widen this into a public homepage redesign. Only adjust routing/docs needed for the fourth landing page.
- Browser proof matters because this is a first-viewport landing page and the header gains another nav item.
