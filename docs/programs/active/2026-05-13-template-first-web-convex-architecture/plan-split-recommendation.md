---
title: "Template First Web Convex Plan Split Recommendation"
summary: "Recommended child ExecPlan split for the template-first web and Convex migration."
docType: "plan_split_recommendation"
status: "active"
read_when:
  - "Creating child ExecPlans under this Program."
  - "Deciding how to split the migration without losing billing safety."
---

# Template First Web Convex Plan Split Recommendation

## Recommended Split

1. Architecture contract and migration inventory.
2. App `src/` tree, app shell, and route group migration.
3. Convex module reshape.
4. Billing domain rebuild for Starter licenses with authenticated/authorized fresh-checkout renewal and early-renewal extension, Workers subscriptions, Smart Retries recovery state, owner/admin billing attention state, failed-payment customer recovery email state, recovered-payment customer confirmation email state, failed-payment internal billing ops alert state, recovered-payment internal billing ops resolved email state, terminal failed-recovery customer access-ended email state, terminal failed-recovery internal billing ops closeout email state, provider-dashboard refund initiation boundary, full/partial refund state, full-refund customer status email state, full-refund internal ops closeout email state, cancellation email state, and Cal.com-mirrored Worker Seal Team 6 bookings.
5. Stripe billing routes, authorized Starter renewal checkout, webhook handling, Workers Customer Portal plan changes, period-end cancellation, Smart Retries failed-payment and recovered-payment lifecycle, terminal failed-recovery cancellation handling, provider-dashboard refund sync handling, no in-app admin refund actions, and route tests.
6. Worker Seal Team 6 Cal.com paid booking integration, webhook sync, cancellation/refund mirror state, and booking tests.
7. Sentry integration.
8. Resend integration for Workers failed-payment customer recovery, Workers recovered-payment customer confirmation, Workers terminal failed-recovery access-ended email, full-refund customer status emails, full-refund internal ops closeout emails, Workers failed-payment internal billing ops alert/resolved/closeout emails, Workers cancellation confirmation, and Worker Seal Team 6 emails.
9. Debug tools, release docs, provider setup docs, and proof cleanup.
10. Final old-boundary cleanup.

## First Slice

The first child ExecPlan should be `Architecture contract and migration inventory`.

It should:

- Create app-level architecture and conventions docs derived from the sibling template.
- Map current `apps/web` paths to the target `src/` tree.
- Map current Convex files to the target Convex module structure.
- Create a deviation register for anything not copied from the template.
- Define the target billing and fulfillment domain in prose before schema changes.
- List exact tests and proof surfaces each later slice must update.

It should not:

- Move the whole app tree.
- Rewrite checkout or webhooks.
- Add provider dependencies.
- Change production webhook endpoints.

## Why This Split

The migration spans P0 billing, auth, provider setup, Convex schema, and route groups. A single giant ExecPlan would be hard to validate and easy to partially complete. The split keeps each child plan testable while preserving one Program-level source of truth.

The first slice is intentionally documentation and inventory heavy because it prevents future slices from debating the same architecture in every PR. After the contract exists, implementation slices can move quickly and measure themselves against the same target.

## Child ExecPlan Requirements

Every child ExecPlan should include:

- `program_id: "template-first-web-convex-architecture"` in frontmatter.
- `planning_brief` pointing at the exact versioned planning brief used.
- A risk classification for touched surfaces.
- A production-path validation step for the exact routes, Convex functions, or provider boundaries changed.
- A note about whether external setup docs changed.
