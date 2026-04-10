---
summary: Add a curated DESIGN.md preset catalog to the blueprint Design step so customers can choose a named inspiration, see a real preview, and still fine-tune the existing shadcn-based theme controls before the compiler emits one final DESIGN.md.
read_when: Open this plan when changing the blueprint Design step, canonical blueprint facts, or compiler-owned design-system generation to support selectable external DESIGN.md inspirations with preview.
plan_status: done
---

# Add Curated DESIGN.md Preset Selection To Blueprint

This document is a living execution plan. It must stay current as research, implementation, validation, and follow-up decisions evolve.

Maintain this ExecPlan in accordance with `.plans/PLANS.md`.

## Purpose / Big Picture

Today the `/blueprint` Design section lets a customer manipulate a shadcn preset code, but it does not let them choose a named visual inspiration such as Vercel, Notion, or Linear, and it does not show the kind of concrete preview that makes that choice obvious. The public landing page also does not yet sell this as a product capability, so visitors cannot see that Ship by Sunday includes curated design-direction selection as part of the system. After this change, a customer on `/blueprint` can pick one curated DESIGN.md preset from a dropdown, see a real inspiration preview plus the existing live starter-preview, and then customize that starting point through the same shadcn controls the product already understands. The public homepage should also surface this as part of the offer so a visitor understands that the product includes design-direction selection and preview, not just generic starter output. A human can prove the work by opening `/blueprint`, selecting a preset such as Vercel, seeing the inspiration preview update immediately, tweaking a few knobs, saving, downloading the generated repo from `/review`, and confirming that the repo still contains exactly one root `DESIGN.md` that reflects the chosen preset plus any user overrides. They should also be able to read the homepage and see this capability represented truthfully in the public product story.

## Progress

- [x] 2026-04-09 09:02 ET: Re-read `.plans/PLANS.md`, root `AGENTS.md`, `apps/web/AGENTS.md`, `packages/blueprint-compiler/AGENTS.md`, root `DESIGN.md`, and `.docs/scripts.md` to anchor the plan to current repository contracts.
- [x] 2026-04-09 09:08 ET: Inspected the current `/blueprint` page and confirmed that the Design section is still a single `theme_preset` pipeline routed through `apps/web/features/blueprint-flow/components/blueprint-theme-configurator.tsx` and persisted as canonical blueprint facts.
- [x] 2026-04-09 09:13 ET: Verified that the compiler currently generates one root `DESIGN.md` from structured facts and one resolved shadcn preset. There is no existing markdown parser for external DESIGN.md files and no preset registry with stable ids.
- [x] 2026-04-09 09:18 ET: Verified the external source shape. The linked GitHub repo is primarily a discovery index. The importable raw files live at `https://getdesign.md/design-md/<slug>/DESIGN.md`, the human pages live at `https://getdesign.md/<slug>/design-md`, and the collection is consistent enough to curate but not safe enough to trust dynamically at runtime.
- [x] 2026-04-09 09:24 ET: Promoted preview to a hard requirement for v1. The plan now assumes the Design section must show a real preset preview, not just a text label or an external link.
- [x] 2026-04-09 09:48 ET: Ran a local grill pass against the real code paths and found three missing requirements: the duplicated field registries in stage definitions and presentation copy, the CLI field-contract and derivation surfaces, and the need to define exact reseed semantics when a user switches presets after customizing the theme.
- [x] 2026-04-09 10:03 EDT: Froze the first eight curated presets as `vercel`, `linear`, `notion`, `stripe`, `supabase`, `framer`, `raycast`, and `cursor`, with SVGL-backed logo lookups and repository-owned preview screenshots under `apps/web/public/blueprint/design-presets/`.
- [x] 2026-04-09 10:09 EDT: Implemented the compiler-owned preset catalog, added `design_preset_id` to the canonical facts, updated the duplicated field inventories, and kept the CLI/compiler slice compatible.
- [x] 2026-04-09 10:16 EDT: Updated the `/blueprint` Design section to add the logo-led preset selector, selected-state summary card, static inspiration preview, and theme-override flow.
- [x] 2026-04-09 10:18 EDT: Extended generated design output to include preset provenance and a visible `Preset Inspiration` section while keeping the final output singular.
- [x] 2026-04-09 10:22 EDT: Added homepage copy to the Starter System section so the public product story now mentions curated design-direction selection with preview.
- [x] 2026-04-09 10:23 EDT: Validation passed for targeted package tests, app unit and integration-ui packs, `bun run sbs:check`, `bun run format:check`, `bun run lint`, and `bun run typecheck`.
- [x] 2026-04-09 11:25 EDT: Fixed the post-review findings by rewiring the CLI canonicalization path to re-derive from the selected preset instead of the complete fixture, making web save clearing preserve authored design prose, expanding preset provenance classification beyond `theme_preset`, and adding the vendored asset contract test.

