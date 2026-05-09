---
title: Worker Install Compatibility Dependency Graph
summary: Dependency graph for Worker install compatibility proof.
docType: planning
status: active
read_when:
  - Sequencing Worker install compatibility slices.
  - Checking which proof layers depend on earlier product behavior.
---

# Worker Install Compatibility Dependency Graph

The fixture harness depends on `runInstallCommand`, temporary Git repositories, a valid Worker license file under a temporary Worker home, real package-manager commands, and fake Codex binaries for kickoff proof.

Generated recipient docs depend on installer templates in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`. They should not be judged complete until the harness asserts their presence and command truthfulness.

Blank-slate support depends on changing installer preflight and apply behavior so a missing root `package.json` becomes a Bun-default install path instead of a blocker.

Release smoke depends on the fixture harness being stable enough to call from the package-distributed and native executable paths without making ordinary package smoke too slow or brittle.
