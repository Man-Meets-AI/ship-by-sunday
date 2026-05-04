---
title: Package And Generated Output Research Pass
summary: Package, compiler, and generated-output scan for codebase contracts affected by the direct rename.
docType: program_research
status: active
read_when:
  - Planning compiler, package, generated repo, generated docs, or customer snapshot cleanup.
---

# Package And Generated Output Research Pass

This pass records package and compiler surfaces where `codebase` is an API or generated-output contract.

## Affected Surface Groups

Package identity:

- `packages/codebase-compiler/package.json`
- `packages/codebase-presentation/package.json`
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `bun.lock`

Public TypeScript API:

- `packages/codebase-compiler/src/index.ts`
- `packages/codebase-compiler/src/server.ts`
- exported names such as `deriveCodebaseFacts`, `CodebaseStageId`, `CodebaseStageDefinition`, `CodebaseStepDefinition`, `evaluateCodebaseReadiness`, `CodebaseReadiness`, `CodebaseArtifactStage`, `CodebaseFieldDraftValues`, and `formatCodebaseFactValue`

Compiler flow contract:

- `packages/codebase-compiler/src/stages/stage-definitions.ts`
- `packages/codebase-compiler/src/readiness/**`
- `packages/codebase-compiler/src/codebase-field-helpers.ts`
- `packages/codebase-compiler/src/canonical-project-definition/derived-codebase-facts.ts`

Generated tree renderers:

- `packages/codebase-compiler/src/codebases/**`
- `packages/codebase-compiler/src/server/rendered-codebase-tree.ts`
- `packages/codebase-compiler/src/server/template-loader.ts`
- `packages/codebase-compiler/src/public-artifact-contract.ts`

Generated customer repo contracts:

- `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`
- `packages/codebase-compiler/src/repo-generation/build-repo-generation-manifest.ts`
- `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts`
- `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`
- generated starter scripts and tests that refer to `packages/codebase-compiler`

Generated docs and mirrors:

- `packages/codebase-compiler/src/generated-docs/generated-doc-paths.ts`
- `docs/generated/openai-codebase/**`
- `docs/generated/ship-by-sunday-codebase/**`
- root `package.json` scripts that enforce generated docs checks

Assets:

- design preset URLs under `/codebase/design-presets/**`
- `apps/web/public/codebase/design-presets/**`

## Rename Risks

Package identity is high risk because the packages are private but still function as workspace API boundaries. Package owners must keep app imports, `next.config.ts` transpilation, package dependencies, lockfile state, generated starter scripts, Vercel tracing, and tests aligned.

API rename breadth is high. App, Convex, presentation, compiler, and tests all consume `Codebase*` exports.

Stage id and route values are behavioral. The stage id `"codebase"` and route `"/codebase"` are not just package internals; web runtime and persisted state consume them.

Generated customer output must remain executable. Renaming package paths inside generated repo snapshots changes root scripts, snapshot tests, package dependencies, and tracing includes.

Generated mirrors must move with their source. Renaming `docs/generated/*-codebase` without changing source docs and checks will break or hollow out `docs:generated:check`.

## Package Ordering

First, make Program and docs instructions match the direct rename.

Second, package owners finish package and compiler source references.

Third, update generated customer output and snapshot expectations from the source generator.

Fourth, run package-local validation and generated-doc validation.

## Focused Validation

Compiler/package slices should use package-local validation first:

```bash
bun install
bun run --cwd packages/codebase-compiler format:check
bun run --cwd packages/codebase-compiler lint
bun run --cwd packages/codebase-compiler typecheck
bun run --cwd packages/codebase-compiler test
bun run --cwd packages/codebase-presentation typecheck
bun run --cwd packages/codebase-presentation test
bun run docs:generated:check
```

Then run app typecheck and repo-level gates after consumers move:

```bash
bun run --cwd apps/web typecheck
bun run format
bun lint
bun typecheck
```
