---
summary: "Living execution plan for turning the repo into a configurable starter, with the starter contract, implementation slices, validation loops, and retrospective notes. It tracks completed work through E5 and the remaining visibility, marketing, analytics, and hardening slices."
read_when: "Open this when you need the current implementation roadmap, slice status, validation commands, or the remaining starter-generalization work."
plan_status: "done"
---

# Configurable Starter Execution Plan

This execution plan turns the strategy in [2026-03-23-configurable-starter-plan.md](/Users/parkerrex/Projects/ship-by-sunday/.codex/plans/2026-03-23-configurable-starter-plan.md) into a living implementation loop.

Use this document to:

1. pick one small unchecked slice,
2. implement only that slice,
3. run the slice validation,
4. update `Progress`, `Decision Log`, and the slice status,
5. only then move to the next slice.

Do not skip the validation or status-update step.

## Purpose / Big Picture

Turn `ship-by-sunday` into a configurable starter without weakening the good parts that already work:

- Clerk auth
- hosted Convex dev workflow
- Stripe checkout and access handoff
- Telegram observability
- SEO foundations
- Codex-assisted surfaces
- the protected shell

The target is not “Ship by Sunday with some labels changed.” The target is “a strong reusable starter with optional modules and clean defaults.”

This execution plan assumes:

- auth, billing, and access handoff are higher-risk and should change slowly
- starter generalization should happen through seams, not broad rewrites
- each implementation pass should be small enough to validate immediately

## Progress

- [x] E0. Create the strategic starter plan and boundaries doc.
- [x] E1. Introduce a starter contract in [config/product.ts](/Users/parkerrex/Projects/ship-by-sunday/config/product.ts) with backward-compatible `productConfig`.
- [x] E2. Add starter selector helpers in [features/starter/lib/starter-selectors.ts](/Users/parkerrex/Projects/ship-by-sunday/features/starter/lib/starter-selectors.ts).
- [x] E3. Rewire visible identity surfaces to starter-driven labels and copy.
- [x] E4. Add soft module gating for `docs`, `course`, and `starterRepo`.
- [x] E5. Replace the course-disabled protected shell with a real neutral workspace home.
- [ ] E6. Add a starter visibility surface so operators can see what is enabled and why.
- [ ] E7. Generalize homepage structure beyond renamed copy.
- [ ] E8. Add a typed analytics adapter and baseline event contract.
- [ ] E9. Harden tests, docs, and rollout rules around starter mode.

## Surprises & Discoveries

- `config/product.ts` was already the natural seam for the first generalization pass. That made starter contract work cheaper than expected.
- User-facing tests are tightly coupled to copy. Small label changes require test updates even when behavior is unchanged.
- Browser smoke depends on `NEXT_PUBLIC_CONVEX_URL` and cannot run in environments that have not been connected to hosted Convex dev first.
- Route entrypoints are a better module-gating seam than deep component branching. Gating late in the tree leaves too much dead shell visible.
- The protected shell is useful even when the course module is off. That makes a neutral workspace home a better next slice than route renaming.
- Existing Codex, starter-repo, and account cards were reusable as-is inside starter mode. That kept the workspace-home slice additive instead of inventing parallel setup UI.

## Decision Log

- 2026-03-23: Do not start with route renames. Keep `/mission`, `/lesson/[lessonKey]`, and `/artifacts` stable until the starter-mode protected experience is real.
- 2026-03-23: Use a compatibility layer in [config/product.ts](/Users/parkerrex/Projects/ship-by-sunday/config/product.ts) instead of forcing a repo-wide switch to a new config API in one pass.
- 2026-03-23: Treat docs, course, and starter-repo as optional modules exposed through starter config.
- 2026-03-23: Prefer route-level blank states over half-rendered disabled module surfaces.
- 2026-03-23: The next meaningful product slice is a neutral protected workspace home, not route aliasing.
- 2026-03-23: Reuse existing settings/Codex/starter-repo/account cards inside starter mode before inventing new starter-only operational components.

## Outcomes & Retrospective

