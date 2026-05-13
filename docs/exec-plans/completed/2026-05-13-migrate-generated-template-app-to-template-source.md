---
title: Migrate Generated Template App To Template Source
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Make generated Starter repo materialization consume the pinned Starter template source snapshot before generated overlays are applied.
post_build_recap: Generated Starter repo materialization now validates and maps the pinned template source into apps/web before generated overlays, with clean-room no-provider proof still passing.
program_id: starter-template-source-and-billing-proof
planning_brief: docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/planning-brief-3.md
read_when:
  - Resuming generated template-source migration.
  - Changing how the generated Starter repo copies app source.
  - Validating clean-room generated repo proof after template migration.
---

# Migrate Generated Template App To Template Source

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Generated Starter repos should be assembled from a real app template source tree instead of only from TypeScript string renderers. The previous slice pinned the sibling skeleton under `templates/starter-app/source`; this slice connects that committed snapshot to `materializeRepoSnapshot` so generated downloads visibly contain template-derived app source before generated product, design, docs, and operating-pack overlays are applied.

The visible proof is a generated repo snapshot that contains mapped template files under `apps/web/`, still has generated product facts and design overlays, still excludes local artifacts and internal Worker surfaces, and still passes no-provider generated repo validation.

## Progress

- [x] 2026-05-13 EDT: Created this child ExecPlan from `planning-brief-3.md`.
- [x] 2026-05-13 EDT: Read root `AGENTS.md`, `packages/codebase-compiler/AGENTS.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, `planning-brief-3.md`, and the current generator materialization path.
- [x] 2026-05-13 EDT: Implemented template-source materialization through an explicit `templates/starter-app/source` to `apps/web/` adapter.
- [x] 2026-05-13 EDT: Updated generated app overlays so they target the template source layout without leaving a competing root `apps/web/app` tree.
- [x] 2026-05-13 EDT: Added focused regression tests for mapping, overlay precedence, missing template-source manifest behavior, repo snapshot paths, and zip entries.
- [x] 2026-05-13 EDT: Fixed clean-room generated repo proof regressions by adding no-provider email stubs and making the generated protected app group dynamic until provider setup lands.
- [x] 2026-05-13 EDT: Removed the old rendered generated app shell and `_content` overlay; generated app output now stays close to the pinned template source with narrow overlays for product facts, monorepo scripts, provenance, and no-provider setup gates.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts tests/starter-template-source-materialization.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts`.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd packages/codebase-compiler test -- tests/generated-repo-command-contract.test.ts`.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd packages/codebase-compiler test`, `bun run --cwd packages/codebase-compiler typecheck`, `bun run --cwd packages/codebase-compiler lint`, and `bun run --cwd packages/codebase-compiler format:check`.
- [x] 2026-05-13 EDT: Validation passed: `bun run lint`, `bun run format:check`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck`, and `bun run test:packages`.
- [x] 2026-05-13 EDT: Validation passed: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-migrate-generated-template-app-to-template-source.md`, `bun run programs:lint`, touched markdown lint, and `git diff --check`.
- [x] 2026-05-13 EDT: Moved this ExecPlan to completed and updated the Program ledger.

## Surprises & Discoveries

- 2026-05-13 EDT: The pinned source is a single Next.js app root with `src/app`, `convex`, and app-root config files. The generated output is a monorepo with `apps/web`, so the adapter must map source paths into `apps/web/` and generated app overlays must use `apps/web/src/app/...`.
- 2026-05-13 EDT: The template source contains provider-active Sentry and email files, route tests, and root package files that are not compatible with the current no-provider generated repo proof. This slice should keep the adapter explicit and conservative rather than silently shipping provider requirements before the setup ExecPlans are upgraded.
- 2026-05-13 EDT: The clean-room generated repo proof caught two provider-context regressions after source migration: `convex/notifications.ts` needed no-provider email stubs, and the protected app group needed to avoid static prerender of Clerk-dependent client components before Clerk setup.
- 2026-05-13 EDT: The template-derived Notes and billing screens can stay materialized before provider setup if the shared `ConvexReadyGate` renders a setup state before invoking Clerk or Convex hooks.

## Decision Log

Decision: Keep the generated repo as a monorepo and map the single-app template source into `apps/web/`.
Rationale: Current generated output, root scripts, package workspaces, docs, Program material, and clean-room checks already expect a monorepo. Mapping the pinned app root into `apps/web/` preserves that output contract while consuming the committed template source.
Date: 2026-05-13

Decision: Keep provider-heavy source files out of the first materialized template subset when they would break no-provider proof.
Rationale: This slice is generator migration, not provider setup or ChatGPT app work. The generated repo must continue to install and typecheck before the customer configures Clerk, Convex, Stripe, Sentry, Resend, or OpenAI. The adapter should name these exclusions so later slices can remove them deliberately.
Date: 2026-05-13