## Surprises & Discoveries

The most important discovery is that the external GitHub repository is not the real content store. Each `design-md/<slug>/README.md` in the repo is only a stub, while the actual raw markdown lives on `getdesign.md`. That means runtime folder scanning or GitHub API browsing would create a brittle dependency and would not even guarantee the raw DESIGN.md exists. One folder, `semrush`, appears to be orphaned: the folder exists in GitHub but the hosted raw markdown returned `404` during research. The plan therefore treats external presets as untrusted source material that must be curated into a compiler-owned catalog.

Another important discovery is that the current system already has two different preview concepts that can be combined into a stronger Design section without inventing a new architecture. The blueprint flow already includes a live token-based starter preview in `apps/web/features/blueprint-flow/components/blueprint-theme-preview.tsx`, and the external collection demonstrates the value of a real inspiration preview. The product should show both: a static inspiration preview for the chosen preset and the live starter preview that responds to the current `theme_preset` knobs.

The current compiler is one-way. It derives a generated design system from structured facts and renders one root `DESIGN.md` in `packages/blueprint-compiler/src/design-system/generated-design-system.ts`, but it does not read markdown back into facts. That means v1 should not attempt general DESIGN.md ingestion. The correct architecture is a compiler-owned preset catalog that seeds structured facts, not a parser that tries to reverse-engineer arbitrary prose.

The existing `theme_preset` value is an opaque shadcn preset code and already carries real design-system information such as theme accent, font, radius, style, base color, and icon library. This is visible in `apps/web/features/blueprint-flow/lib/blueprint-theme-helpers.ts` and `packages/blueprint-compiler/src/design-system/preset-design-system.ts`. The plan should therefore add a higher-level named selector for humans while preserving `theme_preset` as the low-level source that keeps the rest of the compiler honest.

The design-step field inventory is duplicated in more places than the first draft of this plan acknowledged. Besides the canonical schema, the Design step fields are described in `packages/blueprint-compiler/src/stages/stage-definitions.ts`, the presentation copy and labels in `packages/blueprint-presentation/src/index.ts`, and the simplified CLI model in `packages/ship-by-sunday-cli/src/field-contract.ts` plus `packages/ship-by-sunday-cli/src/blueprint-derivation.ts`. If the new selector is added only to the schema and the web form, the compiler package and CLI slice will drift.

This initiative is greenfield for product data, so the implementation does not need a customer-data migration or an older-workspace restoration mode. The schema still needs to remain draft-safe during development and tests, but the shipped experience can assume that new workspaces will have a real curated preset selection rather than a guessed recovery state.

The logo source can be standardized instead of hand-curated blindly. SVGL documents an open API at `https://api.svgl.app` with title search through `https://api.svgl.app?search=<term>`, and the response can include both a main `route` and an optional `wordmark`. Some responses use a single string and others use a `{ light, dark }` object, so the plan must account for both shapes. The safest use is lookup during curation or asset-refresh time, then storing the chosen logo files in the repo rather than depending on the SVGL API at runtime.

The adversarial review surfaced a real cross-surface bug: the CLI generator path was still carrying the complete fixture’s design defaults forward even after `design_preset_id` was introduced. That meant the web path and CLI path could disagree about the same preset selection. The final implementation resolved that by making the CLI build a reduced facts draft from the selected preset seed rather than inheriting authored design copy from the complete fixture.

One implementation discovery mattered more than expected: changing a curated preset would not have updated the hidden design narrative fields on save unless those fields were explicitly cleared. The saved canonical facts already contain derived values such as `visual_thesis`, `content_plan`, `layout_direction`, and `copy_tone`, so a preset switch without clearing them would have left stale generated prose in the next repo export. The final implementation solves that in `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts` by clearing the preset-derived design fact keys whenever the design selector inputs change before saving.

## Decision Log

Decision: V1 will use a compiler-owned curated preset catalog rather than parsing external DESIGN.md files directly.
Rationale: The external source is index-like, partially inconsistent, and has at least one broken entry. A local catalog gives stable ids, trusted labels, deterministic previews, and testable behavior.
Date: 2026-04-09

Decision: Preview is a hard requirement for the first shipped version.
Rationale: The user explicitly called the getdesign-style preview important, and a dropdown without a visual reference would bury the value of the feature.
Date: 2026-04-09