- Outcome: `course = false` now renders a real protected workspace home instead of a dead-end disabled shell.
- What improved for starter reuse: starter mode now has a neutral signed-in default that shows enabled modules, concrete next steps, and existing setup cards without importing lesson/workbench internals.
- What stayed intentionally unchanged: `/mission` remains the protected entry route; `/lesson/[lessonKey]` and `/artifacts` still stay on explicit disabled states when the course module is off; auth, checkout, and access-grant flows were untouched.
- What turned out more coupled than expected: none in the actual implementation slice; the existing route-level module seams were good enough once the new feature lived in its own folder.
- Follow-up created: E6 starter visibility surface should now build on top of the workspace-home and selector model instead of starting from scratch.

## Context and Orientation

### Important strategic document

- [2026-03-23-configurable-starter-plan.md](/Users/parkerrex/Projects/ship-by-sunday/.codex/plans/2026-03-23-configurable-starter-plan.md)

### Current implementation seams

- Starter contract: [config/product.ts](/Users/parkerrex/Projects/ship-by-sunday/config/product.ts)
- Starter selectors: [features/starter/lib/starter-selectors.ts](/Users/parkerrex/Projects/ship-by-sunday/features/starter/lib/starter-selectors.ts)
- Public marketing copy: [features/marketing/content/home.ts](/Users/parkerrex/Projects/ship-by-sunday/features/marketing/content/home.ts)
- Protected entry routes: [app/(workspace)/mission/page.tsx](/Users/parkerrex/Projects/ship-by-sunday/app/(workspace)/mission/page.tsx), [app/(workspace)/artifacts/page.tsx](/Users/parkerrex/Projects/ship-by-sunday/app/(workspace)/artifacts/page.tsx), [app/(workspace)/lesson/[lessonKey]/page.tsx](/Users/parkerrex/Projects/ship-by-sunday/app/(workspace)/lesson/[lessonKey]/page.tsx), [app/(workspace)/settings/page.tsx](/Users/parkerrex/Projects/ship-by-sunday/app/(workspace)/settings/page.tsx)
- Docs route shell: [app/docs/layout.tsx](/Users/parkerrex/Projects/ship-by-sunday/app/docs/layout.tsx), [app/docs/[[...mdxPath]]/page.tsx](/Users/parkerrex/Projects/ship-by-sunday/app/docs/[[...mdxPath]]/page.tsx)
- Protected shell: [features/course/shared/components/app-shell.tsx](/Users/parkerrex/Projects/ship-by-sunday/features/course/shared/components/app-shell.tsx)

### High-risk areas

- Stripe checkout creation and session handling
- checkout success recovery logic
- access grant and resume flow
- sign-in redirect rules
- Convex-backed product-access assumptions

Unless a milestone explicitly says otherwise, do not expand scope into those areas.

## Plan of Work

Work in this exact loop:

1. Pick one unchecked sub-slice from the active milestone.
2. Read only the files listed for that slice plus direct dependencies.
3. Implement the smallest version that satisfies the slice acceptance.
4. Run the slice-specific validation commands.
5. If validation fails, stop and repair before moving on.
6. Update this file:
   - mark the sub-slice status
   - add discoveries
   - add decisions
   - note validation outcome
7. Only then choose the next sub-slice.

Active milestone order:

1. E5 — Neutral workspace home
2. E6 — Starter visibility surface
3. E7 — Public marketing modularization
4. E8 — Analytics adapter
5. E9 — Hardening and docs

## Milestones

### E5 — Neutral workspace home

**Purpose**

Replace the current course-disabled protected blank state with a real starter-mode home. This should become the default protected experience when `starterConfig.modules.course` is `false`.

**Status**

- [x] Complete

**Sub-slices**

- [x] E5.1 Add `features/workspace-home/` with a read-only model layer.
- [x] E5.2 Build a neutral protected dashboard UI that does not import lesson/workbench internals.
- [x] E5.3 Reuse existing cards where useful: Codex connection, starter repo access when enabled, account/settings links.
- [x] E5.4 Render `WorkspaceHomePage` from [app/(workspace)/mission/page.tsx](/Users/parkerrex/Projects/ship-by-sunday/app/(workspace)/mission/page.tsx) when `course` is off.
- [x] E5.5 Keep lesson and artifacts routes on explicit disabled states for now.
- [x] E5.6 Add tests for the `course off` branch and the workspace-home model.

