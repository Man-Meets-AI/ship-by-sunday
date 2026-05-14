---
title: "T3 Code And Current UI Research"
summary: "Research pass comparing the T3 Code app design system with Ship by Sunday's current web-facing UI surfaces."
docType: "research_pass"
status: "active"
read_when:
  - "Re-entering the T3 Code design system port."
  - "Checking why this is a full visual-system replacement rather than a token patch."
---

# T3 Code And Current UI Research

## T3 Code Source

T3 Code's app design source lives under `/Users/bazelrex/Developer/t3code/apps/web`. The central file is `src/index.css`, which defines Tailwind v4 `@theme inline` tokens, class-based dark mode with `@custom-variant dark (&:is(.dark, .dark *))`, additive radius steps from a `0.625rem` base, semantic warning/success/info/destructive tokens, and the light/dark palettes. The visual center is DM Sans for UI text and an SF Mono stack for code.

The T3 Code shadcn config uses `style: "base-mira"`, `baseColor: "zinc"`, lucide icons, `rsc: false`, and an `@coss` registry. It is not compatible with Ship by Sunday's current `radix-nova` setup by configuration alone.

The reusable primitive layer lives in `src/components/ui`. Buttons, cards, inputs, selects, dialogs, menus, sheets, popovers, command, toast, tooltip, sidebar, form, fieldset, and related controls are implemented around `@base-ui/react` plus CVA recipes. The look comes from compact sizes, subtle borders, small shadows, controlled focus rings, blue primary accent, alpha-based muted surfaces, and dense layout rhythm.

The app shell uses `AppSidebarLayout`, `SidebarProvider`, resizable sidebars, `SidebarInset`, and a chat-centered workspace. `ChatView` and `ChatComposer` define the most important product surface: full-height `bg-background`, bordered top bar, message timeline, and a centered rounded composer with a `rounded-[22px]` outer shell and `rounded-[20px]` card interior. Settings use compact rows, uppercase micro-labels, rounded cards, and the same token system.

Theme state is handled by T3 Code's `useTheme.ts` and an inline pre-React boot script. The browser app can adapt this to `next-themes`, but the visual behavior still needs class-based `.dark`, anti-flash behavior, and matching token values.

Source evidence:

- `/Users/bazelrex/Developer/t3code/apps/web/src/index.css:1` imports Tailwind v4 directly; lines 3-5 define `dark` and window-control custom variants.
- `/Users/bazelrex/Developer/t3code/apps/web/src/index.css:7` starts the inline theme map; lines 34-40 derive additive radius tokens from `--radius`.
- `/Users/bazelrex/Developer/t3code/apps/web/src/index.css:86` starts the light token set; lines 96-107 set the blue primary and ring; lines 116-145 define the nested dark token set.
- `/Users/bazelrex/Developer/t3code/apps/web/src/index.css:147` sets DM Sans as the body font; lines 192-195 set the mono stack.
- `/Users/bazelrex/Developer/t3code/apps/web/src/index.css:181` adds the subtle fixed noise overlay; lines 210-234 define compact scrollbars.
- `/Users/bazelrex/Developer/t3code/apps/web/components.json:3` sets `style: "base-mira"`; lines 6-12 point shadcn at `src/index.css` with `baseColor: "zinc"`; line 13 selects lucide icons.
- `/Users/bazelrex/Developer/t3code/apps/web/package.json:16` depends on `@base-ui/react`; lines 48-59 show the Tailwind 4/Vite setup.
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/button.tsx:10` starts the T3 button recipe; lines 18-31 define compact sizes; lines 32-46 define default, outline, secondary, ghost, link, destructive, and destructive-outline treatments.
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/card.tsx:8` starts the card primitive; lines 24-90 add `CardFrame`; lines 92-180 define card header/title/panel/footer spacing and typography.
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/input.tsx:14` implements the input around Base UI; lines 56-70 render the wrapper that supplies the T3 border, focus, shadow, disabled, autofill, and dark-mode states.
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/sidebar.tsx:1` imports Base UI render helpers; lines 173-186 expose the resizable sidebar option; lines 262-309 render the desktop sidebar shell; lines 661-675 wrap content in the T3 scroll area; lines 759-780 define the menu button recipe.
- `/Users/bazelrex/Developer/t3code/apps/web/src/hooks/useTheme.ts:90` applies `.dark` and syncs browser chrome; lines 124-127 apply the stored theme immediately; lines 174-193 expose the hook contract.

## Current Ship By Sunday UI

Ship by Sunday's current global CSS defines Inter as `font-sans`, Berkeley Mono as mono/number font, Instrument Serif for H1s, Bebas Neue for wordmark-only usage, neutral color tokens, multiplicative radius steps, and separate `accent-info/state-success/state-warning` token names. The current root layout loads those fonts through `apps/web/src/app/fonts.ts`, applies them on `<html>`, imports Telegram widget CSS, imports Clerk and shadcn CSS, and injects a generated design-system style block from `apps/web/src/config/generated-design-system.ts`.

