# Ship by Sunday Design System

## Overview / Creative North Star

Ship by Sunday should feel like a durable operating system for shipping, not a hype-y AI landing page and not a generic SaaS dashboard. The visual thesis is restrained, blueprint-first, editorial, and calm under pressure: strong hierarchy, sparse chrome, one obvious next action, and just enough atmosphere to make the system feel intentional.

The product has two visual modes that must stay aligned:

- The shared app shell and component library use a neutral shadcn-based token system defined in [apps/web/app/globals.css](/Users/parkerrex/Projects/ship-by-sunday/apps/web/app/globals.css).
- Marketing illustrations and the docs shell add a warmer Ship by Sunday brand expression on top of that neutral base.

Future UI work should preserve that structure instead of inventing a second app-wide palette.

## Visual Theme & Atmosphere

- Base feeling: calm, exact, durable, minimal.
- Marketing feeling: editorial and high-contrast, with strong typography and long-form section rhythm instead of dense card grids.
- Workspace and app feeling: operational, sparse, and utility-first.
- Brand expression comes mostly from composition, typography, and a small set of accent moments, not from constant saturated UI.
- Light mode is the default visual center of gravity. Dark mode exists and should feel equally intentional, not like an afterthought inversion.

## Color Palette & Roles

### Core app tokens

These are the canonical shared UI tokens. Use these roles before introducing new colors.

| Role                 | Light                       | Dark                        | Purpose                              |
| -------------------- | --------------------------- | --------------------------- | ------------------------------------ |
| `background`         | `oklch(0.99 0 0)`           | `oklch(0.145 0 0)`          | Main canvas                          |
| `foreground`         | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`          | Primary text and high-contrast marks |
| `card`               | `oklch(0.99 0 0)`           | `oklch(0.205 0 0)`          | Flat surfaces and cards              |
| `popover`            | `oklch(0.99 0 0)`           | `oklch(0.205 0 0)`          | Floating surfaces                    |
| `primary`            | `oklch(0.205 0 0)`          | `oklch(0.922 0 0)`          | Primary action fill and emphasis     |
| `primary-foreground` | `oklch(0.985 0 0)`          | `oklch(0.205 0 0)`          | Text on primary surfaces             |
| `secondary`          | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | Quiet contrast surfaces              |
| `muted`              | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | Subtle backgrounds                   |
| `muted-foreground`   | `oklch(0.556 0 0)`          | `oklch(0.708 0 0)`          | Secondary text                       |
| `accent`             | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | Hover and active backgrounds         |
| `border`             | `oklch(0.922 0 0)`          | `oklch(0.99 0 0 / 10%)`     | Dividers and low-contrast outlines   |
| `input`              | `oklch(0.922 0 0)`          | `oklch(0.99 0 0 / 15%)`     | Input borders and dark fills         |
| `ring`               | `oklch(0.708 0 0)`          | `oklch(0.556 0 0)`          | Focus ring                           |
| `destructive`        | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error and destructive actions        |

Interpretation:

- The shared system is intentionally neutral. Most UI should read as black, white, and gray first.
- `primary` is ink-like, not “brand color.” It should carry action and emphasis without turning the interface colorful.
- Borders are quiet and often further softened with opacity such as `border-border/40` or `border-border/60`.

### Ship by Sunday editorial / illustration accents

These appear in marketing diagrams and branded docs surfaces. Treat them as narrative accents, not as replacement semantic tokens for the full app.

| Accent             | Values found in assets                     | Role                                                 |
| ------------------ | ------------------------------------------ | ---------------------------------------------------- |
| Warm parchment     | `#F5F0E7`, `#EDE5D8`, `#FFFCF7`, `#FFF5E8` | Marketing background planes and editorial paper feel |
| Source amber       | `#E5BA7C`, `#C57C30`, `#74491C`, `#3C2817` | Product-definition/source-of-truth emphasis          |
| Design blue        | `#EEF6FF`, `#7BA6DE`, `#26496F`            | Design-pack illustration coding                      |
| Marketing green    | `#EEFBEF`, `#85C18E`, `#2A6031`            | Marketing-pack illustration coding                   |
| Build rose         | `#FFF1F4`, `#DB8BA2`, `#7D3348`            | Build-pack illustration coding                       |
| Prompt gold        | `#FFF8E8`, `#DEBC63`, `#7B641E`            | Prompt-pack illustration coding                      |
| Final handoff teal | `#7FE0C6` on `#2C221B`                     | Final state / handoff emphasis                       |

Usage rules:

- Use these accents in diagrams, editorial art, pack labeling, and occasional section emphasis.
- Do not repurpose all four pack colors as everyday button states, badges, tabs, or status colors.
- When in doubt, keep app UI neutral and let these accents live in storytelling surfaces.

