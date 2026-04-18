---
summary: Compile a customer-facing root DESIGN.md and starter theme output from the blueprint page's shadcn preset so downloaded repos ship with a portable design system instead of generic fallback prose.
read_when: Open this plan when changing the blueprint design step, the blueprint compiler, or the generated starter repo so customer theme selections become real design-system output.
plan_status: done
---

# Compile Customer DESIGN.md From Blueprint Theme Presets

This document is a living execution plan. It must stay current as research, implementation, validation, and follow-up decisions evolve.

Maintain this ExecPlan in accordance with `.plans/PLANS.md`.

## Purpose / Big Picture

Today the `/blueprint` page lets a customer choose a rich shadcn preset, but the compiler only carries that choice forward as a stored preset code and some generic design copy. After this change, a customer who chooses a theme on `/blueprint` and downloads the starter repo will receive a repo that contains a root `DESIGN.md`, a structured design snapshot, and starter app theme output that all reflect the chosen preset and product context. A human can prove the work by choosing a distinct preset on `/blueprint`, downloading the generated repo, opening the root `DESIGN.md`, then starting the app and seeing the chosen color, radius, font, and surface treatment applied consistently.

## Progress

- [x] 2026-04-06 13:50 ET: Reviewed `.plans/PLANS.md`, the blueprint theme intake, the compiler’s current design-pack rendering, and the generated starter repo path.
- [x] 2026-04-06 14:05 ET: Confirmed that `apps/web/features/blueprint-flow/components/blueprint-theme-configurator.tsx` stores a full encoded shadcn preset through the canonical `theme_preset` fact and that `apps/web/features/blueprint-flow/lib/blueprint-theme-tokens.ts` already derives semantic CSS variables from that preset.
- [x] 2026-04-06 14:20 ET: Verified the relevant external patterns. Stitch documents `DESIGN.md` as a portable design artifact that ships with exports, and shadcn v4 documents presets as a compact carrier for colors, base color, icon library, fonts, and radius.
- [x] 2026-04-06 14:45 ET: Confirmed that the canonical fact schema already contains design-oriented fields such as `visual_thesis`, `content_plan`, `interaction_thesis`, `design_tokens`, `typography_direction`, `imagery_direction`, `layout_direction`, `existing_system_mode`, `hero_goal`, `proof_strategy`, `section_narrative`, and `copy_tone`, but the current `/blueprint` design step only collects `theme_preset` and `design_references`.
- [x] 2026-04-06 15:22 ET: Created a shared preset-derivation module in `packages/blueprint-compiler/src/design-system/` and switched the blueprint preview to consume it via the compiler package.
- [x] 2026-04-06 15:24 ET: Codified the first-pass fact model in code by deriving design-facing facts from the current page inputs and keeping `/blueprint` unchanged.
- [x] 2026-04-06 15:25 ET: Kept new blueprint design inputs out of first pass and recorded them as a follow-up only if the generated output proves too generic.
- [x] 2026-04-06 15:25 ET: Rendered a generated customer root `DESIGN.md`, `docs/facts/design-system.json`, and `apps/web/config/generated-design-system.ts` into the starter repo output.
- [x] 2026-04-06 15:25 ET: Shaped the generated `DESIGN.md` around the compact top context block using `Users`, `Brand Personality`, `Aesthetic Direction`, and `Design Principles`.
- [x] 2026-04-06 15:26 ET: Applied the generated design snapshot to the app shell through `apps/web/app/layout.tsx`, `apps/web/app/globals.css`, and `apps/web/app/manifest.ts`.
- [x] 2026-04-06 15:26 ET: Updated generated starter guidance so root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`, and generated `apps/web/AGENTS.md` point contributors at `DESIGN.md`.
- [x] 2026-04-06 15:26 ET: Added the optional Impeccable consumer note to the generated guidance rather than making it a build dependency.
- [x] 2026-04-06 15:26 ET: Curated and shipped a small compiler-owned anti-pattern bank in the generated `Do’s and Don’ts` section.
- [x] 2026-04-06 15:28 ET: Validation passed for compiler checks, app unit checks, and the required repo-level `bun run format`, `bun run lint`, and `bun run typecheck` gates.
- [x] 2026-04-06 16:08 ET: Fixed the local `/api/download/repo` route so the real browser flow can download the generated starter archive from `/review` without a `500`. Verified the route through the browser with the entitled QA account and confirmed the returned zip contains `DESIGN.md`, `docs/facts/design-system.json`, `apps/web/config/generated-design-system.ts`, and the shipped prompt pack files.

## Surprises & Discoveries

The blueprint flow already captures far more design signal than the current compiler uses. The `theme_preset` field on `/blueprint` is not merely a theme color; it encodes the theme accent, neutral base color, font, radius, icon library, menu accent, menu color, and style treatment. This is visible in `apps/web/features/blueprint-flow/components/blueprint-theme-configurator.tsx`, `apps/web/features/blueprint-flow/lib/blueprint-theme-helpers.ts`, and `apps/web/features/blueprint-flow/lib/blueprint-theme-tokens.ts`.

The current compiler does not consume that richness. The design pack renderer in `packages/blueprint-compiler/src/blueprints/render-design-blueprint.ts` only emits `docs/design/AGENTS.md`, `CHECKLIST.md`, `PLANS.md`, and `documentation.md`, and the compiler still loads only the neutral OpenAI templates through `packages/blueprint-compiler/src/server/template-loader.ts`. There is no generated `DESIGN.md`, no generated starter theme config, and no starter-repo instruction telling future agents to consult a customer-specific design system.

The generated starter repo already has one clean global theme boundary. `apps/web/app/globals.css` maps semantic CSS variables like `--background`, `--primary`, `--sidebar`, and `--radius` into the utility system, and `apps/web/app/layout.tsx` is the obvious place to inject generated font or token output. This means the theme can be customized centrally without rewriting many components.

The Tailwind v4 radius utilities already flow through the semantic radius scale declared in `apps/web/app/globals.css`. That meant the generated `--radius` token could change button, card, and control rounding without rewriting individual components.

The first real browser download attempt exposed a live route bug that unit tests had not covered. `apps/web/features/blueprint-flow/server/downloads.ts` was reparsing `projectDefinition.facts` as already-canonical facts with `canonicalProjectFactsSchema.parse(...)`, which broke local `/api/download/repo` requests because the authenticated workspace query returns draft facts. Passing the draft facts directly into `createCanonicalProjectDefinition(...)` fixed the route and preserved the intended compiler derivation path.

Shadcn’s current v4 behavior confirms that a preset is meant to carry design-system configuration across tools and projects. Their docs describe `--preset` as packing colors, fonts, icon library, and radius into one string, and their theming docs center the system on semantic CSS variables. Stitch’s `DESIGN.md` docs confirm the pattern we want: a human-readable artifact backed by structured values, exported with the project, but they do not require Google’s visual style.

## Decision Log

Decision: Copy the `DESIGN.md` artifact pattern, not Google’s aesthetic language.
Rationale: The user explicitly rejected Google’s visual style. The useful part of Stitch is the portable design-system document and the export behavior, not the Material look.
Date: 2026-04-06

Decision: Treat the current repo root `DESIGN.md` and the generated customer root `DESIGN.md` as different artifacts with different audiences.
Rationale: The existing root `DESIGN.md` is Ship by Sunday’s own visual contract for building this product. A generated repo needs its own root `DESIGN.md` derived from customer inputs. Merging those concerns would make both artifacts less truthful.
Date: 2026-04-06

Decision: The compiler must own the canonical preset-to-design-system derivation.
Rationale: The downloaded repo, the generated docs, and the starter app must all agree. If derivation lives only inside `apps/web`, the compiler remains blind and the generated output stays generic.
Date: 2026-04-06

Decision: The first shipped version should not add new blueprint design inputs unless the generated `DESIGN.md` is demonstrably too generic with the current page inputs.
Rationale: The existing page already asks users to choose a rich shadcn preset and optional design references. The user explicitly pushed back on adding more design affordances. The safest scope is to compile the first-pass design system from what the page already collects, then revisit extra inputs only if the output quality proves insufficient.
Date: 2026-04-06

Decision: Reuse the existing canonical design facts where possible before adding brand-new ones.
Rationale: The schema already contains many design-shaping fields, but the current intake path ignores them and resets them to baseline defaults. The first design-modeling step should be to classify those existing fields into surfaced, derived, and internal buckets instead of casually introducing parallel fields.
Date: 2026-04-06

Decision: When a latent design fact can be truthfully resolved from existing inputs, prefer compiling it into the generated `DESIGN.md` over exposing it as another separate blueprint question.
Rationale: The blueprint form should stay compact. The generated `DESIGN.md` is the right place to hold resolved tone, principles, and direction as long as those sections are derived honestly from the preset, product facts, and a very small amount of explicit design context.
Date: 2026-04-06

Decision: If automation is added for reapplying presets in the generated repo, prefer a Bun script over a shell script.
Rationale: The repository standard is Bun for JavaScript. A Bun script can parse JSON safely, choose between safe modes, and remain cross-platform. A shell wrapper is acceptable only for a tiny convenience alias and should not contain the business logic.
Date: 2026-04-06

Decision: A preset reapplication helper is not part of the first pass.
Rationale: The primary deliverable is a truthful generated `DESIGN.md` and a starter repo that already uses the selected design system. The helper adds useful maintenance ergonomics, but it is not required to prove the core value and it widens scope while the design-derivation path is still being established.
Date: 2026-04-06

Decision: The generated starter repo must mention the generated root `DESIGN.md` in its top-level guidance files.
Rationale: The artifact only matters if future contributors and coding agents are directed to use it. The generated repo already emits generalized `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `README.md`, so the plan should update those files to make `DESIGN.md` part of the normal workflow.
Date: 2026-04-06

