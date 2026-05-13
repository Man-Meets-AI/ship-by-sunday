---
title: Pinned Starter Template Source Planning Brief 2
program_id: starter-template-source-and-billing-proof
brief_version: 2
status: current
summary: Create the next child ExecPlan for the pinned Starter template-source boundary without beginning ChatGPT template implementation.
read_when:
  - "Writing the second child ExecPlan for this Program."
  - "Creating the repo-local template-source boundary."
  - "Deciding what provenance and generated-overlay contracts the Starter template source needs."
---

# Pinned Starter Template Source Planning Brief 2

## Planning Context

The first Program slice is complete. Hosted billing proof now accepts `--offer=starter|workers`, defaults to Starter, passes the selector through release proof planning, and documents Starter and Workers amounts, price envs, destinations, and capabilities.

The next dependency is the template-source boundary. The Program direction is already settled: use `~/Developer/next-js-convex-clerk-stripe-template` as the pinned app skeleton, later replace Notes with a ChatGPT-style BYO OpenAI chat app, and layer in the Ship by Sunday generated operating pack. Do not re-litigate that shape.

The current generator still renders the template app through string builders under `packages/codebase-compiler/src/repo-generation/`. There is no ordinary repo-shaped source tree that can be audited, versioned, tested, and composed with generated overlays. This slice should create that boundary and provenance model before any chat-domain migration.

## Next Plan Recommendation

Exact next plan title: `Introduce Pinned Starter Template Source`.

Exact target path: `docs/exec-plans/active/2026-05-13-introduce-pinned-starter-template-source.md`.

Exact scope: define the repo-local template source location, provenance metadata, ownership rules, generated-overlay contract, and validation path. Inspect `~/Developer/next-js-convex-clerk-stripe-template` read-only as the source seed. Add only the minimum copied or imported skeleton material needed to establish a deterministic template-source boundary if the child plan concludes that copying is part of this slice.

Exact boundaries: do not fetch mutable remote template source, do not change sibling repos, do not implement the ChatGPT app, do not migrate the generator wholesale, and do not replace the current generated app output until the boundary and proof path are clear.

## Success Criteria

The slice succeeds when the repository has a clear, documented, and validated boundary for pinned Starter template source. Future agents should know where the template source lives, how provenance is recorded, which generated overlays may replace template files, what the generator may and may not copy, and which focused checks prove the boundary without touching live provider setup.
