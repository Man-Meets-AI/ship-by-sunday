---
title: Template Update And Release Proof Docs Planning Brief 7
program_id: starter-template-source-and-billing-proof
brief_version: 7
status: current
summary: Close the Program by documenting the template update process, direct template path, and product-specific billing proof operations.
read_when:
  - "Writing the seventh child ExecPlan for this Program."
  - "Documenting how future agents should update the Starter template source."
  - "Checking how Starter and Workers billing proof should be run."
---

# Template Update And Release Proof Docs Planning Brief 7

## Planning Context

The Program now has product-specific hosted billing proof, a pinned `templates/starter-app/source` boundary, generated repo materialization from that pinned source, a generated first customer Program with setup ExecPlans, a ChatGPT-style BYO OpenAI `/chat` template app, and a direct no-questions Starter template route backed by the same dynamic generator.

The remaining closeout work is documentation and release-proof alignment. Future agents need to know that the template is source-owned, not a static zip; that template updates must change the pinned source, manifest, digest, generated output contracts, and docs together; that the direct route is generated on demand from default facts; and that billing proof must be run intentionally for both Starter and Workers when release risk touches paid access.

## Next Plan Recommendation

Exact next plan title: `Template Update And Release Proof Docs`.

Exact target path: `docs/exec-plans/completed/2026-05-14-template-update-and-release-proof-docs.md`.

Exact scope: update durable docs and the Program ledger so future work can maintain the pinned Starter template-source pipeline, direct template download path, and product-specific billing proof without reintroducing static zip drift or Starter-only proof assumptions. Record the focused validation that proves the direct route, generated zip parity, billing proof preflight behavior, Program metadata, and repo gates.

Exact boundaries: do not change the pinned template source in this closeout slice, do not introduce a static template artifact, do not alter the payment UX, and do not weaken the existing Review download auth/readiness contract.

## Success Criteria

The slice succeeds when docs describe the direct generated template path and template-source update rules, the Program ledger is complete, all child ExecPlans point at the final Program packet, billing proof docs mention both paid offers and the Convex sync boundary, and focused plus broad validation has been run or explicitly reported with a blocker.