Decision: Mention Impeccable as an optional downstream design-skill consumer, not as a required build dependency.
Rationale: Impeccable is useful as an example of a design-skill system that benefits from a good `DESIGN.md`, but the generated customer repo should remain self-sufficient and should not require any third-party skill pack to understand or apply its own design system.
Date: 2026-04-06

Decision: Borrow Impeccable’s anti-pattern and heuristic rule shape for generated `DESIGN.md`, but keep the actual rule set short, product-relevant, and compiler-owned.
Rationale: The public Impeccable site is strongest where it names concrete design anti-patterns and positive moves in plain language. That format is useful inside a generated `DESIGN.md` because it gives future agents high-signal guardrails. The generated repo should not inherit all of Impeccable’s worldview or command taxonomy.
Date: 2026-04-06

Decision: Borrow the compact context block shape from the local `.impeccable.md` file for the top of generated customer `DESIGN.md`.
Rationale: The local file’s `Users`, `Brand Personality`, `Aesthetic Direction`, and `Design Principles` sections are a better opening frame for agent-facing design context than a token dump alone. They provide high-signal narrative guidance while staying short enough to compile from blueprint inputs.
Date: 2026-04-06

Decision: Prefer simple curated UI affordances over open-ended design writing in the blueprint flow.
Rationale: The blueprint page already asks users to choose a shadcn preset visually. The rest of the design context should follow the same pattern: a small number of constrained, high-signal selections inspired by Impeccable’s heuristics. This yields more reliable compiler input and better generated `DESIGN.md` output than asking customers to write design strategy in prose.
Date: 2026-04-06

