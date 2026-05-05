---
title: Docs Spine Adoption Planning Brief 3
program_id: docs-spine-adoption-operating-loop
brief_version: 3
status: superseded
summary: Build bounded Codex synthesis packets from deterministic docs-spine scanner facts.
read_when:
  - Authoring the Codex synthesis child ExecPlan for docs-spine adoption.
---

# Docs Spine Adoption Planning Brief 3

The next implementation slice should turn deterministic scanner artifacts into bounded Codex synthesis packets. It should not apply generated Markdown to customer repos yet.

The completed scanner slice writes repo facts, source-truth map, command-proof map, docs gap report, architecture signals, security signals, quality-score baseline, instruction-surface map, skill-trigger map, generated-surface map, validation-surface map, and performance timings under `.sbs/docs-spine-adoption/facts/**`.

This slice should define the prompt packet contracts, input artifact selection, redaction boundaries, output schemas, blocked states, and local artifact refs for Codex-generated drafts. Codex should consume scanner facts and produce structured local draft artifacts only. It must not receive raw source, raw logs, package script bodies, docs drafts for sync, secrets, local absolute paths, or full transcripts.

The synthesis output should stay under `.sbs/docs-spine-adoption/drafts/**` and should be shaped for the later apply-and-proof slice. Expected draft families include docs index changes, Program packet draft, ExecPlan draft, agent instruction routing draft, prompt asset draft, validation/proof notes, quality-score blocked-proof notes, and parity checklist draft.

Keep the deterministic controller as the authority owner. Codex can draft and explain, but it cannot apply files, widen paths, mutate package scripts, change CI, push branches, open PRs, run provider CLIs, or decide approval scope.

Focused validation should include schema tests for prompt packet inputs and draft outputs, local-runner workflow regression tests, privacy tests that prove raw source/script bodies/transcripts are excluded, plan lint, Program lint, markdown lint for changed planning docs, and `git diff --check`.
