# Ship By Sunday CLI Deletion Normalized

## Facts

- The helper CLI is release-critical today because repo scripts and CI made it required, not because the web app or generated starter depends on it.
- `package.json:19` points `bun run sbs` at `packages/ship-by-sunday-cli/src/cli.ts`.
- `package.json:20` defines `sbs:check`, and `package.json:46` includes it in root `check`.
- `.github/workflows/ci.yml:80-101` runs a dedicated `cli` job through `bun run sbs:check`.
- `bin/sbs:1-9` execs the CLI source file.
- `docs/release-workflow.md:67` and `docs/release-workflow.md:103` document `cli` as required proof.
- The source research found no live `packages/codebase-compiler` references to `bun run sbs`, `./bin/sbs`, `Ship by Sunday CLI`, `.ship-by-sunday`, or `ship-by-sunday-cli`.
- The CLI depends on codebase-compiler APIs, not the other way around.
- Removing the CLI loses local browserless codebase intake, `.ship-by-sunday/draft.json`, JSON automation commands, import/export/apply/mutate support, legacy draft import normalization, and local generation from draft facts.
- Codex's CLI is the product itself; Codex does not justify a separate SBS helper CLI bolted into root scripts.

## Recommendation

Delete or retire the helper CLI as a distinct Program slice after unwiring root scripts, CI, branch protection, docs, and tests. Move only genuinely reusable non-CLI behavior if the Program decides those capabilities still matter.

## Risks

- Deleting `packages/ship-by-sunday-cli` first would break root `check`, CI, `bin/sbs`, docs, lockfile state, and documented branch protection.
- Useful draft normalization or local generation behavior could be lost if it is still needed but not moved to `packages/codebase-compiler` or another non-CLI package.
- Public docs under `apps/web/content/docs/` would advertise a removed command surface.
- Branch protection may continue requiring a deleted `cli` context if GitHub settings are not updated.

## Code Seams

- `packages/ship-by-sunday-cli/**`
- `packages/ship-by-sunday-cli/tests/**`
- `bin/sbs`
- `package.json`
- `bun.lock`
- `.github/workflows/ci.yml`
- `README.md`
- `apps/web/content/docs/ship-by-sunday-cli.mdx`
- `apps/web/content/docs/commands.mdx`
- `apps/web/content/docs/_meta.ts`
- `apps/web/content/docs/index.mdx`
- `docs/design-docs/scripts.md`
- `docs/release-workflow.md`
- `qa/README.md`
- GitHub branch protection required `cli` context

## Proposed Slices

1. Decide whether any CLI-only draft or generation behavior must move to non-CLI code.
2. Unwire CLI from root scripts, CI, and branch protection.
3. Remove `bin/sbs`, `packages/ship-by-sunday-cli`, and CLI tests.
4. Remove or rewrite public and internal CLI docs.
5. Refresh lockfile and validation commands around the new command surface.

