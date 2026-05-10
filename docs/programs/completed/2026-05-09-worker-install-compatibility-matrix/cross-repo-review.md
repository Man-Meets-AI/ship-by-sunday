---
title: Worker Install Compatibility Cross-Repo Review
summary: Cross-repo review notes for Worker install compatibility proof.
docType: review
status: active
read_when:
  - Comparing Worker install output to Arena CRM's runtime shape.
  - Checking whether compatibility proof is too narrow.
---

# Worker Install Compatibility Cross-Repo Review

Arena CRM shows why checked-in runtime source and root command forwarding are useful. It also shows the risk of productizing a pattern too narrowly: Arena is Bun-first, application-specific, and already has a rich monorepo README and AGENTS instructions.

Worker Foundations install needs the useful part of that shape without assuming the target repo is Arena. The installed surface should be visible and local, but it must preserve npm, pnpm, Bun, or other explicit target package-manager choices. It must also work in repos where JavaScript is only one part of a larger polyglot system.

The compatibility tests should therefore avoid using `runner-test` as the proof source. Temporary fixtures can represent the repo shapes directly and keep the expectations reviewable in `packages/local-runner`.
