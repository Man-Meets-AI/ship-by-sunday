# Cross-Repo Review

This Program is Ship by Sunday-local and uses the repository's checked-in Program and ExecPlan contracts.

## Ship By Sunday Surfaces

The initiative touches the web app runtime boundary surfaces under `apps/web/`. Primary surfaces include:

- `apps/web/features/observability/`
- `apps/web/features/execute-ship/`
- `apps/web/app/api/codex/`
- `apps/web/features/codex/server/`
- `apps/web/app/sitemap.ts`
- `apps/web/app/docs/[[...mdxPath]]/page.tsx`
- `apps/web/tests/`

## Codex Reference Surfaces

The source ExecPlan already records the Codex reference files used for boundary guidance. The relevant principle is separation, not code reuse. Codex keeps protocol schema, transport, dispatch, lifecycle ownership, telemetry, and process execution separate. Ship by Sunday should apply the same discipline in TypeScript and Next.js terms.

## Program Contract Surfaces

The durable Program surfaces are `docs/programs/PROGRAMS.md`, this completed Program packet, and Program-linked child ExecPlans. Child ExecPlans must carry `program_id: sbs-runtime-boundary-hardening` and `planning_brief: docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md`.

## Cross-Repo Risk

The biggest risk is overclaiming from the Codex reference. Codex proves a boundary shape, not an SBS implementation. Each child ExecPlan still needs focused proof in this repo.
