---
title: Cross Repo Review
summary: Risk review for keeping the direct codebase rename scoped, coherent, and validated.
docType: program_review
status: active
read_when:
  - Reviewing a child ExecPlan or PR for the codebase language migration.
---

# Cross Repo Review

## Findings

The main risk is mixed instructions after a broad mechanical rename. A repo can compile while active docs still tell future workers to preserve an old noun family.

Docs-owned current-truth surfaces should state that codebase is canonical and that the rename is direct. This includes Program packets, Program indexes, root docs, source docs, generated mirrors, and frontmatter.

Generated mirrors are the highest-risk docs contract. Source and generated files must agree, or `docs:generated:check` should fail and identify the owning source.

App, package, Convex, and release-proof source paths are high-risk for collisions because other workers own them. A docs slice should report issues there instead of editing those files.

Historical evidence should be reviewed after active docs are coherent. Immutable provenance can retain what was true at the time, but completed docs should not masquerade as current instruction.

## Review Questions For Child Slices

Does this slice keep `codebase` as the canonical noun?

Does any changed generated mirror have a matching source or generation-path change?

Did renamed files also get matching titles, summaries, frontmatter, and index entries?

Did the slice stay inside its declared write set?

If validation found app/package issues, are they reported with exact paths rather than patched by the docs owner?

## Required Review Stance

Reviewers should prioritize stale Program instructions, docs/generated drift, broken path references, misleading frontmatter, missing validation, and cross-owner edits. Style-only wording preferences are out of scope once the codebase vocabulary rules are satisfied.
