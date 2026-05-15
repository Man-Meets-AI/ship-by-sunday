---
title: "Local Runner Node And Effect Migration Cross-Repo Review"
summary: "Boundary review for the local-runner Node and Effect migration across Ship by Sunday, the vendored Effect reference, and generated Worker target repos."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Checking cross-repo implications of local-runner runtime changes."
  - "Deciding how to use the vendored Effect reference."
---

# Local Runner Node And Effect Migration Cross-Repo Review

## Ship By Sunday Repo

Ship by Sunday owns the local-runner package and its shipped command contract. The Program should change `packages/local-runner` and directly related docs/tests first. It should not silently migrate root app commands, `apps/web`, Convex tooling, release proof commands, or generated Starter template package-manager behavior.

The root workspace still uses Bun. That does not block a Node-first local-runner package, but child plans must distinguish repo development commands from the published local-runner runtime contract.

## Vendored Effect Reference

`repos/effect/` is a checked-in upstream reference snapshot. It exists to improve agent understanding while designing the Effect migration. It is not a source dependency, not a patch target, and not an auto-import location.

When an Effect slice needs reference material, agents should inspect `repos/effect/AGENTS.md` and any relevant upstream docs/source under `repos/effect/`, then implement against published packages in `packages/local-runner/package.json`.

## Generated Worker Target Repos

Worker Foundations install mutates customer or future-customer repos. Changing generated runtime defaults is customer-facing setup behavior. The hard cutover slice must update generated scripts, generated `apps/worker/package.json`, README/AGENTS managed sections, proof command labels, and smoke expectations together.

Existing Bun-shaped Worker repos are not a compatibility target for this Program. The generated Worker contract should be Node/npm-first.

## Package Registry Consumers

The package smoke path must keep proving packed-tarball behavior through real package-manager execution. Node-first package behavior should be proved by `npx` and installed package execution, not Bun-native package runners.

## Risks

The biggest cross-repo risk is mixing three separate migrations: root workspace package manager, local-runner package runtime, and generated Worker target runtime. This Program owns the second and the Worker-specific part of the third. It does not own the root workspace package-manager migration.

Another risk is letting `repos/effect/` become an accidental source tree. Editor exclusions and root guidance already reduce this risk; child slices should preserve that boundary.
