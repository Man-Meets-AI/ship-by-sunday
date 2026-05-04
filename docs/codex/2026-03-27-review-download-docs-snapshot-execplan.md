---
summary: "ExecPlan for replacing the review download with a customer-safe repo snapshot that unpacks as a real repo folder and ships generated docs under repo-root `docs/`. It tracks the classification rules, packaging contract, and route cleanup needed to make the download safe and truthful."
read_when: "Open this when you need the snapshot packaging contract or the generated-docs layout decisions for the review download work."
plan_status: "done"
---

# Make the review download a customer-safe repo snapshot with generated docs

This is a living execution plan for changing the Review download from a recursive filesystem snapshot plus repo-root `codebase/` outputs into a customer-safe starter repo bundle built from the tracked repository, classified and sanitized for customer use, with generated Design, Marketing, and Build materials under repo-root `docs/`. It is written so a fresh coding agent can implement the change end to end without prior chat context, and it must be updated as work proceeds.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this work, a buyer who reaches `/review` and downloads the `Codebase` will receive one zip that unpacks into a real repo folder, not a flat archive of whatever happened to be on the server filesystem. That repo will begin from the tracked repository, then apply an explicit customer-safe classification pass: some files will ship unchanged, some will ship as generalized starter versions, and some will be excluded entirely. The delivered repo will contain the safe starter code plus generated docs under repo-root `docs/`, so the customer can open the repo and immediately find their design, marketing, build, and prompt materials where a repo reader expects them, along with the shipped planning prompt assets and the generalized AI and QA starter material. A human should be able to verify the change by downloading the snapshot, unzipping it, seeing a single named repo folder, seeing generated files under `docs/`, seeing only the approved generalized helper surfaces, confirming that no real env files, local virtualenvs, `output/` artifacts, media, or local build junk are present, and seeing no separate pack-download affordances or routes anywhere in the product.

## Progress

- [x] 2026-03-27 10:41 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, and the `long-horizon` planning skill reference before drafting this plan.
- [x] 2026-03-27 10:41 EDT — Inspected the current review download flow in `apps/web/app/api/download/repo/route.ts`, `apps/web/app/api/download/codebase/[stage]/route.ts`, `apps/web/features/codebase-flow/server/downloads.ts`, and the review UI under `apps/web/features/codebase-flow/components/`.
- [x] 2026-03-27 10:41 EDT — Inspected the codebase compiler surfaces in `packages/codebase-compiler/src/server/rendered-codebase-tree.ts`, `packages/codebase-compiler/src/server/template-loader.ts`, `packages/codebase-compiler/src/codebases/`, `packages/codebase-compiler/src/codebase-archives/`, `packages/codebase-compiler/src/repo-generation/`, and `packages/codebase-compiler/src/public-artifact-contract.ts`.
- [x] 2026-03-27 10:41 EDT — Confirmed the current bug: the manifest-aware local snapshot payload is about `2.12 GB`, dominated by `apps/web/output` and `apps/web/.venv-video`, because `materializeRepoSnapshot()` recursively walks included directories and does not honor `.gitignore` or a strict customer-safe contract.
- [x] 2026-03-27 10:41 EDT — Confirmed the current contract mismatch: canonical docs and tests still require repo-root `codebase/`, while the approved target for this initiative is a downloaded repo whose generated packs live under repo-root `docs/`.
- [x] 2026-03-27 10:41 EDT — Confirmed that `apps/web/config/vercel-output-tracing.ts` already contains a curated repo-download allowlist for deployed tracing, but the runtime snapshot builder does not reuse that allowlist.
- [x] 2026-03-27 11:03 EDT — Measured the full tracked repository with `git ls-files`: about `23.6 MB` across 1,187 tracked files. The tracked tree includes internal authoring and ops material such as `.agents/skills`, `docs/codex`, `qa/`, and a few tracked artifact-like files, so the final snapshot contract must classify tracked paths instead of assuming “all tracked files” is automatically customer-safe.
- [x] 2026-03-27 11:19 EDT — Completed the grill pass. Resolved the final snapshot base as “full tracked repo plus classification”, kept `docs/prompts/*` as shipped static prompt assets, chose generalized `.agents`, generalized root `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`, generalized `qa/` with project-shaped starter CSVs, excluded `docs/codex` except `docs/codex/PLANS.md`, excluded internal docs such as `docs/openai` and `docs/ship-by-sunday`, chose inert generalized GitHub workflow examples instead of live workflows, and required a new safe `apps/web/.env.production.example`.
- [x] 2026-03-27 11:48 EDT — Closed the remaining grill decisions. The snapshot remains the only download artifact, `/api/download/codebase/[stage]` is removed rather than preserved as compatibility surface, the public story keeps `Agent-Ready Packs` as the mechanism but delivers them only inside the `Codebase`, stage pages lose pack-download affordances entirely, `/review` replaces the supporting artifact grid with a non-clickable “What’s inside the Codebase” preview, generalized starter surfaces stay static rather than personalized, and the remaining tracked root-file policy is now explicit: keep only runtime/setup roots plus generalized top-level docs, exclude `.impeccable.md`, `skills-lock.json`, `todo.md`, `CHANGELOG.md`, and the tracked temporary PNGs.
- [x] 2026-03-27 12:03 EDT — Completed Milestone 1. Added `packages/codebase-compiler/src/generated-docs/generated-doc-paths.ts` as the shared generated-docs path contract, updated the codebase-compiler contract docs to describe repo-root `docs/...`, clarified the root `README.md` override to point at `docs/README.md`, and froze the tracked-repo classification rules in `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`.
- [x] 2026-03-27 12:03 EDT — Completed the generated-tree portion of Milestone 2. `renderFullCodebaseTree()` and the stage archive builders now emit repo-root `docs/...`, and the old generated marketing/implementation/qa/deploy prompt pack has been replaced by the shipped ExecPlan prompt assets from `docs/prompts/*`.
- [x] 2026-03-27 12:22 EDT — Completed Milestone 2. Removed the stage-pack route, deleted the codebase-archive builders and their test lane, dropped the archive exports from `@codebase-compiler`, and updated the remaining route integration test to cover only `/api/download/repo`.
- [x] 2026-03-27 12:27 EDT — Completed Milestone 3. Replaced the broad manifest roots with the shared source contract in `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`, generated the generalized starter surfaces and safe `apps/web/.env.production.example`, filtered forbidden files such as tracked `.mp4` assets from included directories, prefixed the final zip entries with `repoName`, memoized static template reads, and pointed `apps/web/config/vercel-output-tracing.ts` at the shared repo-download trace contract.
- [x] 2026-03-27 12:22 EDT — Completed Milestone 4. Review now shows a non-clickable “What’s inside the Codebase” preview, completed stage sidebars no longer offer pack downloads, Execute / Ship no longer links to deleted pack routes, and the focused web tests now assert the single-download contract.
- [x] 2026-03-27 12:27 EDT — Completed Milestone 5. Focused codebase-compiler tests, route/UI tests, `bun run lint`, direct zip inspection, and `bun run build` all passed. `bun run format:check` remains blocked by unrelated pre-existing formatting issues in other `apps/web` files outside this slice.
- [x] 2026-03-27 12:34 EDT — Updated the durable markdown docs in `README.md`, `apps/web/content/docs/how-the-starter-works.mdx`, and `apps/web/content/docs/local-qa.mdx` so the repo entry docs and local QA runbook now describe the single `Codebase` contract instead of implying separate pack downloads.

