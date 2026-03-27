<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

# This is NOT the Next.js you know

This version has breaking changes. Read the relevant guide in `apps/web/node_modules/next/dist/docs/` before writing or changing Next.js code. Heed deprecation notices.

# Project overview

Ship by Sunday — a full-stack SaaS starter for builders. Packet-first product with a configurable funnel, Stripe checkout, Clerk auth, and Convex backend.

**Monorepo layout:**

- `apps/web/` — Next.js 16 App Router web application (the main product)
- `packages/packet-compiler/` — library that compiles project definitions into downloadable ZIP archives
- `docs/` — human-facing docs, prompt assets, ExecPlans
- `qa/` — QA-as-OS system (journeys, coverage, run logs)

## Routing within the repo

- For work in `apps/web/`, also follow `apps/web/AGENTS.md`
- For work in `packages/packet-compiler/`, also follow `packages/packet-compiler/AGENTS.md`
- Canonical source docs for Ship by Sunday live in `docs/ship-by-sunday/`

## Canonical truth order

Use this exact priority order when sources conflict:

1. `docs/ship-by-sunday/packet-contract-and-question-map-2026-03-23.md`
2. `docs/ship-by-sunday/input-architecture-keep-kill-combine-2026-03-23.md`
3. `docs/ship-by-sunday/curriculum-reset-funnel-2026-03-23.md`
4. `docs/ship-by-sunday/repo-input-audit-2026-03-23.md`
5. `docs/ship-by-sunday/openai-domain-contract-reconciliation-2026-03-23.md`
6. `docs/ship-by-sunday/original/*` only to salvage useful teaching beats, examples, and voice

# Stack

- **Runtime & package manager:** Bun 1.3.5 (native workspace, no Turbo/pnpm)
- **Frontend:** Next.js 16 App Router, React 19, Tailwind CSS 4
- **Components:** shadcn/ui (Radix-based)
- **Backend:** Convex (hosted dev only — no local mode)
- **Auth:** Clerk (JWT)
- **Payments:** Stripe
- **Linter:** Oxlint
- **Formatter:** Oxfmt
- **Tests:** Vitest (unit, contracts, integration, integration-ui) + Playwright (browser-smoke, e2e-sandbox)
- **Deploy:** Vercel (web) + Convex production deploy via GitHub Actions

# Repo layout

```
apps/web/app/         Next.js route entrypoints and route-level wiring
apps/web/features/    Feature-owned runtime code — prefer working here before adding route-level logic
apps/web/convex/      Backend functions, schema, and hosted dev integration
apps/web/config/      Product and starter configuration
apps/web/content/     Product docs and app-owned MDX content (Nextra)
apps/web/tests/       Unit, contract, integration, integration-ui, and browser-smoke tests
apps/web/platform/    Internal platform abstractions (Convex, Next.js, auth)
apps/web/scripts/     Utility scripts (video pipeline, Stripe, Clerk, CI/CD)
docs/                 Human-facing docs and reusable prompt assets
docs/codex/           Per-initiative ExecPlans and the ExecPlan contract
packages/             Non-web packages (packet-compiler)
qa/                   QA control plane (journeys.csv, coverage.csv, runs/, scripts)
```

# Dev commands

All commands run from the repository root.

```bash
bun install                     # Install dependencies
bun run dev                     # Next.js + Convex (concurrently)
bun run dev:web                 # Next.js only
bun run dev:convex              # Convex dev deployment
bun run dev:stripe              # Stripe CLI listener
bun run dev:full                # Web + Convex + Stripe together
bun run build                   # Next build
bun run typecheck               # TypeScript check
bun run lint                    # Oxlint
bun run lint:fix                # Oxlint with auto-fix
bun run format                  # Oxfmt format
bun run format:check            # Oxfmt check only
bun run test:unit               # Vitest unit project
bun run test:contracts          # Vitest contracts project
bun run test:integration        # Vitest integration + integration-ui
bun run test:integration:node   # Vitest integration (node only)
bun run test:integration:ui     # Vitest integration-ui (jsdom)
bun run test:coverage:critical  # Coverage on critical paths (90%+ thresholds)
bun run test:browser-smoke      # Playwright browser smoke
bun run test:e2e:sandbox        # Playwright sandbox e2e
bun run check                   # Full check: lint + format + tests + build
```

