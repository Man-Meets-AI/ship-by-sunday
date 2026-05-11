---
title: Shipbysunday Worker Foundations Installer Dependency Graph
summary: Dependency order for building the Worker Foundations installer before broader Worker-full surfaces.
docType: dependency_graph
status: active
read_when:
  - Choosing the next Worker Foundations installer child ExecPlan.
  - Checking why Worker Foundations must precede Worker-full state installation.
---

# Shipbysunday Worker Foundations Installer Dependency Graph

The hard dependency is visible Worker Foundations before Worker-full expansion. The installer must first prove that it can safely install the repo-local Program, ExecPlan, prompt, validation, and command source that made Arena work.

## Ordered Dependencies

1. Installer command and bundle model. Add `shipbysunday install` and `shipbysunday i`, define the default Worker Foundations bundle, and write the install-plan artifact contract.

2. Native/license/Codex/toolchain/branch preflight. Validate Git repo shape, root `package.json`, clean worktree, `~/.worker/` license state, `codex` availability and authentication, Worker-managed Codex permission profile setup, private Worker-managed Bun toolchain availability, and safe `shipbysunday/install` branch creation or reuse before mutation.

3. Template and source boundary. Extract or author the cleaned Worker Foundations source subset from Worker and Arena without copying Worker-specific state.

4. Structured target repo patching. Patch root `package.json`, `.git/info/exclude`, docs contracts, prompts, `apps/worker`, `scripts/run-worker.sh`, and instructions with same-name conflict handling and no blind overwrites.

5. Dogfood proof. Create a target Program packet and Program-linked child ExecPlan through the installed local command surface.

6. Proof-gated commit. Run validation, write `.worker/**` proof and `docs/worker/install-report.md`, then auto-commit only after proof passes.

7. Golden target smoke. Run the installer against Arena CRM or a faithful Arena fixture and prove the harness-to-Worker-foundations migration.

8. Distribution and update lane. After local install proof works, harden native download, license activation, package-manager fallback, update semantics, and migration behavior for already-installed repos.

## Parallelizable Work

Template cleanup and Arena fixture design can run while the command and bundle model are implemented if they stay read-only. Program/ExecPlan validator reuse can be mapped in parallel with Worker command forwarding design.

## Non-Parallel Work

Do not install or test Worker-full state until Worker Foundations is repeatable. Do not mutate a real target repo while another workflow is also applying docs or package-script changes to the same checkout.