Decision: The Design section will combine a named preset selector with the existing shadcn controls rather than replacing them.
Rationale: The existing `theme_preset` pipeline already drives compiler output, bootstrap behavior, and the current live starter preview. Reusing it keeps the diff small and preserves customizability.
Date: 2026-04-09

Decision: V1 will still emit one final generated `DESIGN.md`, one design snapshot JSON, and one runtime config.
Rationale: The current compiler and generated starter assume one active design system. Multi-preset runtime switching would widen scope into app runtime and bootstrap behavior without helping the immediate blueprint-selection story.
Date: 2026-04-09

Decision: The inspiration preview shown inside `/blueprint` will use repository-owned static screenshots, not live remote iframes.
Rationale: Static screenshots avoid runtime network dependence, cross-origin issues, layout instability, authentication surprises, and third-party outages while still delivering the concrete preview the user asked for. External links to the full hosted preview and raw DESIGN.md remain useful as secondary affordances.
Date: 2026-04-09

Decision: The preset selector should visually resemble the getdesign browsing pattern by using brand logos, strong labels, short summaries, and a richer selected-state card rather than a plain text-only select menu.
Rationale: The user explicitly likes the way the external design site lays out its options. A logo-led selector makes the choices scan faster and makes the feature feel like choosing a real design direction instead of entering a low-level theme code.
Date: 2026-04-09

Decision: Use the SVGL API as the authoritative lookup source for brand logos during catalog curation, but keep the actual dropdown logos as repository-owned assets.
Rationale: SVGL provides a simple, documented logo API that removes guesswork for brand marks, while vendoring the final chosen logos keeps the product runtime stable and avoids introducing a new external dependency into the protected blueprint flow.
Date: 2026-04-09

Decision: The initial curated set is eight presets: `vercel`, `linear`, `notion`, `stripe`, `supabase`, `framer`, `raycast`, and `cursor`.
Rationale: This set covers the most recognizable developer-product aesthetics and spans monochrome precision, editorial warmth, dark devtool, premium gradient, and motion-forward visual directions without making the first catalog feel random or overlarge.
Date: 2026-04-09

Decision: The curated preset picker and preview must be reflected on the public homepage as part of the product promise.
Rationale: If the capability exists only inside the protected blueprint flow, the landing page undersells the product and leaves a meaningful differentiator invisible to buyers. The homepage copy should mention the curated design-direction selection truthfully without implying runtime theme switching in the generated app.
Date: 2026-04-09

Decision: Switching from one curated preset to another should deterministically reseed the editable theme state rather than trying to merge presets.
Rationale: Merge behavior would be opaque and hard to explain. The simpler rule is: choosing a curated preset replaces the current preset-derived theme seed, then the user can customize from that starting point again.
Date: 2026-04-09

Decision: The public homepage should describe this capability inside an existing section, with `starterSystemSection` as the default landing point for the copy update.
Rationale: The capability is part of the system and starter path, not a separate top-level offer category. Reusing an existing section keeps the homepage contract smaller unless implementation proves that another section carries the message more honestly.
Date: 2026-04-09

Decision: The CLI does not need to expose the full curated preset browser in v1, but it must remain schema-compatible and draft-compatible with the new `design_preset_id` fact.
Rationale: The feature is being sold and rendered through the web blueprint flow. The CLI should not block the compiler slice or break imports, but forcing the same UX into the CLI would widen scope unnecessarily.
Date: 2026-04-09

## Outcomes & Retrospective

The shipped result matches the intended shape. The Design section now has a real curated-preset selection layer, local inspiration previews, and the existing live starter preview, while the compiler still emits one final generated `DESIGN.md`. The homepage now mentions the capability in the Starter System story rather than leaving it hidden inside the protected flow.

The most important lesson was that the state model only stays honest if the named preset and the editable theme code are both preserved. `design_preset_id` gives the user-facing provenance and links, while `theme_preset` remains the actual low-level design-system carrier. The other important lesson was that hidden derived design facts need explicit clearing when a preset changes, otherwise the saved generated prose drifts even if the visible theme looks correct.

No follow-up is required to ship the initial version. The most likely future expansion is a larger curated catalog or richer preset-specific narrative overrides, but neither is necessary for the current feature to work end to end.

## Context and Orientation

