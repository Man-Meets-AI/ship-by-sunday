---
title: "Starter Interactive Preview Normalized Target"
summary: "Normalized target decisions for the Starter-specific preview and its visual, product, and checkout boundaries."
docType: "normalized_pass"
status: "active"
read_when:
  - "Checking the desired Starter preview behavior."
  - "Writing a child ExecPlan for the preview."
  - "Resolving whether to reuse or replace old homepage demo pieces."
---

# Starter Interactive Preview Normalized Target

## Product Target

The public `/starter` page should show a Starter-specific interactive preview near the hero. The preview should help a new builder understand the path from rough idea to product facts, design and pricing choices, and the repo/codebase promise they receive after checkout.

The preview is not a homepage resurrection. It should not include the old full-screen leverage hero, the old existing-codebase branch, the Doctor Pass audit copy, Worker checkout copy, Program/PLANS homepage stacks, social proof, FAQ, pricing footer, or the old homepage section order. The current `/` page remains the Man Meets AI routing page. `/starter` remains the Starter offer page.

The preview story should be clearly scoped to Starter:

1. start from an idea
2. answer product facts
3. preview design and pricing choices
4. see the locked repo/codebase promise
5. start Starter checkout with `offerId="starter"`

## Visual Target

The preview should match the new public route system from the T3 Code migration. It should use the shared public route surface, compact panels, DM Sans, zinc tokens, restrained blue accents, tight spacing, quiet borders, stable responsive layouts, and no old serif hero scale. The design should feel like a product tool embedded in the Starter page, not like a separate landing page grafted below it.

Cards should remain compact enough for scanning on desktop and should stack cleanly on mobile. The preview should use stable dimensions and avoid layout shifts when fields are edited, design presets are selected, saved-state labels appear, or checkout enters a loading state.

## Reuse Target

Reuse or extract existing codebase-demo logic where it carries real behavior:

- local draft storage and parsing
- default draft construction from design presets
- Foundation form controls
- Design preset radio controls and preview card
- Pricing model and price controls
- sidebar progress
- locked section preview language
- save-before-checkout behavior

Do not reuse the full `CodebaseDemoSectionBlock` wrapper. Do not duplicate the local draft parser. If old code is moved to a shared module, preserve existing import users or update them with focused tests proving compatibility.

## Checkout Target

The existing hero CTA on `/starter` must stay in place and must keep `offerId="starter"`. The preview CTA must also use `offerId="starter"` explicitly. The slice must not change Stripe offer IDs, checkout session params, checkout success routing, protected Starter route access, Worker checkout, Worker Seal Team 6 booking, or provider setup.

The preview should keep using the existing local draft storage key so the protected Starter seeder can import the public answers after checkout. Any change to this storage contract is a separate protected-flow change and should not be part of the first preview slice.

## Testing Target

The first implementation slice should add public Starter preview tests and keep the old homepage demo tests green if that compatibility code remains referenced. Validation should include focused public route tests, checkout button tests where relevant, browser proof for `/starter` desktop and mobile, app format check, root lint and typecheck, and `git diff --check`.
