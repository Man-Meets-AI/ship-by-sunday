# Cross-Repo Review

## App Runtime

`apps/web/next.config.ts` owns the current Nextra build hook. It must remain until docs and blog rendering no longer depend on Nextra.

`apps/web/mdx-components.tsx` is currently a Nextra wrapper bridge. It may be replaced or removed only after the chosen app-owned MDX path is in place.

`apps/web/app/docs/layout.tsx`, `apps/web/app/docs/[[...mdxPath]]/page.tsx`, `apps/web/app/docs/_lib/page-paths.ts`, docs components, and docs CSS are the primary docs runtime surfaces.

`apps/web/app/blog/_server/blog-posts.ts`, `apps/web/app/blog/_server/page-paths.ts`, `apps/web/app/blog/_lib/blog-toc.ts`, blog page metadata, blog structured data, and blog tests are the primary blog runtime surfaces.

`apps/web/app/_metadata/content-route-index.ts` and `apps/web/app/sitemap.ts` already provide a filesystem-based metadata index and should be kept aligned with the new content inventory.

## Content

`apps/web/content/docs/**/*.mdx` and `apps/web/content/blog/**/*.mdx` should keep their public route mapping. Content copy rewrites are out of scope.

`_meta.ts` files in docs and blog content are route/navigation inputs that should be modeled explicitly.

## Tests And Metadata

Existing focused tests include docs metadata, docs disabled state, public metadata routes, route metadata, blog metadata, blog structured data, blog formatters, and blog page paths. Child slices should update or add focused tests before relying on broad lint and typecheck.

## Compiler And Starter Assumptions

`packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` includes `apps/web/mdx-components.tsx` in customer-safe app paths. Starter rendering files also mention docs content layout and local Next docs paths. These are package-cleanup slice concerns after the final app-owned rendering shape is known.

Compiler schema and facts are out of scope for this Program unless a later approved plan explicitly expands the work.

## Release Workflow

The current release workflow uses short-lived feature branches into `main`, durable CI contexts, and production proof after merge. Because this Program touches public docs and blog surfaces, browser proof, sitemap proof, metadata tests, lint, typecheck, and package validation belong in the final hardening slice.

Billing-sensitive proof, Stripe, checkout, promo code, webhook, and environment behavior are out of scope.
