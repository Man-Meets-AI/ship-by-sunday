---
title: Existing Codebase Setup UI
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Build the protected `/workspace/setup` onboarding surface for existing-codebase buyers so they can pair a local runner, resolve readiness blockers, and start the doctor pass.
post_build_recap: Shipped `/workspace/setup`, `/workspace/choose`, workspace route constants, setup readiness model, pairing command surface, Machine Setup and Project Setup UI, privacy defaults, doctor-pass run creation CTA, focused tests, route protection, and review hardening.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Implementing `/workspace/setup` for existing-codebase buyers.
  - Designing Machine Setup, Project Setup, local runner pairing, setup blockers, warnings, or privacy defaults.
  - Verifying that setup remains separate from local runner implementation, doctor-pass execution, findings UI, workflow approval, and worker queues.
---

# Existing Codebase Setup UI

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Existing-codebase buyers need one protected first screen that gets them from purchase into a useful private doctor pass. After this change, an existing-codebase buyer who lands on `/workspace/setup` should see a clear setup console with a local runner pairing command, Machine Setup readiness, Project Setup readiness, row-level blockers and warnings, privacy and sync defaults, default open destination, and one primary `Run doctor pass` action. The screen should make setup feel like guided onboarding for diagnosis, not generic settings and not loop configuration.

The observable result is a protected workspace route where the customer can understand what is ready, what blocks the doctor pass, what remains local, and what command to run locally. This plan does not implement the local runner daemon, `bunx` package, doctor-pass probes, findings upload, workflow approval, or worker queue controls.

## Progress

