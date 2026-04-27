---
title: 'Plan Split Recommendation Feature Folder Surface'
summary: 'Recommended child ExecPlan split for reducing apps/web/features.'
docType: 'plan_split'
status: 'active'
read_when:
  - 'Writing the next child ExecPlan.'
  - 'Checking the recommended migration order.'
---

# Plan Split Recommendation Feature Folder Surface

The first child ExecPlan should remove the generic and public metadata feature folders. It is narrow enough to implement immediately and proves the initiative is deleting actual feature-folder surface, not only rewriting imports.

The second child ExecPlan should move settings route components into the settings route private folder.

The third child ExecPlan should move workspace home components and model into the workspace route private folder.

The fourth child ExecPlan should split starter and starter-repo into route, docs, Convex-safe validation, and course workbench homes.

Later child ExecPlans should tackle one durable domain at a time. Course should be decomposed last unless a smaller safe seam appears, because it has the largest fan-in.