### Docs theme roles

The docs shell uses `product-*` roles such as `product-bg`, `product-surface`, `product-border`, `product-text`, `product-muted`, and `product-accent` inside [apps/web/features/docs/styles/docs-theme.css](/Users/parkerrex/Projects/ship-by-sunday/apps/web/features/docs/styles/docs-theme.css). Those exact values are not defined in a single obvious source file today.

Until those values are centralized, treat the docs palette as an established surface convention but a token-source gap. Future work should map those roles back to a documented source instead of inventing a third palette.

## Typography Rules

### Display / brand type

- `Bebas Neue` is the explicit display and wordmark font, loaded in [apps/web/app/layout.tsx](/Users/parkerrex/Projects/ship-by-sunday/apps/web/app/layout.tsx) as `--font-bebas-neue`.
- Use it for:
  - product wordmarks
  - marketing hero headlines
  - large docs editorial headings
- Styling conventions:
  - uppercase by default
  - tight leading around `0.9` to `0.95`
  - negative tracking for large marketing lines
  - never use it for dense body copy, forms, or data-heavy UI

### Body type

- The repo does not define a custom body font beyond the shared sans stack used by shadcn/Tailwind and Clerk.
- Body typography should stay clean, readable, and neutral.
- Default body text is usually `text-sm` to `text-lg` with generous line-height (`leading-7`, `leading-relaxed`, or `1.8` in docs).

### Hierarchy rules

- Marketing headlines should be large, compressed, and immediate.
- App and workspace headings should be strong but calmer, typically `font-semibold` with tight tracking instead of display theatrics.
- Section leads and supporting copy should stay narrow. Avoid wide text blocks.
- Use muted text for explanation, not for primary claims or labels that drive action.

## Geometry / Corners / Shape Language

The system is rounded, but not bubbly.

- Base radius token: `--radius: 0.625rem`
- Derived radii:
  - `radius-sm`: `calc(var(--radius) * 0.6)`
  - `radius-md`: `calc(var(--radius) * 0.8)`
  - `radius-lg`: `var(--radius)`
  - `radius-xl`: `calc(var(--radius) * 1.4)`
  - `radius-2xl`: `calc(var(--radius) * 1.8)`
  - `radius-3xl`: `calc(var(--radius) * 2.2)`
  - `radius-4xl`: `calc(var(--radius) * 2.6)`

Practical geometry rules:

- Shared controls default to `rounded-lg`.
- Cards default to `rounded-xl`.
- Marketing CTAs and nav pills often use `rounded-full` or `rounded-2xl`.
- Docs articles and large docs panels go larger still, around `24px` to `28px`, to feel editorial and substantial.
- Favor simple rectangles with softened corners over novelty shapes.

## Elevation / Borders / Depth

The system is mostly flat with thin structure.

- Primary structure comes from borders, separators, and spacing.
- Standard cards use `ring-1 ring-foreground/10` rather than deep drop shadows.
- Inputs, outline buttons, dialogs, popovers, and menus rely on soft rings and thin borders.
- Heavy shadows are rare and reserved for:
  - hero CTA emphasis
  - floating menus and overlays
  - docs shell framing

Depth rules:

- Prefer `border-border/40` and `border-border/60` section separators over stacked nested cards.
- Use background contrast before shadow.
- Do not add decorative glassmorphism or frosted layers unless a surface already depends on them.

## Component Stylings

### Buttons

Canonical button behavior lives in [apps/web/components/ui/button.tsx](/Users/parkerrex/Projects/ship-by-sunday/apps/web/components/ui/button.tsx).

- Default button:
  - dark/ink fill in light mode
  - light fill in dark mode
  - `h-8`
  - `rounded-lg`
  - subtle active press via `active:translate-y-px`
- Outline button:
  - quiet border
  - background-driven hover
  - good default for utility actions
- Hero and pricing CTAs:
  - intentionally larger than base controls
  - pill or soft-rectangle silhouette
  - stronger scale or translate hover
  - should remain the obvious focal action

### Inputs and fields

Canonical styling lives in [apps/web/components/ui/input.tsx](/Users/parkerrex/Projects/ship-by-sunday/apps/web/components/ui/input.tsx), [apps/web/components/ui/textarea.tsx](/Users/parkerrex/Projects/ship-by-sunday/apps/web/components/ui/textarea.tsx), and [apps/web/lib/clerk-auth-appearance.ts](/Users/parkerrex/Projects/ship-by-sunday/apps/web/lib/clerk-auth-appearance.ts).

- Transparent or near-transparent fill
- Thin border
- `rounded-lg`
- Focus state comes from border + 3px ring, not from glow or large shadow
- Auth surfaces should inherit the same visual language as app inputs