- [x] 2026-05-04 EDT: Created this child ExecPlan from `planning-brief-2.md`.
- [x] 2026-05-04 EDT: Inspected the current workspace shell, route map, design system, Codex connection card, checkout-intent outputs, workspace data/events outputs, route docs, Convex guidance, and local Next 16 docs before implementation.
- [x] 2026-05-04 EDT: Added existing-codebase workspace route constants for `/workspace/setup`, `/workspace/doctor-pass`, `/workspace/findings`, `/workspace/loops`, `/workspace/runs`, and `/workspace/privacy`, and updated the route map docs.
- [x] 2026-05-04 EDT: Added a typed setup readiness model for pairing state, `Machine Setup`, `Project Setup`, privacy defaults, default open destination, blockers, warnings, and doctor-pass CTA readiness.
- [x] 2026-05-04 EDT: Built `/workspace/setup` with feature-local existing-codebase setup components and a narrow backend setup state/pairing-token hook.
- [x] 2026-05-04 EDT: Added focused unit and integration-ui tests for setup states, row-level blocker details, pairing states, default open destination persistence, privacy defaults, and doctor-pass CTA enablement.
- [x] 2026-05-04 EDT: Added `/workspace/choose` and `/workspace/setup` to the Clerk proxy protected-route matcher and blocked `/workspace` in robots metadata after browser proof exposed the protected-route gap.
- [x] 2026-05-04 EDT: Reconciled the desktop and mobile browser proof requirement as an accepted local-auth limitation: authenticated browser proof could not reach `/workspace/setup` because the local Clerk dev session entered a refresh loop, so completion relies on integration-ui render coverage, route-manifest/typecheck proof, and this documented residual risk until the next visible setup UI change.
- [x] 2026-05-04 EDT: Attempted authenticated local browser proof on `127.0.0.1:3102` and `127.0.0.1:3000`, including the repo local-auth middleware bypass lane. The run did not reach the setup UI because Clerk entered a session-refresh loop before sign-in completed; bypassing middleware allowed sign-in but caused Clerk `auth()` to reject server route access because middleware was not detected.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web test:unit -- tests/unit/workspace-setup-readiness-model.test.ts` passed, 1 file and 9 tests.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx` passed, 1 file and 4 tests, with the pre-existing `--localstorage-file` warning.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts` passed, 3 files and 13 tests.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web test:unit -- tests/unit/workspace-setup-readiness-model.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/public-metadata-routes.test.ts` passed, 3 files and 13 tests.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/workspace-setup-readiness-model.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/public-metadata-routes.test.ts` passed, 4 files and 19 tests, including the setup server route access-recovery and pairing preload behavior.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web lint` passed with 0 warnings and 0 errors.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web typecheck` passed through the Next production build and included `/workspace/setup` in the route manifest; PostHog source-map upload emitted warnings for empty `.next/dev` maps but did not fail the build.
- [x] 2026-05-04 EDT: `bun run format` passed after formatting the seven setup-slice files reported by `bun run format:check`.
- [x] 2026-05-04 EDT: `bun run lint` passed with 0 warnings and 0 errors.
- [x] 2026-05-04 EDT: `bun run typecheck` passed through the Next production build and included `/workspace/setup` in the route manifest.
- [x] 2026-05-04 EDT: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-existing-codebase-setup-ui.md`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-existing-codebase-setup-ui.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md apps/web/content/docs/route-map.mdx`, and `git diff --check` passed.
- [x] 2026-05-04 EDT: Post-review hardening gated `/workspace/setup` and all `workspace` Convex handlers to `existing_codebase_doctor`, prevented resolved fulfillment-track rewrites through `/workspace/choose`, routed legacy grants without fulfillment metadata to `/workspace/choose`, removed section-level readiness fallback for per-row checks, and wired enabled `Run doctor pass` to create a doctor-pass run row without running local probes.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web test:unit -- tests/unit/workspace-setup-readiness-model.test.ts` passed, 1 file and 10 tests, including partial setup events leaving missing required checks blocked.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx` passed, 1 file and 5 tests, with the pre-existing `--localstorage-file` warning, including the enabled doctor-pass click mutation.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web test:unit -- tests/unit/workspace-setup-readiness-model.test.ts tests/unit/workspace-data-model.test.ts tests/unit/course-access.test.ts tests/unit/course-entitlements.test.ts tests/unit/app-workspace-codebase-review-routes.test.tsx` passed, 5 files and 50 tests, covering generated-codebase setup rejection and legacy choice routing.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts tests/unit/workspace-data-model.test.ts tests/unit/workspace-setup-readiness-model.test.ts` passed, 4 files and 24 tests, after updating the privacy fixture to keep the other entitled viewer on the existing-codebase track.
- [x] 2026-05-04 EDT: Targeted `oxfmt` ran on the setup/access/readiness/test files touched by the review fixes.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web lint` passed with 0 warnings and 0 errors after the post-review fixes.
- [x] 2026-05-04 EDT: `bun run --cwd apps/web typecheck` passed through the Next production build and included `/workspace/setup` in the route manifest after the post-review fixes.
- [x] 2026-05-04 EDT: Post-review planning checks passed: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-existing-codebase-setup-ui.md`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-existing-codebase-setup-ui.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md apps/web/content/docs/route-map.mdx`, and `git diff --check`.

## Surprises & Discoveries

- The repo instruction points at `apps/web/node_modules/next/dist/docs/`, but this checkout has Next hoisted under root `node_modules/next/dist/docs/`. The relevant local Next docs were read from the hoisted path.
- The workspace data/events slice had runner bindings and sync-safe events, but it did not expose a durable pairing command read shape for setup. This slice added the narrow Convex setup state hook and short-lived pairing token command model instead of hard-coding fake production state in the page.
- Local browser proof exposed that `/workspace/choose` and `/workspace/setup` were not in the Clerk proxy protected-route matcher. The setup route was protected by the workspace layout, but Clerk server `auth()` also needs the proxy to run for that route. The matcher now includes both `/workspace/choose(.*)` and `/workspace/setup(.*)`.
- Authenticated browser proof was blocked in this local environment: `bun run --cwd apps/web auth:dev:doctor` passes for hosted Convex dev and Clerk test keys, but opening `/sign-in?redirect_url=%2Fworkspace%2Fsetup` under `next dev` triggered Clerk's session-refresh loop before the setup UI rendered. The repo local-auth middleware bypass did not prove this route because Clerk server `auth()` rejects protected route access when middleware is bypassed. Completion records this as a proof limitation rather than claiming browser proof passed.
- Post-review source analysis found that product access alone was too broad for the existing-codebase setup lane. The route and backend now require `existing_codebase_doctor`; generated-codebase buyers stay on `/codebase`, and legacy grants with no track are sent to `/workspace/choose`.
- Post-review source analysis found that aggregate `machineSetupStatus` and `projectSetupStatus` could promote missing row checks to ready. The setup read model now requires each row's own completed event; missing required checks block and missing optional checks warn.

