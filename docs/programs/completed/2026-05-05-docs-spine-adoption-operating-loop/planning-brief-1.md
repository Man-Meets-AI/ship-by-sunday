---
title: Docs Spine Adoption Planning Brief 1
program_id: docs-spine-adoption-operating-loop
brief_version: 1
status: superseded
summary: Build the workflow bundle scaffold for deterministic docs-spine adoption.
read_when:
  - Authoring the first child ExecPlan for docs-spine adoption.
---

# Docs Spine Adoption Planning Brief 1

The first implementation slice should create the `docs-spine-adoption` workflow bundle scaffold. It should not attempt to install the full docs spine in Arena CRM yet.

Use Bun and TypeScript for v1 because the existing local runner, workflow API, approval packet validation, CLI dispatch, daemon worker, Convex packet model, and tests are TypeScript-owned. Keep scanner and synthesis phases behind JSON artifacts so a Go scanner can replace specific hot paths later if measured performance justifies it.

The scaffold should create a feature-local workflow directory under `packages/local-runner/src/workflows/docs-spine-adoption/` or the nearest existing local-runner pattern if implementation inspection finds a better fit. It should include a manifest, workflow runner skeleton, phase interfaces, artifact refs, schemas, prompt placeholders, renderer placeholders, and tests.

The workflow id is `docs-spine-adoption`, version `v1`. The CLI command should eventually be `ship-by-sunday workflow docs-spine-adoption run --workflow-run-id <id> --confirm-docs-spine-adoption`, but the first slice may stop at approval packet recognition and local blocked/proof artifacts if the full CLI path is too broad.

The first scaffold proof path should be small and deterministic. It should resolve an approved packet, require terminal confirmation, require a clean worktree, validate branch/profile/lease metadata, write `.sbs/runs/<workflow-run-id>/workflow-packet.json`, write `.sbs/docs-spine-adoption/manifest.json` or equivalent, write a minimal facts artifact, write proof or blocked proof, send sync-safe proof events without a repo-local outbox, and avoid source docs mutation until later slices.

Allowed v1 scaffold writes are `.sbs/runs/<workflow-run-id>/**` and `.sbs/docs-spine-adoption/**`. Runtime code changes are only inside Ship by Sunday's local-runner implementation and app approval surfaces, not inside a customer repo.

The first child ExecPlan should update the workflow packet contract docs and focused tests. It should name the later scanner, synthesis, apply, proof, and Arena CRM pilot slices but not absorb them.

Focused validation should include local-runner workflow tests, workflow API tests, CLI help tests if the command is wired, workspace read-model tests if the approval UI is wired, Convex workflow packet tests if the hosted packet is wired, plan lint for the child ExecPlan, Program lint, markdown lint for the Program packet, and `git diff --check`.

After this slice lands, refresh `program.md` with the exact scaffold files, validation evidence, and the next recommended child slice.
