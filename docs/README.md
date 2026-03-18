# Docs

The docs tree is split into public contributor docs and internal launch-operation docs.

## Read First

- [../README.md](../README.md)
- [../CONTRIBUTING.md](../CONTRIBUTING.md)
- [dev/architecture.md](dev/architecture.md)
- [dev/customization.md](dev/customization.md)

## Public Docs

- [architecture.md](architecture.md): top-level bridge to the canonical runtime architecture doc
- [tech-stack.md](tech-stack.md): top-level bridge to the canonical stack and purchase-flow docs
- [memory.md](memory.md): top-level bridge to durable setup/debugging learnings
- [dev/architecture.md](dev/architecture.md): runtime surfaces, course state flow, and purchase-to-access behavior
- [dev/customization.md](dev/customization.md): the safest places to tailor curriculum, UI, marketing, and purchase flow
- [dev/testing.md](dev/testing.md): the main local testing runbook for lint, unit/smoke checks, QA accounts, browser QA, and Stripe sandbox verification
- [dev/lesson-workbench.md](dev/lesson-workbench.md): workbench renderer boundaries and UI architecture
- [dev/course-state-lifecycle.md](dev/course-state-lifecycle.md): how lesson progress, artifacts, and viewer state interact
- [dev/convex-sop.md](dev/convex-sop.md): Convex deployment and environment workflow
- [dev/qa-browser-auth.md](dev/qa-browser-auth.md): QA auth-account setup for browser testing
- [delivery-onboarding/stack-decision.md](delivery-onboarding/stack-decision.md): source of truth for the live purchase-to-access handoff
- [ux-design-crit-tracker.md](ux-design-crit-tracker.md): top-level bridge to the internal UX-crit tracker
- [ux-design-crit/README.md](ux-design-crit/README.md): top-level bridge to the internal lesson critique archive

## Internal Docs

- [internal/README.md](internal/README.md): tracker, launch OS, role prompts, workstream plans, and internal research
- [internal/design/workbench-system.md](internal/design/workbench-system.md): canonical workbench architecture and hierarchy rules
- [internal/design/workbench-readability-system.md](internal/design/workbench-readability-system.md): readability critique and the shared typography/spacing contract proved in lesson `1.2`

If the repo becomes more public over time, `docs/internal/` is the first candidate to move into a private operations repo without changing the public contributor path.

## Placement Rules

- Put public developer or product-behavior docs in `docs/dev/` or another clearly product-facing docs folder.
- Put launch operations, founder workflow, workstream planning, and internal research in `docs/internal/`.
- Keep root docs focused on what the app is, how to run it, how to contribute, and what is intentionally customizable.

## Docs-Site Readiness

- The public starter docs site now lives at `/docs` inside the main Next app using `Nextra`.
- Published starter-doc content lives under `content/docs/`.
- The public `/docs` IA is grouped into `Start Here`, `Get Running`, `Build Your Product`, `AI Workflow`, `Troubleshooting`, and `Reference`.
- The markdown files in `docs/` remain the source of truth for contributor docs and internal launch docs, not the customer-facing starter docs site.
- Do not publish `docs/internal/` through the starter docs site.
- The starter docs site is manually curated in this repo for now; do not add automated sync from the starter repo until there is an explicit decision to support that workflow.