## Decision Log

Decision: Split setup into `Machine Setup` and `Project Setup`.
Rationale: A healthy local machine and a healthy selected repository fail in different ways. Codex auth, `gh` auth, SBS profiles, Codex config hygiene, optional config backup, and daemon health are machine readiness. Repo root, Git remote, dirty state, package manager, command map, and safe read-only mode are project readiness.
Date: 2026-05-04

Decision: Use `blocked`, `warning`, and `ready` for every setup check.
Rationale: Setup needs concrete remediation without inventing many ambiguous health states. Blockers disable `Run doctor pass`; warnings remain visible but allow Crawl to proceed; ready checks explain what is already safe.
Date: 2026-05-04

Decision: Show one primary pairing command before daemon connection.
Rationale: The first local action should be easy to copy and understand. The primary command is `bunx ship-by-sunday setup pair <token>`, with `npx ship-by-sunday setup pair <token>` as fallback. The web UI should show token expiry, expected repo root, and pairing states instead of daemon internals.
Date: 2026-05-04

Decision: Keep `Run doctor pass` disabled only by blockers.
Rationale: The first AHA is the doctor pass and Top 9 findings ledger. Warnings such as dirty worktree during Crawl, skipped optional config backup, or imperfect sandbox defaults should be visible, but they should not prevent a useful read-only scan.
Date: 2026-05-04

Decision: Keep this plan out of runner and doctor-pass implementation.
Rationale: The setup UI depends on checkout intent and workspace state, but local execution belongs in `local-runner-prototype`, and probes plus sync preview belong in `doctor-pass-and-sync-preview`. Mixing them would make the first UI slice harder to validate and would blur privacy boundaries.
Date: 2026-05-04

Decision: Derive setup UI from backend rows and sync-safe events, not direct browser access to the local daemon.
Rationale: The browser should subscribe to hosted state and event summaries. It should not read customer files or talk directly to a local daemon. That keeps refresh, audit, revocation, and privacy behavior consistent.
Date: 2026-05-04

Decision: Add a narrow backend setup pairing hook in the existing workspace contract.
Rationale: `/workspace/setup` needs a real pairing token and setup summary shape before the local runner exists. A Convex mutation now prepares or reuses a short-lived pairing runner row, and the setup state query returns the copyable `bunx` and `npx` commands from backend state.
Date: 2026-05-04

Decision: Protect the existing-codebase workspace spine through the Clerk proxy.
Rationale: The workspace layout checks product access, but Clerk server `auth()` requires the middleware/proxy to match the protected route. `/workspace/choose` and `/workspace/setup` are now part of the protected route matcher so checkout-routed existing-codebase buyers land on a real protected onboarding surface.
Date: 2026-05-04

Decision: Gate existing-codebase workspace APIs by fulfillment track, not only granted product access.
Rationale: Product access covers both generated-codebase and existing-codebase buyers. `/workspace/setup` and the `workspace` Convex namespace create and operate the existing-codebase setup lane, so they must require `existing_codebase_doctor`. Legacy grants without fulfillment metadata are routed to `/workspace/choose`; resolved tracks cannot be rewritten from the choice screen.
Date: 2026-05-04

Decision: Treat setup readiness as row-event derived.
Rationale: Section or runner health aggregates are useful summaries, but they cannot prove every required setup check completed. Each readiness row now needs its own `setup.check.completed` event to become ready or warning; missing required events remain blockers.
Date: 2026-05-04

Decision: Let `Run doctor pass` create a run row, but not execute probes in this slice.
Rationale: The setup page needs an enabled primary action that is not inert. Creating a `doctorPassRuns` row is within the existing workspace contract, while actual local probe execution remains owned by the runner and doctor-pass plans.
Date: 2026-05-04

## Outcomes & Retrospective