**Primary files**

- new `features/workspace-home/components/*`
- new `features/workspace-home/lib/workspace-home-model.ts`
- [app/(workspace)/mission/page.tsx](/Users/parkerrex/Projects/ship-by-sunday/app/(workspace)/mission/page.tsx)
- possibly [features/settings/components/settings-page.tsx](/Users/parkerrex/Projects/ship-by-sunday/features/settings/components/settings-page.tsx)
- possibly [features/codex/components/codex-connection-card.tsx](/Users/parkerrex/Projects/ship-by-sunday/features/codex/components/codex-connection-card.tsx)
- [tests/integration-ui/*](/Users/parkerrex/Projects/ship-by-sunday/tests/integration-ui)

**Acceptance**

- When `course` is enabled, the existing mission flow still renders.
- When `course` is disabled, `/mission` renders a real protected home instead of a disabled card.
- The page explains what this starter instance currently supports.
- The page contains at least one real next action for the operator.
- No checkout, sign-in, or access-grant behavior changes.

**Validation**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
bunx oxlint --deny-warnings <touched files>
bunx oxfmt --check <touched files>
bun run test:unit <new or touched unit tests>
bun run test:integration:ui <new or touched integration-ui tests>
bun run build
```

**Last verified**

- 2026-03-23: scoped `oxlint` passed on touched files
- 2026-03-23: scoped `oxfmt --check` passed on touched files
- 2026-03-23: `bun run test:unit tests/unit/workspace-home-model.test.ts tests/unit/workspace-home-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/starter-selectors.test.ts tests/unit/not-found-screen.test.tsx` passed
- 2026-03-23: `bun run build` passed

### E6 — Starter visibility surface

**Purpose**

Make the starter’s current configuration legible. A user should not need to inspect source files to understand which modules are on, which are off, and what to do next.

**Status**

- [ ] Not started

**Sub-slices**

- [ ] E6.1 Define a derived “starter visibility” model from config and module state.
- [ ] E6.2 Add a read-only starter visibility panel or page.
- [ ] E6.3 Show brand identity, enabled modules, key routes, and module-specific next steps.
- [ ] E6.4 Link the visibility surface from the protected app when appropriate.
- [ ] E6.5 Add tests for the visibility model and rendering.

**Primary files**

- new `features/starter/components/starter-visibility-*`
- new `features/starter/lib/starter-visibility-model.ts`
- [features/settings/components/settings-page.tsx](/Users/parkerrex/Projects/ship-by-sunday/features/settings/components/settings-page.tsx) or the new workspace home

**Acceptance**

- A signed-in operator can see which modules are enabled.
- The view explains the consequences of a disabled module.
- The view does not expose secrets or low-level env details.

**Validation**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
bunx oxlint --deny-warnings <touched files>
bunx oxfmt --check <touched files>
bun run test:unit <new or touched unit tests>
bun run build
```

### E7 — Public marketing modularization

**Purpose**

Move the public site from “renamed Ship by Sunday page” to “starter homepage with replaceable sections.”

**Status**

- [ ] Not started

**Sub-slices**

- [ ] E7.1 Define section-level content/config seams for hero, proof, FAQ, and pricing.
- [ ] E7.2 Add section-level enablement and safe fallbacks.
- [ ] E7.3 Keep current SEO output intact while making content structure less product-specific.
- [ ] E7.4 Add tests for public CTA presence and structured-data continuity.

**Primary files**

- [features/marketing/content/home.ts](/Users/parkerrex/Projects/ship-by-sunday/features/marketing/content/home.ts)
- `features/marketing/components/home-page/*`
- [features/marketing/lib/home-page-structured-data.ts](/Users/parkerrex/Projects/ship-by-sunday/features/marketing/lib/home-page-structured-data.ts)
- [tests/browser-smoke/app-smoke.spec.ts](/Users/parkerrex/Projects/ship-by-sunday/tests/browser-smoke/app-smoke.spec.ts)

**Acceptance**

- Homepage sections can be hidden or replaced without breaking layout.
- Public metadata and JSON-LD still render.
- The public shell still looks intentional when optional sections are off.

**Validation**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
bunx oxlint --deny-warnings <touched files>
bunx oxfmt --check <touched files>
bun run test:unit <touched tests>
bun run build
# Optional when hosted Convex env is available:
bun run test:browser-smoke
```

### E8 — Analytics adapter

**Purpose**

Add a starter-safe analytics seam without coupling the repo to a specific provider.

**Status**

- [ ] Not started

**Sub-slices**

- [ ] E8.1 Define a typed event contract for public and protected core events.
- [ ] E8.2 Add a no-op or console-backed adapter.
- [ ] E8.3 Add event calls in a minimal set of high-value surfaces.
- [ ] E8.4 Keep analytics separate from observability and incident handling.
- [ ] E8.5 Add unit coverage for event helpers.

**Primary files**

- new `features/analytics/*`
- public CTA surfaces
- checkout entry/success surfaces
- protected home entry surface

**Acceptance**

- A provider can be swapped in later without changing event callsites.
- Event names and payloads are typed and documented.
- Telegram observability remains independent.

**Validation**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
bunx oxlint --deny-warnings <touched files>
bunx oxfmt --check <touched files>
bun run test:unit <new or touched unit tests>
bun run build
```

### E9 — Hardening, docs, and rollout

**Purpose**

Document the starter path, tighten tests, and make the repo safe to hand off as a starter.

**Status**

- [ ] Not started

**Sub-slices**

- [ ] E9.1 Update starter docs to reflect the current config and module model.
- [ ] E9.2 Add or update regression tests for starter mode.
- [ ] E9.3 Decide what remains intentionally product-specific.
- [ ] E9.4 Write starter-ready rollout and cleanup criteria.

**Primary files**

- [README.md](/Users/parkerrex/Projects/ship-by-sunday/README.md)
- [content/docs/customize-the-starter.mdx](/Users/parkerrex/Projects/ship-by-sunday/content/docs/customize-the-starter.mdx)
- other docs as needed
- browser and integration tests

**Acceptance**

- Docs match the real starter behavior.
- Starter-mode regressions are covered.
- The repo has a clear definition of “starter-ready.”

**Validation**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
bun run build
bun run test:unit
bun run test:integration
# Optional when hosted Convex env is available:
bun run test:browser-smoke
```

## Concrete Steps

Use this checklist for every slice:

1. Restate the slice in one sentence at the top of the working session.
2. Confirm the exact files to read before editing.
3. Patch only the files needed for that slice.
4. Format touched files.
5. Run slice-local lint and tests.
6. Run `bun run build`.
7. Update this plan:
   - mark slice complete
   - record validation status
   - record surprises
   - record follow-up if needed

## Validation and Acceptance

### Minimum validation for every slice

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
bunx oxlint --deny-warnings <touched files>
bunx oxfmt --check <touched files>
bun run build
```

### Choose one or more based on blast radius

- `bun run test:unit <specific tests>`
- `bun run test:integration:ui <specific tests>`
- `bun run test:integration <specific tests>`
- `bun run test:browser-smoke`

### Environment caveat

`bun run test:browser-smoke` requires `NEXT_PUBLIC_CONVEX_URL` for the hosted Convex dev deployment. If that env is missing, record the smoke run as blocked-by-environment rather than silently skipping it.

## Idempotence and Recovery

If a slice fails validation:

1. stop new edits
2. inspect only the failing area
3. repair the failure
4. rerun the same validation
5. only after that, resume forward progress

If a slice opens architectural ambiguity:

1. stop implementation
2. update `Decision Log`
3. split the slice into smaller sub-slices
4. continue only after the narrower path is written here

If a slice touches a fragile surface by accident:

1. revert only the unintended part of that slice
2. keep the validated seam work
3. rewrite the slice with a safer boundary

If a command is blocked by environment:

1. record the exact missing env or service
2. do not mark the validation as passed
3. move the slice forward only if the remaining checks are sufficient for a safe partial landing