## Surprises & Discoveries

The current size problem is not theoretical. The local snapshot builder would include about `2,117,988,385` bytes, which is about `1.97 GiB`, before compression. The two largest buckets are `apps/web/output` at `1,513,065,985` bytes and `apps/web/.venv-video` at `584,144,654` bytes. That means the route is not just slow or sloppy. It is packaging workstation-specific artifacts as if they were product output.

The current implementation is more dangerous than a large zip alone suggests. `materializeRepoSnapshot()` recursively walks `apps/web` and `packages/codebase-compiler`, and the exclude list is only a small set of path segments. `apps/web/.env.local` sits under `apps/web`, and the deployed tracing contract currently includes both `.env.local.example` and `.env.production`. The app-level and repo-level `.gitignore` files ignore local secrets, but the snapshot builder does not consult those files, so the current design is capable of leaking local-only or deployment-specific env files unless the contract is tightened explicitly.

There is already a useful allowlist in the repo. `apps/web/config/vercel-output-tracing.ts` defines `repoDownloadTraceIncludes`, which is a curated set of files and globs for the deployed `/api/download/repo` route. The review snapshot bug exists because the runtime snapshot builder ignores that contract and separately walks large directory trees. This means the plan can reduce risk by creating one shared snapshot contract instead of inventing a second one.

The generated outputs already use the three OpenAI source folders the user described, but the current customization strategy is a wrapper plus `## Base Template`, not a true in-place customized copy of those files. That is acceptable for this initiative if the outputs become truthful, stable, and customer-safe, but the plan must acknowledge that it is migrating location and delivery semantics first, not redesigning every generated document’s writing model. The same logic now applies to the non-product helper surfaces: generalized `qa/`, generalized `.agents`, generalized root AI instruction files, and inert workflow examples should be explicit starter artifacts, not ad hoc copies of the internal repo.

There is also contract drift in the entrypoint docs. The planning contract says repo-root `README.md` should explain what is included and what to do first, but the current override in `render-template-overrides.ts` only writes product name and summary, while the actual codebase overview lives in the generated `codebase/README.md`. Once the generated tree moves to `docs/`, the implementation should make repo-root `README.md` and `docs/README.md` work together intentionally instead of leaving that split accidental.

The tracked repo is small enough to make “more like my repo” feasible, but it is not automatically safe to ship wholesale. A tracked-file audit showed about `23.6 MB` total, with obvious internal-only material under `.agents/skills`, `docs/codex`, and `qa/`. That means the final snapshot contract needs an explicit classification pass for tracked files: ship unchanged, ship only after generalization or sanitization, or exclude entirely.

The tracked production env file is actively unsafe. `apps/web/.env.production` currently contains live publishable keys, secret keys, webhook secrets, bot tokens, and chat IDs. That confirms the plan must not merely “exclude env files in general”. It must replace the excluded production env file with a safe production template and update any docs or starter workflows that currently assume the real file exists.

The separate-pack model is wired more deeply than one route. `/review` has a supporting artifact grid, completed stage sidebars expose per-stage pack download buttons, `Execute / Ship` references and links directly to Design and Marketing pack downloads, the homepage still sells multiple visible pack artifacts, and the tests assert those affordances. That means removing `/api/download/codebase/[stage]` is not a one-file deletion. The plan has to update product copy and tests together so the single-download contract stays truthful.

The tracked repo-root classification needed one more pass after the larger folder decisions. `bunfig.toml` is operational and must ship because the repo uses it to force Bun’s hoisted linker behavior. By contrast, `.impeccable.md`, `skills-lock.json`, `todo.md`, `CHANGELOG.md`, and the tracked `tmp-blog-article*.png` files are internal design, planning, or temporary operator artifacts and should not ride along merely because they are versioned.

The codebase-compiler path migration was less coupled to the web app than it first looked. `renderFullCodebaseTree()` and the three stage archive builders were the only code paths that cared about the generated internal zip paths, while `apps/web/tests/integration/codebase-download-routes.test.ts` mocks the compiler server and only asserts outward filenames. That made it safe to land the `docs/...` tree migration and shipped ExecPlan prompt asset swap before the route deletion slice.

The focused codebase-compiler validation command has to run from `packages/codebase-compiler`, not from the repository root. The local Vitest config only includes `tests/**/*.test.ts` relative to that codebase directory, so invoking it from the root reports “No test files found” even when the target test file list is correct.

The first customer-safe snapshot pass still leaked one tracked media file: `apps/web/public/blog/editorial-loop.mp4`. That file only appeared after the manifest switched from the tiny allowlist to a more repo-shaped `apps/web/public` directory include. Adding a shared `isExcludedSnapshotPath()` filter to the source contract closed that gap and made the zip inspection and the codebase-compiler safety tests prove the same rule.

`bun run build` now completes cleanly, but Turbopack emits one NFT warning for `/api/download/repo` because `materialize-repo-snapshot.ts` still reads filesystem paths dynamically. The warning did not block the build or route generation, but it is worth keeping in mind if Next tightens that tracing check in a future release.

The repo-wide `bun run format:check` failure is unrelated to this slice. The current failing files are `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`, `apps/web/app/(workspace)/mission/page.tsx`, `apps/web/components.json`, `apps/web/components/ui/icon-cloud.tsx`, several `apps/web/convex/course/*` and `apps/web/features/execute-ship/*` files, and multiple `apps/web/tests/unit/*` and `apps/web/tests/integration-ui/execute-ship-page.test.tsx` files that were already outside the review-download change set. The targeted format checks for the touched codebase-compiler and review-download files are green.

Evidence from repo inspection:

    Current manifest-aware payload summary
    - totalBytes: 2,117,988,385
    - apps/web/output: 1,513,065,985
    - apps/web/.venv-video: 584,144,654
    - apps/web/public: 12,619,369

    Largest included files today
    - apps/web/.venv-video/lib/python3.11/site-packages/torch/lib/libtorch_cpu.dylib: 216,509,200
    - apps/web/output/video-pipeline/tmp/2026-03-26T16-55-35-300Z/L1--name-the-thing.cut.mp4: 205,476,597
    - apps/web/output/video-pipeline/tmp/2026-03-26T16-55-35-300Z/L6--gather-references.cut.mp4: 170,051,141

## Decision Log