Decision: In the first implementation pass, do not surface `visual_thesis` or any other new design field on `/blueprint`.
Rationale: The current page already asks for `theme_preset` and `design_references`, and the user explicitly pushed back on widening the form. First pass should prove the compiler can synthesize a useful `DESIGN.md` from the current inputs before adding a guided direction field later.
Date: 2026-04-06

## Outcomes & Retrospective

The first-pass scope landed. Downloaded repo snapshots now contain a generated root `DESIGN.md`, a structured design snapshot at `docs/facts/design-system.json`, and a generated runtime config at `apps/web/config/generated-design-system.ts`. The tracked app shell now consumes the generated design system through `apps/web/app/layout.tsx`, `apps/web/app/globals.css`, and `apps/web/app/manifest.ts`, so the starter app actually uses the selected preset instead of merely documenting it.

The major lesson from implementation is that the existing `/blueprint` inputs were sufficient for a strong first pass once the compiler had a shared preset-derivation layer and a small anti-pattern bank. No extra design-step controls were required to deliver the core value. A later follow-up can still add one guided design-direction affordance if real generated outputs prove too generic, but that is not needed to resume this implementation.

## Context and Orientation

The customer-facing blueprint intake lives in `apps/web`. The `Blueprint` page is rendered by `apps/web/features/blueprint-flow/components/blueprint-page.tsx`, and the page sections are defined in `apps/web/features/blueprint-flow/lib/blueprint-page-sections.ts`. The `Design` section corresponds to the `theme_preset` and `design_references` fields defined in `packages/blueprint-compiler/src/stages/stage-definitions.ts` and surfaced through `packages/ship-by-sunday-cli/src/field-contract.ts`.

