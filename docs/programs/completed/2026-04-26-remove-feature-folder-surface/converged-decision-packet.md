---
title: 'Converged Decision Packet Feature Folder Surface'
summary: 'Decision packet for starting feature-folder reduction with generic and metadata helpers.'
docType: 'decision_packet'
status: 'active'
read_when:
  - 'Checking why generic helper deletion is first.'
  - 'Reviewing which feature-folder surfaces are deferred.'
---

# Converged Decision Packet Feature Folder Surface

The initiative should continue the app-structure direction by deleting feature-folder surface only where ownership is already clear. The first accepted deletion target is the pair of folders that are not durable product domains: `features/shared` and `features/public-metadata`.

The first slice does not move route screens, billing code, Convex schema, generated Convex files, Stripe behavior, checkout behavior, webhook behavior, pricing, promotion code behavior, environment behavior, or shared UI inventory. It only moves a generic hook into `apps/web/hooks` and sitemap support into a private App Router metadata helper.

The acceptance standard is concrete: after the first slice, `find apps/web/features/shared apps/web/features/public-metadata` should fail because those folders no longer exist, and `rg '@/features/(shared|public-metadata)|features/(shared|public-metadata)' apps/web` should return no matches.
