---
title: "Public Product Split Dependency Graph"
summary: "Dependency order for the Man Meets AI, Starter, Workers, checkout, docs, blog, and generated-template split."
docType: "dependency_graph"
status: "active"
read_when:
  - "Choosing the next implementation slice."
  - "Checking why public `/workers` and split checkout must happen before stronger Starter claims."
---

# Public Product Split Dependency Graph

## Ordered Dependencies

1. Program truth and route contract. Record the new product hierarchy so later work does not keep implementing the older Generate Codebase, Tutorials, and Worker peer-surface model.

2. Public route hard cut. Create `/` as a brand/thesis routing page, create the visible public routes for `/starter` and `/workers`, and keep `/blog` usable. Public `/workers` depends on narrowing route protection and resolving the current protected `/workers` page. Public `/starter` depends on creating protected Starter work below `/starter/*` rather than letting protected work collide with the public root.

3. Paid app IA cleanup. Update `/home` so Starter and Workers are the only product choices for multi-product, unresolved, and legacy users, while single-product users auto-forward into their product route. Tutorials and Generate Codebase should stop appearing as peer products. Keep generator and videos reachable through `/starter/home`, `/starter/lessons`, `/starter/lessons/[lessonKey]`, and `/starter/generate-codebase`.

4. Old protected Starter/Tutorial redirects. Add unpromoted redirects from `/generate-codebase`, `/tutorials`, and `/tutorials/[lessonKey]` to matching `/starter/*` routes during the first implementation pass. `/tutorials/[lessonKey]` redirects to `/starter/lessons/[lessonKey]`. Delete redirects only in a later cleanup after the new routes ship cleanly.

5. Minimal split checkout and access. Public CTAs need two real app-backed purchase paths and product-specific success routing. Starter should use a `$297` checkout offer, grant generator and videos, then route to `/starter/home`. Workers should use a `$600` checkout offer, grant only Worker access by default, then route to `/workers/setup`. Existing grants need manual review, not blind migration.

6. Generated template extraction. This is Slice 2, after the public IA and checkout split unless it becomes a hard blocker. Once the public Starter promise is stable, extract generated output away from core-app snapshots and remove Worker local-runner code from generated repos. In the first pass, keep app code template-shaped and use questionnaire answers to customize source truth, docs, Program, ExecPlans, and agent instructions.

7. Docs and blog cleanup. Public navigation should include only Man Meets AI, Starter, Workers, Blog, and Sign in. Keep `/docs` public by direct link but demote docs from public product navigation and sales CTAs. Preserve docs where generated-codebase customers need them. Move Plan/Program thesis material into blog posts in a later content slice.

8. Customer migration and proof. Review the three existing customers manually, document the chosen grants, and run route, checkout, access, generated-output, and browser proof for the final split.

## Parallelizable Work

Blog content drafting can happen in parallel with route work because it does not own checkout or entitlement boundaries.

Docs promotion inventory can happen in parallel with route work, but docs cleanup should not be treated as complete until public navigation and generated-codebase customer entry points are known.

Compiler research can happen in parallel with public route implementation, but the compiler extraction should land as a separate child ExecPlan because it touches package output contracts and generated customer files.

## Blocked Work

Public `/workers` is blocked by the current protected route and proxy matcher.

Truthful Starter copy is blocked by generated-output behavior if it promises a clean template app. The first public slice can describe the intended Starter outcome carefully, but the compiler extraction must follow before stronger template-app claims are fully release-ready.

Split prices are blocked by the current one-price managed Stripe configuration unless the first implementation adds a direct two-price path or an operator-approved temporary access process.