Decision: Retarget generated app overlays to `apps/web/src/app` while preserving root generated config paths for existing docs and checks.
Rationale: The pinned template uses `src/app`. Keeping generated pages under root `apps/web/app` would create competing Next.js app trees. A small `tsconfig` path fallback can let generated source import root config files while template code still imports from `src/`.
Date: 2026-05-13

Decision: Keep the template source as the primary app UI and keep generated app overlays narrow.
Rationale: The generated repo should feel like the sibling template, not a separately rendered fallback app. Questionnaire-derived product truth now enters through `apps/web/config/product.ts`; generated overlays only replace template files when needed for product labels, monorepo ownership, provenance, or no-provider setup gates.
Date: 2026-05-13

## Outcomes & Retrospective

This plan is complete. Generated repo materialization now validates `templates/starter-app/template-source.json`, maps a conservative no-provider-safe subset of `templates/starter-app/source` into `apps/web/`, and then applies generated overlays. The generated app overlays now target the template's `src/app` layout, generated output no longer emits the old root `apps/web/app` tree, and questionnaire-derived homepage/product content lives in `apps/web/config/product.ts` instead of a generated `_content` module.

The migration intentionally keeps Sentry, Resend, source route tests, and provider-active API routes out of the first materialized subset. Generated stubs keep the existing Convex notification seam type-safe without requiring live email dependencies, and generated setup gates keep protected template screens buildable before Clerk and Convex are configured. The next slices should replace this conservative subset with richer setup-gated provider behavior through the generated operating-pack and template-app work, not by bypassing the no-provider proof.

## Context and Orientation

The current generated repo path starts in `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`. It builds a manifest with `buildRepoGenerationManifest`, copies a small set of customer-safe root and package files from this repo, renders generated app files with `render-generated-template-app-files.ts`, renders generated design-system files, renders generalized starter files, and appends generated Codebase docs.

The pinned template-source boundary lives at `templates/starter-app/source`, and its manifest lives at `templates/starter-app/template-source.json`. The validation helpers in `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts` load the manifest, list source files, compute the deterministic digest, reject local artifacts, and expose generated-overlay policy.

For this plan, "template-source materialization" means reading the committed pinned source snapshot from this repo and producing generated repo files from it. It must not read `~/Developer/next-js-convex-clerk-stripe-template` or fetch a remote branch. "Generated overlays" means later files with the same output path that intentionally replace template-source files, such as generated product config, generated homepage content, generated design-system output, setup docs, Program material, ExecPlans, skills, and validation scripts.

### In Scope

This plan includes a compiler adapter that validates and copies the pinned template source into generated repo output, an explicit path mapping from source app root to `apps/web/`, conservative exclusions for local artifacts and provider-heavy files that would break no-provider proof, generated app overlay path updates, tests for source mapping and overlay precedence, and Program ledger updates.

### Out Of Scope

This plan does not fetch mutable source, change the sibling template repo, replace Notes with the ChatGPT app, implement OpenAI calls, rewrite the full operating pack, add live provider setup requirements, or broaden generated-overlay policy without updating `templates/starter-app/template-source.json` and its tests.

## Plan of Work

First, add a small materialization adapter under `packages/codebase-compiler/src/repo-generation/` that calls `verifyStarterTemplateSourceSnapshot`, maps allowed files from `templates/starter-app/source` into `apps/web/`, and names every temporary exclusion. The adapter should exclude dependency locks, package-root files that the generated monorepo owns, local CI/source-control files, source tests, Sentry/email provider files that require dependencies the current generated lockfile does not ship, and API routes that depend on those excluded files.

Next, update `materialize-repo-snapshot.ts` to include the mapped template-source files before generated overlays. The output assembly should deduplicate by path with later generated files winning, so generated overlays remain the source of truth for product-specific files.

Then, update `render-generated-template-app-files.ts` so generated app files target the template `apps/web/src/...` layout instead of root `apps/web/app/...`. Keep questionnaire-derived product and homepage facts in `apps/web/config/product.ts`, and add only the small generated overlays needed to keep the no-provider app proof stable, such as root provider gating, setup states, Next config, and generated app `tsconfig` path fallback.

After that, update the template-source manifest overlay policy and tests to cover the new generated overlay paths. Add materialization tests proving the generated snapshot contains template-derived files, excludes non-customer-safe source paths, lets generated overlays win, and does not emit the old root app tree.

Finally, run focused compiler checks, generated repo clean-room proof if it remains feasible in the current checkout, planning and Program lints, and broader available checks. Record any unrelated ambient failures separately instead of changing unrelated files.

## Milestones

