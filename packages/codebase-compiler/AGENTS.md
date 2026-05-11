# packages/codebase-compiler

## Scope

Use this file for all work under `packages/codebase-compiler`.

This package is the generator behind one customer-facing repo output. The public contract is the Codebase snapshot delivered at Review & Download.

## Read Before Editing

- Start with the repo root `AGENTS.md`.
- Read the current schema and render path before changing canonical facts or output shape:
  - `src/canonical-project-definition/schema.ts`
  - `src/public-artifact-contract.ts`
  - `src/codebases/render-*.ts`
- If generated docs or customer-facing pack contracts change, inspect the matching files under `docs/ship-by-sunday/`, `docs/openai/`, and `docs/generated/`.

## Output Contract

The compiler produces one customer-safe Codebase snapshot that includes:

- repo-root `DESIGN.md`
- generated docs under repo-root `docs/`
- repo-root `README.md` override
- repo-root `docs/index.md`
- repo-root `docs/facts/project-definition.json`
- repo-root `docs/facts/design-system.json`
- customer-safe `packages/codebase-compiler`, `packages/codebase-presentation`, and `packages/telegram-chat-widget` workspace source required by the generated app
- starter overrides for `apps/web/config/product.ts` and `apps/web/app/_content/home-page.ts`
- starter override for `apps/web/config/generated-design-system.ts`
- design, marketing, build, and prompt materials inside that one repo output

Do not treat design, marketing, build, or prompt materials as separate public deliverables unless the live product changes first.

## Compiler Rules

- Prefer derivation over recollection.
- Only ask for information that changes output files.
- Do not store copied-prompt confirmations, env vars, QA runtime state, duplicate naming/domain fields, or free-text implementation briefs as canonical intake.
- Pricing belongs in Build Plan because it affects product logic and payment setup.
- Canonical fact keys come from `src/canonical-project-definition/schema.ts`; use exact names such as `support_email`.
- `domain` and `support_email` are placeholder-friendly and must not block repo generation.
- Provider setup, env vars, QA runtime, deploy walkthroughs, and production fixes belong after codebase generation.
- Repo snapshots must stay customer-safe and exclude machine-local junk, generated output, and unresolved symlinks.
- `src/public-artifact-contract.ts`, `src/codebases/render-*.ts`, and starter-snapshot labels are implementation details, not separate product surfaces or planning inputs.

## Change Triggers

- Schema changes must update every renderer, fixture, and test that depends on the fact shape.
- Public output changes must update docs-pack or generated-pack expectations in the same change.
- New required facts must define placeholder behavior, blocking behavior, and where the value appears in output.
- New generated files must prove they are customer-safe and do not include local paths, secrets, unresolved symlinks, or transient runtime state.

## Planning Triggers

- For compiler changes, create or update an ExecPlan first.
- Define blockers, placeholder-friendly defaults, and derivation rules explicitly.
- Never re-ask downstream for data that should be derived upstream.

## Local Verification

- Run the narrow compiler-focused tests that cover the changed schema, renderer, or output path.
- If generated artifacts or docs packs change, verify source and generated mirrors are in sync.
- Before completing code work, the repo-level gates from root still apply: `bun run format`, `bun lint`, and `bun typecheck`.
