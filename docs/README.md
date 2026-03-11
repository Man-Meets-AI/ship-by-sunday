# Ship by Sunday Docs Hub

This folder is the canonical home for generated launch workstream docs.

## Source Of Truth Order

- `todo.md`: current status, owners, blockers, and the next operating sequence
- `main.md`: launch OS, critical path, and launch-wide constraints
- `lib/course/`: curriculum, lesson structure, and student-facing lesson content
- `convex/`: entitlement, progress, autosave, and buyer-access state
- `docs/<workstream>/`: workstream decisions, plans, and supporting detail

If a workstream doc conflicts with `todo.md` or the implemented app state, update the doc. Do not preserve stale planning language for its own sake.

## Rules

- Keep `AGENTS.md`, `main.md`, `todo.md`, and `roles/` at repo root.
- Put all generated planning, execution, and role-output docs under `docs/<workstream>/`.
- Use short filenames inside each workstream folder.
- Link to repo files with relative markdown links, not absolute local filesystem paths.

## Workstream Map

- `recording/`: founder prep, session packets, and pickup tracking
- `course-ops/`: course structure, worksheets, onboarding flow, and support notes
- `offer-funnel/`: offer framing, checkout copy, guarantee, and CTA flow
- `email/`: launch and buyer onboarding email drafts
- `delivery-onboarding/`: stack decisions and access-flow decisions
- `analytics-qa/`: KPI tracking, event map, QA script, and bug tracking
- `outbound/`: deliverability, inbox, domain, and sending setup
- `list-building/`: audience segments, schema, and qualification rules
- `youtube/`: launch-fit video concepts and CTA paths
- `design/`: launch visuals, brand system, and creative production docs
- `dev/`: developer onboarding and architecture notes

## Current Canonical Files

- `recording/sprint-packets.md`
- `recording/founder-checklists.md`
- `recording/day-1-prep.md`
- `course-ops/plan.md`
- `course-ops/lesson-content-ingestion.md`
- `offer-funnel/plan.md`
- `offer-funnel/messaging-foundation.md`
- `email/launch-and-onboarding.md`
- `delivery-onboarding/stack-decision.md`
- `analytics-qa/plan.md`
- `outbound/setup-plan.md`
- `list-building/plan.md`
- `youtube/launch-plan.md`
- `design/launch-assets.md`
- `design/brand-visual-system.md`
- `design/creative-playbook.md`
- `dev/architecture.md`
- `dev/convex-sop.md`
