---
title: Docs Spine Adoption Planning Brief 2
program_id: docs-spine-adoption-operating-loop
brief_version: 2
status: superseded
summary: Build the scanner and facts model for deterministic docs-spine adoption.
read_when:
  - Authoring the scanner and facts child ExecPlan for docs-spine adoption.
---

# Docs Spine Adoption Planning Brief 2

The next implementation slice should populate the scanner and facts layer behind the completed `docs-spine-adoption` scaffold. It should not apply Markdown docs to a customer repo yet.

The scaffold already owns workflow id/version, approval packet validation, CLI and daemon dispatch, local branch creation, `.sbs` artifact refs, proof JSON, sync preview metadata, and a minimal `repo-facts.json`. This slice should keep those contracts stable and expand the facts model through deterministic scanners.

Use `git ls-files` as the primary inventory source. Avoid broad filesystem crawling, dependency folders, generated folders, raw source sync, long log capture, package installs, migrations, provider CLIs, branch pushes, pull requests, and CI-affecting commands.

The scanner output should remain JSON artifacts under `.sbs/docs-spine-adoption/**`. Expected artifacts include `source-truth-map.json`, `command-proof-map.json`, `docs-gap-report.json`, `architecture-signals.json`, `security-signals.json`, `quality-score-baseline.json`, `instruction-surface-map.json`, `skill-trigger-map.json`, `generated-surface-map.json`, `validation-surface-map.json`, and `performance-timings.json`.

The first scanner implementation should prefer fast deterministic metadata before Codex. Capture package manager, package scripts, workspace topology, docs surfaces, Program and ExecPlan surfaces, prompt/spec/generated docs surfaces, validation commands, CI workflows, release/deploy docs, root README routing, assistant shims, and local instruction files. Only add Semgrep or AST scanners if they run locally without dependency mutation and write bounded artifacts.

Quality-score output should be evidence-bound. If the scanner cannot compute a real score, it should write blocked score evidence rather than invented numbers.

The child ExecPlan should update the docs-spine manifest and schema types, add focused tests for every new artifact, and preserve the first scaffold's `.sbs`-only write boundary. It should also update the Program with exact validation evidence and keep the next recommended slice as Codex synthesis packets.

Focused validation should include local-runner scanner tests, workflow scaffold regression tests, schema or fixture tests for every new artifact, plan lint, Program lint, markdown lint for changed planning docs, and `git diff --check`.
