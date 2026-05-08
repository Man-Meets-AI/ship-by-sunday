---
title: SBS Worker Foundations Installer Cross-Repo Review
summary: Risk review for installing Worker planning-runtime foundations into arbitrary repos after the Arena proof.
docType: cross_repo_review
status: active
read_when:
  - Pressure-testing Worker Foundations installer scope.
  - Reviewing conflict, privacy, portability, and same-name file risks before implementation.
---

# SBS Worker Foundations Installer Cross-Repo Review

## Review Findings

The largest product risk is scope leakage. Worker contains many useful surfaces that are not planning-runtime foundations. Copying all of them would install fake state into unrelated repos and make the product brittle. The first install profile must be able to say no to Worker-specific state.

The second risk is hidden ownership. Thin wrappers are easy to distribute, but Arena showed that inspectable local source is what made the system useful for agents. If the installer keeps the true behavior inside the package, the target repo will remain dependent on opaque behavior and future agents will have less context.

The third risk is same-name overwrite. Many serious repos already have `apps/runtime`, `scripts/run-runtime.sh`, `.runtime`, docs prompts, Program docs, package scripts, or `AGENTS.md` sections. The installer must classify these as already present, managed, mergeable, conflicting, or blocked. Filename matching is not authority to replace.

The fourth risk is privacy and sync safety. Install proof should not include raw logs, raw source, package script bodies, dependency versions, local absolute paths, credentials, or Codex transcripts. The docs operating-system work already established that proof must be concise and sync-safe; the Worker Foundations installer should preserve that standard.

The fifth risk is dogfood theater. A copied Program folder that does not pass `programs:lint`, a child ExecPlan that links to `current-planning-brief.txt`, or an `execplan:*` command that assumes local Worker paths would make the install look complete while failing the real product requirement.

## Acceptance Pressure

A good installer should survive three target shapes:

- a sparse repo with no docs operating system
- Arena's harness-shaped starting point
- Ship by Sunday itself, where many docs-core pieces already exist and should not be duplicated

The installer should report different operation states for each target instead of forcing one template path.

## Required Safeguards

Use structured parsing for `package.json` and `.gitignore` patching. Use managed sections or blocked states for instruction files. Use create-only or conflict-aware writes for `apps/runtime` and docs prompts. Run the installed commands from the target repo root. Keep proof artifacts under `.sbs/worker-install/**` and ensure they are sync-safe.
