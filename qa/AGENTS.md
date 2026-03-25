# QA Agent Workflow

Use this file whenever a task changes routes, auth behavior, entitlement behavior, checkout behavior, browser QA, or ship-readiness evidence.

This folder is the canonical QA control plane. Do not invent alternate scenario lists in a skill folder, a PR comment, or a one-off script. Update the files in `qa/` directly.

## Read Order

Read these files in order before changing QA decisions:

1. `qa/README.md`
2. `qa/glossary.md`
3. `qa/journeys.csv`
4. `qa/coverage.csv`
5. `qa/test-inventory.csv`
6. `qa/personas.json`

Then inspect only the app code and tests required for the selected scenarios.

## Five Agent Responsibilities

### Scenario Mapper

Read the diff, map the changed files to scenario IDs, and state which packs are affected. Prefer product language over file names. Example: a change in `apps/web/features/product-access/` affects `AUTH-02`, `ACCESS-01`, and `PACKET-01`, not “the access-required component.”

### Test Auditor

Keep `qa/test-inventory.csv` current with the real `apps/web/tests/` tree. Every test file must have one row. If a test only proves implementation details, mark it `merge`, `replace`, or `delete` instead of pretending it is ship-critical journey proof.

Use:

```bash
bun run qa:inventory:sync
bun run qa:validate
```

### Browser Runner

Prepare the needed personas, run the smallest relevant browser surface, and record which scenario IDs were actually exercised.

Use:

```bash
bun run qa:run-pack -- --pack=default_ship --dry-run
bun run qa:personas:prepare -- --pack=default_ship
bun run test:browser-smoke
E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=<safe_base_url> bun run --cwd apps/web test:e2e:sandbox:default-ship
```

Pack policy:

- `default_ship`: run `qa:run-pack -- --pack=default_ship` once the environment is ready. This validates the catalog, prepares personas, scaffolds the report, runs browser smoke, and runs the tagged canonical packet-route sandbox spec.
- `extended`: run only the scenarios touched by the diff unless the user asks for a full extended sweep.
- `billing_integration`: run `qa:run-pack -- --pack=billing_integration` only when the environment is explicitly safe for test payments and `QA_ALLOW_BILLING_INTEGRATION=1` is set.
- For authenticated sandbox packs, prefer a hosted environment over `PLAYWRIGHT_USE_LOCAL_SERVER=1` until the local auth bootstrap is redesigned. The current Playwright `globalSetup` can provision hosted personas reliably, but it is not stable enough against a just-started local web server.

### Gap Reviewer

Read `qa/journeys.csv`, `qa/coverage.csv`, the latest report, and the touched diffs together. Find important scenarios that still have `gap`, `rewrite_required`, low-confidence automation, or no recent browser evidence. Flag the missing proof in product language, not in framework language.

Use:

```bash
bun run qa:validate
```

Then inspect the rows with `gap` or low confidence in `qa/coverage.csv` and compare them against the latest committed run report.

### Release Summarizer

Create or update `qa/runs/YYYY-MM-DD-<slug>.md` using `qa/templates/run-report.md`. List the pack, personas, scenario IDs, commands run, pass/fail findings, and blocked items. If a flow was not executed, say so plainly.

Use:

```bash
bun run qa:ship -- --pack=default_ship --slug=<short-name>
```

That command scaffolds a local report under `qa/runs/local/`. Promote the final report into committed `qa/runs/` only after the evidence is worth keeping.

## Operating Rules

- Do not store secrets in `qa/`. Only `qa/personas.local.json` may hold local credentials, and it must stay ignored.
- Do not count a unit test as journey proof if it only checks an internal helper and never validates the user-facing behavior.
- If a current test uses `/mission` or `/artifacts`, mark it `rewrite_required` or `rewrite` unless the actual customer-facing contract still depends on that alias.
- Prefer additive updates. Refresh the inventory, coverage map, and report before deleting legacy tests.
- Run `bun run qa:validate` before concluding any QA control plane change is complete.
- Use `Gap Reviewer` whenever a diff touches release-critical journeys but the coverage map still shows `gap`, `rewrite_required`, or stale browser evidence.