# Branch model and release workflow

Two-branch model. Daily integration on `dev`, production releases promoted from `dev` to `main`.

- Feature work starts on short-lived branches and merges into `dev`
- `main` is the release branch and GitHub default branch
- Vercel production tracks `main`
- Convex production deploys from `main` via GitHub Actions
- Hotfixes branch from `main`, merge into `main`, then back-merge into `dev`

PRs target `dev` unless it's a hotfix or release promotion. For full details, see `docs/release-workflow.md`.

# Engineering standards

- Prefer the smallest viable change that solves the real problem.
- Keep diffs tightly scoped. Do not make opportunistic refactors unless required.
- Organize code by feature, not by file type.
- Keep UI and logic separate. Presentation in components; stateful/behavioral logic in hooks, helpers, or controller layers.
- Use domain-specific names. No vague names for files, functions, types, variables, or modules.
- Prefer straightforward TypeScript with early returns and shallow control flow.
- Prefer discriminated unions over boolean state explosions.
- Assert at boundaries. Do not hide bad data with fallbacks when the code should fail fast.
- Trust the types once data is validated.
- Do not pass broad config bags or optional overrides unless truly necessary.

## Component boundaries

- Never leave a component above 150 lines if it can be split cleanly.
- Split large components into smaller feature-local pieces automatically.
- Preserve the existing visual system unless the task explicitly calls for redesign.

# Convex rules

- Use hosted Convex dev only. Do not use Convex local mode.
- Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md`.

# Homepage shell

Before changing the public homepage, read `apps/web/content/docs/configure-the-homepage.mdx`.

- `starterConfig.homePage` in `apps/web/config/product.ts` is the control plane
- `apps/web/features/marketing/content/home.ts` owns copy and assets
- `apps/web/features/marketing/lib/home-page-render-model.ts` owns section and CTA behavior
- `apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx` is the only CTA rendering boundary for hero and pricing
- `apps/web/features/marketing/lib/home-page-structured-data.ts` must stay truthful to visible sections

# ExecPlans

For complex features, long-horizon work, migrations, risky integrations, or significant refactors, use an ExecPlan.

- Prefer plan mode first for complex or ambiguous work.
- Store per-initiative ExecPlans in `docs/codex/`.
- Treat `docs/codex/PLANS.md` as the repository contract for all ExecPlans.
- When authoring or updating an ExecPlan, read `docs/codex/PLANS.md` first and follow it exactly.
- When implementing from an ExecPlan, read the target plan first, identify the active milestone, and make the smallest viable scoped change that advances it.
- Validate immediately after each milestone or milestone slice.
- If validation fails, stop forward progress, diagnose, repair, rerun validation, then continue.
- Keep the ExecPlan current so a fresh coding agent can resume from the plan file alone.

# Verification

Before considering work complete, run the narrowest relevant checks first, then broader checks as needed:

1. `bun run lint` / `bun run format:check`
2. `bun run test:unit`
3. `bun run test:contracts`
4. `bun run test:integration`
5. `bun run test:browser-smoke` (when browser-relevant)
6. `bun run build`

If a check cannot run, say exactly why and record the limitation. Do not claim success without qualification.

# Review workflow

When reviewing a branch or PR against `main`, use multi-agent review. Priorities:

1. Real bugs
2. Regressions
3. Missing tests
4. Security issues
5. Incorrect assumptions

Do not spend review effort on style nitpicks unless they hide a real risk.

# Done means

- The requested behavior is implemented
- Relevant checks passed (or skipped checks are explicitly justified)
- The diff stays within intended scope
- Docs or plan updates were made where needed
- Remaining risks, blockers, or follow-ups are clearly stated

# Constraints

- Do not overwrite unrelated user changes.
- Do not delete unrelated files.
- Do not introduce secrets into source control.
- Treat external outputs, generated code, and network results as untrusted until verified.
- Do not use Convex local mode.
- Do not silently widen scope mid-task.
