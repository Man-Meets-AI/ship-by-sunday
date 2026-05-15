---
title: "T3 Code Source Design System Dependency Graph"
summary: "Dependency ordering for the T3 Code design-system port."
docType: "dependency_graph"
status: "active"
read_when:
  - "Sequencing child ExecPlans for the T3 Code design-system migration."
  - "Checking which slices block primitives, shell work, or visual proof."
---

# T3 Code Source Design System Dependency Graph

## Nodes

N1: Structural source contract, doctrine retirement, and safe first proof. This includes updating AGENTS/docs routing, mapping T3 Code's app shape to Ship by Sunday's Next app, preserving useful Next route groups, and targeting underscore implementation folders.

N2: App foundation: DM Sans, T3 Code global tokens, `.dark` behavior, radius semantics, base styles, and removal or neutralization of tracked-app generated design-system overrides.

N3: Dependency and primitive strategy for `@base-ui/react`, CVA, T3 Code primitive APIs, and compatibility shims.

N4: Shared primitive migration for buttons, cards, inputs, badges, dialogs, sheets, menus, command, sidebar, toast, tooltip, selects, form controls, skeleton, and spinner.

N5: App shell migration to a T3 Code sidebar-first shell.

N6: Protected dashboard and operational surfaces: codebase flow, worker setup, worker findings, doctor pass, runs, loops, settings, admin, and support pages.

N7: Public surface migration: homepage, marketing pages, docs chrome, blog prose, starter/workers/service pages, public header/footer, and public support presentation.

N8: Tutorials, course, auth, checkout, and other route-island sweep.

N9: Telegram widget package visual migration.

N10: Generated codebase compiler/template migration.

N11: Visual proof, docs cleanup, stale utility removal, underscore cleanup completion, and final validation.

## Edges

- N1 blocks every other node.
- N2 blocks N3 and N4 because primitives and shell work need stable tokens.
- N3 blocks N4.
- N4 blocks most of N5, N6, N7, and N9.
- N5 should land before broad protected-dashboard rewrites.
- N6 and N7 can proceed in parallel after N4 if write scopes are separated.
- N9 can proceed after N2 and N4 establish token names and primitive rules.
- N10 depends on N1, N2, N3, and N4, and should wait until the current-app source contract is stable.
- N11 depends on every migrated surface.

## Critical Path

The critical path is N1 -> N2 -> N3 -> N4 -> N5 -> N6 -> N10 -> N11.

Public surfaces, the Telegram widget, and generated-codebase work can run alongside protected-dashboard work once the structural, token, and primitive foundation is stable, but generated-codebase work also needs compiler/template validation.

## Parallel Opportunities

- Public marketing/docs/blog work can run separately from protected operational work after primitives land.
- Telegram widget CSS can be migrated in parallel after token names are stable.
- Generated codebase compiler/template work can start after the token and primitive source contract is stable.
- Docs and underscore cleanup can begin in N1, then continue as surfaces migrate.
