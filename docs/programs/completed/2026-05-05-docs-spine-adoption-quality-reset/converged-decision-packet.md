---
title: Docs Spine Quality Reset Decision Packet
summary: Final decision to rebuild docs-spine adoption around deterministic evals before further generation.
docType: program_decision
status: active
read_when:
  - Checking the selected remediation strategy for docs-spine adoption.
---

# Docs Spine Quality Reset Decision Packet

The Program will reopen docs-spine adoption as an active quality reset. The completed v1 loop remains historical evidence, but it is no longer the product bar for customer installs.

The first implementation slice must build a docs-spine eval and lint harness before changing scanners or renderers. That harness should fail the current Arena CRM output and describe the failure in actionable terms.

The second slice repairs source-truth scanning so the workflow recognizes canonical instructions, root shims, package managers, app topology, native gates, existing docs, and CI while excluding noisy historical or hidden artifacts from primary routing.

The third slice repairs synthesis/rendering by reusing or matching the existing Worker/SBS and generated operating-pack contracts. It should produce complete Program and ExecPlan packets, first-hop docs, quality-score structure, validation/proof docs, and prompt docs with repo-specific content.

The fourth slice hardens apply and proof. Apply must reject blocked drafts, run the eval suite before and after writes, preserve existing content through managed sections when appropriate, and record native gate blockers honestly.

The fifth slice reruns the Arena CRM pilot and treats the customer-visible docs diff as the acceptance artifact. The Program cannot complete until that output meets the quality threshold.

The implementation remains TypeScript/Bun inside the existing local-runner and docs tooling boundaries unless measured scanner performance creates a separate Go replacement slice. JSON phase boundaries remain mandatory.