The actual preset selection control lives in `apps/web/features/blueprint-flow/components/blueprint-theme-configurator.tsx`. It decodes the stored preset, lets the user adjust the knobs, and writes back a preset code string. The current pure derivation logic for previewing the chosen preset lives in `apps/web/features/blueprint-flow/lib/blueprint-theme-helpers.ts` and `apps/web/features/blueprint-flow/lib/blueprint-theme-tokens.ts`. Those files derive semantic CSS variables, font family strings, and style metadata from the preset.

The canonical product facts are defined in `packages/blueprint-compiler/src/canonical-project-definition/schema.ts` and normalized in `packages/blueprint-compiler/src/canonical-project-definition/derived-blueprint-facts.ts`. Today those derived facts include `theme_preset`, `design_references`, `visual_thesis`, `design_tokens`, and related prose fields, but the prose is mostly generic fallback text.

The compiler’s generated design docs are assembled in `packages/blueprint-compiler/src/blueprints/render-design-blueprint.ts` and its templates are loaded in `packages/blueprint-compiler/src/server/template-loader.ts`. The full generated repo snapshot is materialized in `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts`. General starter files such as the generated root `AGENTS.md`, `CLAUDE.md`, and QA starter docs are emitted by `packages/blueprint-compiler/src/repo-generation/render-generalized-starter-files.ts`, while starter overrides such as `README.md` and generated product config live in `packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts`.

The starter app’s visual system is centered on semantic CSS variables declared in `apps/web/app/globals.css`. That file already defines `:root` and `.dark` tokens such as `--background`, `--primary`, `--sidebar`, and `--radius`, then maps them into Tailwind v4 `@theme inline` values. `apps/web/app/layout.tsx` is the single place to inject generated design data that must affect the full app shell.

The current shadcn project metadata is stored in `apps/web/components.json`, and `bunx --bun shadcn@latest info --json` confirms that the app uses `radix-nova`, Tailwind v4, CSS variables, and `lucide` icons. Shadcn’s current docs describe presets as a full design-system carrier and recommend semantic CSS variables as the theming layer.

## Plan of Work

First, move the preset-decoding and semantic-token derivation into a shared compiler-owned module that both the web app and the compiler can consume. This shared module must expose plain data rather than React-specific types so it can power both client preview code and server-side repo generation. The app preview code in `apps/web/features/blueprint-flow/lib/blueprint-theme-tokens.ts` will become a thin adapter over the shared derivation instead of the primary source of truth.

Second, audit the existing design-oriented canonical facts and decide which ones the blueprint flow should own directly. The schema already includes fields such as `visual_thesis`, `content_plan`, `interaction_thesis`, `design_tokens`, `typography_direction`, `imagery_direction`, `layout_direction`, `existing_system_mode`, `hero_goal`, `proof_strategy`, `section_narrative`, and `copy_tone`, but the current `/blueprint` design step only collects `theme_preset` and `design_references`. This milestone must classify those fields into four groups: fields that should be surfaced directly to the user, fields that should be derived from `theme_preset` plus existing answers, fields that should be compiled only into the generated `DESIGN.md`, and fields that should stay as internal defaults.