The blueprint route is served from `apps/web/app/(workspace)/blueprint/page.tsx`, which preloads the workspace state and mounts `apps/web/features/blueprint-flow/components/blueprint-page.tsx`. That page reads the canonical blueprint facts through `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts` and renders the Design section according to `apps/web/features/blueprint-flow/lib/blueprint-page-sections.ts`. The Design section itself is currently driven by the `theme_preset` field inside `apps/web/features/blueprint-flow/components/blueprint-stage-step-field.tsx`, which special-cases that field and delegates to `apps/web/features/blueprint-flow/components/blueprint-theme-configurator.tsx`.

The configurator currently works only at the shadcn preset-code level. It decodes a preset string through `apps/web/features/blueprint-flow/lib/blueprint-theme-helpers.ts` and shows the live starter preview via `apps/web/features/blueprint-flow/components/blueprint-theme-preview.tsx`. This is already valuable because it previews the actual starter theme, but it does not give the customer a named inspiration source.

The canonical blueprint fact model lives in `packages/blueprint-compiler/src/canonical-project-definition/schema.ts`, and all persisted facts are normalized through `packages/blueprint-compiler/src/canonical-project-definition/derived-blueprint-facts.ts`. The current design pipeline expects a single `theme_preset` string plus optional `design_references`. The compiler then resolves the preset through `packages/blueprint-compiler/src/design-system/preset-design-system.ts`, builds the generated design-system object in `packages/blueprint-compiler/src/design-system/generated-design-system.ts`, and writes one root `DESIGN.md`, one machine-readable design snapshot, and one generated runtime config through `packages/blueprint-compiler/src/repo-generation/render-generated-design-system-files.ts`.

The field metadata is duplicated across package boundaries. `packages/blueprint-compiler/src/stages/stage-definitions.ts` controls which fields appear in the Design step, `packages/blueprint-presentation/src/index.ts` controls field labels and helper copy, and `packages/ship-by-sunday-cli/src/field-contract.ts` plus `packages/ship-by-sunday-cli/src/blueprint-derivation.ts` maintain a simplified parallel model for the CLI and import paths. Any new design selector must either update those surfaces or explicitly document why one of them is intentionally left unchanged.

The external source material is not part of this repository. The linked GitHub repository is only a human-readable directory, while the actual importable markdown is hosted on `getdesign.md`. Because the external corpus is not under repository control, the implementation must vendor the important information into this repo. The recommended shape is one compiler-owned catalog module that contains trusted metadata and a corresponding set of repository-owned preview screenshots stored under the web app’s public assets. The screenshots are used only for the `/blueprint` experience; the compiler continues to generate one final `DESIGN.md` from structured facts.

Logo discovery should use the documented SVGL API, not manual copying from arbitrary sites. The relevant documented endpoints are `https://api.svgl.app?search=<term>` for search and the `route` or `wordmark` values returned in the SVG records. Because the API can return either a direct string URL or a `{ light, dark }` object, the curation flow must choose the right mark for this product’s light-mode-first selector UI and save that chosen mark into repository-owned public assets.

The homepage has its own contract and cannot be treated as free-form marketing copy. The control plane lives in `apps/web/config/product.ts`, the default copy and assets live in `apps/web/features/marketing/content/home.ts`, and the behavioral seam lives in `apps/web/features/marketing/lib/home-page-render-model.ts`. If this feature becomes part of the public product promise, those files and their matching tests must change together so the visible section content, CTA logic, and structured data remain truthful.

This plan uses the phrase “preset provenance” to mean the record of where the current generated design came from. In this repository that should be a small structured field on the generated design-system output that can say whether the active result came from a curated catalog preset, a user-customized preset, or the legacy default. Provenance is useful because the generated repo guidance, debugging, and future improvements become easier when the output can explain which starting preset was selected.

## Plan of Work

The implementation should begin by creating a compiler-owned preset catalog that sits above the existing `theme_preset` string. This catalog must live in `packages/blueprint-compiler/src/design-system/` so both the compiler and the blueprint UI can import the same ids, labels, summaries, preset codes, and external reference URLs. The catalog should not attempt to mirror the full external corpus. It should contain only the first eight curated presets, each with enough structured information to seed blueprint facts truthfully.

Once the catalog exists, the canonical blueprint facts should gain a new `design_preset_id` field. This new field is the human-facing selector. It must not replace `theme_preset`; instead, derivation should use `design_preset_id` to seed or default `theme_preset`, `design_references`, and a few narrative design facts when those facts are otherwise blank. Because this work is greenfield for product data, the main requirement is a clean default for newly created workspaces rather than a legacy restoration mode.

