---
title: 'Retired Frontend Route'
summary: 'Temporary pointer away from the old frontend doctrine during the T3 Code migration.'
docType: 'redirect'
status: 'active'
read_when:
  - 'You followed an old link to docs/FRONTEND.md.'
---

# Retired Frontend Route

This file is no longer a current frontend doctrine surface.

Use the active T3 Code migration Program instead:

- [program.md](programs/active/2026-05-14-t3-code-source-design-system-port/program.md)
- [current-planning-brief.txt](programs/active/2026-05-14-t3-code-source-design-system-port/current-planning-brief.txt)

Keep Next.js route groups such as `(auth)`, `(marketing)`, and `(app)` when they are useful framework organization. The cleanup target is the underscore implementation-folder pattern such as `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata`.

The intended end state is to remove this redirect after repo references are migrated. Do not add new frontend rules here.
