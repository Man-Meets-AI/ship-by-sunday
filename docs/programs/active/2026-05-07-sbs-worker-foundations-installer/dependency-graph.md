---
title: SBS Worker Foundations Installer Dependency Graph
summary: Dependency order for building the planning-runtime installer before broader Worker-full surfaces.
docType: dependency_graph
status: active
read_when:
  - Choosing the next Worker Foundations installer child ExecPlan.
  - Checking why planning-runtime must precede Worker-full state installation.
---

# SBS Worker Foundations Installer Dependency Graph

The hard dependency is visible planning-runtime foundations before Worker-full expansion. The installer must first prove that it can safely install the repo-local Program, ExecPlan, prompt, validation, and lifecycle command source that made Arena work.

## Ordered Dependencies

1. Installer command and profile model. Add `worker install`, define `planning-core`, `planning-runtime`, and deferred `worker-full`, and write the install-plan artifact contract.

2. Template and source boundary. Extract or author the cleaned planning-runtime source subset from Worker and Arena without copying Worker-specific state.

3. Structured target repo patching. Patch `package.json`, `.gitignore`, docs contracts, prompts, runtime source, and instructions with same-name conflict handling and no blind overwrites.

4. Dogfood proof. Create or validate a target Program packet and Program-linked child ExecPlan through the installed local command surface.

5. Golden target smoke. Run the installer against Arena CRM or a faithful Arena fixture and prove the harness-to-Worker-foundations migration.

6. Distribution and update lane. After local install proof works, decide package naming, public registry path, update semantics, and migration behavior for already-installed repos.

## Parallelizable Work

Template cleanup and Arena fixture design can run while the command and profile model are implemented if they stay read-only. Program/ExecPlan validator reuse can be mapped in parallel with runtime command forwarding design.

## Non-Parallel Work

Do not install or test Worker-full state until planning-runtime is repeatable. Do not mutate a real target repo while another workflow is also applying docs or package-script changes to the same checkout.