After the data model is in place, the `/blueprint` Design section should be upgraded in one place: `apps/web/features/blueprint-flow/components/blueprint-theme-configurator.tsx`. The new selector should appear above the current theme/style/font controls and should use a getdesign-like visual treatment: brand logo, strong name, category or one-line descriptor, and short summary in the option rows and selected state. The component should render two previews together: an inspiration preview card backed by a local static screenshot for the selected preset, and the existing live starter preview that reflects the current `theme_preset` code. The state machine must stay simple and explicit: selecting a curated preset reseeds the editable `theme_preset` and any preset-seeded companion facts, then the user customizes from there; the implementation must not try to merge the newly selected preset with prior manual overrides.

The generated compiler output should remain singular. `packages/blueprint-compiler/src/design-system/generated-design-system.ts` should learn how to include preset provenance and any preset-seeded narrative facts, but it must still render one final root `DESIGN.md`. `packages/blueprint-compiler/src/repo-generation/render-generated-design-system-files.ts` should continue to emit exactly one `DESIGN.md`, one design-system JSON artifact, and one runtime config file. Nothing in this work should introduce multi-theme runtime switching in the generated starter.

The plan should finish by adding tests across the compiler, blueprint flow, and homepage surfaces, then running the repository-required quality gates from the root. Only after all of that is stable should the catalog be expanded beyond the first eight presets.

## Milestones

Milestone 1 creates the curated preset catalog and the static preview asset contract. At the end of this milestone, the repository contains one compiler-owned preset definition module with eight stable ids, labels, summaries, preset codes, design-reference URLs, and internal preview image paths, and the web app has matching local preview screenshots for those ids. Success is visible when a unit test can import the catalog, confirm that all eight presets are valid, and verify that no entry points at a missing preview asset or a broken raw DESIGN.md URL placeholder.

Milestone 2 extends canonical blueprint facts and derivation with a human-facing preset selector. At the end of this milestone, `design_preset_id` exists in the canonical schema, step definitions and presentation copy know about it, the CLI remains compatible, and derivation can turn a catalog preset into the appropriate default `theme_preset`, `design_references`, and narrative design facts when those fields are blank. Success is visible when compiler tests show that choosing `vercel` or `notion` results in different resolved design-system outputs even before manual knob overrides are applied.

Milestone 3 upgrades the `/blueprint` Design section UI so preset selection and preview become first-class. At the end of this milestone, a customer can open `/blueprint`, use a logo-led dropdown to switch between the eight curated presets, see a richer selected-preset card that mirrors the getdesign information hierarchy, see a local inspiration screenshot update, open the full hosted preview or raw DESIGN.md in a new tab, and still use the existing shadcn controls to customize the generated starter preview. Success is visible when the page behaves this way in the browser and unit or integration UI tests cover the selection and save flow.

Milestone 4 teaches the compiler to report preset provenance and keeps the generated output singular. At the end of this milestone, the generated design-system JSON and `apps/web/config/generated-design-system.ts` can report whether the final result came from a catalog preset, a customized preset, or the legacy default, while the generated starter repo still contains only one active `DESIGN.md`. Success is visible when snapshot or string tests prove that the generated output mentions the chosen preset and still renders a coherent final design system instead of exposing raw catalog mechanics.

Milestone 5 updates the landing page so this capability becomes part of the public product story. At the end of this milestone, the homepage copy or section content truthfully tells a buyer that Ship by Sunday includes curated design-direction selection with preview inside the blueprint flow. Success is visible when the homepage render model, content, and tests all agree on that story and the public page shows it without breaking the current CTA or section contract.

Milestone 6 validates the full workflow end to end. At the end of this milestone, a human can save a preset selection on `/blueprint`, continue to `/review`, download the repo, inspect the generated `DESIGN.md`, and start the app with the expected theme. They can also read the homepage and see that this capability is represented there as part of the offer. Success is visible when targeted tests pass, browser interaction confirms the preview story, homepage checks pass, and the repository-wide `bun run format`, `bun run lint`, and `bun run typecheck` commands all succeed.

## Concrete Steps

Start from the repository root and keep all commands there unless a step explicitly changes directories.

Create the preset catalog in `packages/blueprint-compiler/src/design-system/design-preset-catalog.ts`. Each catalog entry should include the stable preset id, display label, short summary, category, shadcn `presetCode`, raw DESIGN.md URL, hosted preview page URL, repository-local preview image path, and a repository-local logo path that the blueprint UI can render in both the dropdown rows and the selected-preset summary card. Use these eight ids for the first version:

    vercel
    linear
    notion
    stripe
    supabase
    framer
    raycast
    cursor

