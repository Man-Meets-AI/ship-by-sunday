---
title: "Public Docs Surface Research"
summary: "Research pass mapping the current public docs MDX corpus, route runtime, blog boundary, setup-truth risk, and stale reference surfaces before removal."
docType: "research_pass"
status: "active"
read_when:
  - "Planning public docs removal."
  - "Checking what exists under apps/web public docs today."
  - "Separating blog MDX from docs MDX."
---

# Public Docs Surface Research

This research pass records repository facts gathered before implementation of public docs removal.

## Content Inventory

`apps/web/src/content/docs/` currently contains 34 public docs MDX pages plus `_meta.ts` files. The top-level docs include setup, deployment, provider configuration, troubleshooting, starter customization, agent guidance, and product-building material. Troubleshooting docs live under `apps/web/src/content/docs/troubleshooting/`.

`apps/web/src/content/blog/` contains two blog MDX posts plus `_meta.ts`. Blog is a separate content family and should stay.

## Route Runtime

The public docs route lives under `apps/web/src/app/(marketing)/docs/`. It has:

- `layout.tsx`
- `[[...mdxPath]]/page.tsx`
- route-local components under `_components/`
- metadata, page-path, and theme helpers under `_lib/`
- explicit dynamic MDX imports in `_server/docs-content.ts`
- route-local CSS under `_styles/docs-theme.css`

The docs route is already unpromoted, noindexed, and absent from the public sitemap, but it remains directly reachable.

## Shared Content Inventory And Metadata

`apps/web/src/app/_content/public-content-inventory.ts` currently handles both docs and blog content. Docs removal should preserve blog inventory behavior while deleting docs entry types, docs navigation construction, docs metadata reads, and docs `_meta.ts` imports.

`apps/web/src/app/_metadata/content-route-index.ts` imports docs content entries for docs sitemap routes even though sitemap currently only uses published blog routes. Docs removal should delete the unused docs export rather than leaving dead imports.

## Config And App References

Docs-related symbols are present in product and starter config. Known references include `routeConfig.docs`, docs display selectors, module flags, and tests that use docs as a placeholder link target.

Course lesson content points at `/docs/local-setup`. Repo-map constants also include `/docs/deploy-to-vercel`. These are not public product paths and should be removed or redirected to non-public setup truth as appropriate for app UI.

## Tests

Docs-specific tests exist for content loading, page paths, metadata, navigation components, disabled state, and the docs theme toggle. Shared tests such as public content inventory and public metadata routes include docs assertions that must be removed or rewritten around the blog-only public content contract.

Home page render-model and structured-data tests use docs route config as artificial link targets. Those should move to surviving public routes.

## Markdown Metadata Tooling

`scripts/markdown-metadata/families.ts` and `scripts/markdown-metadata/lint.ts` include a `web_docs_page` family for `apps/web/src/content/docs/`. Once public docs MDX is deleted, that family should be removed or otherwise made unreachable intentionally. Blog metadata validation must stay.

`docs/RELIABILITY.md` and `docs/design-docs/scripts.md` currently say `markdown:lint` validates docs MDX under `apps/web/src/content/docs/`. Those docs must be updated when the family goes away.

## Setup Truth

Public docs contain real setup details. The high-risk pages are:

- `environment-variables.mdx`
- `local-setup.mdx`
- `local-qa.mdx`
- `clerk-convex-auth.mdx`
- `stripe-checkout-webhook.mdx`
- `deploy-to-vercel.mdx`
- `route-map.mdx`
- `worker-seal-team-6-cal-com.mdx`
- `telegram-support-bot.mdx`

The setup truth should survive in durable non-public repo docs. Good targets are `docs/internal/`, `README.md`, `docs/release-workflow.md`, and active provider Programs or ExecPlans.

## Active Docs References

Active planning docs still point at public docs MDX as setup truth. Notable references include:

- `docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md`
- `docs/programs/active/2026-05-06-telegram-support-bot/program.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`
- `docs/programs/active/2026-05-12-public-product-split-starter-workers/`

These references need to be updated or superseded so a future worker does not chase deleted public MDX.

## Research Conclusions

The smallest coherent cleanup is not another docs demotion. It is a hard public docs retirement:

- preserve blog MDX and blog route behavior
- move setup truth out of public MDX
- delete docs MDX and docs route runtime
- remove docs-specific content inventory, metadata, config, tests, and markdown family code
- update active docs that point at public MDX
- validate the blog and public route metadata path after deletion
