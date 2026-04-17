# Playwright

Keep browser smoke and browser-specific setup here, next to the web app.

- `public/` is the deterministic public browser lane behind `bun run test:e2e`.
- Local runs use a production build plus `next start` by default.
- Set `PLAYWRIGHT_SKIP_BUILD=1` when a workflow or local session already built the app and only needs `next start`.
- The same suite can run locally or against a deployed URL.
- Deployed checkout smoke should stay env-gated instead of spawning a second QA runtime.