- Decision: The final Review download contract for this initiative is a customer-safe starter repo bundle with generated materials under repo-root `docs/`, not repo-root `codebase/`.
  Rationale: The user explicitly approved the `docs/` contract in chat, and the current repo-root `codebase/` contract is what makes the downloaded repo feel unlike “their repo”.
  Date/Author: 2026-03-27 / Codex

- Decision: The generated docs tree will move to this concrete shape inside the downloaded repo:

      docs/
        README.md
        facts/
          project-definition.json
        design/
          AGENTS.md
          CHECKLIST.md
          PLANS.md
          documentation.md
        marketing/
          README.md
          AGENTS.md
          CHECKLIST.md
          PLANS.md
          documentation.md
        build/
          AGENTS.md
          CHECKLIST.md
          docs/
            prompt.md
            plans.md
            implement.md
            documentation.md
        prompts/
          execplan-grill.md
          execplan-writer.md
          execplan-execution-loop.md

  Rationale: The user wants three primary generated packs, with `docs/prompts/*` as shipped static prompt assets rather than a generated marketing/implementation/QA/deploy prompt family. This keeps the repo-root `docs/` contract truthful and aligned with the existing prompt assets the customer should receive.
  Date/Author: 2026-03-27 / Codex

- Decision: The final zip must unpack into a single top-level repo folder using the existing slugified `repoName`.
  Rationale: That turns the archive into a real “modified clone” instead of a flat file dump, and the code already computes `repoName` in `buildRepoGenerationManifest()` even though it is not used yet.
  Date/Author: 2026-03-27 / Codex

- Decision: The repo snapshot builder must move from recursive directory walking to a shared explicit allowlist plus forbidden-pattern contract.
  Rationale: A denylist-only directory walker is what caused the `2 GB` bug and the secret-leak risk. A shared contract aligned with `apps/web/config/vercel-output-tracing.ts` keeps local and deployed behavior in sync.
  Date/Author: 2026-03-27 / Codex

- Decision: Safe example env files may remain only if they are explicitly named in the allowlist, but real env files such as `.env.local` and `.env.production` must be excluded from both local snapshot assembly and deployed route tracing.
  Rationale: The user wants “my repo except my actual envs and stuff we do not want them to have”. `.env.local.example` can be a legitimate starter artifact, while `.env.production` and similar files are secret-bearing or deployment-specific and must not ship.
  Date/Author: 2026-03-27 / Codex

- Decision: Separate Design, Marketing, and Build archive downloads will stay available, but their internal zip paths must also move to the `docs/` tree.
  Rationale: Keeping those routes while changing only the final snapshot would create two parallel output contracts, which would be harder to reason about and easier to break.
  Date/Author: 2026-03-27 / Codex

- Decision: Supersede the earlier route-compatibility assumption and remove separate Design, Marketing, and Build archive downloads entirely. The only customer download artifact is the `Codebase`.
  Rationale: The user explicitly chose one download artifact because it is simpler and clearer. Keeping `/api/download/codebase/[stage]` would preserve dead product surface area, stale docs, extra tracing, and misleading UI affordances.
  Date/Author: 2026-03-27 / Codex

- Decision: The workspace root `docs/` source directory from this repository will not be blindly copied into the customer snapshot.
  Rationale: The customer-safe repo should contain generated customer docs under repo-root `docs/`, the shipped static `docs/prompts/*` assets, and only `docs/codex/PLANS.md` from the internal planning contract. Internal source-template and product-contract docs such as `docs/openai/*` and `docs/ship-by-sunday/*` should not ship.
  Date/Author: 2026-03-27 / Codex

- Decision: This slice should include low-risk performance work by memoizing static template reads and by using deterministic file enumeration instead of repeated broad directory walks, but it should not add a database cache, background artifact persistence, or a new storage service.
  Rationale: The biggest performance win comes from not scanning and reading giant irrelevant trees. Memoizing static OpenAI template loads is a safe second win. Anything heavier would widen scope beyond the approved delivery-contract fix.
  Date/Author: 2026-03-27 / Codex

- Decision: The final snapshot contract must include an explicit tracked-file review that classifies repo content into three buckets: ship unchanged, ship as a generalized or sanitized derivative, or exclude.
  Rationale: The user wants the download to feel like “my repo” while still avoiding security implications. That cannot be achieved with a blind tracked-file copy or with the current tiny starter subset. The plan must make the inventory review a first-class implementation step.
  Date/Author: 2026-03-27 / Codex

- Decision: The final snapshot base is the full tracked repo, not the current `apps/web` plus `packages/codebase-compiler` subset.
  Rationale: The user explicitly chose “full tracked repo as the base, then classification” because they want the result to feel like their repo rather than a narrow export bundle.
  Date/Author: 2026-03-27 / Codex

- Decision: `.agents` ships as a generalized subset, root `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` ship as generalized starter guidance, and `.codex` is excluded entirely.
  Rationale: The customer repo should preserve reusable AI operator guidance, but `.codex` is repo-local orchestration config and should not ship. `.agents` must be filtered because some references and plans are internal-only.
  Date/Author: 2026-03-27 / Codex

- Decision: `qa/` ships as a generalized starter QA kit with project-shaped starter CSVs, not as a raw copy of the internal QA control plane.
  Rationale: The user wants generalized QA in the starter. The raw `qa/` tree is too repo-specific, but a lighter starter kit with generalized prose, templates, example personas, and project-shaped starter CSVs fits the product goal.
  Date/Author: 2026-03-27 / Codex

- Decision: GitHub workflows ship only as inert generalized examples, not as active live automation.
  Rationale: The tracked workflows are tied to this repo’s branch model, deploy targets, and secret names. Example workflows preserve the starter experience without accidentally running half-configured automation in a customer fork.
  Date/Author: 2026-03-27 / Codex

- Decision: The starter must ship both `apps/web/.env.local.example` and a new safe `apps/web/.env.production.example`, while excluding the real tracked `apps/web/.env.production`.
  Rationale: The user explicitly wants env templates. The current production env file contains live secrets, so the starter needs a safe production-template replacement rather than silence.
  Date/Author: 2026-03-27 / Codex

- Decision: Generalized starter surfaces outside the generated `docs/` tree stay static and customer-safe rather than personalized with buyer facts.
  Rationale: The generated docs tree and the starter overrides already carry the buyer-specific customization. Keeping generalized `.agents`, root AI guidance files, QA starter material, and inert workflow examples static avoids a second personalization system and sharply reduces leak risk.
  Date/Author: 2026-03-27 / Codex

- Decision: Stage pages and stage sidebars should lose all pack-download affordance and language once separate pack routes are removed.
  Rationale: The user explicitly chose to remove the affordance rather than replace it with “included in snapshot” messaging. That keeps intermediate stages focused on answering questions and moving forward, while `/review` remains the single download moment.
  Date/Author: 2026-03-27 / Codex

- Decision: `/review` should replace the current supporting artifact grid with a non-clickable “What’s inside the Codebase” preview.
  Rationale: The user wants one download artifact, but still wants the pack mechanism to remain legible. A static contents preview keeps the single-download story clear without hiding what the snapshot contains.
  Date/Author: 2026-03-27 / Codex