Implemented the first `/workspace/setup` surface as a protected existing-codebase setup console. The route prepares backend pairing state on the server, renders from a typed local read model, and shows the `bunx ship-by-sunday setup pair <token>` command with `npx` fallback, pairing stages, Machine Setup and Project Setup readiness, blocker/warning/ready rows, privacy defaults, default open destination, daemon and one-shot status affordances, and the primary `Run doctor pass` CTA. Post-review hardening now keeps generated-codebase buyers out of the existing-codebase lane, keeps legacy grants on the choice screen until they resolve a track, requires per-check setup events for ready rows, and makes the enabled CTA create a doctor-pass run row.

The implementation intentionally does not run local probes, upload findings, mutate Codex config, talk directly to a daemon from the browser, create loop setup, or expose queue controls. Authenticated browser proof did not complete because the local Clerk sign-in route loops before authenticated `/workspace/setup` can render, even though the repo auth doctor reports the local Clerk and hosted Convex dev configuration is aligned. This completion accepts integration-ui render coverage plus route-manifest/typecheck proof with that local-auth limitation recorded; the next visible setup UI change must add fresh desktop and mobile browser proof.

## Context and Orientation

The protected app route group lives under `apps/web/app/(workspace)`. The route group itself is not part of the URL, so `apps/web/app/(workspace)/workspace/setup/page.tsx` renders `/workspace/setup`. `apps/web/app/(workspace)/layout.tsx` already gates protected workspace routes through product access. The generated-codebase flow currently lives at `apps/web/app/(workspace)/codebase/page.tsx` and must remain `/codebase`.

The current route constants live in `apps/web/config/product.ts` as `routeConfig`. It currently names `/codebase`, `/review`, `/settings`, and other live paths, but not the future existing-codebase workspace spine. The route map lives in `apps/web/content/docs/route-map.mdx` and currently calls `/codebase` the canonical protected landing. The checkout-intent routing plan owns changing success routing so generated buyers go to `/codebase`, existing-codebase buyers go to `/workspace/setup`, and missing or legacy intent goes to a choice screen.

The shared app shell lives in `apps/web/app/(workspace)/_components/app-shell.tsx` and its supporting components under `apps/web/app/(workspace)/_components/app-shell/`. Existing local navigation patterns live in `app-shell-local-nav.tsx` and `apps/web/app/(workspace)/_components/workspace-navigation/`. Generated-codebase page components live under `apps/web/app/(workspace)/_components/codebase-flow/`; do not reuse their stage model for existing-codebase setup because the generated intake stages are product-fact sections, not local runner readiness.

The current Codex connection UI lives under `apps/web/app/(workspace)/_components/codex-connection-card/`. The setup UI can reuse its account-status model or visual component if it fits, but setup must still distinguish ChatGPT/Codex account connection from local runner pairing and Machine Setup health. Codex app-server connection is not the same thing as a paired local runner.

The workspace data/events plan at `docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md` owns Convex tables and sync-safe events for existing-codebase projects, runner bindings, repository bindings, doctor-pass runs, findings, workflow runs, and runner events. This setup UI plan should consume those rows and events. If implementation finds that the data/events plan did not define a pairing token or setup-health read shape, update that plan first or revise both plans together before inventing token storage inside a client component.

