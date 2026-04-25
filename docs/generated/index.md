---
title: 'Generated Docs'
summary: 'Landing page for generated mirrors and blueprint artifacts checked into Ship by Sunday.'
docType: 'index'
status: 'active'
read_when:
  - 'You need to inspect generated mirrors or blueprint artifacts from the docs spine.'
---

# Generated Docs

`docs/generated/` contains checked-in generated mirrors and blueprint artifacts. Treat this lane as output, not as the primary owner of repo doctrine.

Do not hand-edit files under `docs/generated/` as the first edit. Update the source lane or generation path first, then sync the matching generated mirror.

## Current Areas

- `docs/generated/openai-blueprint/` mirrors `docs/openai/`.
- `docs/generated/ship-by-sunday-blueprint/` mirrors `docs/ship-by-sunday/`.

## Mirror Check

Run the mirror check from the repository root:

```bash
bun run docs:generated:check
```

The command should print no diff output. If it reports drift, update the source and generated mirror together or document why the mirror policy changed.
