# Convex Backend Notes

This folder owns the app data and product-state backend for `Ship by Sunday`.

## Current responsibilities

- product access grants
- Stripe webhook ingestion
- starter repo access requests and provisioning state
- lesson state and autosave
- mission progress
- artifact listing
- upload URL generation

## Local workflow

Run the Convex dev server with:

```bash
bun run dev:convex
```

Run the full app with:

```bash
bun run dev
```

Deployment workflow: [docs/dev/convex-sop.md](../docs/dev/convex-sop.md)

## Key files

- `schema.ts`: database schema and indexes
- `access.ts`: product-access grants and access-read functions
- `http.ts`: Convex HTTP routes, including the Stripe webhook
- `course.ts`: lesson progress, mission, and lesson-state logic
- `uploads.ts`: upload URL generation for lesson media fields
- `auth.config.ts`: Convex auth provider configuration

## Guardrails

- Treat product access and lesson progress as production state.
- Prefer adding tests around pure domain helpers in `features/course/lesson/model/` before refactoring Convex behavior.
- If a change affects auth, purchase, or access gating, run `bun run check` before closing it.