Third, keep the first implementation pass on the current design-step inputs: `theme_preset` and `design_references`. Use the existing product facts, the chosen preset, and a small compiler-owned anti-pattern bank to generate the first-pass `DESIGN.md`. Only revisit extra blueprint design inputs if that first pass proves too generic in actual generated output.

Fourth, introduce a compiler-level rendered design artifact for the starter repo itself. The compiler should emit a root `DESIGN.md` into the generated repo, plus a structured design snapshot file under a predictable path such as `docs/facts/design-system.json` or `apps/web/config/generated-design-system.ts`. The generated markdown should follow the Stitch-style structure that matters for agents, but it should open with a compact context block borrowed from the useful shape of `.impeccable.md`: `Users`, `Brand Personality`, `Aesthetic Direction`, and `Design Principles`. After that opening block, it should cover colors, typography, geometry, elevation, components, layout, motion, and do’s and don’ts. It should be written in Ship by Sunday’s own language and derived from customer inputs. This is also where many latent design facts should land when they do not deserve a dedicated intake field. The `Do’s and Don’ts` section should be informed by a short curated anti-pattern bank inspired by Impeccable’s public guidance, for example avoiding cards-on-cards, defaulting to dark-mode glow aesthetics, centering everything, or hiding critical functionality on mobile.

Fifth, wire the starter app to use the generated design snapshot. This should happen through one central theme boundary so that the chosen preset affects the actual downloaded app. The preferred path is to inject generated CSS variables and generated font data through `apps/web/app/layout.tsx` and a new `apps/web/config/generated-design-system.ts` file, leaving `apps/web/app/globals.css` as the semantic token bridge. The result should be that choosing a different preset changes the generated app’s color roles, radius, sidebar treatment, and typography without requiring component rewrites.

Finally, update tests and docs. Compiler tests should assert that the generated repo now contains the customer root `DESIGN.md`, the generated runtime design config, and starter guidance files that reference that root design artifact. Web tests should continue to prove that the blueprint theme preview derives the correct tokens. Validation must include the relevant compiler and app checks, plus a generated-repo proof that a chosen preset appears in docs, starter guidance, and runtime output. The generated docs should also include a short note that the root `DESIGN.md` can be used by external design-skill systems such as Impeccable, while remaining fully useful on its own.

## Milestones

Milestone 1 creates the shared preset derivation boundary. At the end of this milestone, there is one pure TypeScript module that accepts the stored shadcn preset code and returns a normalized design-system object that includes semantic color roles, typography data, geometry data, sidebar treatment, and human-readable labels. The blueprint preview should still render correctly, and the compiler should be able to import the same derivation without reaching into `apps/web`. Success is visible when unit tests show that changing `theme_preset` changes the normalized design-system output in predictable ways.

Milestone 2 audits and restructures the design fact model. At the end of this milestone, there is an explicit repository decision about which existing design-related canonical facts are surfaced, derived, compiled into the generated `DESIGN.md`, or kept internal. The first shipped version should preserve the current `/blueprint` design-step inputs unless actual generated output proves that one more input is necessary. Success is visible when the field model is codified in schema and derivation logic without breaking older drafts or widening the page prematurely.

Milestone 3 teaches the compiler to render a customer root `DESIGN.md` plus a structured design snapshot. At the end of this milestone, a dry run of the compiler should show a new root `DESIGN.md` in the generated repo and a machine-readable design snapshot next to the existing generated facts. Success is visible when snapshot or string tests prove that a chosen preset, the resolved design facts, the compact top context block, and a curated `Do’s and Don’ts` section appear in the rendered output.

Milestone 4 applies the generated design system to the starter app. At the end of this milestone, the downloaded starter app should no longer rely only on the tracked default tokens in `apps/web/app/globals.css`. Instead, it should consume generated token values and font settings. Success is visible when a generated repo built from a non-default preset renders with the chosen design traits and the app still passes its build and typecheck gates.