Before implementing under `apps/web`, read `apps/web/AGENTS.md`. Because this plan touches protected routes and UI, also read `docs/release-workflow.md`, root `DESIGN.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, and the relevant Next.js docs under `apps/web/node_modules/next/dist/docs/` for App Router, server component, redirect, metadata, and client boundary behavior. If implementation touches Convex queries or mutations, read `apps/web/convex/_generated/ai/guidelines.md` first and use hosted Convex dev only.

### In Scope

This plan includes the protected `/workspace/setup` route, route constants for the existing-codebase workspace spine, route-map documentation, feature-local setup components, the setup read model, integration with existing product access, setup local navigation labels, desktop and mobile layout, unit tests, integration-ui tests, browser proof, and Program/ExecPlan refresh.

The first setup screen includes `Machine Setup`, `Project Setup`, runner pairing, ChatGPT/Codex connection status, daemon status display, privacy and sync defaults, default open destination, setup blockers, setup warnings, row-level remediation copy, and the primary `Run doctor pass` CTA.

Machine Setup checks include Codex auth, `gh` auth, SBS execution profiles, Codex config diff and backup, optional `codex-config`, and daemon health. Project Setup checks include repo root, Git remote, dirty state, package manager, command map, and safe read-only mode.

The local runner pairing UI includes one copyable `bunx ship-by-sunday setup pair <token>` command, an `npx ship-by-sunday setup pair <token>` fallback, token expiry, expected repo root, pairing states `waiting`, `runner detected`, `verifying machine`, `verifying project`, and `paired`, plus `Regenerate token`, `Use one-shot mode`, and `Cancel pairing` actions when those actions are backed by the data contract.

The one-shot mode UI copy belongs in this plan, but only as a setup fallback affordance. It can describe that one-shot pairs, checks setup, runs the doctor pass, writes local reports, opens sync preview, and exits. The actual one-shot command behavior belongs in `local-runner-prototype` and `doctor-pass-and-sync-preview`.

### Out Of Scope

This plan does not implement the local runner CLI, daemon, one-shot command execution, local `.sbs/` state, Codex profile installation, Codex config mutation, `gh` commands, setup check execution, doctor-pass probes, `codebase-intake` productization, sync preview generation, findings upload, Top 9 findings UI, workflow packet approval, write leases, branch creation, PR delivery, run history, loop catalog, privacy deletion mechanics, recurring worker queues, managed GitHub, or generated-repo operating pack work.

This plan must not stream raw terminal logs, show raw source, store local absolute paths in the browser or Convex, or present the browser as capable of directly editing local files. Local mutations should be represented as `Fix in terminal` or `Preview diff` affordances whose actual execution is owned by runner plans.

## Plan of Work

Start by confirming dependencies. Read the checkout-intent plan and workspace data/events plan, then inspect the current runtime files named in the context section. Confirm whether `routeConfig` already includes `/workspace/setup` and whether the data/events implementation exposes a setup summary query, pairing token command model, and runner event-derived health state. If those data shapes do not exist yet, update the data/events plan first or make this plan explicitly wait for that implementation.

Next, add route constants and docs. `apps/web/config/product.ts` should expose stable route names such as `workspaceSetup`, `workspaceDoctorPass`, `workspaceFindings`, `workspaceLoops`, `workspaceRuns`, and `workspacePrivacy`, while keeping `codebase` unchanged. `apps/web/content/docs/route-map.mdx` should say `/codebase` is the generated-codebase protected landing and `/workspace/setup` is the existing-codebase setup entry after checkout intent routing.

Then define the setup read model in a feature-local library. Prefer a file such as `apps/web/app/(workspace)/_lib/workspace-setup-readiness-model.ts` that converts backend setup rows and runner events into explicit UI sections, check rows, pairing state, privacy summary, and CTA state. Represent setup check status as a discriminated union, not loosely related booleans. The model should define exactly why `Run doctor pass` is enabled or blocked.

After that, build the route and components. Expected ownership is `apps/web/app/(workspace)/workspace/setup/page.tsx` for the server route, plus feature-local components under `apps/web/app/(workspace)/_components/existing-codebase-setup/`. Good component names are `existing-codebase-setup-page.tsx`, `setup-pairing-panel.tsx`, `setup-readiness-section.tsx`, `setup-check-row.tsx`, `setup-privacy-summary.tsx`, `setup-open-destination-control.tsx`, and `setup-doctor-pass-action.tsx`. Keep stateful behavior in hooks or model helpers, not in large presentation components.

Design the page as an operational workspace, not a homepage. Use the existing app shell, restrained neutral surfaces, clear section hierarchy, row-based check lists, and one obvious primary action. Avoid nested cards, decorative hero treatment, marketing copy, or a generic settings page label. The left or local navigation labels for this lane should be product-stage labels: `Setup`, `Doctor Pass`, `Findings`, `Loops`, `Runs`, and `Privacy`, with unavailable future routes clearly disabled or routed to scoped placeholders only if the implementation needs them for navigation proof.

Finally, add tests and browser proof. Unit tests should cover model derivation for blockers, warnings, ready states, pairing states, one-shot copy, privacy defaults, and CTA enablement. Integration-ui tests should render `/workspace/setup` with seeded setup summaries and assert the primary command, fallback command, blocker rows, warning rows, privacy defaults, default open destination, and disabled or enabled `Run doctor pass` behavior. Browser proof should cover one desktop viewport and one mobile viewport.

## Milestones

The first milestone is route and read-model shape. It is complete when route constants and docs name `/workspace/setup`, and a typed setup readiness model can represent unpaired, waiting, verifying, paired, blocked, warning, and ready states without rendering UI.

The second milestone is setup composition. It is complete when `/workspace/setup` renders inside the protected app shell with Machine Setup, Project Setup, pairing, privacy defaults, default open destination, and `Run doctor pass`.

The third milestone is remediation behavior. It is complete when blocked rows show exact cause, impact, local action, and `Retry check`, warnings show `Review`, `Dismiss for this run`, or `Fix later`, and local mutation rows use terminal or diff affordances rather than pretending the browser edits local files.

The fourth milestone is responsive proof. It is complete when the setup UI works without overlapping text or broken controls on desktop and mobile, keeps the primary action clear, and does not show findings, loop setup, or queue controls.

The fifth milestone is validation and Program refresh. It is complete when focused unit tests, integration-ui tests, app lint and typecheck, planning validation, markdown lint, and diff checks pass, and this ExecPlan records the evidence.

## Concrete Steps

From the repo root, inspect the current workspace and dependency surfaces before editing:

    sed -n '1,180p' apps/web/config/product.ts
    sed -n '1,220p' apps/web/content/docs/route-map.mdx
    sed -n '1,220p' 'apps/web/app/(workspace)/layout.tsx'
    sed -n '1,220p' 'apps/web/app/(workspace)/codebase/page.tsx'
    sed -n '1,220p' 'apps/web/app/(workspace)/_components/app-shell.tsx'
    sed -n '1,220p' 'apps/web/app/(workspace)/_components/app-shell/app-shell-local-nav.tsx'
    sed -n '1,220p' 'apps/web/app/(workspace)/_components/app-shell/app-shell-primary-nav.tsx'
    sed -n '1,220p' 'apps/web/app/(workspace)/_components/codex-connection-card/codex-connection-card.tsx'

Read required local docs before implementation:

    sed -n '1,220p' apps/web/AGENTS.md
    sed -n '1,220p' docs/release-workflow.md
    sed -n '1,220p' DESIGN.md
    sed -n '1,220p' docs/ship-by-sunday/design-pack/AGENTS.md
    sed -n '1,260p' docs/exec-plans/completed/2026-05-04-existing-codebase-checkout-intent-routing.md
    sed -n '1,260p' docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md

If Convex queries or mutations are touched, read Convex guidance first:

    sed -n '1,260p' apps/web/convex/_generated/ai/guidelines.md

Expected implementation ownership is:

    apps/web/config/product.ts
    apps/web/content/docs/route-map.mdx
    apps/web/app/(workspace)/workspace/setup/page.tsx
    apps/web/app/(workspace)/_lib/workspace-setup-readiness-model.ts
    apps/web/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx
    apps/web/app/(workspace)/_components/existing-codebase-setup/setup-pairing-panel.tsx
    apps/web/app/(workspace)/_components/existing-codebase-setup/setup-readiness-section.tsx
    apps/web/app/(workspace)/_components/existing-codebase-setup/setup-check-row.tsx
    apps/web/app/(workspace)/_components/existing-codebase-setup/setup-privacy-summary.tsx
    apps/web/app/(workspace)/_components/existing-codebase-setup/setup-open-destination-control.tsx
    apps/web/app/(workspace)/_components/existing-codebase-setup/setup-doctor-pass-action.tsx

Exact filenames can change if the surrounding codebase suggests a clearer feature-local boundary. Keep names specific to existing-codebase setup.

Add focused tests close to these names:

    apps/web/tests/unit/workspace-setup-readiness-model.test.ts
    apps/web/tests/integration-ui/workspace-setup-page.test.tsx

Run focused validation first:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-setup-readiness-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck

Run planning validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-existing-codebase-setup-ui.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-existing-codebase-setup-ui.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md apps/web/content/docs/route-map.mdx
    git diff --check

If the implementation changes visible UI, start the app and capture browser proof for one desktop and one mobile viewport. Use the repo's existing browser tooling or Playwright pattern for local route proof. The proof should show `/workspace/setup` rendering the pairing command, readiness sections, privacy defaults, and doctor-pass CTA without overlap.

## Validation and Acceptance

This plan is accepted when `/workspace/setup` is a protected existing-codebase onboarding surface that renders from typed setup state. A buyer should be able to see the primary `bunx` pairing command and `npx` fallback, understand whether the runner is waiting, detected, verifying, or paired, see Machine Setup and Project Setup checks with `blocked`, `warning`, or `ready` status, and understand why `Run doctor pass` is enabled or blocked.

Setup blockers are accepted when each blocked row names the exact cause, why it blocks the doctor pass, what local action is needed, and how to retry. Warnings are accepted when they remain visible but do not disable Crawl. Privacy is accepted when the page says raw source, raw terminal logs, and Codex transcripts are disabled by default and only approved structured findings or report summaries can sync.

The route is accepted when `/codebase` remains the generated-codebase protected landing, `/workspace/setup` is documented as the existing-codebase setup entry, and the page does not show findings, abstract loop setup, workflow approval, run history, or worker queue controls.

### Test Commands

Run these commands from the repo root:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-setup-readiness-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-existing-codebase-setup-ui.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-existing-codebase-setup-ui.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md apps/web/content/docs/route-map.mdx
    git diff --check

For future visible UI changes, add desktop and mobile browser proof before marking the follow-up change complete. This completed slice records the 2026-05-04 local Clerk blocker as a residual proof limitation rather than a passed browser proof. If a listed test file is renamed during implementation, update this plan with the actual command before completion.

## Idempotence and Recovery

Adding `/workspace/setup` should be additive. If checkout intent routing is not complete yet, the route can still be visited directly by entitled users for testing, but checkout success should not be guessed inside this plan.

If the workspace data/events implementation is not ready, do not hard-code durable fake backend state into production UI. Use typed fixtures only in tests or keep the route behind a minimal empty state that explains setup is waiting on project creation. Record the dependency in this plan before stopping.

Pairing token actions must be safe to regenerate. Regenerating a token should invalidate or supersede the prior unpaired token in backend state when the backend owns that behavior. The UI should never expose secret credential contents, Codex `auth.json` contents, local absolute paths, or raw terminal logs.

If browser proof shows text overlap, clipped commands, or a confusing mobile layout, fix the layout before broad validation. The setup command should wrap or scroll predictably without resizing the whole page.

## Artifacts and Notes

Owning Program: `docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md`.

Planning brief: `docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`.

Prior child plans:

    docs/exec-plans/completed/2026-05-04-existing-codebase-checkout-intent-routing.md
    docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md

Scratch note: `support-codebases.md`.

Canonical generated-codebase route: `/codebase`.

Canonical existing-codebase setup route: `/workspace/setup`.

Primary pairing command:

    bunx ship-by-sunday setup pair <token>

Fallback pairing command:

    npx ship-by-sunday setup pair <token>

## Interfaces and Dependencies

This plan depends on `apps/web/AGENTS.md`, `docs/release-workflow.md`, `DESIGN.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, `apps/web/config/product.ts`, `apps/web/content/docs/route-map.mdx`, `apps/web/app/(workspace)/layout.tsx`, `apps/web/app/(workspace)/_components/app-shell.tsx`, `apps/web/app/(workspace)/_components/app-shell/app-shell-local-nav.tsx`, `apps/web/app/(workspace)/_components/app-shell/app-shell-primary-nav.tsx`, `apps/web/app/(workspace)/_components/workspace-navigation/`, `apps/web/app/(workspace)/_components/codex-connection-card/`, `docs/exec-plans/completed/2026-05-04-existing-codebase-checkout-intent-routing.md`, `docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md`, and `docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`.

The setup UI should consume existing-codebase workspace state from the data/events implementation. Expected upstream concepts are `workspaceProject`, `workspaceRunnerBinding`, `workspaceRepositoryBinding`, `workspaceRunnerEvent`, setup check summaries, runner pairing status, privacy defaults, and doctor-pass readiness. The downstream plans that depend on this setup UI are `local-runner-prototype`, `doctor-pass-and-sync-preview`, `findings-ledger-and-decision-screens`, `source-truth-agent-readiness-workflow`, `workspace-support-surfaces`, and `existing-codebase-work-phase-workers`.
