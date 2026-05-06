---
title: Docs Spine Adoption Planning Brief 4
program_id: docs-spine-adoption-operating-loop
brief_version: 4
status: current
summary: Apply approved docs-spine drafts on a local branch and prove the result.
read_when:
  - Authoring the apply-and-proof child ExecPlan for docs-spine adoption.
---

# Docs Spine Adoption Planning Brief 4

The next implementation slice should apply bounded docs-spine draft artifacts to customer repo files on the already approved local branch. This is the first slice that may write outside `.sbs`, so it must be narrower and more explicit than the scaffold, scanner, or synthesis slices.

The completed synthesis slice writes local draft artifacts under `.sbs/docs-spine-adoption/drafts/**` and sets the next recommended workflow to `docs-spine-apply-and-proof`.

The apply slice should validate draft schemas, target refs, allowed path families, frontmatter or metadata where applicable, markdown lint expectations, Program packet shape, ExecPlan shape, agent instruction routing, prompt inventory, quality-score blocked notes, and parity checklist output before writing any repo docs.

Customer repo writes must be explicitly limited to approved docs-spine paths. Do not mutate package scripts, CI workflows, dependencies, lockfiles, migrations, providers, runtime app code, branch remotes, pull requests, raw logs, raw source sync, or Codex transcripts.

Proof should run structural docs checks first. When a repo-native gate exists, the workflow should either run it if approved and safe or write blocked proof that says exactly why it did not run. Arena CRM's expected broad gate is `bun run gate`, but the pilot should remain a later child ExecPlan after apply mechanics are stable.

Focused validation should include local-runner apply tests, path-allowlist tests, schema validation tests, markdown/frontmatter proof tests, blocked-proof tests, plan lint, Program lint, markdown lint for changed planning docs, and `git diff --check`.
