---
title: Arena Worker Foundations Research Pass
summary: Research capture from the Arena CRM manual Worker-foundations spike and the current Ship by Sunday docs runner boundary.
docType: program_research
status: active
read_when:
  - Comparing the existing docs operating-system runner with the Arena Worker-foundations proof.
  - Deciding what the Worker Foundations installer must install visibly into target repos.
---

# Arena Worker Foundations Research Pass

## Question

What did the Arena CRM spike prove that the current portable docs runner does not yet productize?

## Findings

The current Ship by Sunday local runner solved the portable docs-core problem. It can expose package-owned docs operating-system commands, patch package scripts and wrappers, refresh lockfiles, update quality evidence, run native command proof, and avoid leaking raw logs, package script bodies, or local absolute paths. That work deliberately stopped short of installing Worker runtime source or app-stack conventions.

Arena CRM showed that the next useful product layer is not another hidden validator command. Arena initially had a harness-shaped validator with `harness:*` scripts and `scripts/validate-harness.mjs`, but it lacked the public Worker/SBS command surface: `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, and `program:write-child-plan`. It also lacked the Program loop behavior that resolves `current-planning-brief.txt` once, stamps immutable `planning_brief` provenance on child ExecPlans, and lets future agents continue from checked-in files.

The manual Arena fix used Worker as the source of truth and installed the missing local substrate. The important commit shape was:

- `2fd0211ccf26c8e987a1979cbbac0e14e2d3d07f`: installed Worker planning contracts, prompt docs, and Program/ExecPlan guidance.
- `143de7e6a5b10bae370922c8599bf4adc9eb69a6`: added root script aliases, `scripts/run-runtime.sh`, and `apps/runtime` with Program/ExecPlan validators, runtime command forwarding, prompt loading, proof extraction, Codex runner boundaries, and child-plan workflows.
- `8ad93149d3f2fffdf2d25ee5b783062a9da39208`: dogfooded the planning loop with a real active Program and active child ExecPlans.

That sequence worked because the target repo contained the ideal source files. Codex did not need to infer the operating system from chat. It could inspect `apps/runtime`, `scripts/run-runtime.sh`, package scripts, prompts, Program contracts, ExecPlan contracts, and the dogfood Program packet.

The existing runner's wrapper-first model is too small for this product outcome. It gives repos commands that call back into the package, but it does not give future agents the local source shape that made Arena work. The package should still distribute and update the system, but the behavior that defines the repo's planning/runtime operating system should be checked into the target repo.

## Product Implication

The product should become a Worker Foundations installer. The 2026-05-08 product-shape decision supersedes the initial profile/runtime names below: the customer command is `shipbysunday install`, the installed source root is `apps/worker`, the forwarding script is `scripts/run-worker.sh`, and local proof/state lives under `.worker/`. The core research finding remains that the target repo needs visible local source, not hidden package wrappers.

The installer should leave behind:

- `apps/worker/**`
- `scripts/run-worker.sh`
- Program and ExecPlan docs, prompts, validators, and indexes
- root scripts for `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `program:write-child-plan`, bounded ExecPlan commands, and `worker:test`
- `.worker/` protected as ignored local state
- a dogfood Program packet and first child ExecPlan when the target repo does not already have an active Program loop
- sync-safe install proof under `.worker/**` plus a tracked `docs/worker/install-report.md`

## Watchpoints

Do not copy Worker-specific state. Worker has local runtime state, dashboard/control surfaces, provider integrations, role docs, topology, notes, goals, projects, Telegram/Discord surfaces, and app-specific process commands that are not part of portable Worker Foundations.

Do not preserve Arena's temporary harness assumptions. The harness code was useful only as evidence of the starting gap. The product should replace parallel validation surfaces with the canonical Worker/SBS command surface.

Do not skip dogfooding. The install has not proven the Worker Foundations substrate until the target repo can run the Program loop and create a Program-linked child ExecPlan with immutable planning-brief provenance through the installed command surface.
