# Codex Test Strategy Research

This research pass preserves the Codex test strategy findings gathered from `/Users/parkerrex/Developer/codex` on 2026-04-24.

## Source Track

The source track inspected Codex local test commands, CI test selection, unit and integration layout, Bazel mechanics, fixtures, snapshots, SDK tests, remote-env tests, and intentionally excluded live coverage.

## Findings

Codex uses three overlapping test paths:

- local Rust development through `cargo nextest`
- PR-time Rust verification through Bazel
- heavier post-merge Cargo verification through `rust-ci-full`

`justfile:47` defines the routine local Rust test command as `just test`, which runs `RUST_MIN_STACK=8388608 cargo nextest run --no-fail-fast`. Comments say nextest is preferred for routine local runs and `--all-features` should not be needed.

`justfile:71` defines `just bazel-test` as `bazel test --test_tag_filters=-argument-comment-lint //... --keep_going`. `justfile:82` defines `just bazel-remote-test` with `--config=remote --platforms=//:rbe`.

TypeScript SDK local commands are `pnpm run build`, `pnpm run lint`, and `pnpm run test`, with Jest matching `**/tests/**/*.test.ts`. Evidence is `sdk/typescript/package.json:34` and `sdk/typescript/jest.config.cjs:10`.

Python SDK tests are pytest-discoverable under `sdk/python/tests`, with quiet pytest defaults in `sdk/python/pyproject.toml:60`. The research pass did not find a GitHub workflow invoking `pytest`; `.github/workflows/sdk.yml:106` covers the TypeScript SDK path.

Codex CI intent is documented in `.github/workflows/README.md:1`. PRs get fast, review-friendly signal, and `main` gets full cross-platform verification. `.github/workflows/README.md:7` names `bazel.yml` as the main pre-merge Rust path and `rust-ci.yml` as intentionally small. `.github/workflows/README.md:21` says `rust-ci-full.yml` handles full Cargo clippy, full Cargo nextest, release-profile builds, cross-platform argument-comment-lint, and Linux remote-env tests after merge.

`rust-ci.yml` gates PR jobs by changed paths such as `codex-rs/*`, lint tooling, `justfile`, Bazel defs/templates, and `.github/*` at `.github/workflows/rust-ci.yml:20`.

`bazel.yml` runs `bazel test //...` across macOS arm/x64, Linux gnu/musl x64, and Windows gnullvm, with Linux arm temporarily disabled for flake stabilization. Evidence is `.github/workflows/bazel.yml:23`. Normal Bazel tests exclude standalone `third_party/v8` and `argument-comment-lint` tagged tests at `.github/workflows/bazel.yml:78`.

Full Cargo tests use `cargo nextest run --no-fail-fast --target ... --cargo-profile ci-test --timings` after installing nextest 0.9.103. Evidence is `.github/workflows/rust-ci-full.yml:645` and `.github/workflows/rust-ci-full.yml:671`.

Rust tests follow crate boundaries, with internal test-support crates such as `core_test_support`, `app_test_support`, and `mcp_test_support`. Evidence is `codex-rs/Cargo.toml:1` and `codex-rs/Cargo.toml:210`.

The largest test concentrations are in `core`, `app-server`, `apply-patch`, `tui`, `exec`, `tools`, `exec-server`, `login`, and `cli`.

`codex-core` aggregates many integration modules into one `tests/all.rs` binary and wires dispatch so the same binary can behave like `codex`, `apply_patch`, or `codex-linux-sandbox`. Evidence is `codex-rs/core/tests/all.rs:1` and `codex-rs/core/tests/suite/mod.rs:9`.

`codex-app-server` uses a similar single integration binary split into protocol/v2 modules by RPC surface: thread, turn, config, MCP, plugin, review, status, and related surfaces. Evidence is `codex-rs/app-server/tests/all.rs:1` and `codex-rs/app-server/tests/suite/v2/mod.rs:1`.

`codex-apply-patch` uses fixture-driven scenario tests: each scenario has input, patch, and expected state; the test runs the binary and compares final filesystem snapshots. Evidence is `codex-rs/apply-patch/tests/suite/scenarios.rs:10`.

`codex-tui` leans heavily on `insta` snapshots for rendered output, and repo instructions require snapshot coverage for UI/text output changes. Evidence is `AGENTS.md:105`.

