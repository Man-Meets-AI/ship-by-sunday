# @shipbysunday/ship-by-sunday-cli

Repo-local Ship by Sunday CLI for blueprint intake and Ship by Sunday Blueprint generation.

## Supported Use

Clone the repository, run `bun install`, then launch from the repo root with either `bun run sbs` or `./bin/sbs`.

The CLI reports version information from the manifest:

```bash
bun run sbs --version
./bin/sbs --version
bun run sbs version --json
```

Shell completion is printed to stdout for manual sourcing:

```bash
./bin/sbs completion bash
./bin/sbs completion zsh
```

## What Is Not Supported

- public registry distribution
- `bunx`
- Homebrew
- self-update or remote update commands

## Workspace Commands

```bash
bun run --cwd packages/ship-by-sunday-cli lint
bun run --cwd packages/ship-by-sunday-cli format:check
bun run --cwd packages/ship-by-sunday-cli typecheck
bun run --cwd packages/ship-by-sunday-cli test
```