The preview image path should point at a repository-owned static asset route such as `/blueprint/design-presets/vercel.png`. Store the actual images under the web app public assets in a matching folder. Do not rely on remote screenshots at runtime.

Source the logo assets through the SVGL API during curation. The simplest repeatable lookup flow is:

    curl 'https://api.svgl.app?search=vercel'

Choose the returned `wordmark` when it exists and suits the selected-state card, otherwise use `route`. If the response uses a `{ light, dark }` object, prefer the `light` asset for this light-mode-first selector UI unless the mark becomes illegible on the chosen surface, in which case store a repository-owned adjusted variant. Download the selected SVG into the web app public assets so runtime rendering never depends on SVGL availability.

After the catalog exists, update `packages/blueprint-compiler/src/canonical-project-definition/schema.ts` to add `design_preset_id` as an optional draft fact and a required or derived fact only when that proves necessary. Then update the save and formatting helpers in `packages/blueprint-compiler/src/blueprint-field-helpers.ts`, the blueprint step inventory in `packages/blueprint-compiler/src/stages/stage-definitions.ts`, and the field labels and helper copy in `packages/blueprint-presentation/src/index.ts` so the new field can round-trip through blueprint form drafts without affecting unrelated sections.

Update `packages/ship-by-sunday-cli/src/field-contract.ts` and `packages/ship-by-sunday-cli/src/blueprint-derivation.ts` deliberately. The CLI does not need the full curated browser, but it must remain compatible with the new field and should preserve or pass through `design_preset_id` when present in imported facts. For CLI-created drafts, it is acceptable to seed the same repository default that the web flow uses. Do not leave the CLI slice to fail implicitly after the schema changes.

Update `packages/blueprint-compiler/src/canonical-project-definition/derived-blueprint-facts.ts` so derivation works in this order. First, if `design_preset_id` exists and maps to a known catalog preset, seed the derived defaults from that preset. Second, if the customer has manually edited `theme_preset` or related design facts, preserve those edits. Third, if nothing exists, fall back to the current default behavior. This step must not silently erase manual knob changes after a preset has been chosen, and it must define the exact provenance rule: if `design_preset_id` points at a curated preset and the saved `theme_preset` still matches that preset’s seed, the source is `catalog`; if `design_preset_id` points at a curated preset but the saved `theme_preset` differs, the source is `customized_catalog`; if there is no curated preset id during development or tests, the source should resolve to the normal default path rather than a special customer-facing recovery mode.

Extend `packages/blueprint-compiler/src/design-system/generated-design-system.ts` to include preset provenance. A small shape such as `selection: { presetId?: string; source: "catalog" | "customized_catalog" | "custom_code" | "legacy_default" }` is enough. Keep the rest of the generated design-system object singular.

Implement the new UI inside `apps/web/features/blueprint-flow/components/blueprint-theme-configurator.tsx`. Add a preset dropdown above the current control grid. The dropdown rows should show the preset logo, name, and one-line summary so the menu feels like a visual picker rather than a generic select. Under that dropdown, render a selected-preset summary card with the logo, name, category, summary, and outbound links, then a two-column preview block where the left side is an inspiration preview card backed by the local static screenshot and the right side is the existing `BlueprintThemePreview`. The inspiration card should also include links to the hosted full preview page and the raw DESIGN.md URL for the selected preset.

Do not create page-level state for this feature in `apps/web/features/blueprint-flow/components/blueprint-page.tsx`. Keep the state flowing through the existing field architecture in `apps/web/features/blueprint-flow/components/blueprint-stage-step-field.tsx` and `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts`. The new dropdown should still write through the canonical facts system, not around it.

Add any UI-facing helper functions to feature-local files under `apps/web/features/blueprint-flow/lib/` or `apps/web/features/blueprint-flow/components/` so the blueprint flow remains feature-organized. Do not introduce a top-level shared `utils` bucket.

Once the blueprint flow and compiler behavior are stable, update the homepage contract files in this order: `apps/web/config/product.ts` only if a new or existing section needs control-plane changes, then `apps/web/features/marketing/content/home.ts` for the actual public copy, then `apps/web/features/marketing/lib/home-page-render-model.ts` if any new behavior or section wiring is needed. Prefer changing existing section copy over adding a brand-new homepage section unless the current structure cannot carry the story cleanly. The homepage should sell the capability as “choose a curated design direction and preview it inside the blueprint flow” or equivalent truthful language. Do not imply that customers are browsing arbitrary third-party DESIGN.md files live at runtime, and do not imply runtime theme switching inside the generated starter app.

