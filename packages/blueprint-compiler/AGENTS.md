# packages/blueprint-compiler/AGENTS.md

## Ship by Sunday — compiler rules

- Treat this as the generator behind one customer-facing repo output.
- The public contract is the Blueprint snapshot delivered at Review & Download.
- `src/public-artifact-contract.ts`, `src/blueprints/render-*.ts`, and starter-snapshot labels are internal implementation details, not separate product surfaces or planning inputs.
- Prefer derivation over recollection.
- Only ask for information that changes output files.
- Do not store copied-prompt confirmations, env vars, QA runtime state, duplicate naming/domain fields, or free-text implementation briefs as canonical intake.
- Pricing belongs in Build Plan because it affects product logic and payment setup.
- Canonical fact keys come from `packages/blueprint-compiler/src/canonical-project-definition/schema.ts`; use exact names such as `support_email`.
- `domain` and `support_email` are placeholder-friendly and must not block repo generation.
- Provider setup, env vars, QA runtime, deploy walkthroughs, and production fixes belong after blueprint generation.
- Repo snapshots must stay customer-safe and exclude machine-local junk, generated output, and unresolved symlinks.

## Public output contract

- one customer-safe Blueprint snapshot
- repo-root `DESIGN.md`
- generated docs under repo-root `docs/`
- repo-root `README.md` override
- repo-root `docs/README.md`
- repo-root `docs/facts/project-definition.json`
- repo-root `docs/facts/design-system.json`
- starter overrides for `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts`
- starter override for `apps/web/config/generated-design-system.ts`
- design, marketing, build, and prompt materials are generated inside that one repo output; do not treat them as separate public deliverables unless the live product changes first

## Planning behavior

- For compiler changes, create an ExecPlan first.
- Define blockers, placeholder-friendly defaults, and derivation rules explicitly.
- Never re-ask downstream for data that should be derived upstream.
