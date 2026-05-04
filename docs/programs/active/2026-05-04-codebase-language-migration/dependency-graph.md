---
title: Dependency Graph
summary: Ordering dependencies for the direct Codebase Language Migration Program.
docType: program_dependency_graph
status: active
read_when:
  - Deciding which codebase rename cleanup slice should run next.
---

# Dependency Graph

## Root Decision

Canonical noun: `codebase`.

Rename policy: direct non-compatible rename. Current code, docs, generated output, packages, paths, and Program packets should converge on codebase names.

## Dependency Edges

Program packet coherence comes first because it tells future workers how to interpret the rename.

Docs index and frontmatter cleanup depends on the renamed file inventory. Fix titles, summaries, `read_when`, and index entries after paths move.

Source docs and generated mirrors must move together. A generated mirror change depends on the matching source document or generation path.

Public language lint depends on the public vocabulary decision and should enforce codebase language after copy changes land.

Package and route cleanup depends on package/app ownership. Docs workers should record remaining path references but not edit app/package source outside their write set.

Historical/provenance review depends on current docs passing first. Do not spend the first slice normalizing archives while active instructions are stale.

## Blocking Risks

Leaving the Program packet in staged-migration language can cause later agents to rebuild old-name support that the user explicitly rejected.

Changing generated mirrors without source changes can break `docs:generated:check`.

Fixing docs by touching app or package code can collide with concurrent owners.

Renaming paths without frontmatter and index cleanup can leave Program or markdown lint green in one place but misleading in the docs navigation.