Milestone 5 finalizes repo guidance. At the end of this milestone, the generated root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `README.md` explicitly instruct future contributors to consult the generated root `DESIGN.md`. The generated docs also contain a short optional note explaining that external design-skill systems such as Impeccable can use the root `DESIGN.md` as their project design context. Success is visible when a fresh user can open the generated repo and identify the design source of truth immediately.

## Concrete Steps

Create a new plan branch from the current working tree and keep all edits scoped to the preset-to-design-system initiative.

From the repository root, inspect the current shadcn project context whenever the preset behavior needs to be re-verified:

    cd /Users/parkerrex/Developer/ship-by-sunday/apps/web
    bunx --bun shadcn@latest info --json

Expected observation: the output reports `style: radix-nova`, `tailwindVersion: v4`, `tailwindCss: app/globals.css`, and the installed component list. This confirms that the app uses semantic CSS variables and that preset-driven derivation should map cleanly onto the existing theme layer.

When implementing the shared derivation module, start by extracting the pure logic from `apps/web/features/blueprint-flow/lib/blueprint-theme-helpers.ts` and `apps/web/features/blueprint-flow/lib/blueprint-theme-tokens.ts` into a compiler-owned or shared workspace location. Keep the exported shape free of `React.CSSProperties` so both server and client code can consume it. Then update the app preview to call the shared module and adapt the result for React styling.

Before extending the canonical facts, audit the existing design-oriented ones already present in `packages/blueprint-compiler/src/canonical-project-definition/schema.ts`. In particular, review `visual_thesis`, `content_plan`, `interaction_thesis`, `design_tokens`, `typography_direction`, `imagery_direction`, `layout_direction`, `existing_system_mode`, `hero_goal`, `proof_strategy`, `section_narrative`, and `copy_tone`. The current CLI derivation path in `packages/ship-by-sunday-cli/src/blueprint-derivation.ts` simply copies baseline defaults for these values, so the first implementation task is to decide which of them should become real customer-driven data.

Use this proposed first-pass bucket model unless implementation reveals a better truth-preserving split:

    surfaced on /blueprint
      - theme_preset
      - design_references

    derived and persisted in canonical facts
      - visual_thesis
      - design_tokens
      - typography_direction
      - layout_direction
      - interaction_thesis
      - imagery_direction
      - existing_system_mode

    compiled into generated DESIGN.md but not necessarily surfaced as separate questions
      - content_plan
      - copy_tone
      - design principles
      - do's and don'ts
      - users
      - brand personality
      - aesthetic direction

    internal or marketing-oriented defaults
      - hero_goal
      - proof_strategy
      - section_narrative

This proposal intentionally reuses the existing `visual_thesis` fact instead of introducing a parallel `design_brief` field. In first pass, `visual_thesis` should be derived rather than surfaced. Only add a new or newly surfaced design field if implementation proves that the current page inputs cannot support a truthful generated `DESIGN.md`.

Do not add extra design-step controls in the first pass. In particular, avoid introducing abstract axes that overlap with the existing shadcn preset picker, such as “color energy,” and avoid vague labels like “motion feel” unless the UI can show what the choice means with real previews. If implementation later proves the current inputs are insufficient, the preferred follow-up is one guided `design direction` chooser with concrete example cards, not multiple abstract chips. That follow-up can compile into existing facts such as `visual_thesis`, `interaction_thesis`, `copy_tone`, and `layout_direction`.

When adding the generated customer root `DESIGN.md`, introduce a dedicated renderer in the compiler rather than trying to stuff the artifact into the existing `docs/design/*` pack. The root file should be part of the generated starter repo because future agents need it at the top level. Keep the current design pack docs, but treat them as implementation workflow material and the root `DESIGN.md` as the customer-facing visual source of truth.

Use this rough section order for the generated customer `DESIGN.md` unless implementation proves a better sequence:

    # Design System

    ## Users
    ## Brand Personality
    ## Aesthetic Direction
    ## Design Principles
    ## Colors
    ## Typography
    ## Geometry / Corners / Shape Language
    ## Elevation / Borders / Depth
    ## Component Stylings
    ## Layout / Spacing / Responsive Principles
    ## Motion / Interaction Notes
    ## Do's and Don'ts

