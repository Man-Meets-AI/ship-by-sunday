---
title: Docs And Blog Cleanup Planning Brief 4
program_id: public-product-split-starter-workers
brief_version: 4
status: current
summary: Keep docs reachable as support material while removing public promotion and move the product-split thesis into blog content.
read_when:
  - Writing or resuming the docs and blog cleanup ExecPlan.
  - Changing public robots, sitemap, docs metadata, homepage demo navigation, or blog MDX inventory.
  - Checking how docs stay available without being marketed as a primary product path.
---

# Docs And Blog Cleanup Planning Brief 4

## Planning Context

The public route split, checkout split, generated snapshot purity pass, and explicit generated template app extraction are complete. The remaining content dependency is to make docs behave like support material rather than a promoted product surface, while making `/blog` a real place for Man Meets AI / Ship by Sunday product thesis posts.

Current research found that the primary public header already uses only Man Meets AI, Starter, Workers, Blog, and Sign in. The docs route remains directly reachable, which is intentional. The remaining promotion is in search/discovery metadata and an old homepage demo top bar: `apps/web/app/robots.ts` explicitly allows `/docs`, `apps/web/app/sitemap.ts` includes every docs route, and `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-top-bar.tsx` still links to Docs. The blog system is live but currently has one post and a manual MDX loader in `apps/web/app/blog/_server/blog-content.ts`.

## Next Plan Recommendation

Exact next plan title: `Clean Up Docs Promotion And Blog Content`.

Exact target path: `docs/exec-plans/active/2026-05-13-clean-up-docs-promotion-and-blog-content.md`.

Exact scope: remove docs from promoted public discovery by taking docs routes out of the sitemap, removing `/docs` from explicit robots allow rules, adding noindex metadata to docs pages, and removing the leftover Docs link from the old homepage demo top bar. Add one product-split blog post and wire it into the blog MDX loader and unit tests.

Exact boundaries: do not delete `/docs`, protect `/docs`, or rewrite the docs library in this slice. Do not reopen checkout, entitlement, Worker, generated-repo, or route-family decisions unless a direct broken link appears.

## Success Criteria

The slice succeeds when `/docs` remains directly renderable but no longer appears in the sitemap or explicit public robots allow list, docs metadata marks pages noindex, public navigation no longer contains a Docs CTA, and `/blog` lists at least two published posts including a post about the Starter / Workers split.
