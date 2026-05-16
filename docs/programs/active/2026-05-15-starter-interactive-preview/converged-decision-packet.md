---
title: "Starter Interactive Preview Decision Packet"
summary: "Canonical decisions for restoring a Starter-specific interactive preview without reverting to the old homepage."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking the canonical preview decisions."
  - "Resolving scope between `/starter`, the old homepage demo, and checkout."
  - "Reviewing child ExecPlans for this Program."
---

# Starter Interactive Preview Decision Packet

## Decisions

Decision: Restore the preview on `/starter`, not `/`.

Rationale: The current public IA makes `/` the Man Meets AI brand and routing page. Starter owns the new-builder offer, so the interactive idea-to-codebase preview belongs on `/starter`.

Decision: Do not reuse `CodebaseDemoSectionBlock` directly.

Rationale: The full wrapper includes the old dark full-screen homepage hero and the existing-codebase/Workers branch. Reusing it would bring back the old homepage structure and confuse the Starter/Workers split.

Decision: Reuse the narrow codebase-demo pieces that carry behavior.

Rationale: The local draft storage, form cards, design preset controls, pricing controls, saved-state behavior, and post-checkout seeding path are already real product behavior. Reusing them reduces duplication and preserves the buyer handoff from public preview to protected Starter workspace.

Decision: Make the visual system match current public route surfaces.

Rationale: The T3 Code migration is complete and is now the source of truth for web UI. The preview should feel like the current app: compact, DM Sans, zinc semantic tokens, blue accents, quiet panels, and restrained motion.

Decision: Keep both Starter checkout CTAs explicit.

Rationale: Checkout is revenue and access-critical. The hero CTA already uses `offerId="starter"`, and the preview CTA should also pass `offerId="starter"` explicitly instead of relying on a default.

Decision: Keep the existing local draft storage contract.

Rationale: The protected Starter codebase seeder already reads `sbs:home-codebase-draft:v1`. Changing that key or schema would widen the work into protected data handoff and should be avoided in the first slice.

Decision: Treat the first implementation as P1-adjacent public checkout surface work.

Rationale: The slice is mostly UI, but it changes a public checkout entry surface and the draft data that seeds the paid Starter workspace. It needs focused tests and desktop/mobile browser proof.
