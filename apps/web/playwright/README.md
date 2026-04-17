# Playwright

Keep browser smoke and browser-specific setup here, next to the web app.

- `smoke.spec.ts` is the deterministic browser lane behind `bun run test:e2e`.
- The same suite can run locally or against a deployed URL.
- Deployed checkout smoke should stay env-gated instead of spawning a second QA runtime.
