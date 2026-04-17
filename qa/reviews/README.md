# QA Reviews

This folder holds QA-team review artifacts that are useful for feature-level analysis but are not the same thing as durable ship evidence.

- `qa/reviews/local/` is ignored scratch space for material advisory reviews, diff-based QA notes, and scaffolded review files created by `bun run qa:team`.
- `qa/runs/` remains the durable committed evidence set for browser runs, pack runs, and release-ready QA reports.

Use a review artifact when the QA-team interaction is substantial enough that another agent should be able to audit how the verdict was reached. Use a run report when commands actually executed and the evidence is worth keeping.

Start from the repository root:

```bash
bun run qa:team -- --slug=<feature-slug> --base=main --dry-run
```

Drop `--dry-run` to scaffold the local Markdown artifact under `qa/reviews/local/`.

For a command-backed review, pass the mode and environment explicitly:

```bash
bun run qa:team -- --slug=<feature-slug> --base=main --review-mode=command-backed --environment=dev-local --commands="bun run qa:validate||bun run qa:run-pack -- --pack=default_ship --dry-run"
```

Use `||` to separate commands inside `--commands`.
