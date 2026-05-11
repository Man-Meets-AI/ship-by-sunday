---
title: Worker Install Compatibility Normalized Pass
summary: Normalized target state for the Worker install compatibility matrix.
docType: research
status: active
read_when:
  - Comparing current compatibility tests to the target matrix.
  - Planning the next Worker install compatibility slice.
---

# Worker Install Compatibility Normalized Pass

The compatibility target is not every theoretical permutation. The target is a representative matrix that covers the dimensions most likely to break a repo-mutating installer: blank versus existing repo, package-manager identity, monorepo shape, non-JavaScript project presence, existing owner-authored files, older Worker installs, fresh recipient clones, JSON safety, and kickoff.

Blank and unclaimed repositories should default to Bun. Repositories that already declare npm, pnpm, Bun, yarn, or another supported manager should keep that identity. Worker internals should remain Bun-backed through `apps/worker` and `scripts/run-worker.sh`, while root commands should feel native to the target repo.

Ready-to-rip means the installed repo has recipient-grade README and AGENTS instructions, direct executable entrypoints, passing proof commands, a clean committed install, fresh clone command proof, and a fake-Codex kickoff proof. CI should run fast source-level fixture tests. Release proof should also run packed and native executable smoke.
