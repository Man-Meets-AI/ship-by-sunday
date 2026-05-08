---
title: SBS Worker Foundations Installer Decision Packet
summary: Accepted direction for productizing the Arena Worker-foundations proof as a visible repo-local planning-runtime installer.
docType: program_decision
status: active
read_when:
  - Checking what the first Worker Foundations installer Program must build.
  - Deciding whether a proposed runtime or Worker-state surface belongs in planning-runtime.
---

# SBS Worker Foundations Installer Decision Packet

The Program will productize Worker Foundations as a repo-local planning-runtime installer. The package will not remain a hidden source of truth for core planning-runtime behavior after install. Instead, it will install visible source that the target repo and future coding agents can inspect.

The first command shape is `ship-by-sunday worker install --profile planning-runtime --repo <path>`. The exact package alias can be revisited during distribution work, but the local-runner command should model the product now.

The first implementation slice should define the installer profile model, install-plan artifact shape, conflict policy, and apply/proof flow for `planning-runtime`. It may reuse existing docs-operating-system validators and install-plan helpers, but it should not be constrained by the old wrapper-only result.

The target repo should receive a cleaned subset of Worker/Arena source:

- Program and ExecPlan docs contracts and indexes
- Program and ExecPlan prompt contracts
- markdown metadata, Program packet, and ExecPlan validators
- `program:write-child-plan`
- `execplan:write`, `execplan:grill`, `execplan:build`, `execplan:validate`, and `execplan:feature`
- `scripts/run-runtime.sh`
- `apps/runtime`
- root package scripts that forward into the runtime
- `.runtime/` ignore entries

The installer must dogfood the result. A successful install should create or validate a real target-repo Program packet and first child ExecPlan, not merely copy files.

The first profile must explicitly exclude Worker-specific state and app operations: notes, goals, projects, worker role docs, topology, dashboard/control-panel surfaces, Telegram/Discord/provider integrations, launchd, Browser Harness, Things, yt-dlp/ASR/OpenCut assumptions, app-stack process startup, and CI/provider configuration.

Same-name conflicts must block, merge through managed sections, or apply parsed patches. The installer must not overwrite owner-authored `apps/runtime`, `scripts/run-runtime.sh`, prompt docs, package scripts, Program folders, or instruction files by filename alone.

Arena CRM is the first golden target. The installer should reproduce the useful migration from harness-shaped validation to Worker-style planning-runtime operation, but it should not encode Arena-only docs folder assumptions as universal requirements.

Acceptance is visible behavior in the target repo: canonical commands exist, local source exists, validators run, child ExecPlan provenance is stamped with an immutable planning brief, and proof explains any blocked setup without leaking raw logs or local paths.
