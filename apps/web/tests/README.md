# App Tests

Keep tests close to the app code and grouped by product domain instead of by framework layer.

- Domain folders mirror app areas such as `auth/`, `blueprint-flow/`, `checkout/`, `course/`, `observability/`, and `workspace/`.
- Plain `*.test.ts` and `*.test.tsx` files are the default unit lane.
- `*.integration.test.ts` files are the route and server integration lane.
- `*.ui.test.tsx` files are the jsdom UI lane.
- `*.contract.test.ts` files are the offline contract lane.
- `*.convex-contract.test.ts` files are the edge-runtime Convex contract lane.
- `tests/setupTests.ts` is the shared jsdom setup entrypoint.
- `tests/utils/` is the app-local shared test helper surface.
