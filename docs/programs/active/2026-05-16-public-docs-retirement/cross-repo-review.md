---
title: "Public Docs Retirement Cross Repo Review"
summary: "Risk review for deleting public docs without breaking blog, provider setup truth, or route metadata."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Reviewing a public docs removal patch."
  - "Checking likely regressions from deleting /docs."
---

# Public Docs Retirement Cross Repo Review

## Review Findings To Guard

Risk: Setup truth disappears with public MDX.

Mitigation: Move essential setup material into non-public durable docs before deleting MDX. Review the replacement docs for env names, provider setup locations, callback URLs, event types, permissions, value destinations, verification, and failure modes.

Risk: Blog breaks because public content inventory used shared docs/blog helpers.

Mitigation: Run focused blog unit tests and public metadata tests after inventory cleanup.

Risk: Stale imports remain after route deletion.

Mitigation: Search for docs module imports, `routeConfig.docs`, `/docs`, `content/docs`, `getDocs`, and docs-specific metadata helpers before final validation.

Risk: Active Program or ExecPlan docs point future workers at deleted paths.

Mitigation: Update active guidance that names public docs as setup truth. Historical completed plans can stay unless they are referenced by active instructions.

Risk: `/docs` behavior is accidental.

Mitigation: Decide whether the App Router should default to 404 or redirect. Add focused route tests if the repo has route-level coverage for public missing routes.

Risk: Docs-specific markdown metadata family remains and causes confusing lint behavior.

Mitigation: Remove or retire the `web_docs_page` family only after confirming blog validation stays intact.

Risk: The patch expands into unrelated product work.

Mitigation: Keep Telegram, Starter preview, checkout, generated repo, and visual redesign out of scope.

## Review Questions

- Does any public route, sitemap, header, footer, course resource, or structured-data path still imply `/docs` exists?
- Does every deleted setup page have a durable non-public replacement when the information is still operationally necessary?
- Does `apps/web/src/content/blog` still import and render normally?
- Are docs-specific tests deleted rather than rewritten to assert removed behavior?
- Are active Program/ExecPlan references truthful after the deletion?
