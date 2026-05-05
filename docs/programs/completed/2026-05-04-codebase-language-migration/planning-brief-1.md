---
title: Codebase Language Migration Planning Brief 1
program_id: codebase-language-migration
brief_version: 1
status: current
summary: Make docs and Program packets coherent with the direct codebase rename.
read_when:
  - Authoring the first child ExecPlan for the Codebase Language Migration Program.
---

# Codebase Language Migration Planning Brief 1

The first implementation slice should make docs-owned current truth agree with the user's directive: the canonical noun is `codebase`, and this is a direct non-compatible rename rather than an old-name support project.

This slice owns docs and Program coherence. Update the active Codebase Language Migration packet, Program indexes, root docs, source docs, generated mirrors when the source is changed, and path/title/frontmatter references that drifted during mechanical renames.

Do not edit app or package source in this slice. If validation finds remaining app, package, Convex, release-proof, or test references outside the docs-owned write set, record them as remaining issues for the owning worker.

Generated docs mirrors may move only when their source or generation path is updated in the same slice. Do not manually edit `docs/generated/**` as the only source of truth.

This slice must not reintroduce an old-name support plan, facade-package plan, route redirect plan, API facade plan, or cleanup window. The rename target is codebase; validation should prove the renamed surfaces directly.

Focused validation should include:

```bash
bun run programs:lint
bun run markdown:lint -- --paths docs/programs
bun run docs:generated:check
```

After this slice lands, refresh `program.md` with the exact files changed, validation evidence, and the next recommended child slice.
