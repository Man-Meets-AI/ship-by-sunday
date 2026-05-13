# Template Source Instructions

Templates under this directory are source material for generated customer repos.
They are not runtime code for the Ship by Sunday web app.

## Rules

- Keep template source deterministic and repo-local. Do not make generation read from a sibling checkout, remote branch, or network fetch.
- Do not commit dependency installs, local env files, build output, screenshots, or machine-local state under `templates/`.
- When changing a pinned source snapshot, update its manifest, content digest, docs, tests, and owning Program or ExecPlan in the same change.
- Generated overlays must be explicit. Do not let the generator overwrite arbitrary template files without recording that path in the template manifest.
- Treat secrets and provider config as customer-owned setup. Template files may include safe examples and setup docs, never real credentials.

## Starter App

The Starter app source boundary is `templates/starter-app/`. Read `templates/starter-app/README.md` and `templates/starter-app/template-source.json` before changing files in that subtree.
