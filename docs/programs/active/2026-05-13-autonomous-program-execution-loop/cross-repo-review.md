---
title: "Autonomous Program Execution Loop Cross-Repo Review"
summary: "Review of the Ship by Sunday, Worker, local runner, and generated-repo boundaries that the autonomous Program runner must respect."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Checking whether the autonomous runner should be extracted to another repo."
  - "Reviewing which parts of Worker can be reused in Ship by Sunday."
---

# Autonomous Program Execution Loop Cross-Repo Review

## Ship by Sunday

Ship by Sunday owns the canonical Program and ExecPlan contracts, prompt inventory, markdown/frontmatter linting, and codebase-generator operating pack. It should own the first implementation because the runner is primarily about making those contracts executable.

The runner should follow the root `AGENTS.md` rules. Program packet changes must pass `bun run programs:lint`. Child ExecPlans must pass `bun run plans:lint`. Markdown metadata should pass `bun run markdown:lint` for touched docs.

## Local Runner

The local runner already provides a docs operating system command surface and a Codex exec wrapper. It is the natural package/distribution path once the command contract stabilizes.

The docs operating system adoption workflow has a strict privacy boundary. That boundary should remain. The autonomous runner may create local run artifacts, but it should not sync raw source, secrets, long logs, Codex transcripts, provider payloads, or absolute paths by default.

The Worker Foundations installer currently installs useful script names but does not yet install the complete autonomous behavior behind those names. A later slice should replace placeholders with real runner-backed commands.

## Worker Repo

The Worker repo contains the strongest reference implementation for headless execution. Its ExecPlan feature workflow has Codex execution wrappers, proof command runners, grill loops, validation repair loops, and runtime receipts.

Worker should not become a direct dependency for Ship by Sunday's runner. Its implementation assumes Worker runtime state and dashboard concepts that do not belong in every generated or customer repo. The reusable ideas should be ported or factored into package-shaped local runner code.

## Generated Starter Repos

Generated Starter repos should eventually receive the docs operating system and possibly the generic Program runner, but they should not receive Worker-local product code. The generated template should include agent-ready Programs, ExecPlans, setup plans, and validation scripts. It should only include autonomous execution commands when those commands are generic, safe, and not branded as the Worker product surface.

## Separate Repo Decision

A separate repo may eventually make sense for the generic docs operating system and Program runner. It does not make sense before the command contract has been proven in this repo and at least one second consumer. Extracting too early would duplicate truth, add versioning overhead, and make it harder to evolve the runner while the state model is still being shaped.

The current recommendation is to build package-shaped code in Ship by Sunday first, use Worker as the reference, and revisit extraction after the runner is real.
