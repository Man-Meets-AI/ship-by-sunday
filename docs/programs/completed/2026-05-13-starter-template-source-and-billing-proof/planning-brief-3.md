---
title: Generated Repo Template Source Migration Planning Brief 3
program_id: starter-template-source-and-billing-proof
brief_version: 3
status: superseded
summary: Create the next child ExecPlan for migrating generated Starter output to consume the pinned template source before applying generated overlays.
read_when:
  - "Writing the third child ExecPlan for this Program."
  - "Migrating generated Starter repo materialization to template source."
  - "Checking how the pinned source snapshot should feed generated output."
---

# Generated Repo Template Source Migration Planning Brief 3

## Planning Context

The pinned source boundary is in place. `templates/starter-app/source` contains the committed sibling skeleton snapshot, and `templates/starter-app/template-source.json` pins that source by content digest, file count, required files, excluded local artifacts, provenance, and generated-overlay policy. Compiler validation lives in `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts`.

The current generated Starter repo still comes from `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`, which copies selected repo files and renders the app through `render-generated-template-app-files.ts`. The next dependency is migration: make generated output start from the pinned source snapshot, then apply generated overlays for product facts, design facts, docs, Program material, ExecPlans, skills, validation scripts, and any app-specific generated config.

The pinned source seed is currently a single Next.js app root. Current generated customer output is a minimal monorepo. The migration plan must explicitly decide the materialization mapping instead of silently flattening, nesting, or mixing layouts.

## Next Plan Recommendation

Exact next plan title: `Migrate Generated Template App To Template Source`.

Exact target path: `docs/exec-plans/active/2026-05-13-migrate-generated-template-app-to-template-source.md`.

Exact scope: teach the compiler to validate and consume `templates/starter-app/source`, materialize it into generated Starter repos through an explicit mapping, and apply existing generated overlays without reading the sibling checkout. Preserve or deliberately update clean-room generated repo proof and tests. If the source layout mismatch requires an adapter, keep that adapter small, named, and tested.

Exact boundaries: do not fetch mutable source, do not change the sibling repo, do not implement the ChatGPT app, do not rewrite the full generated operating pack, do not add live provider requirements, and do not broaden overlay paths beyond the manifest without updating the manifest and tests.

## Success Criteria

The slice succeeds when generated Starter repo materialization consumes the committed template source snapshot rather than only string-rendered app files, current no-provider generated repo validation still passes, and tests prove the generator rejects missing or drifted template-source manifest state. Future agents should be able to see which files came from template source and which files came from generated overlays.
