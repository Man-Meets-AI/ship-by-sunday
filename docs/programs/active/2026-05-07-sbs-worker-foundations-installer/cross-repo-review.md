---
title: Shipbysunday Worker Foundations Installer Cross-Repo Review
summary: Risk review for installing Worker Foundations into arbitrary repos after the Arena proof.
docType: cross_repo_review
status: active
read_when:
  - Pressure-testing Worker Foundations installer scope.
  - Reviewing conflict, privacy, portability, and same-name file risks before implementation.
---

# Shipbysunday Worker Foundations Installer Cross-Repo Review

## Review Findings

The largest product risk is scope leakage. Worker contains many useful surfaces that are not Worker Foundations. Copying all of them would install fake state into unrelated repos and make the product brittle. The first install bundle must be able to say no to Worker-specific state.

The second risk is hidden ownership. Thin wrappers are easy to distribute, but Arena showed that inspectable local source is what made the system useful for agents. If the installer keeps the true behavior inside the package, the target repo will remain dependent on opaque behavior and future agents will have less context.

The third risk is same-name overwrite. Many serious repos may already have `apps/worker`, `scripts/run-worker.sh`, `.worker`, docs prompts, Program docs, package scripts, or `AGENTS.md` sections. The installer must classify these as already present, managed, mergeable, conflicting, or blocked. Filename matching is not authority to replace.

The fourth risk is privacy and sync safety. Install proof should not include raw logs, raw source, package script bodies, dependency versions, local absolute paths, credentials, or Codex transcripts. The docs operating-system work already established that proof must be concise and sync-safe; the Worker Foundations installer should preserve that standard.

The fifth risk is dogfood theater. A copied Program folder that does not pass `programs:lint`, a child ExecPlan that links to `current-planning-brief.txt`, or an ExecPlan command that assumes local Worker paths would make the install look complete while failing the real product requirement.

The sixth risk is surprising Git mutation. The installer should require a clean worktree, create or reuse `shipbysunday/install`, and auto-commit only after proof passes. It should not push or open a pull request by default.

The seventh risk is dependency pollution. The target app's dependency graph should not absorb Worker tooling. Root `package.json` should only get forwarding scripts; `apps/worker` should own its Bun dependencies and lockfile. If Bun is missing, the installer should use a private Worker-managed toolchain instead of forcing global Bun installation or changing the app's package manager.

The eighth risk is surprising machine-global Codex config mutation. The Worker-managed Codex permission profiles are useful because auto-kickoff should run inside a project-scoped safety rail, but `~/.codex/config.toml` is user-owned state. The installer must treat it as a parsed config file with a marked managed block, a backup, rollback on failure, and no edits outside the Worker-managed section.

## Acceptance Pressure

A good installer should survive three target shapes:

- a sparse repo with no docs operating system
- Arena's harness-shaped starting point
- Ship by Sunday itself, where many docs-core pieces already exist and should not be duplicated

The installer should report different operation states for each target instead of forcing one template path.

## Required Safeguards

Use structured parsing for `package.json` patching. Use `.git/info/exclude` plus `.worker/.gitignore` for local state protection. Use managed sections or blocked states for instruction files. Use create-only or conflict-aware writes for `apps/worker` and docs prompts. Install Worker-managed Codex permission profiles only through a marked, reversible block in `~/.codex/config.toml`, then launch foreground kickoff with the project-write profile. Run the installed commands from the target repo root. Keep proof artifacts under `.worker/**`, write a concise tracked report under `docs/worker/install-report.md`, and ensure both are sync-safe.
