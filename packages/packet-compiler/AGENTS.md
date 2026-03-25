# packages/packet-compiler/AGENTS.md

## Ship by Sunday — compiler rules

- Treat this as a packet compiler with repo-generation side effects.
- Prefer derivation over recollection.
- Only ask for information that changes output files.
- Do not store copied-prompt confirmations, env vars, QA runtime state, duplicate naming/domain fields, or free-text implementation briefs as canonical intake.
- Pricing belongs in Build Plan because it affects product logic and payment setup.
- Domain and support email are placeholder-friendly and must not block repo generation.
- Provider setup, env vars, QA runtime, deploy walkthroughs, and production fixes belong after packet generation.

## Required outputs

- README
- facts/project-definition.json
- design packet
- marketing packet
- build packet
- prompt pack
- starter-ready repo config

## Planning behavior

- For compiler changes, create an ExecPlan first.
- Define blockers, placeholder-friendly defaults, and derivation rules explicitly.
- Never re-ask downstream for data that should be derived upstream.
