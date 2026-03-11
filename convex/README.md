# Convex Backend Notes

This folder owns the app data and product-state backend for `Ship by Sunday`.

## Current responsibilities

- course entitlements
- lesson state and autosave
- mission progress
- artifact listing
- upload URL generation

## Local workflow

Run the Convex dev server with:

```bash
pnpm run dev:convex
```

Run the full app with:

```bash
pnpm run dev
```

Deployment workflow: [docs/dev/convex-sop.md](../docs/dev/convex-sop.md)

## Key files

- `schema.ts`: database schema and indexes
- `course.ts`: course access, progress, mission, and lesson-state logic
- `uploads.ts`: upload URL generation for lesson media fields
- `auth.config.ts`: Convex auth provider configuration

## Guardrails

- Treat entitlements and lesson progress as production state.
- Prefer adding tests around pure domain helpers in `lib/course/` before refactoring Convex behavior.
- If a change affects auth, purchase, or access gating, run `pnpm run check` before closing it.
