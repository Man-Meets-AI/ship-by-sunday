---
title: Direct Contract Rename Normalized Pass
summary: Normalized rules for completing the direct codebase rename across current contracts.
docType: program_normalized_pass
status: active
read_when:
  - Deciding whether a current technical identifier, docs path, generated mirror, or packet title still needs rename cleanup.
---

# Direct Contract Rename Normalized Pass

The technical migration is a direct rename to codebase names. Do not plan old-name support as a product requirement.

## Current Contract Names

Current repo truth should use codebase-named contracts, including:

- `/codebase`
- `routeConfig.codebase`
- `codebaseWorkflowStates`
- `api.codebase.*`
- serialized stage id `"codebase"`
- `kind: "codebase_stage"`
- `codebaseReadiness`
- `codebaseStageId`
- `@shipbysunday/codebase-compiler`
- `@shipbysunday/codebase-presentation`
- `docs/generated/*-codebase/**`
- `sbs:home-codebase-draft:v1`

## Rename Rule

When a current source file, docs file, generated mirror, frontmatter title, package name, test name, route reference, or lint rule still uses a non-codebase noun, update it to codebase directly inside the owning write set.

When a remaining non-codebase string belongs to immutable provenance, leave it only if the surrounding document clearly functions as historical evidence rather than current instruction.

When validation fails because a path was renamed but a title, summary, index, generated mirror, or frontmatter key was not, fix the metadata drift in the same slice.

## Cleanup Rule

Do not leave a TODO that asks a later worker to decide whether codebase is canonical. It is canonical. Remaining work should name the concrete path, source mirror, generated mirror, package, test, or validation gate that still needs repair.
