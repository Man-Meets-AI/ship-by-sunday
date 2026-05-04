---
title: Plan Split Recommendation
summary: Recommended child ExecPlan split for the direct Codebase Language Migration Program.
docType: program_plan_split
status: active
read_when:
  - Creating child ExecPlans for the codebase language migration.
---

# Plan Split Recommendation

## Slice 1: Docs And Program Packet Coherence

Rewrite current Program packet language, Program indexes, root docs, source docs, generated mirrors when source-owned, and path/title/frontmatter references so they state the direct codebase rename and no longer describe an old-name support model.

Keep the write set to docs-owned files in this slice.

## Slice 2: Current Public Language Enforcement

Update current public and operator-facing docs plus public-readiness lint so the repo enforces `codebase` and `agent-ready codebase` as the active product vocabulary.

## Slice 3: Generated Mirror Proof

Run the generation or mirror validation path for `docs/openai/**`, `docs/ship-by-sunday/**`, and `docs/generated/**`. Fix source/mirror drift caused by renamed paths or frontmatter.

## Slice 4: App And Package Owner Cleanup

Have app/package owners fix any remaining code, test, package, Convex, or release-proof references that still use non-codebase names or fail after the direct rename.

## Slice 5: Provenance Audit

Review archives, completed plans, transcripts, changelog entries, and release evidence. Leave immutable source evidence alone, but remove any stale current instruction hiding in historical-looking files.