### Cards and panels

Canonical shared card lives in [apps/web/components/ui/card.tsx](/Users/parkerrex/Projects/ship-by-sunday/apps/web/components/ui/card.tsx).

- Flat card background
- `rounded-xl`
- light ring instead of thick border
- muted footer strip when a footer exists

Usage rule:

- Use cards when grouping genuinely helps comprehension.
- Do not default to cards for marketing sections that can read as open layout.

### Accordions, lists, and content rows

- FAQ and content groups rely on dividers more than panel chrome.
- Accordions are simple, text-first, and low-noise.
- Repeated marketing rows typically use `border-t` stacks with generous vertical padding.

### Docs chrome

- Docs nav items are rounded pills with quiet fills.
- Docs pages sit inside a framed editorial article container with larger radius and subtle shadow.
- Docs headings use the same display font as the product wordmark to keep the marketing and docs voices connected.

## Layout / Spacing / Responsive Principles

### Global layout

- Main marketing shell: `max-w-7xl`, centered, generous horizontal padding.
- Text measures stay intentionally narrow even inside large sections.
- Large sections breathe. Typical marketing section padding sits around `py-24` to `py-40`.

### Section composition

- The homepage uses a strong rhythm of full-width sections separated by thin rules.
- After the hero, many sections use a two-column editorial layout:
  - left column for title / framing
  - right column for details / proof / lists
- Sticky left columns are acceptable on desktop when they help long-form scanning.

### Hero rules

These are already reinforced by the design-pack docs and should remain true:

- The first viewport should read as one composition, not a dashboard.
- The hero should stay focused on brand, one headline, one support sentence, one CTA group, and atmosphere.
- Avoid detached badges, proof rows, stats, or card stacks in the hero.

### Responsive behavior

- Mobile should preserve one-glance readability for hero messaging.
- Large headlines may wrap across lines, but should still feel deliberate and tight.
- Sticky behaviors and atmospheric effects must degrade cleanly on smaller screens.
- Narrow screens should prioritize vertical flow over side-by-side compression.

## Imagery / Illustration / Iconography

- Primary imagery modes:
  - system diagrams and pack illustrations
  - founder proof imagery
  - editorial docs surfaces
- Illustration style is flat, geometric, and labeled, with warm paper backgrounds and role-based accent colors.
- Icons come from `lucide-react` and should stay simple and functional.
- Avoid ornamental iconography, 3D skeuomorphism, or cartoon illustration styles.
- When using photography, crop cleanly and let it feel documentary rather than glossy lifestyle marketing.

## Motion / Interaction Notes

Motion should clarify hierarchy and add presence, not advertise itself.

Established motion patterns:

- Scroll reveal:
  - duration `0.6s`
  - easing `[0.22, 1, 0.36, 1]`
  - upward offset `24px`
  - once-per-view behavior
- Hover behavior:
  - small translate or scale shifts
  - usually `200ms` to `300ms`
  - strongest on primary CTAs
- Theme transitions:
  - body color transitions around `300ms`
- Hero atmosphere:
  - dotted glow background used subtly
  - radial fade keeps the center readable

Motion rules:

- Keep the number of moving ideas small.
- Prefer one meaningful entrance pattern reused consistently over many decorative effects.
- Do not let motion compete with reading or interaction.

## Do’s and Don’ts

### Do

- Start from the shared neutral token system.
- Use display typography sparingly but confidently for brand and major editorial moments.
- Keep app UI sparse, calm, and operational.
- Use borders and spacing before adding card chrome.
- Preserve the blueprint-first story and the fixed homepage structure.
- Treat illustration accents as storytelling tools, not as generic UI colors.
- Keep one clear primary action per surface.

### Don’t

- Do not create a new parallel token system when the existing neutral tokens already work.
- Do not turn marketing pages into dashboard grids.
- Do not flood the app with pack-color accents.
- Do not put badges, proof clutter, or promo chips in the hero by default.
- Do not solve hierarchy problems with extra cards.
- Do not use Bebas Neue for dense body copy or form-heavy surfaces.
- Do not let docs drift into a separate brand world from the product.

## Open Questions / Follow-Ups

1. Document the exact source of the docs `product-*` tokens or centralize them into one visible theme source. Right now the docs shell depends on them, but their canonical definitions are not obvious in the repo.
2. Decide whether the body sans stack should remain implicit or be made explicit as a documented token. The display font is clear; the body type system is currently conventional rather than branded.
3. If the docs palette is meant to be permanent, map it back into the shared token layer in a deliberate, documented way instead of keeping it semi-hidden inside docs-specific styling.
