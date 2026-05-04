# Research Pass: Packaging And Validation

## Question

What validation and packaging architecture should make customer Programs and ExecPlans enforceable without shipping internal Ship by Sunday state?

## Findings

The internal repo uses dedicated linters: `scripts/exec-plan/plan-lint.ts` validates ExecPlan frontmatter, required sections, Program linkage, canonical paths, and completion-state truth. `scripts/programs/frontmatter-lint.ts`, `scripts/programs/document-lint.ts`, and `scripts/programs/prompt-contract.ts` validate Program packets, planning briefs, pointer files, Program docs, and prompt contract requirements. Root `package.json` exposes `plans:lint` and `programs:lint`.

The external `plans-and-programs` starter proves a smaller no-dependency validator can be copied easily, but its `scripts/validate.mjs` is intentionally hard-coded to the starter's seed example. That is useful as a teaching artifact, not a drop-in customer linter for Ship by Sunday.

Generated customer repos already use Bun and root scripts through `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts`, so greenfield generated repos can safely receive `plans:lint`, `programs:lint`, and `agentic:check` scripts. Mature repo adoption must discover and preserve the existing package manager. It can still ship scripts as recommendations or a separate tool path rather than overwriting `package.json`.

The generated customer-safe snapshot contract currently excludes internal Program and ExecPlan docs, which prevents leakage of internal history and local assumptions. This is a good boundary. The Program should introduce new generalized renderer-owned artifacts instead of weakening that boundary.

## Recommended Direction

Build two validation layers:

The generated-repo layer should use first-party TypeScript linters adapted from internal `scripts/exec-plan` and `scripts/programs`, rendered or copied into customer repos in a generalized form. It should validate only customer-safe paths and not reference Ship by Sunday internal archives. Root scripts should expose:

- `plans:lint`
- `programs:lint`
- `agentic:check`

The mature-repo layer should be portable and non-invasive. It should run as a Ship by Sunday audit tool or generated script that reports suggested changes instead of editing automatically. It should produce an adoption packet and a command map, then let the customer's repo decide which scripts become permanent.

The first implementation slice should not introduce a package dependency unless the existing repo already has the dependency. If YAML parsing is needed for durable lint quality, prefer using whatever parser is already available in the repo. If none exists, start with the existing internal parser path and keep the generated validator narrow.

Before adding generated validation scripts, the Program must reconcile prompt and script drift. Current generated prompts include older `execplan-*` files, and at least one shipped customer prompt describes the older `plan_status` field rather than the current internal ExecPlan frontmatter contract. Generated root scripts must not advertise `plans:lint` or `programs:lint` until the corresponding validator implementation ships in the generated repo.

## Validation Targets

Generated repo tests should assert that the materialized customer zip includes the agentic directories, prompt assets, skill wrappers, scripts, and template docs. Structural tests should parse Program and ExecPlan frontmatter and prove that `current-planning-brief.txt` points to a valid `planning-brief-1.md` when a seed Program is emitted.

Mature repo audit tests should use fixture repositories with different package managers and partial docs coverage. The audit should not require the fixture to be a Ship by Sunday starter.

## Watchpoints

Do not hide the operating system in a script. The Markdown contracts must remain readable. Do not rely on `postinstall`. Do not make the generated validator so strict that customers cannot start. Do not make it so loose that agents can mark fake completion.

Do not broaden `scripts/install-codex-skills.sh` without an allowlist review. It currently emits commands from `.agents/skills/external-skills.json`; that is acceptable only while the manifest is generated from trusted starter constants.