The shared primitives under `apps/web/src/components/ui` use Radix-style APIs, especially `asChild` and Radix `Slot`, rather than Base UI `render`. Shared filenames overlap with T3 Code, but the implementations are not equivalent.

The protected app uses a top-header `AppShell` plus optional local navigation rail. That is structurally different from T3 Code's sidebar-first shell. Codebase flow, existing-codebase worker setup/findings/doctor/runs/loops, tutorials, settings, admin, auth, and checkout surfaces all render through this current shell or route-local styling.

The public side has multiple route-local visual systems: homepage sections, public site header, starter/workers/service pages, docs CSS island, docs-specific theme cookie bridge, blog header/prose styles, and support widgets. Many of these still encode the old editorial serif design language.

The Telegram widget package is standalone and currently hardcodes much of its dark panel/launcher styling. It maps some CSS variables to host tokens, but it is not a clean T3 Code token bridge and does not automatically follow app primitive changes.

Current-source evidence:

- `apps/web/src/app/globals.css:40` starts the current inline theme map; lines 41-44 still make Inter/Berkeley the main font pair; lines 81-87 use multiplicative radius math instead of T3's additive scale.
- `apps/web/src/app/globals.css:90` starts current light tokens; lines 135-173 define current dark tokens; lines 214-217 put `font-sans text-sm` plus negative letter spacing on body.
- `apps/web/src/app/fonts.ts:1` loads local/Google fonts; lines 4-24 load Bebas, Instrument Serif, and Inter; lines 26-53 load Berkeley Mono; lines 55-60 apply all current variables.
- `apps/web/src/app/layout.tsx:21` builds generated design-system CSS; lines 72-75 inject it into the root document; lines 83-90 configure `next-themes` class mode.
- `apps/web/src/lib/generated-design-system-css.ts:22` renders root and dark CSS variables from generated design-system facts, which can override T3 token decisions.
- `apps/web/components.json:3` uses `radix-nova`, while `/Users/bazelrex/Developer/t3code/apps/web/components.json:3` uses `base-mira`.
- `apps/web/src/components/ui/button.tsx:7` starts the current Radix/Slot button recipe; lines 11-23 define variants that do not match the T3 primary/outline/shadow treatment; lines 24-33 use a smaller size set than T3.
- `apps/web/src/components/ui/card.tsx:5` defines a ring-based card with `rounded-xl` and route-local spacing; it lacks T3's `CardFrame` and inset-shadow treatment.
- `apps/web/src/components/ui/input.tsx:5` is a raw input primitive, while T3 wraps the actual input in an `input-control` span.
- `apps/web/src/app/(app)/_components/app-shell.tsx:22` defines a top sticky header shell; lines 81-98 choose top-header/page-grid layouts instead of T3's sidebar-first shell; lines 120-188 render the shell around protected app pages.
- `apps/web/src/app/(marketing)/docs/_styles/docs-theme.css:1` defines an isolated docs token island; lines 21-37 define a separate dark island; lines 239-260 use Instrument Serif for docs H1/H2 styling.
- `apps/web/src/app/(marketing)/docs/_components/docs-theme-toggle.tsx:15` bridges docs theme state back to `next-themes`, proving docs have extra theme plumbing beyond the root provider.
- `packages/telegram-chat-widget/src/styles/telegram-chat-widget.css:1` maps a few host variables, but lines 47-113 hardcode launcher and panel dark styling; lines 261-456 hardcode composer, message, and send-control surfaces.
- `templates/starter-app/source/src/app/globals.css:3` defines a third token set for generated apps; lines 19-24 define a minimal Tailwind theme map.
- `templates/starter-app/source/src/app/layout.tsx:1` imports generated-app fonts; lines 10-19 load Instrument Sans and IBM Plex Mono rather than DM Sans/SF Mono.
- `packages/codebase-compiler/src/design-system/preset-design-system.ts:91` defines generated-codebase font presets including DM Sans at lines 128-133; lines 544-600 resolve generated token/radius/font output.
- `packages/codebase-compiler/src/repo-generation/render-generated-design-system-files.ts:9` writes `DESIGN.md`, JSON facts, and `apps/web/config/generated-design-system.ts` into generated repos.

## Research Conclusion

The migration needs to replace source doctrine, runtime foundations, primitives, shell structure, route-level surfaces, and generated-codebase output. It should not start with generated customer repositories because the tracked app foundation needs to become canonical first, but generated codebases are now part of the same Program and should inherit the T3 Code system once source tokens and primitives stabilize.
