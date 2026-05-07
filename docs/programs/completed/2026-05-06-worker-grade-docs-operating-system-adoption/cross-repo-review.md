---
title: Worker-Grade Docs Operating System Cross-Repo Review
summary: Portability review for applying Worker docs operating-system patterns to arbitrary customer repositories.
docType: program_cross_repo_review
status: active
read_when:
  - Reviewing risks before implementing docs tooling install.
  - Checking how Worker, Ship by Sunday, Arena CRM, and sparse repos differ.
---

# Worker-Grade Docs Operating System Cross-Repo Review

## Worker

Worker is the quality target. It has path-family markdown lint, docs-spine validation, Program and ExecPlan validators, planning scripts, and proof artifacts. It also has specialized operating state and runtime systems, but those are deferred from this Program. Worker proves the docs and validation shape of the system, not a template to copy wholesale.

## Ship by Sunday

Ship by Sunday already has Program and ExecPlan contracts, planning lint, markdown metadata scripts, docs-spine-adjacent validation, local-runner workflow packets, `.sbs` proof artifacts, and a generated operating-pack renderer. It is the best implementation host for the runner work. It also proves the "already installed" path must be idempotent and should not duplicate existing scripts or docs.

## Arena CRM

Arena CRM is the customer pilot. It has its own `.codex/AGENTS.md` instruction hierarchy, Bun/Turbo scripts, and `bun run gate` as the broad native gate. The runner must preserve those conventions. Arena also exposed the difference between docs quality and native setup: docs-spine proof can pass while native validation is blocked by missing repo-local dependencies.

## Sparse Repos

Sparse fixtures are required because not every repo has an existing docs tree. The runner must degrade honestly. A sparse repo can receive Programs, ExecPlans, docs routing, prompts, portable validators, and proof without receiving Worker-specific state that would be fake.

## Portability Risks

The biggest portability risk is over-installing Worker-specific operating surfaces. The second risk is under-installing scripts and validators while claiming the docs spine is operational. The third risk is damaging owner files through same-name template writes.

The mitigation is a profile model plus a structured install plan. Each proposed portable docs operation should say whether it is already present, installable, conflicting, or blocked. Non-core surfaces should be reported as out of scope, not modeled as installable modules.

Runtime and Worker-specific operating state are out of scope for this Program. Worker routes runtime commands into `apps/runtime`, and Worker-owned state surfaces assume Worker concepts. Treat them as deferred references, not source code or install behavior for this docs tooling Program.

## API And File Contract Risks

Package manifests and lockfiles must be parsed, not edited as raw text. Script wrappers must respect the target package manager and existing repo scripts. Proof artifacts should stay under `.sbs/runs/<workflow-run-id>/`.

## Review Conclusion

The Program is portable if it treats Worker as a docs-quality reference and installs only the target repo's selected portable docs profile. The first implementation slice should prove the manifest and conflict contract before mutating package scripts or validator files.