Add tests as each slice lands. For compiler work, add or extend tests under `packages/blueprint-compiler/tests/` to cover catalog lookup, derivation precedence, and generated design-system provenance. For web work, add or extend tests under `apps/web/tests/unit/` and `apps/web/tests/integration-ui/` to prove that selecting a preset updates the preview and saves the expected fields.

For the homepage slice, add or extend the tests named in `apps/web/content/docs/configure-the-homepage.mdx`, especially `apps/web/tests/unit/home-page-content.test.ts`, `apps/web/tests/unit/home-page-render-model.test.ts`, and any integration or browser-smoke test whose assertions need to reflect the new public-facing capability.

Once the implementation is complete, run the narrowest relevant checks first:

    cd /Users/parkerrex/Developer/ship-by-sunday
    bun run --cwd packages/blueprint-compiler format:check
    bun run --cwd packages/blueprint-compiler lint
    bun run --cwd packages/blueprint-compiler typecheck
    bun run --cwd packages/blueprint-compiler test

Expected observation: compiler checks pass and tests prove that a known preset id produces the intended seeded design-system output.

Then validate the web slice:

    cd /Users/parkerrex/Developer/ship-by-sunday
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web test:unit
    bun run --cwd apps/web test:integration:ui

Expected observation: the blueprint Design section tests pass and the new preview UI does not break the page.

If homepage copy or section behavior changes, also run the targeted homepage checks from the repository root:

    cd /Users/parkerrex/Developer/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/home-page-primary-cta.test.tsx

Expected observation: homepage content and render-model tests still pass, and the public page remains truthful about visible sections and CTA behavior.

Finish with the repository-required gates:

    cd /Users/parkerrex/Developer/ship-by-sunday
    bun run format
    bun run lint
    bun run typecheck

Expected observation: all three commands exit successfully. If any command fails because of unrelated changes in the working tree, record the exact failure and the affected files in this plan before stopping.

## Validation and Acceptance

The acceptance story for this feature is behavioral, not structural. A customer signs into the product, opens `/blueprint`, scrolls to the Design section, opens the preset dropdown, chooses `Vercel`, and immediately sees a local screenshot-based inspiration preview plus the live starter preview update. The customer then changes a knob such as font or radius, saves, and continues to `/review`. When they download the generated repo, the root contains one `DESIGN.md` and one design snapshot JSON that reflect the selected preset plus the customer’s final overrides rather than a raw untouched template. Separately, a buyer visiting the public homepage can understand that this curated design-direction selection and preview capability is part of the product, because the homepage now names it in the offer without overstating what the generated starter actually does.

The first proof should be local browser behavior. Run the app from the repository root with `bun run dev:web` or the broader stack with `bun run dev:core`, open the authenticated blueprint flow, and verify that switching between at least two presets changes the inspiration preview, summary, external links, and saved facts without requiring a page refresh. If browser-based QA becomes necessary for sign-in or protected-route behavior, use the repository QA path only after the targeted unit and integration checks pass.

Compiler acceptance requires automated evidence that `design_preset_id` actually changes the generated output. At minimum, tests should prove that `vercel` and `notion` resolve to different initial design-system snapshots, that manual `theme_preset` overrides still win when present, and that a missing or unknown preset id falls back to the safe default without crashing older drafts.

Web acceptance requires automated evidence that the Design section still saves canonically through the existing field pipeline. Tests should prove that selecting a preset writes the expected fact values, that switching from one curated preset to another deterministically reseeds the live editable theme state, that re-opening the page restores the selected preset, and that the selected-preset card shows the expected logo and summary.

Homepage acceptance requires automated evidence that the public story stays truthful. Tests should prove that the homepage content includes the new capability in the intended section, that the render model still matches the visible section contract, and that structured data or CTA behavior do not drift just because the copy changed.

Final completion requires the repository-wide quality gates named above. The work is not done if `bun run format`, `bun run lint`, or `bun run typecheck` are skipped without an explicit blocker recorded here.

## Idempotence and Recovery

This feature should be implemented additively so the repository stays runnable throughout the work. The preset catalog can land before the schema changes, and the schema changes can land before the UI uses them. If a partial implementation leaves the UI unable to restore older drafts, stop and restore backward compatibility before moving forward. Backward compatibility here means that a workspace containing only `theme_preset` and `design_references` still renders a usable Design section and still generates a valid `DESIGN.md`.

