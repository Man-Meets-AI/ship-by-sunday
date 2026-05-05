---
title: Cross Repo Review
summary: Risk review for the Docs Spine Adoption Operating Loop Program.
docType: program_cross_repo_review
status: active
read_when:
  - Reviewing docs-spine adoption for determinism, privacy, or mature-repo fit.
---

# Cross Repo Review

## Determinism Risks

The main risk is turning a workflow into an unbounded agent swarm. Parallel subagents are useful for research and draft review, but the workflow controller must own allowed paths, write authority, phase order, schema validation, and proof status.

Every LLM output needs evidence refs and blocked-fact reporting. Drafts that make unsupported claims about repo architecture, security, release process, or quality score should be rejected or downgraded to missing facts.

## Mature Repo Risks

Mature repos have existing instruction files, docs, CI, deploy habits, and handoff artifacts. The workflow must preserve canonical local conventions. Arena CRM, for example, uses `.codex/AGENTS.md` as canonical and root `AGENTS.md` as a shim.

The workflow must not replace a mature repo with generated-starter assumptions. It should install routing docs around the existing source truth and name gaps honestly.

## Performance Risks

Bun and TypeScript are fast enough for v1 if scanners use `git ls-files`, bounded reads, selected Semgrep rule packs, and AST passes over candidate files only. If the Arena CRM pilot exceeds the performance budget, the next slice should isolate hot scanner phases behind JSON and replace only those phases with Go.

## Privacy And Authority Risks

The local runner should sync only structured metadata, proof status, command names, artifact names, and repo-relative refs. Raw source, full command output, secrets, screenshots, local absolute paths, and Codex transcripts stay local unless a later explicit approval exists.

Package scripts, CI config, dependencies, lockfiles, migrations, providers, branch pushes, and pull requests remain out of scope for v1.

## Validation Risks

Docs-spine adoption can look successful while the installed docs are not usable. Proof must include structural lint, Program lint, ExecPlan lint, markdown metadata where installed, `git diff --check`, and the repo-native broad gate when available.

If the workflow cannot run a native proof command safely, it should produce blocked proof instead of claiming success.

