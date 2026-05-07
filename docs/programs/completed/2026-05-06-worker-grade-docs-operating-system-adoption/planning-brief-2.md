---
title: 'Planning Brief 2: Docs Operating System Package Distribution Proof'
program_id: worker-grade-docs-operating-system-adoption
brief_version: 2
status: current
summary: Prove the shared Ship by Sunday CLI package is shaped and smoke-tested for docs operating-system wrapper distribution.
read_when:
  - Authoring the package distribution child ExecPlan for Worker-grade docs operating-system adoption.
  - Changing how generated docs operating-system wrappers depend on the shared `ship-by-sunday` package.
---

# Planning Brief 2: Docs Operating System Package Distribution Proof

The next implementation slice should make the shared `ship-by-sunday` package distribution strategy explicit and testable before later slices depend on it. The runner already writes package scripts and wrappers that call a package-owned binary, and the lockfile refresh workflow now proves package-manager behavior. What is still weak is package artifact proof: the repository must show that a packed `ship-by-sunday` CLI contains the built docs operating-system command surface and can run from the same package shape that customer repos will install.

Keep this slice narrow. It may change `packages/local-runner/package.json`, `packages/local-runner/tests/package-smoke.ts`, package-distribution docs, this Program, and the child ExecPlan. It should not publish a package, create registry credentials, add CI/provider setup, mutate target customer repos, add runtime state, refresh quality evidence, wire native app-stack commands, or widen any docs operating-system workflow packet authority.

The accepted distribution strategy for this Program is an npm-compatible CLI package named `ship-by-sunday` with the `ship-by-sunday` bin pointing at the bundled `dist/cli.js`. The package artifact should ship only the runtime CLI bundle and required package metadata, not source, tests, local `node_modules`, or Program artifacts. Standard pack/publish commands should build the bundle through `prepack`, while the smoke test should also support `--ignore-scripts` after an explicit build so proof does not hide missing artifacts behind package lifecycle scripts.

Extend package smoke beyond runner pairing. It should still prove `bunx --bun --package <tarball> ship-by-sunday setup pair ...` and `npx --package <tarball> ship-by-sunday setup pair ...`, but it should also inspect the tarball contents and run a docs operating-system command from an installed copy of the packed tarball. The important customer-path proof is that the package binary can execute `ship-by-sunday docs-operating-system markdown-lint --repo <target> --paths docs/index.md` from a temporary repo after the tarball is installed as a dev dependency.

Acceptance for this slice requires:

```bash
bun run --cwd packages/local-runner build
bun run --cwd packages/local-runner package:smoke
bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts docs-operating-system-package-script-patching.test.ts docs-operating-system-lockfile-refresh.test.ts
bun run --cwd packages/local-runner lint
bun run --cwd packages/local-runner typecheck
bun run --cwd packages/local-runner format:check
bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-operating-system-package-distribution-proof.md
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-docs-operating-system-package-distribution-proof.md docs/internal/workflow-packets.md
git diff --check
```

After the slice lands, update this Program to record package distribution proof as shipped and keep evidence-bound quality refresh plus native command integration as the remaining non-runtime outcomes.
