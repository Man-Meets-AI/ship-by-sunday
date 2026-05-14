---
title: "Local Runner Node And Effect Migration Converged Decision Packet"
summary: "Canonical decisions for the Node-first local-runner cutover and staged Effect migration."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking the canonical decisions for local-runner Node and Effect migration."
  - "Deciding whether to change Worker install defaults or add Effect dependencies."
---

# Local Runner Node And Effect Migration Converged Decision Packet

## Canonical Shape

The initiative should move in this order: keep the vendored Effect repo as read-only reference, make the shipped local-runner package and generated Worker surface run on Node/npm, add Effect dependencies and a small runtime scaffold, migrate the external I/O boundaries to Effect, then split and migrate the larger Worker install workflow.

## Decisions

Decision: Node-first local-runner package comes before Effect internals.

Rationale: Parker explicitly rejected continuing with Bun for this runner. A Node package contract is the foundation; Effect should then clarify the Node runtime boundaries.

Decision: The Effect subtree is reference only.

Rationale: Vendoring the upstream repo helps agents inspect real patterns locally. Runtime imports from a checked-in reference copy would bypass package manager ownership and make dependency updates unclear.

Decision: Keep a single package bin if practical.

Rationale: The current package publishes only `dist/cli.js`. Preserving that shape makes the runtime cutover easier to smoke through `npx` and installed package execution.

Decision: Separate package runtime from target package-manager support.

Rationale: The local-runner can run on Node while still detecting and using a target repo's existing package manager. The migration should not confuse "the CLI runtime" with "the customer repo's chosen toolchain."

Decision: New blank Worker target repos should default to Node/npm.

Rationale: The generated Worker surface should not force Bun on a customer who did not choose it.

Decision: Existing Bun Worker installs are not a compatibility target.

Rationale: Parker chose a hard cutover. The Program should remove Bun requirements from the generated Worker contract instead of spending implementation budget on legacy migration paths.

Decision: Effect starts at I/O and orchestration boundaries.

Rationale: `Effect` has the most value where failures, dependencies, retries, cancellation, and resource lifecycles are currently implicit.

Decision: Do not rewrite the Worker Foundations workflow in one Effect pass.

Rationale: The workflow is large and customer-facing. It needs module boundaries and focused tests before a deep architectural migration.

Decision: Package smoke remains the confidence gate for distribution changes.

Rationale: Source tests can pass while the packed CLI fails. This Program changes distribution behavior, so shipped-artifact proof is mandatory.