This ordering deliberately combines the compact top context structure from `.impeccable.md` with the lower-level portable design-system sections needed for the starter repo and downstream coding agents.

Build a small compiler-owned anti-pattern bank for the generated `Do’s and Don’ts` section. Seed it from the public Impeccable guidance, but keep only the patterns that are broadly useful and generator-safe. Strong candidates include avoiding overused default fonts, avoiding cards on cards, avoiding identical card grids, avoiding decorative gradient text, avoiding default dark-mode glow aesthetics, preferring varied spacing rhythm, preferring asymmetry where appropriate, and not hiding key functionality on mobile. The generated rule set should remain short enough that a future agent can actually follow it.

When wiring the starter app theme, prefer one generated configuration file and one global injection boundary. A likely shape is a generated file such as `apps/web/config/generated-design-system.ts` plus a small layout helper that emits the chosen token values and font link or font class. Do not duplicate the full token map in multiple places. The semantic layer in `apps/web/app/globals.css` should remain the bridge that components already use.

Keep the generated repo guides truthful. Update the generated root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `README.md` so they instruct future work to read the root `DESIGN.md` before layout, styling, theming, or component changes. The wording should be generic starter guidance, not Ship by Sunday operator-only language. Where useful, include a one-sentence note that the same `DESIGN.md` can also be fed into external design-skill systems such as Impeccable for later polish work.

## Validation and Acceptance

Before implementation, the acceptance target is this observable story: a customer chooses a distinctive preset on `/blueprint`, optionally adds design references, reaches Review, downloads the repo, opens the repo root, sees a customer-specific `DESIGN.md`, and can run the app with that visual system already active.

During implementation, use the narrowest relevant checks first. For compiler-only slices, run:

    cd /Users/parkerrex/Developer/ship-by-sunday
    bun run --cwd packages/blueprint-compiler format:check
    bun run --cwd packages/blueprint-compiler lint
    bun run --cwd packages/blueprint-compiler typecheck
    bun run --cwd packages/blueprint-compiler test

Expected observation: all commands exit successfully and tests prove the generated file tree now contains the new design artifacts.

For blueprint-page or app theme boundary changes, run:

    cd /Users/parkerrex/Developer/ship-by-sunday
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web test:unit
    bun run --cwd apps/web test:integration:ui

Expected observation: the blueprint theme configurator tests still pass, and any added tests prove that the design step saves and displays the new context correctly.

For the full initiative, finish with the repository-required gates:

    cd /Users/parkerrex/Developer/ship-by-sunday
    bun run format
    bun run lint
    bun run typecheck

If any of these fail because unrelated workspace changes exist, document the exact failure and the blocking file in this plan before stopping.

The final human acceptance pass should generate a repo snapshot from a non-default preset, inspect the generated root `DESIGN.md`, inspect the generated design snapshot file, inspect the generated root guidance files to confirm they reference `DESIGN.md`, then start the generated app or inspect its theme config to confirm the chosen font, accent, radius, and sidebar treatment are reflected in runtime output.

## Idempotence and Recovery

All compiler changes should be additive and retry-safe. Rendering the generated repo multiple times with the same inputs must reproduce the same `DESIGN.md`, the same design snapshot, and the same starter theme output. Avoid time-dependent content inside generated files except where the existing compiler contract already requires timestamps.

When extracting shared derivation code, move logic first and keep adapters thin. If the web preview breaks after the extraction, restore the previous app adapter temporarily while keeping the new shared module in place, then compare token output side by side until the values match. This is safer than trying to rewrite the preview and the compiler in one unverified jump.

If the new design-context field causes draft parsing issues, make the field optional in the draft schema first, then tighten helper text and rendering behavior only after existing drafts continue to load. Never make a newly introduced design field block loading or downloading older saved blueprints.

If the generated starter app theme boundary proves too invasive for the first pass, keep the generated root `DESIGN.md` and structured design snapshot milestone, then land the runtime theme application in a follow-up slice. Do not fake success by claiming the starter repo is design-aware if the app itself still only uses the tracked defaults.

