---
title: 'Planning Brief 11 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 11
status: 'current'
summary: 'Eleventh child slice should remove the blog feature folder by moving public blog route UI, content constants, metadata helpers, structured-data helpers, and server content loaders to explicit App Router private owners.'
read_when:
  - 'Writing or executing the blog feature-folder removal ExecPlan.'
  - 'Checking the public blog route ownership slice.'
---

# Planning Brief 11 Feature Folder Surface

The eleventh slice should delete `apps/web/features/blog` only if it can do so without changing public `/blog` route behavior, optional catch-all slug behavior, blog index rendering, blog post rendering, MDX component imports, metadata defaults, generated blog metadata, structured data output, table-of-contents normalization, published-post discovery, draft filtering, or source-path generation.

Move blog route UI components to `apps/web/app/blog/_components`. Move blog copy constants to `apps/web/app/blog/_content`. Move pure blog route helpers, metadata helpers, structured-data helpers, formatters, and table-of-contents helpers to `apps/web/app/blog/_lib`. Move server-only Nextra content loading and page-path discovery to `apps/web/app/blog/_server`, preserving the existing `server-only` guard on the content loader. Update the public blog route, MDX post imports, docs references, tests, and coverage config away from `@/features/blog`.

Do not change marketing content, homepage CTA behavior, checkout, Stripe, pricing, promotion-code behavior, environment behavior, Convex schema, generated Convex files, AppShell, route URLs, public blog copy, MDX frontmatter, structured-data schema semantics, Nextra content discovery, or production release proof semantics. The focused proof should cover blog route path helpers, metadata helpers, date formatting, structured data, sitemap/public metadata coverage, app lint/typecheck, and Program/ExecPlan validation. After the PR merges, verify normal production proof for the merged `main` commit.
