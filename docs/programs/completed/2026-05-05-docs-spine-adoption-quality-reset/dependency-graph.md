---
title: Docs Spine Quality Reset Dependency Graph
summary: Dependency ordering for evals, scanners, renderers, proof, and Arena CRM acceptance.
docType: program_dependency_graph
status: active
read_when:
  - Deciding which docs-spine reset slice can run next.
---

# Docs Spine Quality Reset Dependency Graph

## Nodes

Node A: Define docs-spine quality evals and lint contracts.

Node B: Add fixtures for Worker, Ship by Sunday, and the failed Arena CRM output.

Node C: Repair scanner source-truth ranking and noise exclusion.

Node D: Repair Program, ExecPlan, docs index, prompt, validation, proof, and quality-score rendering.

Node E: Harden apply gating so blocked drafts and weak docs cannot be written.

Node F: Run Arena CRM pilot acceptance and capture proof.

Node G: Update Program completion status only after the pilot diff is customer-ready.

## Dependencies

Node A must land before C, D, E, or F because the reset needs a failing test for the current bad output.

Node B belongs with A because evals need fixtures that represent both good exemplars and the failed pilot.

Node C can start after A because scanner fixes need the source-truth evals to prevent regressions.

Node D can start after A and should use C outputs when available. It may begin with static renderer parity but cannot be accepted until source-truth scanner fixtures pass.

Node E depends on A and D because apply proof must evaluate the actual generated Markdown contract.

Node F depends on C, D, and E because the pilot must exercise the full loop.

Node G depends on F and cannot be satisfied by unit tests alone.

## Critical Path

The critical path is A plus B, then C and D, then E, then F. No more generation work should be called complete until the eval harness can reject the current Arena output and accept the intended output class.
