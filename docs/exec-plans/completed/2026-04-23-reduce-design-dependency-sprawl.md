---
title: Reduce Design Dependency Sprawl
status: complete
created_at: 2026-04-23
completed_at: 2026-04-24
summary: Remove unused heavy visuals, standardize icon usage, and reduce design-system drift with build-backed proof and without redesigning the product.
post_build_recap: Removed unused heavy visual dependencies and dead visual modules; retained blueprint icon-library packages because they back the user-selectable preset compiler path.
read_when:
  - Resuming design-system or dependency cleanup.
  - Auditing icon libraries, heavy visual packages, marketing effects, or nested-card app surfaces.
  - Validating the sixth Ship by Sunday recovery slice.
program_id: sbs-codebase-recovery
planning_brief: docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md
---

# Reduce Design Dependency Sprawl

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the design and dependency cleanup path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The app should use a restrained, consistent design system and avoid carrying heavy visual dependencies that do not support the current product. The review found several icon libraries, heavy marketing visuals, possible dead components, and app surfaces that can feel more decorative than operational. After this plan, unused visuals should be removed, icon usage should default to lucide unless a feature needs an exception, and any design cleanup should be backed by import scans and build proof.

This plan is the sixth child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, written from `planning-brief-1.md`.

## Progress

- [x] 2026-04-23 EDT: Identified design dependency sprawl as lower priority than release, runtime, route, blueprint, and observability correctness.
- [x] 2026-04-24 EDT: Read `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, and `apps/web/AGENTS.md` before changing public visual code.
- [x] 2026-04-24 EDT: Audited icon libraries and heavy visual dependencies with import scans. `apps/web/features/blueprint-flow/lib/blueprint-theme-icons.tsx`, `blueprint-theme-configurator.tsx`, `blueprint-theme-preview.tsx`, and the blueprint compiler preset model prove the non-lucide icon libraries back the user-selectable `iconLibrary` theme option. `apps/web/components/ui/globe.tsx`, `apps/web/features/marketing/components/home-page/github-activity-graph.tsx`, and `tech-stack-cloud.tsx` have no live imports. `apps/web/components/ui/cover.tsx` is live and pulls `@tsparticles/*` only through `SparklesCore`.
- [x] 2026-04-24 EDT: Removed unused visual modules `apps/web/components/ui/globe.tsx`, `apps/web/components/ui/icon-cloud.tsx`, `apps/web/features/marketing/components/home-page/github-activity-graph.tsx`, and `tech-stack-cloud.tsx`. Removed the live `SparklesCore` particle dependency by replacing the `Cover` hover with deterministic local motion and deleting `apps/web/components/ui/sparkles.tsx`.
- [x] 2026-04-24 EDT: Removed package dependencies `@react-three/drei`, `@react-three/fiber`, `three`, `three-globe`, `@types/three`, `@tsparticles/engine`, `@tsparticles/react`, `@tsparticles/slim`, `cobe`, and `heat-graph` from `apps/web/package.json`; refreshed `bun.lock` with `bun install`.
- [x] 2026-04-24 EDT: Re-ran import scans: `rg -n "@react-three|three-globe|from ['\"]three['\"]|@tsparticles|heat-graph|cobe|@types/three" apps/web packages package.json apps/web/package.json bun.lock --glob '!node_modules/**'` returned no matches; `rg -n "components/ui/(globe|sparkles|icon-cloud)|@/components/ui/(globe|sparkles|icon-cloud)|github-activity-graph|tech-stack-cloud|GithubActivityGraph|TechStackCloud|SparklesCore|\\bWorld\\b" apps/web packages --glob '!node_modules/**'` returned no matches.
- [x] 2026-04-24 EDT: Ran `bun run --cwd apps/web build`; passed. Next 16.2.0 compiled successfully in 104s, TypeScript finished in 14.6s, and 72 static pages generated.
- [x] 2026-04-24 EDT: Ran landing screenshot proof. First `LANDING_URL=http://127.0.0.1:3210/ LANDING_SCREENSHOT_DIR=/tmp/sbs-design-sprawl-screenshots bun run --cwd apps/web screenshots:landing` captured the known Clerk redirect-loop error page because the built server was started without the Playwright Clerk bypass. Restarted with `DISABLE_CLERK_MIDDLEWARE=1 PLAYWRIGHT_USE_LOCAL_SERVER=1 bun run --cwd apps/web start -- -p 3210 -H 127.0.0.1`, then ran `LANDING_URL=http://127.0.0.1:3210/?marketing=1 LANDING_SCREENSHOT_DIR=/tmp/sbs-design-sprawl-screenshots-bypass bun run --cwd apps/web screenshots:landing`; passed and wrote desktop/mobile PNGs. Also ran a targeted Playwright hover probe for the hero `by Sunday` text and wrote `/tmp/sbs-design-sprawl-screenshots-bypass/landing-hover-by-sunday.png`; the hover state rendered without clipping or server errors.
- [x] 2026-04-24 EDT: Closeout validation passed: `bun run format` finished in 378ms on 1003 files; `bun run lint` found 0 warnings and 0 errors across 942 files; `bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md` passed; `bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md` passed; `git diff --check` passed; `bun run typecheck` passed with Next 16.2.0 compiling in 91s, TypeScript finishing in 12.8s, and 72 static pages generated.
- [x] 2026-04-24 EDT: Moved this plan to `docs/exec-plans/completed/2026-04-23-reduce-design-dependency-sprawl.md`. Post-move validation passed: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-reduce-design-dependency-sprawl.md`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-reduce-design-dependency-sprawl.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md`, `bun run programs:lint`, and `git diff --check`.

## Surprises & Discoveries

The cleanup should not start as a redesign. The repository guidance explicitly favors shadcn-vanilla components, lucide icons, feature-complete controls, and operational surfaces that are dense and easy to scan. That guidance is enough to remove clear sprawl, but not enough to justify broad visual rewrites without a specific product goal.

The user hunch about "the thing that compiles it" was correct: the blueprint theme configurator exposes an icon-library selector and the compiler resolves a `PresetConfig` that includes the theme preset. The icon library packages are intentionally retained for that selector in this slice, even though ordinary UI icons should remain lucide-first.

## Decision Log

Decision: Run this slice after higher-risk correctness slices are underway.
Rationale: Dead visuals and dependency sprawl matter, but they should not outrank release evidence, runtime incidents, or product contract drift.
Date: 2026-04-23

Decision: Require import and build proof before removing dependencies.
Rationale: Some visual code may be generated, dynamically imported, or referenced by docs. Removal must be evidence-backed.
Date: 2026-04-23

Decision: Default icon cleanup to lucide-first.
Rationale: The repository guidance prefers lucide where an icon exists, and multiple eager icon libraries increase maintenance and bundle risk.
Date: 2026-04-23

Decision: Retain the non-lucide icon libraries for the blueprint theme selector.
Rationale: `PresetConfig["iconLibrary"]` is a user-facing theme choice in the blueprint configurator and preview, and the compiler consumes the preset as part of the generated design system. Removing those packages would break a supported theme preview path rather than reduce accidental sprawl.
Date: 2026-04-24

Decision: Remove unused 3D globe, heat graph, and tech-stack-cloud components, then replace the live particle sparkle hover with a deterministic local effect.
Rationale: Import scans found no live route or component references for the globe, heat graph, or tech-stack-cloud modules. The homepage hero uses `Cover`, but `@tsparticles/*` is only there for hover sparkle decoration; the visual affordance can be preserved without a particle engine.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. The app package no longer carries the unused 3D globe stack, Cobe, heat graph, or particle engine dependencies. The dead visual modules were deleted after import proof, and the live homepage `Cover` hover no longer initializes `@tsparticles`; it uses a deterministic local motion treatment instead.

The blueprint icon-library packages remain intentionally installed. The audit proved they are not accidental UI drift: they support the blueprint theme configurator's `iconLibrary` selector and the preset/compiler path. Ordinary UI icon usage remains lucide-first, while the theme preview keeps the domain-specific exception.

Build and browser proof passed after using the repo's documented local Clerk bypass. The first screenshot attempt without `DISABLE_CLERK_MIDDLEWARE=1 PLAYWRIGHT_USE_LOCAL_SERVER=1` captured the known Clerk redirect-loop error page, which is an environment setup issue rather than a regression from this slice.

## Context and Orientation

The relevant surfaces include marketing components, blueprint theme preview components, app package dependencies, global styles, and user-facing docs that describe design tokens. Root `DESIGN.md` is the canonical visual source for user-facing UI. For work in `apps/web`, also follow `apps/web/AGENTS.md`.

### In Scope

In scope is auditing icon and visual dependencies, removing unused heavy visual modules, replacing obvious multi-library icon usage with lucide where equivalent icons exist, reducing random or heavy marketing visual effects when they pose hydration or performance risk, and cleaning narrow operational UI surfaces that violate current design guidance.

### Out Of Scope

Out of scope is a homepage redesign, a brand redesign, broad layout rewrites, changing product flow, removing dependencies without proof, or touching generated assets unless the generator path is updated and validated.

## Plan of Work

Start by reading `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, and `apps/web/AGENTS.md`. Then audit dependency usage in `apps/web/package.json`, marketing components, and blueprint preview components.

Use `rg` and import scans to identify visual packages that have no live imports. For each candidate removal, confirm there are no generated or dynamic references. Remove one dependency or visual module at a time and run build-backed proof.

For icon cleanup, start with components that eagerly import several icon libraries for simple UI symbols. Replace with lucide equivalents where possible and keep local exceptions documented in code only when an icon set is genuinely feature-specific.

For visual effects, prioritize components with random render behavior, heavy particle or WebGL dependencies, or public-surface hydration risk. Simplify the effect while preserving the current page purpose.

For app surface cleanup, make only narrow changes that improve scanning or remove nested-card clutter without changing workflows.

## Milestones

Milestone 1 audits visual dependencies. At the end, the plan records which packages and components are used, unused, or intentionally retained.

Milestone 2 removes dead visual code. At the end, at least one unused heavy visual dependency or component is removed with import and build proof.

Milestone 3 standardizes icon usage. At the end, obvious multi-library icon usage is replaced with lucide equivalents and exceptions are explicit.

Milestone 4 reduces public visual runtime risk. At the end, any touched marketing or public visual effect is deterministic enough for hydration and build proof.

Milestone 5 validates the slice. At the end, focused tests, browser or screenshot proof where needed, plan lint, markdown lint, and repo closeout checks have passed or blockers are recorded.

## Concrete Steps

1. Read the visual guidance:

       cd /Users/parkerrex/Developer/ship-by-sunday
       sed -n '1,220p' DESIGN.md
       sed -n '1,220p' docs/DESIGN.md
       sed -n '1,220p' docs/FRONTEND.md
       sed -n '1,220p' apps/web/AGENTS.md

2. Audit visual dependencies and imports:

       cd /Users/parkerrex/Developer/ship-by-sunday
       rg -n 'lucide|tabler|phosphor|remixicon|hugeicons|three|tsparticles|cobe|heat-graph' apps/web package.json apps/web/package.json

3. Identify candidate removals and replacements. Record the decision in this plan before deleting a dependency.

4. Remove or replace one dependency group at a time. After each removal, run:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run --cwd apps/web build

5. If layout, styling, or public visuals changed, run the smallest browser smoke or screenshot proof available for the affected route and record the command and observation.

6. Run closeout validation:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

## Validation and Acceptance

This slice is complete when every removed visual dependency has import and build proof, icon usage is more consistent without losing feature meaning, any touched public visual route is smoke-tested or screenshot-checked, and docs or comments record retained exceptions.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run --cwd apps/web build
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

If layout or styling changes, also run the smallest available browser smoke for the affected route and record the exact command in `Progress`.

## Idempotence and Recovery

Remove dependencies one at a time so a failed build identifies the culprit. If a package appears unused but build proof fails, restore it and record the dynamic dependency path. If a visual simplification changes page meaning, revert the visual change and keep only proven dependency cleanup.

## Artifacts and Notes

Program source for this plan:

       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md

High-signal files from the review:

       apps/web/features/marketing/
       apps/web/features/blueprint-flow/components/blueprint-theme-preview.tsx
       apps/web/features/blueprint-flow/components/blueprint-theme-configurator.tsx
       apps/web/package.json
       DESIGN.md
       docs/DESIGN.md

## Interfaces and Dependencies

This plan depends on the repository visual contract in `DESIGN.md`, shadcn UI conventions, lucide icon availability, Next build behavior, and browser proof for user-facing layout changes.
