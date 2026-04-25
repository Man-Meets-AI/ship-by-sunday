# Codex Test Strategy Normalized

## Facts

- Codex uses local Rust development tests through `cargo nextest`, PR-time Rust verification through Bazel, and heavier post-merge Cargo verification through `rust-ci-full`.
- `justfile:47` defines `just test` as `RUST_MIN_STACK=8388608 cargo nextest run --no-fail-fast`.
- Codex source tests follow crate boundaries and use internal test-support crates such as `core_test_support`, `app_test_support`, and `mcp_test_support`.
- Codex centralizes broad integration behavior where module boundaries matter, such as `codex-core`, `codex-app-server`, `codex-apply-patch`, and SDK process integration.
- Codex uses mocked `/responses` providers and structured request inspection for core behavior instead of defaulting to live OpenAI calls.
- Codex keeps live OpenAI and real runtime tests ignored or opt-in by default.
- Codex uses snapshots for UI/text behavior and serializes resource-heavy nextest groups.

## Recommendation

Use Codex's testing philosophy for SBS: preserve source-level unit and integration tests, replace broad QA harness behavior with smaller source or local-process tests, and keep live hosted checks opt-in or release-scoped.

## Risks

- Deleting browser harness tests before equivalent source or hosted proof exists would create coverage gaps.
- Preserving too many weak source tests without consolidation may keep noise while removing visible QA proof.
- Copying Codex's Rust/Bazel mechanics directly would not fit SBS's Bun, Next.js, Convex, and Playwright stack.
- Live hosted tests can remain flaky if they are treated as default PR proof instead of release-scoped proof.

## Code Seams

- `apps/web/tests/unit/**`
- `apps/web/tests/integration/**`
- `apps/web/tests/integration-ui/**`
- `apps/web/tests/contracts/**`
- `apps/web/tests/browser-smoke/**`
- `apps/web/tests/e2e/**`
- `apps/web/vitest.config.ts`
- `apps/web/playwright.config.ts`
- `packages/*/tests/**`
- `qa/scripts/run-pack.mjs`
- `/Users/parkerrex/Developer/codex/justfile`
- `/Users/parkerrex/Developer/codex/codex-rs/.config/nextest.toml`

## Proposed Slices

1. Preserve strong source-level tests as the default proof base.
2. Rewrite or remove stale route and autosave tests that prove obsolete behavior.
3. Replace browser QA harness coverage with source-level or local integration tests where possible.
4. Keep minimal hosted browser/billing/entitlement proof for release tags rather than broad PR QA packs.