- Decision: The final root-file classification keeps only runtime/setup roots plus generalized top-level docs: `.gitignore`, `.oxfmtrc.json`, `.oxlintrc.json`, `bun.lock`, `bunfig.toml`, `package.json`, and generalized `README.md`, `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`.
  Rationale: That preserves the files a customer needs to run or understand the starter while excluding internal planning history, design notes, lock metadata for local agent tooling, and tracked temporary images.
  Date/Author: 2026-03-27 / Codex

- Decision: Centralize the generated-doc tree in `packages/codebase-compiler/src/generated-docs/generated-doc-paths.ts` and make both the full rendered tree and the stage archive filters consume that module.
  Rationale: The main early migration risk was path drift between renderers, archives, tests, and docs. One helper module turns the approved `docs/...` tree into an importable source of truth.
  Date/Author: 2026-03-27 / Codex

- Decision: Replace the generated marketing/implementation/qa/deploy prompt pack with the shipped ExecPlan prompt assets from `docs/prompts/*`.
  Rationale: The grill froze `docs/prompts/*` as unchanged starter assets. Loading those files directly keeps the compiler aligned with the approved snapshot contract and removes a prompt-family generator that no longer belongs in the delivered repo.
  Date/Author: 2026-03-27 / Codex

- Decision: Define the concrete tracked-file include set and the deployed route trace includes from the shared module `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`.
  Rationale: The high-level classification contract explains what should ship, but the runtime snapshot builder and Next tracing rules need one concrete shared list of repo-shaped source roots. Putting those lists and helper builders in one codebase-compiler module keeps local and deployed behavior aligned.
  Date/Author: 2026-03-27 / Codex

- Decision: Generate the generalized root AI guidance, `.agents` subset, `qa/` starter kit, inert workflow examples, and `apps/web/.env.production.example` inside `packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts`.
  Rationale: These starter surfaces must be deterministic, customer-safe, and independent from the raw tracked repo files they replace. Rendering them in code keeps the snapshot contract explicit and testable.
  Date/Author: 2026-03-27 / Codex

## Outcomes & Retrospective

The work is complete. `/review` now downloads a single `Codebase` zip that unpacks into a named repo folder, carries the generated Design, Marketing, Build, facts, and prompt materials under repo-root `docs/`, includes the generalized AI and QA starter surfaces that the grill approved, and excludes the unsafe or internal-only files that used to ride along through broad directory walking.

The implementation also removed the separate pack-download route and its archive builders, so the product now tells one consistent story: Design, Marketing, Build, and Prompt packs are mechanisms inside the `Codebase`, not separate artifacts the buyer has to collect. The remaining caveats are operational rather than functional: there is still one Turbopack NFT warning for the repo-download route because the snapshot builder reads the filesystem dynamically, and the repo-wide `bun run format:check` still fails on unrelated pre-existing `apps/web` files outside this slice. No authenticated manual `/review` browser run was attempted because this turn did not rely on a live entitled-user harness.

## Context and Orientation

The download flow starts in `apps/web/features/codebase-flow/server/downloads.ts`. That server-only helper reads the authenticated user’s product access and canonical project definition from Convex, validates the facts with `canonicalProjectFactsSchema`, and returns the `canonicalProjectDefinition` plus `workspaceState`. The only remaining download route is now `apps/web/app/api/download/repo/route.ts`, which builds the final `Codebase`.

The generated file tree lives in `packages/codebase-compiler`. `packages/codebase-compiler/src/server/template-loader.ts` loads the base OpenAI docs from `docs/openai/design-checklist`, `docs/openai/openai-marketing-kit`, and `docs/openai/codex_long_horizon_templates`, and also loads the shipped ExecPlan prompt assets from `docs/prompts/*`. `packages/codebase-compiler/src/generated-docs/generated-doc-paths.ts` is the shared path contract for the generated Design, Marketing, Build, facts, and prompt files. `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` is the concrete source-of-truth for the repo-shaped include roots, the deployed trace includes, and the forbidden snapshot path filter. `packages/codebase-compiler/src/server/rendered-codebase-tree.ts` combines the template inputs with current project facts and emits repo-root `docs/...` paths. `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts` combines the tracked repo-shaped source files, the generalized starter overrides, and the generated docs into one review snapshot payload, and `packages/codebase-compiler/src/bundle/build-review-download-zip.ts` writes that payload into a zip under the slugified repo root folder.

The current contract is split across implementation, tests, and docs. `packages/codebase-compiler/AGENTS.md` and `docs/ship-by-sunday/codebase-contract-and-question-map-2026-03-23.md` now describe the repo-root `docs/...` tree. `packages/codebase-compiler/tests/codebase-renderers.test.ts`, `repo-generation.test.ts`, and `review-download-zip.test.ts` assert the generated tree, the customer-safe snapshot contents, and the repo-root zip prefix. `apps/web/tests/integration/codebase-download-routes.test.ts` now covers only the repo route, and the Review plus stage-page integration-ui tests assert the single-download product story. `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts` is also part of that contract because it now makes repo-root `README.md` and generated `docs/README.md` work together intentionally.

The product-level pack language still exists, but it now points at the single download artifact instead of extra routes. `apps/web/features/codebase-flow/components/codebase-stage-sidebar.tsx` no longer shows any stage-local download button, `apps/web/features/codebase-flow/components/review/codebase-review-artifact-grid.tsx` is now a non-clickable contents preview for the snapshot, and `apps/web/features/execute-ship/lib/execute-ship-tracks.ts` points people back to Review or the stage pages instead of to deleted pack URLs.

The deployed route now shares its file-tracing inputs with the codebase-compiler source contract. `apps/web/config/vercel-output-tracing.ts` uses the helper builders from `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`, and `apps/web/next.config.ts` applies that traced include set only to `/api/download/repo`. That shared contract now omits the raw tracked `apps/web/.env.production` file while still tracing the safe source inputs the compiler reads from disk.

The repository contains tracked material that should not be assumed customer-safe just because it is versioned. `git ls-files` shows internal skill definitions under `.agents/skills`, long-horizon planning files under `docs/codex`, QA operating files under `qa/`, and a few tracked artifact-like image outputs at repo root. The implementation must therefore define a deliberate classification policy for tracked content rather than switching from “tiny allowlist” to “all tracked files” in one jump.

