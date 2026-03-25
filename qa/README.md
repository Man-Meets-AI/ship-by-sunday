# QA Control Plane

This folder is the product-readable source of truth for Ship by Sunday QA. Read this folder before reading `apps/web/tests/` if you need to answer what journeys matter, which personas are required, what should run before ship, and which existing tests are still worth trusting.

The control plane is organized around product journeys first and implementation files second.

- `qa/glossary.md` defines the shared language for journeys, personas, scenario packs, confidence states, and release reports.
- `qa/journeys.csv` is the canonical journey catalog. Each row is a scenario that a PM or agent can reason about without reading code.
- `qa/coverage.csv` maps each scenario ID to the current proving mechanisms and highlights where coverage is trusted, stale, or missing.
- `qa/test-inventory.csv` inventories every file under `apps/web/tests/` and records whether it should be kept, rewritten, merged, replaced, or deleted.
- `qa/personas.json` is the committed non-secret persona protocol. `qa/personas.local.json` is the ignored local credential file used for real browser runs.
- `qa/AGENTS.md` tells agents how to select scenarios from a diff, how to prepare personas, how to run packs, and how to write reports.
- `qa/templates/run-report.md` is the report template for baseline and ship evidence.
- `qa/runs/` stores committed ship evidence. `qa/runs/local/` is ignored scratch space for dry runs.

Start with these commands from the repository root:

```bash
bun run qa:validate
bun run qa:inventory:sync
bun run qa:personas:prepare
bun run qa:run-pack -- --pack=default_ship --dry-run
bun run qa:ship -- --pack=default_ship --slug=baseline
```

`qa:validate` is the fast integrity check. `qa:inventory:sync` refreshes the full-suite inventory from the current `apps/web/tests/` tree. `qa:personas:prepare` provisions the committed personas against the current hosted dev environment. `qa:run-pack` is the explicit scenario-pack runner for `default_ship`, `extended`, and `billing_integration`. `qa:ship` scaffolds a dated run report for the selected scenario pack so the human runner can record what passed, failed, or remained blocked.

For authenticated sandbox packs, a hosted environment is currently the reliable path. Local `browser-smoke` works with `PLAYWRIGHT_USE_LOCAL_SERVER=1`, but the authenticated sandbox bootstrap still assumes a reachable app before Playwright’s local web server is consistently ready.