Bazel parity is engineered into the test harness. `defs.bzl:125` defines a custom `codex_rust_crate` macro that creates library, binary, unit-test, and integration-test targets. `defs.bzl:261` wraps unit tests so they run from the workspace root and keep Insta snapshot paths Cargo-like. `defs.bzl:328` generates integration tests from `tests/*.rs`, attaches `tests/**` data, and supplies `CARGO_BIN_EXE_*` environment variables for first-party binaries. `defs.bzl:177` marks matching tests flaky for Bazel retry behavior.

Source-tree runtime or compile data must be declared explicitly for Bazel parity. `AGENTS.md:44` calls this out for `include_str!`, `include_bytes!`, `sqlx::migrate!`, and similar cases.

Core integration tests use `core_test_support::responses` to mount `/responses` mocks and inspect structured request bodies rather than manually digging through JSON. Evidence is `AGENTS.md:142` and `codex-rs/core/tests/common/responses.rs:40`.

App-server tests write per-test mock provider config with retries disabled, read-only sandbox, and mock `/v1/responses` base URLs. Evidence is `codex-rs/app-server/tests/common/config.rs:42`.

Nextest serializes slow or resource-heavy groups such as app-server protocol codegen, app-server integration, core apply-patch CLI integration, and Windows sandbox legacy sessions. Evidence is `codex-rs/.config/nextest.toml:5`.

Snapshot path stability under Bazel uses `INSTA_WORKSPACE_ROOT`, `INSTA_SNAPSHOT_PATH`, and Rust path remapping in `defs.bzl:190`.

TypeScript SDK tests are real process integration tests around the Codex binary. CI builds `//codex-rs/cli:codex` with Bazel, installs it to `.tmp/sdk-ci/codex`, exports `CODEX_EXEC_PATH`, then runs TypeScript build/lint/test. Evidence is `.github/workflows/sdk.yml:42`.

TS helpers default to `CODEX_EXEC_PATH` or `codex-rs/target/debug/codex`, inject a mock Responses provider, and disable plugins to avoid temp-home cleanup races. Evidence is `sdk/typescript/tests/testCodex.ts:6`. TS tests isolate `CODEX_HOME` per Jest test in `sdk/typescript/tests/setupCodexHome.ts:10`.

Python SDK has contract-generation drift tests and public API behavior tests. Real app-server/example coverage is skipped unless `RUN_REAL_CODEX_TESTS=1`, in `sdk/python/tests/test_contract_generation.py:36` and `sdk/python/tests/test_real_app_server_integration.py:24`.

Remote-env tests are Docker-backed Linux tests. CI enables them only for Linux x86_64 gnu by exporting `CODEX_TEST_REMOTE_ENV` and `CODEX_TEST_REMOTE_EXEC_SERVER_URL` in `.github/workflows/rust-ci-full.yml:535` and `.github/workflows/rust-ci-full.yml:661`. Local remote-env usage is source-only through `scripts/test-remote-env.sh:3`; the script builds `codex`, starts an Ubuntu 24.04 privileged Docker container, copies the binary in, starts `codex exec-server`, and exports the websocket URL in `scripts/test-remote-env.sh:45`.

## Intentionally Not Covered By Default

PR Cargo-native CI intentionally does not run the full Cargo test matrix; `.github/workflows/README.md:21` says that is post-merge full CI.

Live OpenAI `/v1/responses` smoke tests are `#[ignore]` by default in `codex-rs/core/tests/suite/live_cli.rs:3`.

Python real-runtime SDK coverage is opt-in through `RUN_REAL_CODEX_TESTS=1`, not default pytest coverage. Evidence is `sdk/python/tests/test_real_app_server_integration.py:25`.

New slow-timeout exceptions are discouraged by `codex-rs/.config/nextest.toml:17`, which says not to add new tests there.

Boilerplate tests that only assert experimental field markers are discouraged for app-server protocol work in `AGENTS.md:212`.

Some tests are consciously ignored for flakiness, platform mismatch, unrestricted networking, or missing future behavior. Examples reported by the research track include `codex-rs/core/tests/suite/pending_input.rs:224`, `codex-rs/core/tests/suite/shell_snapshot.rs:655`, `codex-rs/tui/src/app/tests.rs:3582`, and `codex-rs/core/tests/suite/codex_delegate.rs:27`.

## Copyable Principles For Ship By Sunday

The transferable test strategy is:

- source-level tests stay close to the code they prove
- integration breadth is centralized where behavior crosses module boundaries
- end-to-end behavior should prefer mocked or local-process tests over live services
- live external tests should be opt-in or release-scoped
- nondeterminism should be disabled through temp homes, retry control, and serialized groups
- UI/text output changes should use reviewable snapshots where appropriate
- slow, ignored, or live-network tests should be treated as exceptions, not defaults

