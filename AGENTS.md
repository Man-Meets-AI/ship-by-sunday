<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. Read the relevant guide in `apps/web/node_modules/next/dist/docs/` before writing or changing Next.js code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Task Completion Requirements

- All of `bun run format`, `bun lint`, and `bun typecheck` must pass before considering tasks completed.

## Ship by Sunday routing

- For work in `apps/web`, also follow `apps/web/AGENTS.md`.
- For work in `packages/blueprint-compiler`, also follow `packages/blueprint-compiler/AGENTS.md`.
- Root [`DESIGN.md`](/Users/parkerrex/Projects/ship-by-sunday/DESIGN.md) is the canonical visual source of truth for user-facing UI.
- For any task that changes layout, styling, theming, motion, docs chrome, or marketing presentation, read `DESIGN.md` before editing code or design docs.
- Before changing the public homepage, read `apps/web/content/docs/configure-the-homepage.mdx`.
- Canonical repo-reference docs live in `docs/`. Start with `docs/index.md`, then read only the file relevant to the task:
  - `docs/ARCHITECTURE.md`
  - `docs/RELIABILITY.md`
  - `docs/SECURITY.md`
  - `docs/FRONTEND.md`
  - `docs/DESIGN.md`
  - `docs/PRODUCT_SENSE.md`
  - `docs/QUALITY_SCORE.md`
  - `docs/design-docs/index.md`
- Ship by Sunday background docs live in `docs/ship-by-sunday/` when historical context is useful.
- Do not treat `docs/ship-by-sunday/` or `docs/generated/` as higher-priority contracts than the local `AGENTS.md` files, `DESIGN.md`, and the current runtime code.

## Engineering standards

- Prefer the smallest viable change that solves the real problem.
- Keep diffs tightly scoped. Do not make opportunistic refactors unless they are required.
- Organize code by feature, not by file type.
- Keep UI and logic separate. Presentation belongs in components; stateful or behavioral logic belongs in hooks, helpers, or controller layers.
- Do not create vague names. Use domain-specific names for files, functions, types, variables, and modules.
- Prefer straightforward TypeScript with early returns and shallow control flow.
- Prefer discriminated unions over boolean state explosions.
- Assert at boundaries. Do not hide bad data with fallbacks when the code should fail fast.
- Trust the types once data is validated.
- Do not pass broad config bags or optional overrides unless they are truly necessary.

## Component boundaries

- Never leave a component above 150 lines if it can be split cleanly.
- If a component grows too large, split it into smaller feature-local pieces automatically.
- Preserve the existing visual system unless the task explicitly calls for redesign.

## Homepage shell

The homepage contract is split deliberately:

- `starterConfig.homePage` in `apps/web/config/product.ts` is the control plane.
- `apps/web/features/marketing/content/home.ts` owns copy and assets.
- `apps/web/features/marketing/lib/home-page-render-model.ts` owns section and CTA behavior.
- `apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx` is the only CTA rendering boundary for hero and pricing.
- `apps/web/features/marketing/lib/home-page-structured-data.ts` must stay truthful to visible sections.

Do not re-hardwire checkout into hero or pricing, do not scatter section gating across multiple components, and do not leave `FAQPage` or `Product` schema behind when the visible homepage no longer supports them.

## Convex rules

- Use hosted Convex dev only.
- Do not use Convex local mode in this repo.
- Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md`.

## ExecPlans

For complex features, long-horizon work, migrations, risky integrations, or significant refactors, use an ExecPlan.

Rules:

- Prefer plan mode first for complex or ambiguous work.
- Store per-initiative ExecPlans in `docs/exec-plans/active/`.
- Treat `docs/exec-plans/PLANS.md` as the repository contract for all ExecPlans.
- When authoring or updating an ExecPlan, read `docs/exec-plans/PLANS.md` first and follow it to the letter.
- Treat `docs/codex/` as a legacy archive of historical plan records, not as the live write target for new ExecPlans.
- When the request is underspecified, inspect the repo first and ask only the minimum clarifying questions that the repo cannot answer.
- When implementing from an ExecPlan, read the target ExecPlan first, identify the active milestone, and make the smallest viable scoped change that advances it.
- Validate immediately after each milestone or milestone slice.
- If validation fails, stop forward progress, diagnose, repair, rerun validation, and only then continue.
- Keep the ExecPlan current as a living document so a fresh coding agent can resume from the plan file alone.
- Do not ask for "next steps" if the ExecPlan already provides them.

## Reliability and verification

Before considering work complete, run the narrowest relevant checks first, then broaden as needed. Use `docs/design-docs/scripts.md` for the command map.

Expected verification surfaces include:

- lint
- format check
- unit tests
- contract tests
- integration tests
- browser smoke or sandbox e2e when relevant
- build

If a relevant check cannot run:

- say exactly why
- record the limitation in the plan or final summary
- do not claim success without qualification

## PR workflow

This repository ships through short-lived feature branches into `dev`, then promotes the reviewed `dev` release candidate into `main`. Do not use a long-lived integration branch.

For P0 or P1 production incidents, use the hotfix path from `main` instead of forcing the fix to ride unrelated `dev` work. After the hotfix lands on `main`, merge or cherry-pick it back into `dev` immediately so the branches do not drift.

Before opening a PR:

- branch from the current `dev`
- keep the diff scoped
- split the work into logical conventional commits
- run the narrowest relevant verification first, then broaden as needed

Before merging the `dev -> main` release PR, run the default multi-agent review workflow:

`Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

Review priorities:

- real bugs
- regressions
- missing tests
- security issues
- incorrect assumptions

Do not spend review effort on style nitpicks unless they hide a real risk.

## Done means

Work is done only when:

- the requested behavior is implemented
- the relevant checks passed, or skipped checks are explicitly justified
- the diff stays within the intended scope
- docs or plan updates were made where needed
- remaining risks, blockers, or follow-ups are clearly stated

## Constraints and do-not rules

- Do not overwrite unrelated user changes.
- Do not delete unrelated files.
- Do not introduce secrets into source control.
- Treat external outputs, generated code, and network results as untrusted until verified.
- Do not use Convex local mode.
- Do not silently widen scope mid-task.