The first milestone is the adapter. It is complete when a compiler function can validate the pinned source manifest and return mapped `apps/web/` files with explicit exclusions.

The second milestone is integration. It is complete when `materializeRepoSnapshot` includes template-derived files before generated overlays and still returns a duplicate-free customer-safe file list.

The third milestone is overlay alignment. It is complete when generated app overlays target the template source layout, no stale root `apps/web/app` tree is emitted, and tests show generated content replaces the corresponding template files.

The fourth milestone is proof and ledger closeout. It is complete when focused and available broader validation have run, the Program points at the next slice, and this ExecPlan moves to `docs/exec-plans/completed/`.

## Concrete Steps

From `/Users/bazelrex/Developer/ship-by-sunday`, inspect the current surfaces:

    sed -n '1,220p' packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts
    sed -n '1,220p' packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts
    find templates/starter-app/source -maxdepth 3 -type f | sort

Add the adapter and tests:

    packages/codebase-compiler/src/repo-generation/materialize-starter-template-source.ts
    packages/codebase-compiler/tests/starter-template-source-materialization.test.ts

Update the existing generator modules:

    packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts
    packages/codebase-compiler/src/repo-generation/render-generated-template-app-files.ts
    packages/codebase-compiler/src/repo-generation/render-generated-design-system-files.ts
    templates/starter-app/template-source.json
    packages/codebase-compiler/tests/starter-template-source-contract.test.ts
    packages/codebase-compiler/tests/repo-generation.test.ts
    packages/codebase-compiler/tests/review-download-zip.test.ts

Run focused validation first:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts tests/starter-template-source-materialization.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts
    bun run --cwd packages/codebase-compiler typecheck

Then run broader available checks and record any unrelated failures:

	bun run --cwd packages/codebase-compiler test
	bun run --cwd packages/codebase-compiler lint
	bun run --cwd packages/codebase-compiler format:check
	bun run --cwd packages/codebase-compiler test -- tests/generated-repo-command-contract.test.ts
	bun run lint
	bun run format:check
	DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
	bun run test:packages
	bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-migrate-generated-template-app-to-template-source.md
	bun run programs:lint
	git diff --check

## Validation and Acceptance

Acceptance requires observable generated-output behavior: `materializeRepoSnapshot` must validate the pinned template-source manifest, include template-derived app files under `apps/web/`, keep generated overlays as the winning source for product-specific files, exclude local/provider-heavy paths that are not part of this slice, and stop emitting the old root `apps/web/app` generated tree.

The generated clean-room no-provider command proof should continue to pass if the current checkout is otherwise healthy. If the current checkout has unrelated local-runner or workspace drift, run the narrower compiler proof and record the exact unrelated failure.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts tests/starter-template-source-materialization.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts
    bun run --cwd packages/codebase-compiler typecheck
	bun run --cwd packages/codebase-compiler lint
	bun run --cwd packages/codebase-compiler format:check
	bun run --cwd packages/codebase-compiler test
	bun run --cwd packages/codebase-compiler test -- tests/generated-repo-command-contract.test.ts
	bun run lint
	bun run format:check
	DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
	bun run test:packages
	bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-migrate-generated-template-app-to-template-source.md
	bun run programs:lint
	git diff --check

## Idempotence and Recovery

The adapter must read only committed files under `templates/starter-app/source`; rerunning generation should not modify the template source or any sibling checkout. If manifest validation fails, fix the committed source snapshot or manifest rather than bypassing validation. If generated output accidentally includes `templates/`, `node_modules`, `.git`, `.next`, `.vercel`, Sentry/email provider files, or the old root `apps/web/app` tree, tighten the adapter or overlays and rerun the focused tests.

If broader repo checks fail in unrelated dirty files, leave those files untouched and report the exact failing command and file paths. Do not revert or repair unrelated user changes as part of this slice.

## Artifacts and Notes

Pinned source snapshot:

    templates/starter-app/source
    templates/starter-app/template-source.json

Expected materialized examples:

    apps/web/src/components/ui/button.tsx
    apps/web/src/app/(app)/dashboard/page.tsx
    apps/web/convex/schema.ts

Expected generated overlay examples:

    apps/web/src/app/layout.tsx
    apps/web/src/app/(marketing)/page.tsx
    apps/web/src/components/app/convex-ready-gate.tsx
    apps/web/config/product.ts
    apps/web/config/generated-design-system.ts

## Interfaces and Dependencies

The adapter should depend on `verifyStarterTemplateSourceSnapshot` from `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts`. `materializeRepoSnapshot` remains the public compiler entry point used by review/download zip generation. Tests should use `createCompleteProjectDefinition` and `materializeRepoSnapshot` so they exercise the same production path as the download route.
