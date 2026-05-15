# Ship by Sunday

## Instruction Order

- Follow the nearest `AGENTS.md` for the files you are changing.
- Work in this checkout unless the user explicitly names another worktree. Do not touch `.worktrees/` unless the task names one.
- For work in `apps/web`, also follow `apps/web/AGENTS.md`.
- For work in `packages/codebase-compiler`, also follow `packages/codebase-compiler/AGENTS.md`.
- For route, auth, checkout, entitlement, browser proof, release-readiness, or ship-readiness work, also read `docs/release-workflow.md`.
- The completed T3 Code Source Design System Port Program is the current source for web UI visual and structure decisions. Do not treat root `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, or `docs/ship-by-sunday/design-pack/` as preserved doctrine.
- Canonical repo-reference docs live in `docs/`. Start with `docs/index.md`, then read only the file relevant to the task:
  - `docs/ARCHITECTURE.md`
  - `docs/RELIABILITY.md`
  - `docs/SECURITY.md`
  - `docs/PRODUCT_SENSE.md`
  - `docs/QUALITY_SCORE.md`
  - `docs/programs/README.md`
- `docs/openai/` and `docs/ship-by-sunday/` are source instruction packs. `docs/generated/` mirrors generated customer-facing output. Do not edit generated mirrors without also updating their source or the generation path.
- Treat `docs/ship-by-sunday/` as background context unless a local `AGENTS.md`, Program packet, or current runtime code points there as the active contract.

## Vendored Reference Repositories

- `repos/effect/` is a squashed `git subtree` copy of the upstream Effect repository for local reference while migrating `packages/local-runner`.
- Treat `repos/effect/` as read-only reference material. Do not edit files under it unless the task is explicitly to refresh the subtree from upstream.
- Do not import runtime code from `repos/effect/`. Production code must use published packages such as `effect` and `@effect/platform-node` after they are added as dependencies.
- When working on the Effect migration, inspect `repos/effect/AGENTS.md` and `repos/effect/LLMS.md` if present, then read only the relevant Effect source or docs needed for the slice.
- Refresh the reference from a clean worktree with `git subtree pull --prefix=repos/effect https://github.com/Effect-TS/effect.git main --squash`.

## Default Workflow

1. Inspect the relevant code, docs, and nearest instruction files before changing anything.
2. Identify the owning surface: web app, compiler, docs pack, release proof, or release workflow.
3. Make the smallest viable change that solves the real problem.
4. Keep rendering, orchestration, domain logic, and external I/O behind clear boundaries.
5. Run the exact production code path you touched before relying on broader validation. Prefer importing and calling the touched functions directly; when that is impractical, create a local probe under ignored `codex-scripts/` that copies only the minimum surrounding production inputs, fixtures, or wiring needed to observe the real behavior.
6. Run the narrowest relevant validation first, then broaden as needed.
7. Update docs or ExecPlans when behavior, public contracts, commands, or operator workflow changes.
8. Stop and repair failing validation before continuing to unrelated work.

## Agent Notes

- When you make a mistake, append a concise note to root `MISTAKES.md` with the mistake, impact, and corrective action.
- When you wish you had more context or tools, append a concise note to root `DESIRES.md` with the missing context or capability and why it would have helped.
- When you learn something durable about the local environment, append a concise note to root `LEARNINGS.md` with the fact and how it was verified.
- Create these files if they do not exist. Do not include secrets, credentials, or private user data in these notes.

## Path Triggers

