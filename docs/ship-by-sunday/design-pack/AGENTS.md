# Retired Design-Pack Instructions

This file is no longer active instructions for Ship by Sunday UI work.

Use the completed T3 Code migration Program instead:

- `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/structure-map-t3-code-to-ship-by-sunday.md`

Do not preserve this pack's old visual, planning, or frontend doctrine over T3 Code.

Keep Next.js route groups such as `(auth)`, `(marketing)`, and `(app)` when useful. Target underscore implementation folders such as `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata` for migration through bounded ExecPlans.

The intended end state is to remove or archive this folder after references are migrated.
