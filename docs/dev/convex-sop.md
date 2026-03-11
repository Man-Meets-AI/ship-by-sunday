# Convex SOP

Use this repo with three Convex modes:

## 1. Local

Use for normal app development.

- Run: `pnpm run dev`
- What it does:
  - starts Next.js
  - starts a local Convex backend
  - uses the local Convex data in `.convex/local/default/`
- Current repo default: local

Use local when:

- you are building features
- you are changing schema/functions
- you do not need shared cloud state

## 2. Dev Cloud

Use only when you specifically need a shared hosted backend.

- Run Convex against cloud instead of local:

```bash
pnpm exec convex dev
```

- Point the app at the cloud deployment URL instead of the local one in `.env.local`

Use dev cloud when:

- you need to share state with another developer
- you want to test against a hosted Convex deployment before prod

Do not use dev cloud as the default for everyday coding in this repo.

## 3. Prod

Use for the real deployed app only.

- Deploy Convex with:

```bash
pnpm exec convex deploy -y
```

- Prod should use production env vars in the hosting platform, not local `.env.local`

Use prod when:

- deploying the live backend
- validating the actual production buyer flow

## Team Default

Keep it simple:

- local = daily development
- dev cloud = shared testing only when needed
- prod = live app only

## Current Status

- This repo is currently set up to use **local Convex by default**
- The combined app command is `pnpm run dev`
- If you switch to cloud dev, do it intentionally and update `.env.local` to match
