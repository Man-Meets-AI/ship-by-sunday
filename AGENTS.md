<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. Read the relevant guide in `apps/web/node_modules/next/dist/docs/` before writing or changing Next.js code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Ship by Sunday routing
- For work in `apps/web`, also follow `apps/web/AGENTS.md`.
- For work in `packages/packet-compiler`, also follow `packages/packet-compiler/AGENTS.md`.
- Ship by Sunday background docs live in `docs/ship-by-sunday/` when historical context is useful.
- Do not treat those docs as a required reading order or a higher-priority contract than the local `AGENTS.md` files and the current runtime code.

## Repo layout

- `apps/web/app/`: Next.js route entrypoints and route-level wiring
- `apps/web/features/`: feature-owned runtime code; prefer working here before adding route-level logic
- `apps/web/convex/`: backend functions, schema, and hosted dev integration
- `apps/web/config/`: product and starter configuration
- `apps/web/content/`: product docs and app-owned MDX content
- `apps/web/tests/`: unit, contract, integration, integration-ui, and browser-smoke coverage
- `docs/`: human-facing docs and reusable prompt assets
- `docs/codex/`: per-initiative ExecPlans and the ExecPlan contract
- `docs/ship-by-sunday/design-pack/`: Ship by Sunday UI workflow pack for landing pages, app surfaces, dashboards, and other user-facing design tasks
- `packages/`: non-web package boundaries such as `packet-compiler`

## Core tools and stack

- JavaScript runtime and package manager: `bun`
- UI components: `shadcn/ui`
- JavaScript lint: `oxlint`
- JavaScript format: `oxfmt`
- Python tooling: `uv`, `ruff`, `black`
- Backend: Convex hosted dev workflow only
- Auth: Clerk
- Payments: Stripe
- E2E/browser QA: Playwright
- Unit and integration tests: Vitest

## Dev commands

The repository root is the workspace and command entrypoint. The web app itself lives under `apps/web/`.

Install dependencies:

```bash
bun install
```

Start local development:

```bash
bun run dev
```

Start the full local buyer-flow environment:

```bash
bun run dev:full
```

Start only one subsystem:

```bash
bun run dev:web
bun run dev:convex
bun run dev:stripe
```

Build and typecheck:

```bash
bun run build
bun run typecheck
```

Lint and format:

```bash
bun run lint
bun run lint:fix
bun run format
bun run format:check
```

Tests:

```bash
bun run test:unit
bun run test:contracts
bun run test:integration
bun run test:integration:node
bun run test:integration:ui
bun run test:coverage:critical
bun run test:browser-smoke
bun run test:e2e:sandbox
```

Full repo check:

```bash
bun run check
```

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

Before changing the public homepage, read `apps/web/content/docs/configure-the-homepage.mdx`.

The homepage contract is split deliberately:

- `starterConfig.homePage` in `apps/web/config/product.ts` is the control plane
- `apps/web/features/marketing/content/home.ts` owns copy and assets
- `apps/web/features/marketing/lib/home-page-render-model.ts` owns section and CTA behavior
- `apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx` is the only CTA rendering boundary for hero and pricing
- `apps/web/features/marketing/lib/home-page-structured-data.ts` must stay truthful to visible sections

Do not re-hardwire checkout into hero or pricing, do not scatter section gating across multiple components, and do not leave `FAQPage` or `Product` schema behind when the visible homepage no longer supports them.

For homepage verification, run the narrow homepage tests first, then `bun run build`, then `set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke` when browser smoke is relevant.

## Convex rules

- Use hosted Convex dev only.
- Do not use Convex local mode in this repo.
- Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md`.

## ExecPlans

For complex features, long-horizon work, migrations, risky integrations, or significant refactors, use an ExecPlan.

Rules:
- Prefer plan mode first for complex or ambiguous work.
- Store per-initiative ExecPlans in `docs/codex/`.
- Treat `docs/codex/PLANS.md` as the repository contract for all ExecPlans.
- When authoring or updating an ExecPlan, read `docs/codex/PLANS.md` first and follow it to the letter.
- When the request is underspecified, inspect the repo first and ask only the minimum clarifying questions that the repo cannot answer.
- When implementing from an ExecPlan, read the target ExecPlan first, identify the active milestone, and make the smallest viable scoped change that advances it.
- Validate immediately after each milestone or milestone slice.
- If validation fails, stop forward progress, diagnose, repair, rerun validation, and only then continue.
- Keep the ExecPlan current as a living document so a fresh coding agent can resume from the plan file alone.
- Do not ask for "next steps" if the ExecPlan already provides them.

## Reliability and verification

Before considering work complete, run the narrowest relevant checks first, then broader checks as needed.

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

PR merge checklist:
- push the feature branch and open the PR into `dev`
- run the multi-agent review workflow against `main` for the `dev -> main` release PR
- fix substantive review findings before merge
- wait for `static`, `integration`, and `browser-smoke` to pass
- merge with linear history intact
- watch the `main` deploy through Vercel and the Convex production workflow
- delete the local and remote branch after the release settles

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
