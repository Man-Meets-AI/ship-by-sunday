# Starter App Template Source

This directory owns the pinned Starter app source boundary for generated customer repos.

## Layout

- `source/` is the imported source snapshot.
- `template-source.json` records the source provenance, content digest, required files, excluded local artifacts, and generated-overlay policy.

The initial snapshot is copied from `~/Developer/next-js-convex-clerk-stripe-template`. That sibling directory is a source seed only. Generation must consume the committed files in `templates/starter-app/source`, not the sibling path.

## Current Source Shape

The initial source seed is a single Next.js app repo with `src/`, `convex/`, provider boundaries, route groups, billing routes, auth routes, and tests. The generated Ship by Sunday customer repo remains a monorepo, and the generator maps this single-app source into `apps/web/` before applying generated overlays.

The no-provider generated repo subset excludes provider-heavy routes and local-only files until setup ExecPlans activate them deliberately. The source app uses a protected `/chat` sample with Convex-owned conversations/messages and server-side OpenAI streaming.

## Provenance

The sibling source seed did not contain `.git` metadata at import time. The pin is therefore the committed source tree plus `contentDigest` in `template-source.json`.

The digest is deterministic:

1. List every file under `source/`, sorted by POSIX-style relative path.
2. Compute a SHA-256 digest of each file.
3. Compute a final SHA-256 over `relativePath`, a null separator, the file digest, and another null separator for every sorted file.

Changing any source file must update `contentDigest` and `fileCount` in `template-source.json`.

## Generated Overlay Policy

Generated overlays are files the generator may write over template material after copying the source. The manifest records the currently allowed exact paths and path prefixes. Future slices may narrow or expand that policy, but must update tests when they do.

Do not add a broad overlay such as `**/*`. The template source should stay inspectable, and generated replacements should remain intentional.

## Update Workflow

1. Inspect the source seed read-only.
2. Copy or edit the intended template files under `templates/starter-app/source`.
3. Recompute `fileCount` and `contentDigest`.
4. Update `template-source.json`.
5. Run:

   ```bash
   bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts
   bun run --cwd packages/codebase-compiler typecheck
   bun run --cwd packages/codebase-compiler format:check
   bun run --cwd packages/codebase-compiler lint
   ```

6. Update the owning ExecPlan or Program if the source contract changed.

## Boundaries

Do not include `node_modules`, `.git`, `.next`, `.vercel`, local env files, coverage, or test-results output.

Do not make generated downloads reach into `~/Developer/next-js-convex-clerk-stripe-template`.

Do not store real provider credentials in template source.
