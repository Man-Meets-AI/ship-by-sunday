# Design Checklist Source Docs

This folder contains the source material that the repo-owned canonical design pack was derived from.

For active UI work in this repo, start here instead:

- `docs/ship-by-sunday/design-pack/README.md`
- `docs/ship-by-sunday/design-pack/AGENTS.md`
- `docs/ship-by-sunday/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/PLANS.md`
- `docs/ship-by-sunday/design-pack/documentation.md`

For the neutral vanilla baseline, use:

- `docs/openai/design-pack/README.md`
- `docs/openai/design-pack/AGENTS.md`
- `docs/openai/design-pack/CHECKLIST.md`
- `docs/openai/design-pack/PLANS.md`
- `docs/openai/design-pack/documentation.md`

Keep this folder as source basis and historical reference. The codebase compiler still reads these files as the design template input through `packages/codebase-compiler/src/server/template-loader.ts`.

For active human UI work, use `docs/ship-by-sunday/design-pack/`. For the neutral vanilla baseline, use `docs/openai/design-pack/`.
