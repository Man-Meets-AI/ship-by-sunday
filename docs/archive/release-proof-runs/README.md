# Release Proof Runs

Committed reports in this folder are historical release evidence.

- Keep baseline and ship-ready summaries here when they are worth reviewing over time.
- Label every committed report with `Environment:` near the top so `dev`, `prod`, and other targets never get mixed together.
- Read `dev` evidence first when resuming release proof, then the latest report for the target environment.
- Use ignored files under `tmp/` for scratch reports and dry runs.
- Promote a local report into this folder only after you have filled in real pass, fail, and blocked results.