If a maintenance helper is ever added later, ship no helper rather than an unsafe one. A bad reapplication script can destroy local component edits. The generated repo is still valuable without it as long as the initial theme is already applied. The same rule applies to any shell wrapper: if it adds risk or ambiguity, omit it.

## Artifacts and Notes

Relevant repository evidence gathered before implementation:

    apps/web/components.json
      style: "radix-nova"
      tailwind.css: "app/globals.css"
      tailwind.cssVariables: true
      iconLibrary: "lucide"

    bunx --bun shadcn@latest info --json
      framework: Next.js 16.2.0
      tailwindVersion: v4
      base: radix
      style: radix-nova

Relevant external guidance distilled into repository terms:

    Stitch DESIGN.md pattern:
      DESIGN.md is a portable design-system document that should ship with the exported project and be readable by agents.

    shadcn v4 preset pattern:
      A preset carries design-system choices such as colors, fonts, icon library, and radius in one short code.

    Impeccable pattern:
      A separate design-skill system can use a project-level design artifact, but it should consume the repo’s own `DESIGN.md` rather than replace it. Its public anti-pattern format is also a good source for concise generated do/don’t rules.

Relevant local guidance distilled into repository terms:

    .impeccable.md pattern:
      A compact top context block using `Users`, `Brand Personality`, `Aesthetic Direction`, and `Design Principles` is a strong agent-facing preface before token-level rules.

Deferred follow-up, not first-pass scope:

    preset reapplication helper:
      A Bun helper that reapplies a stored shadcn preset may be useful later, but it is not required to prove the first-pass value of compiled `DESIGN.md` plus applied starter theme output.

Observed validation evidence after implementation:

    bun run --cwd packages/blueprint-compiler format:check
      passed

    bun run --cwd packages/blueprint-compiler lint
      passed

    bun run --cwd packages/blueprint-compiler typecheck
      passed

    bun run --cwd packages/blueprint-compiler test
      9 passed files, 25 passed tests

    bun run --cwd apps/web format:check
      passed

    bun run --cwd apps/web lint
      passed

    bun run --cwd apps/web typecheck
      passed after Next.js production build and TypeScript checks

    bun run --cwd apps/web test:integration -- tests/integration/blueprint-download-routes.test.ts
      passed

    browser proof
      signed in locally with the entitled QA account, opened `/blueprint`, continued to `/review`, and fetched `/api/download/repo` successfully with status 200 and a valid zip payload.

    bun run --cwd apps/web test:unit
      108 passed files, 412 passed tests

    bun run format
      passed

    bun run lint
      passed

    bun run typecheck
      passed

This plan intentionally excludes Google’s visual language. The imported idea is the artifact and workflow pattern only.

## Interfaces and Dependencies

The canonical persisted interface starts with `theme_preset` in `packages/blueprint-compiler/src/canonical-project-definition/schema.ts`. In the shipped first pass, that interface remained unchanged. No new canonical design field was added. The generated design system is derived from the existing page inputs, especially `theme_preset` and `design_references`, plus the existing product facts.

The shared derivation interface should accept the stored preset code and return a plain object that includes, at minimum, the normalized preset config, semantic token values, font metadata, radius metadata, style metadata, sidebar metadata, and human-readable summary fields. Both the compiler and the web app preview must consume this same object.

The compiler interface should gain a new rendered artifact for the generated starter repo root `DESIGN.md` and one machine-readable design snapshot file. The exact file path may be `docs/facts/design-system.json`, `apps/web/config/generated-design-system.ts`, or both, but the decision must leave one stable path that a future agent can find without guessing.

The starter app interface should gain one theme application boundary that can read generated design data and affect global tokens. The most likely dependency points are `apps/web/app/layout.tsx` and `apps/web/app/globals.css`. Keep semantic token names aligned with shadcn’s documented token set: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `sidebar-*`, and `radius`.

The generated starter guidance interface must include explicit references to the generated root `DESIGN.md` in `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `README.md`. Those references are part of the implementation contract because they determine whether future contributors and coding agents actually use the generated design system.
