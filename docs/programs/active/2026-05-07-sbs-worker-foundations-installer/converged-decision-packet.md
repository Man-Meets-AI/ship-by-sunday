---
title: Shipbysunday Worker Foundations Installer Decision Packet
summary: Accepted direction for productizing the Arena Worker-foundations proof as a visible repo-local native Worker installer.
docType: program_decision
status: active
read_when:
  - Checking what the first Worker Foundations installer Program must build.
  - Deciding whether a proposed runtime or Worker-state surface belongs in Worker Foundations.
---

# Shipbysunday Worker Foundations Installer Decision Packet

The Program will productize Worker Foundations as a repo-local native installer. The package will not remain a hidden source of truth for core Worker behavior after install. Instead, it will install visible source that the target repo and future coding agents can inspect.

The first customer command shape is `shipbysunday install`, with `shipbysunday i` as the short alias. The normal path runs from the target repo root. A `--repo <path>` option may exist for tests and support, but users should not have to pass it in ordinary use. Users should not see or choose profiles; internal bundle metadata can exist behind the default Worker Foundations install.

The first implementation slice should define the native installer command, install-plan artifact shape, all-required checklist model, license gate, conflict policy, branch policy, apply/proof flow, dogfood proof, and proof-gated auto-commit. It may reuse existing docs-operating-system validators and install-plan helpers, but it should not be constrained by the old wrapper-only result.

The target repo should receive a cleaned subset of Worker/Arena source:

- Program and ExecPlan docs contracts and indexes
- Program and ExecPlan prompt contracts
- markdown metadata, Program packet, and ExecPlan validators
- `program:write-child-plan`
- `execplan:write`, `execplan:grill`, `execplan:build`, and `execplan:validate`
- `scripts/run-worker.sh`
- `apps/worker`
- `apps/worker/package.json`, `apps/worker/bun.lock`, focused Worker tests, and `apps/worker/worker-manifest.json`
- root package scripts that forward into the runtime
- `.worker/` ignore protection and local proof/state handling
- managed root and nested `AGENTS.md` instruction surfaces
- `docs/worker/install-report.md`

The installer must dogfood the result. A successful install should create a real target-repo Program packet and then use the installed `program:write-child-plan` command to create the first child ExecPlan, not merely copy files.

The first install must explicitly exclude Worker-specific state and app operations: notes, goals, projects, worker role docs, topology, dashboard/control-panel surfaces, Telegram/Discord/provider integrations, launchd, Browser Harness, Things, yt-dlp/ASR/OpenCut assumptions, app-stack process startup, `execplan:feature`, and CI/provider configuration. The report may include a suggested CI snippet, but the installer should not patch `.github/workflows/**` in v1.

Same-name conflicts must block, merge through managed sections, or apply parsed patches. The installer must not overwrite owner-authored `apps/worker`, `scripts/run-worker.sh`, prompt docs, package scripts, Program folders, or instruction files by filename alone.

The native `shipbysunday` executable is the primary customer distribution path. Package-manager delivery can remain a development, bootstrap, or fallback lane. The installer should verify a machine-level license under `~/.worker/` before source writes, with `SHIPBYSUNDAY_WORKER_HOME` available only as an internal/test/support override. The v1 activation flow should use a browser/device-code handoff through the existing web account/access system and store a revocable machine credential outside the target repo. Repo pairing tokens remain separate workspace-runner infrastructure. The target repo must be a Git repository with a root `package.json`, and mutation requires a clean worktree.

The installed Worker package is Bun-first for v1. The customer app can use any root package manager, but `apps/worker` owns its own dependencies and lockfile. The native installer should prefer a compatible `bun` on `PATH`, but if Bun is missing or unsuitable it should provision a pinned private Bun runtime under `~/.worker/toolchains/` and make `scripts/run-worker.sh` resolve that runtime without requiring a global Bun install. If the Worker-managed Bun toolchain cannot be provisioned, block before repo writes with setup instructions.

The installer should create or safely reuse `shipbysunday/install`, run validation, and auto-commit locally with `feat(worker): install planning operating system` only after proof passes. Existing branch reuse is allowed only for a clean current install branch or an existing branch that is equal to or an ancestor of the current clean base. It should block when the branch contains unmerged prior installer work. Because Auto-kickoff Codex is part of the required customer path, missing or unauthenticated `codex` should block before repo writes unless a developer/test caller explicitly passes `--no-kickoff`. The Codex preflight should use `codex --version`, `codex login status`, and explicit untrusted-state detection; it should not use file-based `auth.json` presence as the auth check. Before repo mutation, the installer should install or refresh internal Worker-managed Codex permission profiles named `shipbysunday-worker-readonly` and `shipbysunday-worker-project-write` in a marked block in `~/.codex/config.toml`. That writer must preserve unrelated Codex config, back up before write, update only the managed block, and roll back on failure. Auto-kickoff should launch with the project-write profile. It should not push or open a pull request by default.

Arena CRM is the first golden target. The installer should reproduce the useful migration from harness-shaped validation to Worker-style Program/ExecPlan operation, but it should not encode Arena-only docs folder assumptions as universal requirements.

Acceptance is visible behavior in the target repo: canonical commands exist, local source exists, validators run, child ExecPlan provenance is stamped with an immutable planning brief, proof explains any blocked setup without leaking raw logs or local paths, and a successful run leaves a local install commit plus a concise tracked install report.
