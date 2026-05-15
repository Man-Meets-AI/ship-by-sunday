---
title: "Template First Web Convex Dependency Graph"
summary: "Dependency ordering for the web and Convex architecture migration."
docType: "dependency_graph"
status: "active"
read_when:
  - "Sequencing child ExecPlans for the template-first migration."
  - "Checking which slices block billing, routing, or provider setup work."
---

# Template First Web Convex Dependency Graph

## Nodes

N1: Architecture contract and migration inventory.

N2: Target env and provider setup contract for Clerk, Convex, Stripe, Cal.com, Sentry, Resend, PostHog, and debug tools.

N3: App `src/` tree and import boundary scaffolding.

N4: Route group migration to `(marketing)`, `(auth)`, `(app)`, and `api/`, including app-shell placement for owner/admin billing attention.

N5: Convex module reshape around auth, users/workspaces if retained, billing, subscriptions, annual licenses, refunds, Cal.com service booking mirrors, entitlements, processed Stripe events, and processed Cal.com events.

N6: Billing domain rebuild for Starter annual licenses with authenticated/authorized fresh-checkout renewal and early-renewal extension, Workers subscription variants, Smart Retries recovery state, owner/admin billing attention state, failed-payment customer recovery email state, recovered-payment customer confirmation email state, failed-payment internal billing ops alert state, recovered-payment internal billing ops resolved email state, terminal failed-recovery customer access-ended email state, terminal failed-recovery internal billing ops closeout email state, provider-dashboard refund initiation boundary, full/partial refund state, full-refund customer status email state, full-refund internal ops closeout email state, cancellation email state, and Cal.com-mirrored Worker Seal Team 6 bookings.

N7: Stripe checkout, authorized Starter renewal checkout, Workers Customer Portal plan changes, period-end cancellation, Smart Retries failed-payment lifecycle, terminal failed-recovery cancellation handling, `invoice.payment_failed`, `invoice.paid`, provider-dashboard refund sync triggers, success, and webhook route migration with route tests.

N8: Sentry integration.

N9: Resend integration for Workers failed-payment customer recovery, Workers recovered-payment customer confirmation, Workers terminal failed-recovery access-ended email, full-refund customer status emails, full-refund internal ops closeout emails, Workers failed-payment internal billing ops alert/resolved/closeout emails, Workers cancellation confirmation, Worker Seal Team 6 customer prep, and Worker Seal Team 6 internal ops emails.

N10: Worker Seal Team 6 Cal.com paid booking integration with embed/link, webhooks, Convex mirror state, refund/cancellation mirror state, service fulfillment, and booking tests.

N11: Debug tools gate and debug route cleanup.

N12: Release workflow, docs, and proof updates.

N13: Final cleanup of old route names, old provider boundaries, stale webhook docs, and `platform/` leftovers.

## Edges

- N1 blocks every other node.
- N2 should land before N8, N9, N10, and N11.
- N3 should land before broad route and provider file moves.
- N4 depends on N3.
- N5 depends on N1 and can proceed in parallel with N3 if write scopes are separated.
- N6 depends on N5.
- N7 depends on N2 and N6.
- N8 and N9 depend on N2 and can proceed independently of billing after the env contract is set.
- N10 depends on N2, N6, N7, and N9.
- N11 depends on N2, N8, and N9.
- N12 depends on N4, N7, N8, N9, N10, and N11.
- N13 depends on every implementation node and should be the final cleanup slice.

## Critical Path

The critical path is N1 -> N2 -> N5 -> N6 -> N7 -> N10 -> N12 -> N13.

Route restructuring is high-risk but can be staged alongside Convex reshaping if each child ExecPlan has narrow write ownership and focused validation. Sentry and Resend can also run as separate slices after the env contract lands.

## Parallel Opportunities

- App tree scaffolding and Convex inventory can be prepared in separate child ExecPlans.
- Sentry and Resend can be implemented in separate slices after env conventions are established.
- Worker Seal Team 6 Cal.com integration can start after provider env conventions are established. It should not depend on the app-owned Stripe checkout route, because Cal.com owns the paid booking surface for that service.
- Docs/proof inventory can start early, but final release docs must wait until the billing endpoint contract is real.
