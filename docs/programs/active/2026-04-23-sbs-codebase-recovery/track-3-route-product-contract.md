# Route Product Contract Research

This research pass captures the route and product-contract drift.

## Findings

The live application mostly centers protected work on `/blueprint`, `/review`, `/execute`, `/mission`, `/lesson`, `/artifacts`, and `/settings`, but docs and QA surfaces still preserve language from older `/start`, `/product`, `/design`, `/marketing`, and `/build-plan` stages.

The `/execute` route currently behaves more like a redirect and continuation seam than the product bridge described in some docs and QA wording. That mismatch creates bad tests and unclear implementation expectations.

Generated preview is referenced by older contract language, but the live `blueprintPageSections` surface does not consistently make it a first-class rendered section. Legacy course language such as CEO, Design, Build, and Ship still leaks into post-review surfaces where the current product should be blueprint-first.

## Durable Implication

The third child ExecPlan should decide and enforce one product route contract across app routes, docs, QA, navigation, and compatibility redirects.
