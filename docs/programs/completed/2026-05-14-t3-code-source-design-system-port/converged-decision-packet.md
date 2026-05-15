---
title: "T3 Code Source Design System Decision Packet"
summary: "Canonical decisions for the T3 Code design-system port."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking what the T3 Code design-system Program has already decided."
  - "Deciding whether to preserve current Ship by Sunday visual doctrine."
---

# T3 Code Source Design System Decision Packet

## Decisions

Decision: Use T3 Code as the source of truth for current web-facing design.

Rationale: The user explicitly prefers T3 Code across the current product. Current Ship by Sunday design doctrine should not win conflicts.

Decision: Keep Ship by Sunday branding.

Rationale: The source-of-truth decision is about visual system and interaction feel. The product name, logos, customer-facing language, and brand promises remain Ship by Sunday's.

Decision: Include generated customer repositories and compiler output in this Program.

Rationale: The user clarified that generated codebases should get the same treatment. They should be sequenced after the current app foundation and primitive decisions, but they are part of the same design-system migration.

Decision: Port the primitive system, not only token values.

Rationale: T3 Code's look comes from `@base-ui/react` primitives, CVA recipes, compact geometry, sidebar shell, and composer/card structure. A token-only change would leave the disliked UI mostly intact.

Decision: Adapt framework-specific theme plumbing instead of copying Vite/Electron assumptions blindly.

Rationale: Ship by Sunday is a Next.js app using `next-themes`. T3 Code's visual `.dark` contract should be adopted, while desktop bridge behavior and Vite boot details should be adapted or omitted unless needed.

Decision: Rewrite design docs early.

Rationale: Root `DESIGN.md`, docs design guidance, and frontend rules currently tell future agents to preserve the old system. Those docs will cause drift until they name T3 Code as canonical.

Decision: Treat the generated design-system CSS injection as incompatible until proven otherwise.

Rationale: The tracked app currently injects generated design CSS globally. If it remains active, it can override T3 Code colors, radius, and font tokens.

Decision: Rebuild public surfaces with T3 Code, not the current editorial serif language.

Rationale: The user's preference applies to the marketing site and not only the authenticated app. Public pages should look like the same product system.

Decision: Keep high-risk route behavior stable while changing visuals.

Rationale: Auth, checkout, billing success, protected dashboards, and support/admin states cannot regress because the change is visually motivated.
