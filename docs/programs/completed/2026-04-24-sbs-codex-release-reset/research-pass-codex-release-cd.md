# Codex Release And CD Research

This research pass preserves the Codex release and CD findings gathered from `/Users/parkerrex/Developer/codex` on 2026-04-24. No Ship by Sunday files were edited during the source research.

## Source Track

The source track inspected Codex tag-driven release workflows, semantic version gates, release artifacts, signing, npm, WinGet, DotSlash, installer idempotency, and release preparation.

## Findings

Codex release automation is tag-driven. `.github/workflows/rust-release.yml:8-16` triggers on pushes to `rust-v*.*.*`, with comments showing examples. Release concurrency cancels in-progress runs for the same workflow.

The release workflow validates the tag before building. `.github/workflows/rust-release.yml:30-45` requires a `rust-vMAJOR.MINOR.PATCH` tag, with optional `-alpha`, `-alpha.N`, `-beta`, or `-beta.N`, and compares the tag version with the Rust workspace version in `codex-rs/Cargo.toml:103`.

Codex has a single Rust workspace package version source. `codex-rs/Cargo.toml:103` owns `[workspace.package].version`; `codex-rs/cli/Cargo.toml:1` inherits that version; `codex-rs/tui/src/version.rs:1` embeds `CARGO_PKG_VERSION`.

Codex has explicit channel policy:

- GitHub Releases are prereleases when the version contains `-`, in `.github/workflows/rust-release.yml:520`.
- npm publishes stable `x.y.z` or numeric alpha `x.y.z-alpha.N`, in `.github/workflows/rust-release.yml:471`.
- WinGet publishes stable versions only, in `.github/workflows/rust-release.yml:667`.
- Developer-site schema deploy is stable-only and non-blocking, in `.github/workflows/rust-release.yml:545-555`.

The release build fanout is split by platform and concern. Unix/macOS builds run through a six-target matrix in `.github/workflows/rust-release.yml:64-79`. Windows builds delegate to `.github/workflows/rust-release-windows.yml:36`. Zsh and argument-comment-lint artifacts delegate through `.github/workflows/rust-release-zsh.yml:10` and `.github/workflows/rust-release-argument-comment-lint.yml:17`.

The release aggregation job downloads artifacts, removes internal timing and pre-signing artifacts, adds `config-schema.json`, stages npm packages, adds installer scripts, and creates the GitHub Release. Evidence is `.github/workflows/rust-release.yml:392-543`.

Code signing is isolated by platform:

- Linux uses keyless cosign bundles with OIDC in `.github/actions/linux-code-sign/action.yml:17`.
- macOS imports a P12 into a temporary keychain, signs binaries, notarizes binaries and DMGs, staples DMGs, and deletes the keychain in `.github/actions/macos-code-sign/action.yml:33`.
- Windows uses Azure Trusted Signing through OIDC in `.github/actions/windows-code-sign/action.yml:29`.

npm packaging is staged from release artifacts. `scripts/stage_npm_packages.py:81` resolves the release workflow run by `rust-v<version>`, downloads native artifacts, expands `codex` into meta and platform packages, and writes tarballs. `codex-cli/scripts/build_npm_package.py:21` defines platform variants, and `codex-cli/scripts/build_npm_package.py:331` uses platform-tagged package versions to avoid npm version collisions. npm publish uses trusted publishing/OIDC and treats already-published package versions as idempotent success in `.github/workflows/rust-release.yml:561` and `.github/workflows/rust-release.yml:659`.

Codex publishes DotSlash manifests for CLI, zsh, and argument-comment-lint in `.github/workflows/rust-release.yml:524`. The mapping configs are `.github/dotslash-config.json:1`, `.github/dotslash-zsh-config.json:1`, and `.github/dotslash-argument-comment-lint-config.json:1`.

WinGet publishing is stable-only through `winget-releaser`, with `OpenAI.Codex`, Windows exe zip matching, and `WINGET_PUBLISH_PAT` in `.github/workflows/rust-release.yml:680`.

Homebrew is referenced as an install/update channel, but the research pass did not find a checked-in Homebrew publishing workflow. `README.md:25` advertises `brew install --cask codex`. Runtime update checks query the Homebrew cask API for brew installs in `codex-rs/tui/src/updates.rs:57`, and update action runs `brew upgrade --cask codex` in `codex-rs/tui/src/update_action.rs:36`.

Rollback is not a first-class automated workflow. Practical rollback is old tag/assets plus installer pinning via `--release`. Installers verify GitHub asset SHA digests, lock installs, clean stale staging directories, reinstall incomplete releases, and atomically update current links in `scripts/install/install.sh:123`, `scripts/install/install.sh:337`, `scripts/install/install.sh:725`, `scripts/install/install.ps1:58`, and `scripts/install/install.ps1:645`.

Release preparation is separate from release publishing. `.github/workflows/rust-release-prepare.yml:1-53` runs manually or every four hours, updates `models.json` with `CODEX_OPENAI_API_KEY`, and opens a PR.

## Copyable Principles For Ship By Sunday

The transferable release shape is:

- one immutable release identity from a protected semver tag
- a checked version source of truth
- stable/prerelease channel policy
- release artifacts gathered before publishing
- fanout jobs split by concern with narrow permissions
- idempotent publish behavior for already-published outputs
- explicit verification before install, promote, or publish

The non-transferable parts are Codex's Rust, Bazel, binary signing, npm platform package, DotSlash, and WinGet details unless Ship by Sunday later chooses to publish packages or installers.

