---
title: Converged Decision Packet
summary: Final initiative decision for the Docs Spine Adoption Operating Loop Program.
docType: program_decision
status: active
read_when:
  - Checking the selected architecture for docs-spine adoption.
---

# Converged Decision Packet

The Program will ship `docs-spine-adoption` as a first-class local-runner workflow for mature existing repositories.

The workflow follows the existing `mature-repo-adoption` audit, but keeps the first slices inside `.sbs`. `mature-repo-adoption` creates `.sbs` audit and draft artifacts. `docs-spine-adoption` creates scanner facts and bounded draft packets; `docs-spine-apply-and-proof` is the later workflow that may apply an approved docs-spine operating pack.

Version 1 stays in Bun and TypeScript. The runner integration, workflow approval model, Convex packet validation, CLI and daemon dispatch, and current workflow tests are TypeScript-owned. The implementation must still keep JSON phase boundaries so scanner phases can be replaced by Go later if evidence shows Bun is too slow.

The workflow is deterministic at the authority layer. Subagents and Codex can research, draft, and critique, but they do not decide allowed writes or apply patches directly. The workflow controller owns state transitions, schema validation, target paths, proof commands, rollback notes, and sync-safe event payloads.

The first child ExecPlan should build the workflow bundle scaffold, manifest contract, schemas, and one minimal scanner-to-proof path. It should not implement every scanner, every prompt, or the Arena CRM pilot in the first slice.