The current generated tree and the target generated tree are different in two important ways. Today the compiler produces this shape:

    codebase/
      README.md
      facts/project-definition.json
      design/*
      marketing/*
      build/docs/*
      prompts/*

This initiative changes the delivered repo contract to:

    <repoName>/
      README.md
      AGENTS.md
      CLAUDE.md
      GEMINI.md
      .github/workflows/examples/*
      .agents/*
      apps/web/...
      packages/codebase-compiler/...
      qa/*
      docs/
        README.md
        codex/
          PLANS.md
        facts/project-definition.json
        design/*
        marketing/*
        build/docs/*
        prompts/*

In this plan, “customer-safe repo snapshot” means a zip whose file list begins from the tracked repo, then applies a classification pass: some tracked files ship unchanged, some tracked files are replaced by generalized templates or transformed copies, and some tracked files are excluded. In this plan, “generated docs tree” means the customized Design, Marketing, and Build files produced from the user’s saved codebase answers and placed under repo-root `docs/` in the downloaded repo. `docs/prompts/*` are shipped static prompt assets, not generated product-specific prompts.

## Plan of Work

Start by freezing the new output contract in one place before changing behavior. Introduce centralized path helpers for the generated docs tree inside `packages/codebase-compiler`, update the active compiler contract docs to describe `docs/...` instead of `codebase/...`, and update the tests that currently hardcode the old tree. In the same slice, make the repo-root `README.md` contract explicit: the root README should be the human entrypoint for the downloaded repo, while `docs/README.md` should be the generated pack overview. This first slice should also create the tracked-file classification checklist for the final snapshot: each meaningful repo area should be marked as ship unchanged, ship only after generalization or sanitization, or exclude. That checklist must explicitly cover `.agents`, `.codex`, `qa/`, `docs/prompts`, `docs/codex`, `docs/openai`, `docs/ship-by-sunday`, `.github/workflows`, root AI instruction files, root runtime/setup files, root operator-history files, tracked temporary image artifacts, and env-template files.

Once the tree contract is frozen, migrate the actual renderers. Update `renderCodebaseReadme()`, `renderDesignCodebase()`, `renderMarketingCodebase()`, `renderBuildCodebase()`, and `rendered-codebase-tree.ts` so they all emit `docs/...` paths. Retire the old generated prompt-pack shape from `renderPromptPack()` and replace it with the shipped static `docs/prompts/*` contract. Delete the separate pack-archive builders and the `/api/download/codebase/[stage]` route instead of teaching them the new tree. Keep the generated content itself stable unless a file path change requires small wording updates such as `Included Files` lines in the generated README.

After the generated tree is consistent, refactor the repo snapshot builder so it no longer recursively walks `apps/web` and `packages/codebase-compiler` with a tiny exclude list. Create one explicit snapshot contract module that starts from the tracked repo classification rather than from broad directory recursion. That contract must distinguish ship-unchanged files, generalized replacements, and excluded files, including an explicit distinction between safe example env files and real env files. Files that need generalization or sanitization should not be rewritten ad hoc from live tracked content if that can be avoided. Prefer checked-in customer-safe template or transformer inputs under the codebase-compiler codebase so tracing remains predictable. Then either import that contract into `apps/web/config/vercel-output-tracing.ts` or add a parity test that proves the two contracts stay aligned. In the same milestone, prefix the final zip entries with `repoName` so the archive unpacks into a named repo folder, and memoize static OpenAI template loads so the route stops rereading the same template files on every request.

With the archive shape fixed, update the Review surface to tell the truth about what the customer receives. Keep the public mechanism language around Design, Marketing, Build, and Prompt packs, but make it clear that they arrive only inside the `Codebase`. Replace the current supporting artifact grid with a non-clickable “What’s inside the Codebase” preview. Remove stage-level pack-download affordances and pack-download wording from completed stages. Update `Execute / Ship` so it no longer links to deleted pack routes and instead refers back to the snapshot or the relevant stage pages when guidance needs a next step. Update any tests and helper copy that still imply multiple downloadable artifacts.

Finish by running the focused compiler and web tests, then inspect the built zip contents directly. The acceptance bar is not just passing tests. It is a zip that a human can open and understand immediately: one repo folder, one safe codebase, generated docs in `docs/`, and no workstation junk.

## Milestones

### Milestone 1 — Freeze the `docs/` output contract and path helpers

At the end of this milestone, the implementation will have one centralized generated-docs path contract, the active compiler docs will describe the new tree, and the plan for repo-snapshot scope will be explicit. The touched files are `packages/codebase-compiler/AGENTS.md`, `docs/ship-by-sunday/codebase-contract-and-question-map-2026-03-23.md`, `packages/codebase-compiler/src/public-artifact-contract.ts` if new helper exports belong there, one new path helper module under `packages/codebase-compiler/src/`, and `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts` if the root README and generated docs README responsibilities are clarified there. This milestone must also add a tracked-file classification note or fixture that records which repo areas ship unchanged, which require generalized or sanitized output, and which are excluded. That classification must encode the grill decisions: full tracked repo base, generalized `.agents`, generalized root `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`, generalized `qa/`, inert workflow examples, `docs/prompts/*` kept, `docs/codex/PLANS.md` kept, `.codex` excluded, `docs/openai` excluded, `docs/ship-by-sunday` excluded, `CHANGELOG.md` / `docs/release-workflow.md` / `.impeccable.md` / `skills-lock.json` / `todo.md` / tracked temp PNGs excluded, and a new `apps/web/.env.production.example` required. The goal is not visible behavior yet. The goal is to make it impossible for a newcomer to wonder whether the correct target is `codebase/` or `docs/`, whether the repo root README or generated docs README is the real entrypoint, whether the product still supports multiple downloadable artifacts, or which repo areas are allowed into the final snapshot.

Run the codebase compiler test suite after this milestone once the helper module and the first test updates land. Success looks like a clear test failure surface for any remaining `codebase/...` path assumptions and updated docs that state the new tree unambiguously.

### Milestone 2 — Move all generated outputs into `docs/` and delete the separate pack route

At the end of this milestone, the renderers under `packages/codebase-compiler/src/codebases/` and the full tree assembler in `rendered-codebase-tree.ts` will all emit `docs/...` paths. The generated README will now live at `docs/README.md`. Facts will live at `docs/facts/project-definition.json`. The shipped prompt assets will live at `docs/prompts/*.md`, but those files will come from the approved static prompt subtree rather than the current generated prompt-pack renderer. The old per-stage archive builders under `packages/codebase-compiler/src/codebase-archives/` and the route `apps/web/app/api/download/codebase/[stage]/route.ts` should be removed instead of migrated.

Run the codebase compiler tests after this milestone. Success looks like `codebase-renderers.test.ts` and `repo-generation.test.ts` asserting `docs/...` paths with no remaining `codebase/...` expectations, and no remaining production imports that depend on the deleted stage-archive builders.

### Milestone 3 — Make the final snapshot customer-safe, small, and clone-like

At the end of this milestone, `materializeRepoSnapshot()` will enumerate files from a strict customer-safe contract instead of recursively walking whole directories, `buildReviewDownloadZip()` will prefix entries with `repoName` so the zip unpacks into a single repo folder, and the compiler will stop rereading static template files on every request. The touched files are `packages/codebase-compiler/src/repo-generation/build-repo-generation-manifest.ts`, `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`, `packages/codebase-compiler/src/bundle/build-review-download-zip.ts`, `packages/codebase-compiler/src/server/template-loader.ts`, and a new shared snapshot-contract module. This milestone must also add the generalized replacements required by the classification pass: generalized `.agents` content, generalized root `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`, generalized `qa/`, inert workflow examples, and `apps/web/.env.production.example`. `apps/web/config/vercel-output-tracing.ts` and `apps/web/next.config.ts` are part of this milestone if the shared contract is imported directly there.

Run the codebase compiler tests plus a new focused snapshot safety test after this milestone. Success looks like a zip whose entries begin with `<repoName>/`, contain `docs/...`, and contain no `.env`, `.venv`, `output/`, `.mp4`, `*.tsbuildinfo`, `coverage`, `test-results`, or `codebase/` entries.

### Milestone 4 — Align Review, stage sidebars, Execute / Ship, and tests with the single-download contract

At the end of this milestone, the Review page and related copy will explain that the `Codebase` is a repo bundle with generated docs under `docs/`, and it will preview what is inside without offering secondary download actions. The touched files are `apps/web/features/codebase-flow/components/codebase-review-page.tsx`, `apps/web/features/codebase-flow/components/review/codebase-review-checkpoint-card.tsx`, `apps/web/features/codebase-flow/components/review/codebase-review-artifact-grid.tsx` or its replacement, `apps/web/features/codebase-flow/components/codebase-stage-page.tsx`, `apps/web/features/codebase-flow/components/codebase-stage-sidebar.tsx`, `apps/web/features/execute-ship/lib/execute-ship-tracks.ts`, and the relevant tests under `apps/web/tests/`. The outcome is one download moment at review, no per-stage pack-download buttons, and no dead links to removed routes.

Run the repo-route integration test, the Review integration-ui test, and the stage-page integration-ui lane after this milestone. Success looks like the UI still teaching the Design / Marketing / Build / Prompt mechanism, but no longer offering separate artifact downloads or implying that the customer must collect multiple zip files.

### Milestone 5 — Validate the end-to-end zip shape and update final outcomes

At the end of this milestone, the implementation work will be validated from compiler tests through route tests to a direct zip-entry inspection. The final step is to update this ExecPlan’s `Progress`, `Surprises & Discoveries`, and `Outcomes & Retrospective` sections with what actually happened. Success looks like a clean, inspectable archive and a finished plan that another engineer could audit without rereading chat history.

## Concrete Steps

Start from the repository root and re-read the current contract-bearing files before editing anything:

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' packages/codebase-compiler/AGENTS.md
    sed -n '1,140p' docs/ship-by-sunday/codebase-contract-and-question-map-2026-03-23.md
    sed -n '1,220p' packages/codebase-compiler/src/server/rendered-codebase-tree.ts
    sed -n '1,220p' packages/codebase-compiler/src/codebases/render-codebase-readme.ts
    sed -n '1,220p' packages/codebase-compiler/src/codebases/render-prompt-pack.ts
    sed -n '1,260p' packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts
    sed -n '1,220p' apps/web/config/vercel-output-tracing.ts
    sed -n '1,220p' apps/web/app/api/download/repo/route.ts
    sed -n '1,220p' apps/web/app/api/download/codebase/[stage]/route.ts
    sed -n '1,220p' apps/web/features/codebase-flow/components/codebase-stage-sidebar.tsx
    sed -n '1,220p' apps/web/features/execute-ship/lib/execute-ship-tracks.ts

Expected observation: the docs and tests still point at repo-root `codebase/`, while the runtime snapshot builder still walks broad directories instead of a tight customer-safe contract.

When implementing Milestone 1, create or update the generated path helper module first, then replace ad hoc string literals in the renderers with helper-backed paths. Update the active compiler docs and tests in the same slice so the repo never has two “official” output trees at once.

In the same early slice, inventory the tracked repo areas that are candidates for the final snapshot. Record at least these buckets somewhere durable in the implementation branch or this plan as they are resolved: `apps/web`, `packages/codebase-compiler`, `docs/prompts`, `.agents`, `docs/codex`, `qa`, root image artifacts, and other tracked repo-root files. For each bucket, decide whether it ships unchanged, ships only after generalization or sanitization, or is excluded.
 
The classification pass must explicitly record these answers:

    - base snapshot starts from the full tracked repo
    - `docs/prompts/*` ships unchanged
    - `docs/codex/PLANS.md` ships unchanged
    - `docs/codex/*` otherwise excluded
    - `docs/openai/*` excluded
    - `docs/ship-by-sunday/*` excluded
    - `.agents` ships as a generalized subset
    - root `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` ship as generalized starter guidance
    - `.codex` excluded
    - `qa/` ships as a generalized starter QA kit with project-shaped starter CSVs
    - `.github/workflows` ship only as inert generalized examples
    - `CHANGELOG.md` and `docs/release-workflow.md` excluded
    - `.impeccable.md`, `skills-lock.json`, `todo.md`, `tmp-blog-article.png`, and `tmp-blog-article-mobile.png` excluded
    - `apps/web/.env.local.example` ships
    - `apps/web/.env.production` excluded and replaced by `apps/web/.env.production.example`

After the rendered-tree migration, run the focused codebase compiler tests from the codebase-compiler codebase directory:

    cd /Users/parkerrex/Projects/ship-by-sunday/packages/codebase-compiler
    bunx vitest --config vitest.config.ts run \
      tests/customer-safe-snapshot-contract.test.ts \
      tests/codebase-renderers.test.ts \
      tests/repo-generation.test.ts

Expected observation: the codebase compiler tests pass and assert `docs/...` entries instead of `codebase/...`.

When implementing Milestone 3, add a focused safety test that exercises the snapshot enumerator against a temporary directory or another pure file-list helper. That test must prove the forbidden patterns are excluded even if they live under an otherwise included root. If importing the shared snapshot contract into `apps/web/config/vercel-output-tracing.ts` proves awkward, keep a second local contract only temporarily and add a parity test so the drift is explicit.

After Milestone 3, run the codebase compiler tests again plus any new safety tests. Then inspect the zip contents directly with a one-off Bun command:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun -e '
      import JSZip from "jszip";
      import { createCompleteProjectDefinition } from "./packages/codebase-compiler/src/index.ts";
      import { buildReviewDownloadZip } from "./packages/codebase-compiler/src/server.ts";
      const buffer = await buildReviewDownloadZip(createCompleteProjectDefinition());
      const zip = await JSZip.loadAsync(buffer);
      const entries = Object.keys(zip.files).sort();
      console.log(entries.slice(0, 60).join("\n"));
      const forbidden = entries.filter((entry) =>
        /(^|\/)\.env\.local$|(^|\/)\.env\.production$|(^|\/)\.venv|(^|\/)output\/|\.mp4$|\.tsbuildinfo$|(^|\/)coverage\/|(^|\/)test-results\/|(^|\/)codebase\/|(^|\/)\.codex\/|(^|\/)docs\/openai\/|(^|\/)docs\/ship-by-sunday\/|(^|\/)docs\/codex\/(?!PLANS\.md$)|(^|\/)CHANGELOG\.md$|(^|\/)docs\/release-workflow\.md$|(^|\/)\.impeccable\.md$|(^|\/)skills-lock\.json$|(^|\/)todo\.md$|(^|\/)tmp-blog-article(?:-mobile)?\.png$/.test(entry),
      );
      console.error("forbidden entries:", forbidden);
    '

Expected observation: entries start with a slugified repo root such as `ship-by-sunday-os/`, generated files appear under `ship-by-sunday-os/docs/...`, and `forbidden entries: []` is printed. If `.env.local.example` remains part of the contract, it should appear only because it is explicitly allowlisted and not because a broad directory walk picked it up.

When implementing Milestone 4, update the Review surface, stage sidebars, Execute / Ship references, and route-level tests together. Re-run the focused web tests from `apps/web`:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project integration tests/integration/codebase-download-routes.test.ts
    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/codebase-review-page.test.tsx tests/integration-ui/codebase-stage-page.test.tsx

Expected observation: the route test still passes `starter-snapshot.zip` and no longer covers the removed stage-pack endpoint, the Review UI test now describes generated docs under `docs/` and a “What’s inside” preview instead of secondary download buttons, and the stage-page test still passes after the sidebar download affordance is removed.

Once the focused lanes pass, run the broader repository checks:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run lint
    bun run format:check
    bun run build

Expected observation: lint and build pass without new snapshot-contract regressions. If `format:check` fails, record the exact unrelated files before deciding whether the failure belongs to this slice.

If there is an available entitled local user or reusable auth harness for `/review`, perform one manual end-to-end verification after the code lands. Download the real archive from `/review`, unzip it into a temporary directory, and confirm the visible tree matches the contract in this plan. If an authenticated browser path is not available, record that limitation in `Surprises & Discoveries` and keep the direct zip inspection evidence.

## Validation and Acceptance

The work is accepted only when the final `Codebase` behaves like a real starter repo and not like a workstation scrape. That means all of the following must be true at the same time:

The zip unpacks into one top-level repo folder whose name comes from the product slug.

The generated docs are present under repo-root `docs/` with this minimum visible structure: `docs/README.md`, `docs/facts/project-definition.json`, `docs/design/*`, `docs/marketing/*`, `docs/build/docs/*`, `docs/prompts/execplan-grill.md`, `docs/prompts/execplan-writer.md`, `docs/prompts/execplan-execution-loop.md`, and `docs/codex/PLANS.md`.

No archive entry contains repo-root `codebase/`, real env files such as `.env.local` or `.env.production`, local virtualenvs, `output/`, `.mp4`, `*.tsbuildinfo`, `coverage/`, `test-results/`, `node_modules/`, unresolved symlink targets, `.codex/`, `docs/openai/`, `docs/ship-by-sunday/`, `docs/codex/` files other than `PLANS.md`, `CHANGELOG.md`, `docs/release-workflow.md`, `.impeccable.md`, `skills-lock.json`, `todo.md`, or the tracked `tmp-blog-article*.png` files. Safe example env files may exist only if they are explicitly allowed by the snapshot contract.

If tracked internal assets such as `.agents` content are included, they must either be demonstrably safe to ship unchanged or replaced with generalized variants created by the implementation. The final archive must not contain raw internal-only instructions, private references, or tracked operational material that the classification step marked as sanitize-or-exclude.

The final archive must include the generalized AI and QA starter surfaces chosen during the grill:

- generalized root `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`
- generalized `.agents` subset
- generalized `qa/README.md`, `qa/AGENTS.md`, `qa/glossary.md`, `qa/personas.example.json`, `qa/personas.json`, `qa/templates/run-report.md`, and project-shaped starter versions of `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv`
- generalized inert workflow examples instead of live repo-specific workflows
- `apps/web/.env.production.example`

The only remaining download route is `/api/download/repo`. `/api/download/codebase/[stage]` and all related builder exports, UI links, and tests are removed rather than preserved as compatibility surface.

The Review UI still treats `Codebase` as the primary outcome, clearly explains that the final snapshot is a repo bundle with generated docs under `docs/`, and includes a non-clickable “What’s inside the Codebase” preview rather than separate artifact download buttons.

Completed stage pages no longer show any pack-download button or “download pack” language, and `Execute / Ship` no longer links to deleted pack routes.

The focused compiler tests, route tests, Review UI tests, and broader `lint`, `format:check`, and `build` commands all pass, or any blocked lane is explicitly documented with exact reasons.

The canonical contract docs that govern this area no longer describe repo-root `codebase/` as the intended final download tree.

## Idempotence and Recovery

Do not mix the old and new tree shapes in the same commit. The safe sequence is to centralize path helpers first, then migrate renderers and tests, then switch the snapshot builder and Review copy. That keeps any temporary failures localized to one contract rather than creating a half-`codebase`, half-`docs` repo.

Keep the snapshot safety logic pure and testable. If the first attempt to share the allowlist with `apps/web/config/vercel-output-tracing.ts` creates an import-cycle or Next-config loading problem, fall back to a duplicated local contract only long enough to finish the migration, and add a parity test immediately so the duplication does not become silent drift.

If a milestone fails halfway, recover by returning the tree contract to one consistent state before moving on. For example, if renderer paths have moved to `docs/` but route or UI tests still expect `codebase/`, finish the test migration before changing snapshot logic. If the removed stage-pack route turns out to have unexpected callers, repair the callers in the same slice rather than restoring the route as a silent compatibility alias.

If the new snapshot contract accidentally excludes a required starter file, add it to the explicit allowlist and cover it with a test. Do not widen the contract by reintroducing directory-recursive walking.

If the final zip inspection shows forbidden files, stop immediately, add or tighten the forbidden-pattern rule, rerun the focused snapshot tests, and regenerate the zip before continuing to broader validation.

## Artifacts and Notes

Current investigation evidence that this plan is addressing the right problem:

    Current local snapshot sources
    - packages/codebase-compiler/src/repo-generation/build-repo-generation-manifest.ts includes whole directories:
      apps/web
      packages/codebase-compiler
    - packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts recursively reads files and only excludes a short path-segment list

    Current deployed allowlist that should become the shared source of truth
    - apps/web/config/vercel-output-tracing.ts defines repoDownloadTraceIncludes
    - apps/web/next.config.ts applies repoDownloadTraceIncludes to /api/download/repo

    Current generated output contract that must be retired
    - packages/codebase-compiler/AGENTS.md still requires codebase/README.md and codebase/design/** etc.
    - docs/ship-by-sunday/codebase-contract-and-question-map-2026-03-23.md still defines the final tree as codebase/...

    Full tracked repo size check
    - git ls-files reports about 1,187 tracked files and about 23.6 MB total
    - this makes “more like my repo” feasible in size terms
    - it also reveals tracked internal material under `.agents/skills`, `docs/codex`, and `qa/` that must be classified before shipping

    Milestone 1 validation
    - `cd /Users/parkerrex/Projects/ship-by-sunday/packages/codebase-compiler`
    - `bunx vitest --config vitest.config.ts run tests/customer-safe-snapshot-contract.test.ts tests/codebase-renderers.test.ts tests/repo-generation.test.ts`
    - observed: `Test Files  4 passed (4)` and `Tests  7 passed (7)`
    - `cd /Users/parkerrex/Projects/ship-by-sunday`
    - `bunx oxlint packages/codebase-compiler/src packages/codebase-compiler/tests`
    - observed: `Found 0 warnings and 0 errors.`
    - `bunx oxfmt --check packages/codebase-compiler/src packages/codebase-compiler/tests`
    - observed: `All matched files use the correct format.`

    Milestone 3 and 4 validation
    - `cd /Users/parkerrex/Projects/ship-by-sunday/packages/codebase-compiler`
    - `bunx vitest --config vitest.config.ts run tests/customer-safe-snapshot-contract.test.ts tests/codebase-renderers.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts`
    - observed: `Test Files  4 passed (4)` and `Tests  7 passed (7)`
    - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web`
    - `bunx vitest --config vitest.config.ts run --project integration tests/integration/codebase-download-routes.test.ts`
    - observed: `Test Files  1 passed (1)` and `Tests  1 passed (1)`
    - `bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/codebase-review-page.test.tsx tests/integration-ui/codebase-stage-page.test.tsx`
    - observed: `Test Files  2 passed (2)` and `Tests  12 passed (12)`
    - `cd /Users/parkerrex/Projects/ship-by-sunday`
    - `bun run lint`
    - observed: `Found 0 warnings and 0 errors.`
    - `bun run build`
    - observed: build passed and the final route list still includes `/api/download/repo`
    - `bun run format:check`
    - observed: blocked by unrelated pre-existing formatting issues in other `apps/web` files outside this slice

    Direct zip inspection
    - `cd /Users/parkerrex/Projects/ship-by-sunday/packages/codebase-compiler`
    - `bun -e '...'`
    - observed first entries:
      `ship-by-sunday-os/`
      `ship-by-sunday-os/.agents/README.md`
      `ship-by-sunday-os/.github/workflows/examples/basic-ci.example.yml`
      `ship-by-sunday-os/AGENTS.md`
      `ship-by-sunday-os/apps/web/.env.production.example`
    - observed: `forbidden entries: []`

    Grill decisions now frozen
    - snapshot base is the full tracked repo plus classification
    - `docs/prompts/*` ships unchanged
    - `.agents` ships as a generalized subset
    - `qa/` ships as a generalized starter with project-shaped starter CSVs
    - `docs/codex/PLANS.md` ships, other `docs/codex/*` does not
    - `docs/openai/*` and `docs/ship-by-sunday/*` do not ship
    - workflows ship only as inert generalized examples
    - `apps/web/.env.production.example` must be created and shipped
    - generalized starter surfaces outside the generated docs tree stay static, not personalized
    - `/api/download/codebase/[stage]` is removed; the `Codebase` is the only download artifact
    - stage pages lose pack-download affordances entirely
    - `/review` replaces the supporting artifact grid with a non-clickable contents preview
    - root `.impeccable.md`, `skills-lock.json`, `todo.md`, `CHANGELOG.md`, and tracked temp PNGs do not ship

No live `/review` browser verification was attempted in this turn because there was no authenticated entitled-user harness in scope. The zip tests and the direct archive inspection above are the proof for the delivered snapshot shape.

## Interfaces and Dependencies

`apps/web/features/codebase-flow/server/downloads.ts` must continue to be the only server-side boundary that turns authenticated Convex state into a `canonicalProjectDefinition` plus `workspaceState` for the remaining download route. This plan does not change Convex schema or auth logic.

`apps/web/app/api/download/repo/route.ts` must continue to call one codebase-compiler entry point that returns the final snapshot zip. `apps/web/app/api/download/codebase/[stage]/route.ts` and the stage-specific archive builder exports are now removed. The outward snapshot filename from `packages/codebase-compiler/src/public-artifact-contract.ts` remains part of the contract unless the user explicitly changes it later.

`packages/codebase-compiler/src/server/template-loader.ts` remains the source of the base OpenAI templates. This initiative changes where customized outputs are written in the delivered repo, not where the base templates are stored in the authoring repo. The same module now also loads the shipped ExecPlan prompt assets from `docs/prompts/*`, so any later memoization work should cover both template families together.

`packages/codebase-compiler/src/codebases/render-codebase-readme.ts`, `render-design-codebase.ts`, `render-marketing-codebase.ts`, `render-build-codebase.ts`, and `packages/codebase-compiler/src/server/rendered-codebase-tree.ts` now converge on `packages/codebase-compiler/src/generated-docs/generated-doc-paths.ts`. `render-prompt-pack.ts` now ships the static prompt assets that the approved customer contract expects under `docs/prompts/*`.

`packages/codebase-compiler/src/repo-generation/build-repo-generation-manifest.ts`, `materialize-repo-snapshot.ts`, and `packages/codebase-compiler/src/bundle/build-review-download-zip.ts` are the core of the safety and performance fix. They are responsible for which repo files exist in the final download, whether the zip unpacks into a named repo folder, and whether machine-local junk can leak into customer artifacts. They should evolve away from broad directory-walk semantics toward the tracked-file classification contract now recorded in `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`.

`packages/codebase-compiler/src/repo-generation/render-template-overrides.ts` is part of the delivery contract because it controls repo-root `README.md`, `apps/web/config/product.ts`, and `apps/web/features/marketing/content/home.ts` overrides in the downloaded repo. This slice should make the root README and generated `docs/README.md` relationship explicit so the starter repo has one obvious human entrypoint.

`apps/web/config/vercel-output-tracing.ts` and `apps/web/next.config.ts` are part of the same interface because they define the deployed allowlist for `/api/download/repo`. They now share `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` with the local snapshot builder so local and deployed behavior stay aligned while excluding the unsafe raw `.env.production` file.

`packages/codebase-compiler/tests/codebase-renderers.test.ts`, `repo-generation.test.ts`, `review-download-zip.test.ts`, `apps/web/tests/integration/codebase-download-routes.test.ts`, `apps/web/tests/integration-ui/codebase-review-page.test.tsx`, and the stage-page integration-ui lane are the narrowest proof that the output tree, route behavior, and UI contract still work after the migration.

The generalized starter surfaces should not be built by hand in the route file. If generalized `.agents`, generalized `qa/`, generalized workflow examples, and generalized root instruction files are part of the approved snapshot, they need explicit static template or transformer modules inside the codebase-compiler codebase so the route can assemble them deterministically and tests can prove exactly what ships. The approved grill decision is that these starter surfaces stay static rather than personalized with buyer facts.
