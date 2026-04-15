# Workspace layout

Use the repository root as the workspace entrypoint. The app runtime lives under `apps/web`, while supporting systems live in sibling folders.

- `/apps/web/app`: Next.js route entrypoints and route-level wiring.
- `/apps/web/features`: feature-owned runtime code. Prefer this before adding route-level logic.
- `/apps/web/convex`: backend functions, schema, HTTP actions, and hosted dev integration.
- `/apps/web/config`: starter control plane and product configuration.
- `/apps/web/content/docs`: public docs and product-facing MDX guides.
- `/apps/web/tests`: app-local Vitest coverage plus shared test helpers.
- `/apps/web/playwright`: app-local Playwright smoke and browser setup.
- `/packages/blueprint-compiler`: generator for the customer-safe starter snapshot.
- `/packages/ship-by-sunday-cli`: local blueprint-intake CLI that writes `.ship-by-sunday/` drafts and generates starter snapshots.
- `/docs`: human-facing runbooks, long-form background docs, reusable prompts, and ExecPlans.
- `/.agents`, `/.codex`, `/.claude`: repo-scoped agent, QA, and editor configuration surfaces.

Read order for common work:

- UI or product-surface work: `DESIGN.md`, then `apps/web/AGENTS.md`, then the relevant feature folder.
- Compiler or snapshot work: `packages/blueprint-compiler/AGENTS.md`, then `packages/blueprint-compiler/src`.
- Release or verification work: `docs/release-workflow.md`, then `apps/web/content/docs/local-qa.mdx`.
