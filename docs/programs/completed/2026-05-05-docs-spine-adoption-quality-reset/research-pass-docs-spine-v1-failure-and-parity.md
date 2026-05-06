---
title: Docs Spine V1 Failure And Parity Research Pass
summary: Postmortem research comparing the v1 Arena CRM docs-spine output against Worker and Ship by Sunday parity surfaces.
docType: program_research
status: active
read_when:
  - Reviewing why the first docs-spine adoption loop was not good enough.
  - Defining parity requirements before rebuilding docs-spine adoption.
---

# Docs Spine V1 Failure And Parity Research Pass

## Question

Why did the first docs-spine adoption loop produce a weak Arena CRM spine, and what should have been treated as the minimum quality bar?

## Findings

The v1 loop optimized for mechanical application, not for a great customer install experience. It produced files that existed and passed a shallow proof, but the generated docs did not behave like the Worker or Ship by Sunday docs spine.

The Arena CRM output was too thin. `docs/index.md` had no frontmatter, no `Owns`, no `Does Not Own`, no `Next`, no reliable first-hop map, and no explanation of how Codex should load repo guidance. `docs/QUALITY_SCORE.md` was a placeholder, not a scorecard. The Program and ExecPlan docs were skeletons instead of contract-compliant operating packets. The prompt, validation, and proof docs were short notes instead of durable operator surfaces.

The scanner selected the wrong evidence. Arena CRM uses root `AGENTS.md` as a shim and `.codex/AGENTS.md` as the canonical instruction file, but v1 treated that fact as one item among many. It also over-included `.agents/daily-audit`, `.ai`, `.claude`, and `.codex/skills` files. That made the output noisy and prevented it from summarizing the real source of truth.

The renderer was weaker than existing local source material. Ship by Sunday already has a generated customer operating-pack renderer with full Program and ExecPlan contracts. Worker has a structural docs-spine validator and a real quality scorecard model. The v1 docs-spine renderer created a parallel simplified version instead of reusing or matching those contracts.

The apply workflow allowed blocked drafts to become repo files. A draft marked `blocked_pending_codex_context` still had `proposedFiles`, and the apply path accepted it. A blocked draft should be impossible to apply. That was the core safety and quality failure.

The proof gate was not a proof gate. It checked Markdown headings and Git state. It did not check frontmatter, required sections, required links, Program packet validity, ExecPlan validity, quality-score shape, prompt contract shape, docs index route completeness, instruction hierarchy accuracy, hidden-dir noise, or Worker/SBS parity.

The completed Program record was premature. The v1 Program said the Arena pilot met acceptance, but the output itself proved otherwise. The right completion state should have been blocked or superseded pending parity evals.

## What Good Looks Like

A customer installing the runner should receive a docs spine that feels hand-audited. It should preserve the repo's own conventions while installing a complete agent operating system: route map, architecture, reliability, security, frontend/design/product docs where applicable, quality score, Programs, ExecPlans, prompts, validation, proof, and instruction routing.

The spine must be repo-specific. For Arena CRM, that means it recognizes `.codex/AGENTS.md` as canonical, root `AGENTS.md` as a shim, Bun/Turbo as the toolchain, `bun run gate` as the broad gate, and the existing app topology instead of dumping hidden folders.

The spine must be evaluable. Every generated or updated file should be checked by deterministic validators before apply. Any weak fact, blocked synthesis state, missing evidence, or uncertain command should be recorded as a blocker or pending audit, not converted into confident Markdown.

The spine must have a quality bar beyond "files exist." It should be judged by contract compliance, source-truth accuracy, repo specificity, parity with Worker/SBS docs, native gate integration, no fake scores, and no uncurated hidden-dir dumps.

## Required Eval Families

Structural evals check file presence, frontmatter, required headings, required route links, active/completed indexes, managed sections, and blocked-state handling.

Contract evals run Program lint, ExecPlan lint, markdown metadata lint, prompt inventory checks, quality-score checks, and docs-index route checks.

Source-truth evals verify instruction hierarchy, package manager, native command map, CI surfaces, app topology, docs ownership, generated-output lanes, and design/product/security/reliability surfaces.

Content quality evals compare generated output against Worker and Ship by Sunday exemplars for completeness, specificity, actionability, and absence of placeholders.

Safety evals reject raw source dumps, secret-like values, local absolute paths in generated customer docs, hidden-dir noise, blocked drafts, unsafe target paths, package-script mutation without approval, and root instruction mutation without a stronger authority class.

Pilot evals run the full adoption loop against Arena CRM and then validate the applied docs in that repo. Arena output should fail until it reaches the defined parity threshold.

## Recommended Direction

Open a new active Program that treats v1 as superseded. The next implementation slice should not add more Markdown templates first. It should build a docs-spine quality gate that makes the current Arena output fail loudly, then rework scanning and rendering against that gate.

Use deterministic scripts for validators and apply authority. Use Codex or subagents only for synthesis and critique, with structured JSON inputs and outputs. Do not let model calls bypass validators.

Reuse existing Worker/SBS contracts where possible. The generated operating-pack renderer, Program/ExecPlan linters, markdown metadata lint, Worker docs-spine validator concepts, and quality-score renderer should become source material for the local-runner adoption workflow.

## Watchpoints

Do not copy Worker or Ship by Sunday docs verbatim into customer repos. The standard is parity of contract and usefulness, not clone-and-replace content.

Do not invent quality scores before an audit. A repo can receive the scorecard structure with blocked or pending scoring evidence, but scored tables require real findings.

Do not let broad repo scans drown out canonical files. Discovery must rank root docs, nearest AGENTS files, package manifests, CI, app roots, and existing docs above hidden logs and historical audit artifacts.

Do not call a Program complete until the pilot output itself is good enough to show a customer.
