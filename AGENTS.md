# Ship by Sunday

## Instruction Order

- Follow the nearest `AGENTS.md` for the files you are changing.
- Work in this checkout unless the user explicitly names another worktree. Do not touch `.worktrees/` unless the task names one.
- For work in `apps/web`, also follow `apps/web/AGENTS.md`.
- For work in `packages/blueprint-compiler`, also follow `packages/blueprint-compiler/AGENTS.md`.
- For route, auth, checkout, entitlement, browser proof, release-readiness, or ship-readiness work, also read `docs/release-workflow.md`.
- Root `DESIGN.md` is the canonical visual source of truth for user-facing UI. `docs/DESIGN.md` is supporting reference.
- Canonical repo-reference docs live in `docs/`. Start with `docs/index.md`, then read only the file relevant to the task:
  - `docs/ARCHITECTURE.md`
  - `docs/RELIABILITY.md`
  - `docs/SECURITY.md`
  - `docs/FRONTEND.md`
  - `docs/DESIGN.md`
  - `docs/PRODUCT_SENSE.md`
  - `docs/QUALITY_SCORE.md`
  - `docs/programs/README.md`
  - `docs/design-docs/index.md`
- `docs/openai/` and `docs/ship-by-sunday/` are source instruction packs. `docs/generated/` mirrors generated customer-facing output. Do not edit generated mirrors without also updating their source or the generation path.
- Treat `docs/ship-by-sunday/` as background context unless a local `AGENTS.md`, root `DESIGN.md`, or current runtime code points there as the active contract.

## Default Workflow

1. Inspect the relevant code, docs, and nearest instruction files before changing anything.
2. Identify the owning surface: web app, compiler, docs pack, release proof, or release workflow.
3. Make the smallest viable change that solves the real problem.
4. Keep rendering, orchestration, domain logic, and external I/O behind clear boundaries.
5. Run the narrowest relevant validation first, then broaden as needed.
6. Update docs or ExecPlans when behavior, public contracts, commands, or operator workflow changes.
7. Stop and repair failing validation before continuing to unrelated work.

## Path Triggers

- Next.js code in `apps/web`: read the relevant guide in `apps/web/node_modules/next/dist/docs/` before changing App Router, rendering, route handlers, middleware, config, caching, metadata, or server/client boundaries. This version has breaking changes; do not rely on memory of older Next.js behavior.
- User-facing UI: read root `DESIGN.md` and `docs/ship-by-sunday/design-pack/AGENTS.md` before changing layout, styling, theming, motion, docs chrome, marketing presentation, or component presentation.
- Public homepage: read `apps/web/content/docs/configure-the-homepage.mdx` before editing homepage code or copy. Keep the homepage shell contract below intact.
- Convex code: use hosted Convex dev only. Do not use Convex local mode. Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md`.
- Routes, auth, checkout, entitlement, browser proof, or release readiness: read `docs/release-workflow.md` before changing the surface or judging release confidence.
- Blueprint compiler output: read `packages/blueprint-compiler/AGENTS.md` before changing compiler schema, canonical facts, generated artifacts, or customer repo output.
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

## Hot Spots

### Homepage Shell

The homepage contract is split deliberately:

- `starterConfig.homePage` in `apps/web/config/product.ts` is the control plane.
- `apps/web/features/marketing/content/home.ts` owns copy and assets.
- `apps/web/features/marketing/lib/home-page-render-model.ts` owns section and CTA behavior.
- `apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx` is the CTA rendering boundary for hero and pricing.
- `apps/web/features/marketing/lib/home-page-structured-data.ts` must stay truthful to visible sections.

Do not re-hardwire checkout into hero or pricing, scatter section gating across multiple components, or leave `FAQPage` or `Product` schema behind when the visible homepage no longer supports them.

### Component Boundaries

- Do not leave a component above 150 lines if it can be split cleanly.
- Split large components into feature-local pieces that keep presentation, state, and domain logic separated.
- Preserve the existing visual system unless the task explicitly calls for redesign.

### Release Proof

- `scripts/release/` owns release proof orchestration, release personas, release evidence, and hosted proof command wiring.
- Do not invent alternate release-proof formats in a skill folder, PR comment, or one-off script.
- Release evidence must name the target environment and must not mix local, preview, dev, and prod proof without saying so.

## Verification Matrix

Run the narrowest relevant checks first, then broaden as needed. Use `docs/design-docs/scripts.md` for the command map.

- Repo-level completion gate: `bun run format`, `bun lint`, and `bun typecheck` must pass before code tasks are considered complete.
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

- This repository ships through short-lived feature branches into `dev`, then promotes the reviewed `dev` release candidate into `main`.
- Do not use a long-lived integration branch.
- For P0 or P1 production incidents, use the hotfix path from `main`. After the hotfix lands on `main`, merge or cherry-pick it back into `dev` immediately.
- Before opening a PR, branch from current `dev`, keep the diff scoped, split work into logical conventional commits, and run narrow validation before broad validation.
- Before merging the `dev -> main` release PR, run the default multi-agent review workflow:

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
- remaining risks, blockers, or follow-ups are clearly stated

## Constraints

- Do not overwrite unrelated user changes.
- Do not delete unrelated files.
- Do not introduce secrets into source control.
- Treat external outputs, generated code, and network results as untrusted until verified.
- Do not use Convex local mode.
- Do not silently widen scope mid-task.
