# App Tests

Keep tests close to the app code and grouped by runtime surface instead of maintaining a root release-proof sidecar.

- `tests/contracts/` is for contract and backend-facing behavior.
- `tests/integration/` is for route and server integration.
- `tests/integration-ui/` is for jsdom UI flows.
- `tests/unit/` is for focused unit behavior.
- `tests/setupTests.ts` is the shared jsdom setup entrypoint.
- `tests/utils/` is where shared test harness helpers should live.
