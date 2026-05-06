---
title: Docs Spine Quality Reset Plan Split Recommendation
summary: Recommended child ExecPlan split for rebuilding docs-spine adoption to the expected customer quality bar.
docType: program_plan_split
status: active
read_when:
  - Creating the next docs-spine quality reset ExecPlan.
---

# Docs Spine Quality Reset Plan Split Recommendation

## Slice 1: Docs-Spine Eval And Lint Harness

Build the deterministic quality gate first. Add fixtures for Worker/SBS-good and Arena-v1-bad outputs, define docs-spine lint rules, wire focused tests, and make the current Arena docs fail. This slice should not repair rendering yet.

## Slice 2: Source-Truth Scanner Repair

Fix scanner ranking and evidence classification. Recognize instruction shims, canonical AGENTS files, native package scripts, app topology, CI, existing docs, and generated/design/reference lanes. Exclude hidden historical noise from primary docs routes.

## Slice 3: Contract-Grade Renderer And Synthesis

Replace thin Markdown renderers with Worker/SBS-grade and generated-operating-pack-grade contracts. Output complete docs index, Program and ExecPlan packets, prompt docs, validation/proof docs, and quality-score structure. Use Codex synthesis only behind structured facts and validators.

## Slice 4: Apply And Proof Hardening

Refuse blocked drafts. Run evals before and after apply. Preserve existing docs with managed sections where needed. Record native gate blockers with exact command output summaries. Make proof fail on weak docs.

## Slice 5: Arena CRM Acceptance Pilot

Run the full loop on Arena CRM and treat the resulting docs diff as the acceptance artifact. The Program completes only when that diff is strong enough to show a customer.

## Recommended Next Slice

Start with Slice 1. The current failure was not lack of more templates; it was lack of a quality gate that could say "this is not good enough."
