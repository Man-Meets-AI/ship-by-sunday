---
title: Public Language Research Pass
summary: Public, docs, and go-to-market scan for current codebase language.
docType: program_research
status: active
read_when:
  - Planning public copy, homepage, review/download, docs, generated docs, or readiness-lint changes.
---

# Public Language Research Pass

This pass records buyer-facing and operator-facing language that should present Ship by Sunday around `codebase`.

## High-Priority Public Surfaces

Root `README.md` should describe the product as codebase-centered and call the download artifact a codebase.

Root `DESIGN.md` should define the visual thesis around the codebase outcome.

Active repo instruction files should tell implementers that the customer outcome is an agent-ready codebase delivered through Review & Download.

`packages/codebase-compiler/AGENTS.md` should describe the package as the generator behind the customer-facing codebase snapshot.

Homepage content in `apps/web/app/_content/home-page.ts` and homepage demo components under `apps/web/app/_components/home-page/sections/codebase-demo/**` should use codebase language in public copy and section naming.

The public blog post `apps/web/content/blog/the-operating-system-beats-the-prompt.mdx` should use current codebase language if it still represents product truth.

Review/download copy in `apps/web/lib/codebase-flow/review-download-handoff.ts` and `apps/web/app/(workspace)/review/_components/**` should name the artifact as a codebase.

Current docs pages under `apps/web/content/docs/**` should teach `/codebase -> /review` and use codebase nouns around route setup and operator behavior.

`scripts/public-readiness/run-lint.ts` should enforce codebase language as the preferred product vocabulary.

## Source And Generated Mirrors

`docs/openai/**` must stay aligned with `docs/generated/openai-codebase/**`.

`docs/ship-by-sunday/**` must stay aligned with `docs/generated/ship-by-sunday-codebase/**`.

Generated customer repo copy is also emitted by compiler renderers, especially `packages/codebase-compiler/src/public-artifact-contract.ts`, `packages/codebase-compiler/src/codebases/render-codebase-readme.ts`, `packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts`, and `packages/codebase-compiler/src/repo-generation/render-starter-project-onboarding.ts`.

## Historical Areas

Leave immutable provenance such as original transcripts and release evidence alone when rewriting it would make the record less truthful.

Completed plans, completed Programs, `CHANGELOG.md`, and `todo.md` should not be treated as current product instruction. If they are edited for lint or path reasons, keep them factual and do not reintroduce old product language.

Active strategy scratch files such as `support-codebases.md` and `package-discussion.md` are not canonical public truth. They can inform the Program, but they should not drive product behavior without an ExecPlan.

## Vocabulary Rules

Use `codebase` as the canonical noun.

Use `agent-ready codebase` when the external value needs context.

Use `downloadable codebase` or `generated codebase` for the deliverable.

Use `product truth`, `project facts`, or `product contract` for the captured inputs when the text means the structured information rather than the generated repo.

Use `your codebase`, `codebase audit`, `codebase setup`, and `agent-ready loop` for the existing-codebase lane.

Do not introduce another metaphor such as `scaffold`, `foundation`, `kit`, or `workspace` as the canonical replacement unless a future Program changes the product model.

## Focused Validation

Public language slices should use:

```bash
bun run public-readiness:lint
bun run docs:generated:check
bun run markdown:lint -- --paths README.md DESIGN.md apps/web/content/docs apps/web/content/blog docs/openai docs/ship-by-sunday docs/generated
bunx vitest --config apps/web/vitest.config.ts run --project unit apps/web/tests/unit/home-page-content.test.ts apps/web/tests/unit/blog-metadata.test.ts apps/web/tests/unit/blog-structured-data.test.ts apps/web/tests/unit/review-download-handoff.test.tsx
bunx vitest --config apps/web/vitest.config.ts run --project integration-ui apps/web/tests/integration-ui/home-page-product-preview.test.tsx apps/web/tests/integration-ui/codebase-review-page.test.tsx
bun run --cwd packages/codebase-compiler test
```
