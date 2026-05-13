---
title: "Local Runner Node And Effect Boundary Normalization"
summary: "Normalized boundary rules for making local-runner Node-first before migrating selected orchestration surfaces to Effect."
docType: "normalized_pass"
status: "active"
read_when:
  - "Choosing the boundary for a local-runner Node migration slice."
  - "Deciding where Effect belongs in packages/local-runner."
---

# Local Runner Node And Effect Boundary Normalization

## Runtime Boundary

The shipped local-runner CLI should run on Node. Source-level development can keep using the repo's current workspace commands while this repository remains Bun-based overall, but the package contract for `ship-by-sunday` and `shipbysunday` should not require Bun at runtime.

The first Node slice should preserve the existing local-runner command behavior and the single-bin package shape if practical. It should update package scripts, the CLI shebang, build output, package smoke, Worker generated scripts, Worker app package metadata, proof labels, and docs.

## Worker Target Boundary

Worker install target repos are a separate contract from the local-runner package runtime, but this Program cuts both over together. Generated `package.json`, root scripts, Worker app package, proof commands, and direct run script should be Node/npm-first.

Existing Bun-shaped Worker repos are not a supported migration target. Legacy Bun-managed files may be overwritten when recognized as managed output or blocked by the existing conflict checks when they are no longer recognized.

## Effect Boundary

Effect should enter after the Node package runtime and smoke path are stable. It should be used where it improves typed dependencies, cancellation, retry behavior, failure modeling, resource cleanup, or test injection.

The first Effect slice should add dependencies and a small runtime/service scaffold. It should not rewrite the Worker installer or CLI parser in the same slice.

High-value Effect candidates are:

- bounded process execution and timeout classification
- Codex exec child-process lifecycle and JSONL parsing
- runner event outbox delivery, lock handling, and retry/requeue logic
- workflow-run HTTP API calls and packet validation
- later Worker install inspect/plan/apply/proof phases after module split

## Non-Goals

Do not migrate the whole monorepo away from Bun in this Program. Do not preserve Bun Worker compatibility. Do not import from `repos/effect/`. Do not introduce Effect into every simple helper just because the package is installed. Do not do a large Worker installer rewrite before the generated Node target contract is tested.