If a preview screenshot is missing or looks wrong, do not block the rest of the pipeline on remote fetching. Replace the broken asset with a corrected local screenshot and rerun the targeted web tests. If a logo lookup via SVGL produces an unsuitable mark, choose a better returned variant or manually vendor a corrected local asset while keeping the catalog entry stable. If a catalog entry turns out to have a dead upstream page or a misleading summary, keep the local preset id stable, correct the metadata in the catalog, and add a `Surprises & Discoveries` note describing the fix.

If a schema or derivation change causes draft parsing failures during implementation, the recovery move is to make `design_preset_id` optional again at the draft level and restore the current `theme_preset` default path before attempting the richer behavior. If generated-output tests fail because the new preset provenance changes snapshots unexpectedly, update the snapshots only after verifying that the new output still contains one final design system and not a leaked internal catalog representation.

Because this work touches protected product flows, avoid deleting or rewriting unrelated blueprint facts. The safest retry path is to re-run the targeted compiler and web validations after each milestone rather than stacking large unverified edits.

## Artifacts and Notes

The current codebase already contains the strongest reusable preview primitive we need for the right-hand side of the new preview block:

    apps/web/features/blueprint-flow/components/blueprint-theme-preview.tsx

The strongest existing compiler boundary for keeping output singular is:

    packages/blueprint-compiler/src/repo-generation/render-generated-design-system-files.ts

The existing root-level gate commands confirmed by `.docs/scripts.md` are:

    bun run format
    bun run lint
    bun run typecheck

The external source is trustworthy enough to curate but not to depend on dynamically. The raw DESIGN.md route pattern confirmed during research is:

    https://getdesign.md/design-md/<slug>/DESIGN.md

The human preview page pattern confirmed during research is:

    https://getdesign.md/<slug>/design-md

The documented logo lookup source is SVGL:

    https://svgl.app/docs/api
    https://api.svgl.app?search=<term>

The validations completed during implementation were:

    bun run --cwd packages/blueprint-compiler test
    bun run --cwd packages/blueprint-presentation test
    bun run --cwd packages/ship-by-sunday-cli typecheck
    bun run --cwd packages/ship-by-sunday-cli test
    bunx vitest --config vitest.config.ts run --project unit tests/unit/use-blueprint-page-state.test.tsx tests/unit/home-page-content.test.ts tests/unit/blueprint-step-save-feedback.test.ts
    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/blueprint-page.test.tsx
    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/home-page-primary-cta.test.tsx
    bun run sbs:check
    bun run format:check
    bun run lint
    bun run typecheck

After the adversarial review fixes landed, the same high-value validations were rerun successfully:

    bun run --cwd packages/blueprint-compiler test
    bun run --cwd packages/ship-by-sunday-cli test
    bunx vitest --config vitest.config.ts run --project unit tests/unit/use-blueprint-page-state.test.tsx
    bun run test:unit
    bun run test:integration:ui
    bun run sbs:check
    bun run typecheck

## Interfaces and Dependencies

The compiler package must expose the curated preset catalog in a stable form so both the compiler and the web app can import the same ids and metadata. The likely public interface belongs in `packages/blueprint-compiler/src/index.ts` and should export the catalog array, a lookup map or helper such as `getDesignPresetDefinition(id)`, and any small shared types needed by the UI.

The canonical fact model in `packages/blueprint-compiler/src/canonical-project-definition/schema.ts` must gain `design_preset_id` in a way that preserves older drafts. The derivation layer in `packages/blueprint-compiler/src/canonical-project-definition/derived-blueprint-facts.ts` must remain the only place that decides how preset defaults seed `theme_preset`, `design_references`, and related narrative fields. No page-level component should duplicate that logic.

The blueprint UI must continue to use the existing field-save boundary in `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts` and the field renderer in `apps/web/features/blueprint-flow/components/blueprint-stage-step-field.tsx`. This keeps the feature inside the current canonical save architecture and prevents a second unsaved-preview state machine from appearing in `apps/web/features/blueprint-flow/components/blueprint-page.tsx`.

The preview requirement adds two static-asset dependencies: repository-owned screenshots and repository-owned logos stored under the web app public assets and referenced by catalog metadata. The logo curation flow depends on the public SVGL API during asset preparation, but the runtime product must render only the repository-owned copies. These assets are part of the user-facing feature and should be treated as intentional product assets, not temporary placeholders.

The generated design-system output in `packages/blueprint-compiler/src/design-system/generated-design-system.ts` remains singular by design. Any new provenance or preset-label fields added there must support the final generated `DESIGN.md` and JSON artifacts without turning them into a catalog browser or leaking implementation-only catalog details into the customer-facing output.