- Next.js code in `apps/web`: read the relevant guide in the installed `next` package's `dist/docs/` before changing App Router, rendering, route handlers, middleware, config, caching, metadata, or server/client boundaries. In this Bun workspace, Next.js is hoisted to `node_modules/next/dist/docs/` at the repo root. This version has breaking changes; do not rely on memory of older Next.js behavior.
- User-facing UI or app structure: read `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md` before changing layout, styling, theming, motion, docs chrome, marketing presentation, component presentation, or route-local implementation structure.
- Public homepage: read `apps/web/src/content/docs/configure-the-homepage.mdx` before editing homepage code or copy. Keep the homepage shell contract below intact.
- Convex code: use hosted Convex dev only. Do not use Convex local mode. Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md`.
- Routes, auth, checkout, entitlement, browser proof, or release readiness: read `docs/release-workflow.md` before changing the surface or judging release confidence.
- Codebase compiler output: read `packages/codebase-compiler/AGENTS.md` before changing compiler schema, canonical facts, generated artifacts, or customer repo output.
- OpenAI API, ChatGPT Apps SDK, Codex, or OpenAI platform behavior: use the OpenAI developer documentation MCP server before implementing or finalizing conclusions.
- ExecPlans: for complex features, long-horizon work, migrations, risky integrations, or significant refactors, use an ExecPlan in `docs/exec-plans/active/`. Read `docs/exec-plans/PLANS.md` before authoring or updating one.
- Programs: for multi-slice initiatives that span several ExecPlans, use a Program packet under `docs/programs/active/`. Read `docs/programs/PROGRAMS.md` before authoring or updating one, and keep the active/completed indexes current.
- Package or dependency changes: update the matching lockfile in the same change and run the narrow dependency validation the repo provides.
- Build-time generated files or mirrors: update the source and generated artifact together, and document the generation command when one exists.

## Engineering Rules

- Prefer the smallest viable change that solves the root cause.
- Keep diffs tightly scoped. Do not perform opportunistic refactors unless they are required for the task.
- Organize code by feature, not by file type.
- Keep UI and logic separate. Presentation belongs in components; stateful or behavioral logic belongs in hooks, helpers, or controller layers.
- Use domain-specific names for files, functions, types, variables, and modules. Do not introduce vague names such as `temp`, `data`, `handler`, `thing`, `stuff`, `utils2`, `helper`, or `misc`.
- Prefer straightforward TypeScript with early returns and shallow control flow.
- Prefer discriminated unions over boolean state explosions.
- Assert at boundaries. Validate external data and required values where they enter the system.
- Trust the types once data is validated.
- Avoid broad config bags, optional overrides, or loose optional fields unless absence is a real supported case.
- Do not create small helpers that are referenced only once unless they isolate a meaningful boundary.

## Customer Setup Contract

External setup is part of the shipped contract. If a change requires a customer, future customer's agent, operator, or maintainer to configure anything outside the codebase, document that setup in the same change before calling the work done.

This rule applies to third-party accounts, provider projects, labels, dashboards, API keys, personal access tokens, OAuth apps, webhooks, scopes, permissions, repository variables, GitHub secrets, Vercel env, Convex env, Stripe/Clerk/PostHog settings, and generated-repo customer instructions.

The documentation must live where the future worker will actually look: active app docs, `README.md`, `docs/internal/`, release docs, generated customer docs, or the nearest relevant `AGENTS.md`. Do not rely on chat history, local `.env` files, provider dashboards, or memory as the only record.

Document all of this when it applies:

- what must be created
- where it is created
- exact names, labels, callback URLs, event types, scopes, roles, or permissions
- which environment owns it: local, preview, production, maintainer-owned, or customer-owned
- where resulting values go: `.env.local`, Vercel env, Convex env, GitHub secrets or variables, generated repo files, or provider dashboards
- how to verify it worked
- what failure looks like when it is missing or misconfigured

## Hot Spots

### Homepage Shell

The homepage contract is split deliberately:

- `starterConfig.homePage` in `apps/web/src/config/product.ts` is the control plane.
- `apps/web/src/app/_content/home-page.ts` owns copy and assets.
- `apps/web/src/app/_lib/home-page-render-model.ts` owns section and CTA behavior.
- `apps/web/src/app/_components/home-page/sections/home-page-primary-cta.tsx` is the CTA rendering boundary for hero and pricing.
- `apps/web/src/app/_lib/home-page-structured-data.ts` must stay truthful to visible sections.

Do not re-hardwire checkout into hero or pricing, scatter section gating across multiple components, or leave `FAQPage` or `Product` schema behind when the visible homepage no longer supports them.

### Component Boundaries

- Do not leave a component above 150 lines if it can be split cleanly.
- Split large components into feature-local pieces that keep presentation, state, and domain logic separated.
- Preserve the existing visual system unless the task explicitly calls for redesign or an active Program supersedes the existing system.

### Release Proof

- `scripts/release/` owns release proof orchestration, release personas, release evidence, and hosted proof command wiring.
- `release.json` owns the release identity contract for protected `vMAJOR.MINOR.PATCH` tags.
- `.github/workflows/release.yml` owns tag publication and release-evidence assembly for verified `main` commits.
- The durable required CI contexts are `static` and `integration`.
- Do not invent alternate release-proof formats in a skill folder, PR comment, or one-off script.
- Release evidence must name the target environment and must not mix local, preview, dev, and prod proof without saying so.

## Feature Risk Testing Standard

Risk determines test depth. Feature size does not.

Classify every meaningful feature or risky change before deciding validation:

- P0 dangerous: billing, auth, authorization, account or data deletion/export, database migrations, admin tools, webhooks, mutating background jobs, external API integrations, irreversible actions, and anything that sends money, email, SMS, legal notices, or customer-visible notifications.
- P1 core product: signup, onboarding, invite flow, create/publish/share core object flows, upload, generate, search, main dashboards, checkout entry, and core API endpoints.
- P2 normal product: profile editing, preferences, filtering, sorting, non-critical settings, UI state, and dashboard widgets.
- P3 low-risk UI/copy: static copy, spacing, colors, non-critical visual-only changes, and simple marketing layout changes.

Use this minimum testing rule:

- P0: unit tests for pure logic, integration tests at the data/API boundary, permission and failure-mode tests, idempotency/retry tests for mutating paths, migration tests when schema changes, staging smoke when external services are involved, and production preflight/config checks for live provider config.
- P1: integration tests for the main path and key edge cases, plus one browser/E2E test when the UI flow is critical.
- P2: unit tests for tricky logic and integration tests when the change hits persistent state or permissions.
- P3: build/static checks and visual review; avoid heavy tests unless the UI behavior is complex or historically fragile.

For every new feature or risky existing-feature change, write or update a small test brief in the ExecPlan, PR notes, or nearest durable docs:

- Feature: what the user or operator is trying to do.
- Risk: P0, P1, P2, or P3.
- Source of truth: DB row, external API state, queued job, file, event, or UI state that proves success.
- Must work: happy path and important variants.
- Must fail safely: bad permissions, bad input, missing/expired/deleted state, external failure, duplicate request, or retry.
- Tests: unit, integration, E2E/browser, staging smoke, production check.
- CI gate: baseline, auth, billing, db, email, storage, e2e, release proof, or generated-output gate.

Write tests against outcomes, not implementation details. Assert the response, DB state, queued job, emitted event, redirect, or visible UI that would catch a real shipped bug. Mock external dependencies in most tests, but do not mock the boundary you are trying to prove.

Every serious bug gets a regression test. When touching a risky existing feature, leave it with more behavioral coverage than it had before.

## Verification Matrix

Run the narrowest relevant checks first, then broaden as needed. Use `docs/design-docs/scripts.md` for the command map.

- Repo-level completion gate: `bun run format`, `bun lint`, and `bun typecheck` must pass before code tasks are considered complete.
- Behavior probes: for code changes, run the exact functions, route handlers, scripts, or render paths that were touched so the final summary can describe observed production behavior, not only static confidence. Keep one-off probes, copied fixtures, and throwaway scripts in ignored `codex-scripts/`.
- Web app changes: run focused unit, integration, browser, or build checks for the touched surface before broader checks.
- Compiler changes: run compiler-focused tests and any output snapshot or fixture checks that prove the generated contract.
- Release proof changes: run the narrowest release script or unit test for the touched surface, then use `bun run release:proof -- --proof=default_ship --dry-run` or `bun run release:proof -- --proof=billing_integration --dry-run` when proof orchestration changes.
- UI changes: verify at least one desktop and one mobile viewport with browser tooling when available.
- Convex changes: validate against hosted Convex dev and never switch this repo to Convex local mode.
- Program packet changes: run `bun run programs:lint`, plus `plans:lint` for touched child ExecPlans.
- Docs-only changes: run the repo markdown or docs validation command when one exists, then run broader gates only when the changed docs affect generated output or operator commands.

If a relevant check cannot run:

- say exactly why
- record the limitation in the plan or final summary
- do not claim success without qualification

## PR And Release Workflow

- This repository ships through short-lived feature branches into `main`.
- Protected release tags are cut from verified `main` commits and must match `release.json`.
- Do not use a long-lived integration branch.
- The old shared `dev` release-candidate branch, `dev -> main` release PR, release triage, and snapshot fallback paths are retired.
- For P0 or P1 production incidents, branch from `main`, open a focused PR into `main`, and use the same post-merge production proof and tag rules as ordinary releases.
- Before opening a PR, branch from current `main`, keep the diff scoped, split work into logical conventional commits, and run narrow validation before broad validation.
- Before merging release-sensitive PRs into `main`, run the default multi-agent review workflow:

`Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

Review priorities:

- real bugs
- regressions
- missing tests
- security issues
- incorrect assumptions

Do not spend review effort on style nitpicks unless they hide a real risk.

## Done Means

Work is done only when:

- the requested behavior is implemented
- the relevant checks passed, or skipped checks are explicitly justified
- the diff stays within the intended scope
- docs or plan updates were made where behavior or contracts changed
- generated mirrors are synced when source-generated contracts changed
- required external setup is documented in the active docs or generated customer docs when the change creates future customer, operator, or agent work
- remaining risks, blockers, or follow-ups are clearly stated

## Constraints

- Do not overwrite unrelated user changes.
- Do not delete unrelated files.
- Do not introduce secrets into source control.
- Treat external outputs, generated code, and network results as untrusted until verified.
- Do not use Convex local mode.
- Do not silently widen scope mid-task.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
