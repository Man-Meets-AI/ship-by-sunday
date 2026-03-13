# Docs

The docs tree is split into public contributor docs and internal launch-operation docs.

## Read First

- [../README.md](../README.md)
- [../CONTRIBUTING.md](../CONTRIBUTING.md)
- [dev/architecture.md](dev/architecture.md)
- [dev/customization.md](dev/customization.md)

## Public Docs

- [dev/architecture.md](dev/architecture.md): runtime surfaces, course state flow, and purchase-to-access behavior
- [dev/customization.md](dev/customization.md): the safest places to tailor curriculum, UI, marketing, and purchase flow
- [dev/lesson-workbench.md](dev/lesson-workbench.md): workbench renderer boundaries and UI architecture
- [dev/course-state-lifecycle.md](dev/course-state-lifecycle.md): how lesson progress, artifacts, and viewer state interact
- [dev/convex-sop.md](dev/convex-sop.md): Convex deployment and environment workflow
- [dev/qa-browser-auth.md](dev/qa-browser-auth.md): QA auth-account setup for browser testing
- [delivery-onboarding/stack-decision.md](delivery-onboarding/stack-decision.md): source of truth for the live purchase-to-access handoff

## Internal Docs

- [internal/README.md](internal/README.md): tracker, launch OS, role prompts, workstream plans, and internal research

If the repo becomes more public over time, `docs/internal/` is the first candidate to move into a private operations repo without changing the public contributor path.

## Placement Rules

- Put public developer or product-behavior docs in `docs/dev/` or another clearly product-facing docs folder.
- Put launch operations, founder workflow, workstream planning, and internal research in `docs/internal/`.
- Keep root docs focused on what the app is, how to run it, how to contribute, and what is intentionally customizable.
