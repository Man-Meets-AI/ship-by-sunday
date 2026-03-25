# packages/packet-compiler/AGENTS.md

## Ship by Sunday — compiler rules

- Treat this as a packet compiler with repo-generation side effects.
- Prefer derivation over recollection.
- Only ask for information that changes output files.
- Do not store copied-prompt confirmations, env vars, QA runtime state, duplicate naming/domain fields, or free-text implementation briefs as canonical intake.
- Pricing belongs in Build Plan because it affects product logic and payment setup.
- Canonical fact keys come from `packages/packet-compiler/src/canonical-project-definition/schema.ts`; use exact names such as `support_email`.
- `domain` and `support_email` are placeholder-friendly and must not block repo generation.
- Provider setup, env vars, QA runtime, deploy walkthroughs, and production fixes belong after packet generation.
- Repo snapshots must stay customer-safe and exclude machine-local junk, generated output, and unresolved symlinks.

## Required outputs

- repo-root `README.md` override
- `packet/README.md`
- `packet/facts/project-definition.json`
- `packet/design/**`
- `packet/marketing/**`
- `packet/build/**`
- `packet/prompts/**`
- review-download repo zip with `packet/` at repo root
- starter overrides for `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts`

## Planning behavior

- For compiler changes, create an ExecPlan first.
- Define blockers, placeholder-friendly defaults, and derivation rules explicitly.
- Never re-ask downstream for data that should be derived upstream.
