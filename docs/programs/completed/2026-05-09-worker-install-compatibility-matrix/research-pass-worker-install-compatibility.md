---
title: Worker Install Compatibility Research Pass
summary: Initial research pass for proving Worker Foundations install across practical repo shapes.
docType: research
status: active
read_when:
  - Extending the Worker install compatibility matrix.
  - Checking why the first fixture set was chosen.
---

# Worker Install Compatibility Research Pass

The installed Worker surface is intended to behave like a productized, standalone version of the useful Arena CRM runtime pattern: checked-in local source, root command forwarding, local state outside commits, Program and ExecPlan docs, proof commands, and a kickoff path that can start the next worker loop.

The current `runner-test` repository is useful manual evidence, but it is a throwaway proof target. The real compatibility evidence should live inside `packages/local-runner` so the installer can be tested against generated repositories with controlled package-manager, framework, monorepo, conflict, and fresh-clone conditions.

The first representative fixture set should prove a current Bun repo, an npm single-app repo, a pnpm monorepo, a Bun repo whose root version differs from the Worker-managed Bun version, the current blank-slate blocker, fresh clone command execution, and fake-Codex kickoff. Later slices should add polyglot layouts, conflict and upgrade fixtures, generated README/AGENTS assertions, and packed/native release smoke integration.
