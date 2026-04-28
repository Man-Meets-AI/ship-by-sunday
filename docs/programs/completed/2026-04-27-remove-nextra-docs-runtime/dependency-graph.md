# Dependency Graph

## Ordered Graph

1. Research and packet creation has no implementation dependency. It reads instructions, app code, content corpus, Next.js docs, release workflow, compiler starter assumptions, and tests.
2. Content inventory and route model depends on research only. It must be additive and leave Nextra rendering active.
3. Docs rendering replacement depended on the content inventory and route model and is now complete. It replaced `nextra/pages`, `nextra/page-map`, and `nextra-theme-docs` across the docs runtime.
4. Blog rendering replacement depended on the content inventory and route model and is now complete. It replaced `nextra/pages` and the `nextra` heading type across the blog runtime.
5. Package, config, CSS, and starter cleanup depended on completed docs and blog rendering replacement and is now complete. It removed `nextra` and `nextra-theme-docs` after import scans confirmed only config/package/lockfile surfaces remained.
6. Release hardening depends on package and config cleanup and is now the only remaining active slice. It proves that the migrated public routes, metadata, sitemap, browser behavior, lockfile, lint, and typecheck all agree.

## Blockers By Slice

The docs rendering slice was unblocked by the inventory slice and is now complete.

The blog rendering slice was unblocked by the inventory slice and is now complete.

The package-removal slice was unblocked by completed docs and blog rendering slices and is now complete.

The release-hardening slice is blocked by package cleanup because browser proof before dependency removal would not prove the final runtime.

## Parallelism Guidance

Package cleanup and release hardening should stay sequential. Cleanup changes dependency state, and release proof must run against that final state.
