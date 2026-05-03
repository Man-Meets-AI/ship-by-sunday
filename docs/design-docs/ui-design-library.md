---
title: 'UI Design Library'
summary: 'Screenshot-grounded reference for Ship by Sunday app UI typography, color roles, spacing, controls, and audit targets.'
docType: 'guide'
status: 'active'
read_when:
  - 'You are auditing inconsistent UI font sizes, colors, spacing, or controls.'
  - 'You need screenshot-grounded app UI tokens before changing a product surface.'
  - 'You need to decide whether a visual difference is intentional brand expression or UI drift.'
---

# UI Design Library

This document translates the attached Codex UI screenshots into a practical Ship by Sunday app UI reference. It is not a replacement for root `DESIGN.md`; it is the detailed library to use when auditing inconsistent colors, type sizes, spacing, and control geometry.

Reference set:

- Light empty workspace screenshot.
- Light review/split-pane screenshot.
- Dark review/split-pane screenshot.
- Dark automations/gallery screenshot.
- The missing local screenshot named in the prompt was unavailable, so this note is based on the attached images.

## Design Thesis

Ship by Sunday app UI should feel like a quiet professional desktop tool: neutral, compact, readable, and exact. The UI uses color only for state, links, focus, and one active path. Most hierarchy comes from typography, spacing, selected-row fills, thin separators, and restrained contrast.

Use this hierarchy when resolving conflicts:

1. Root `DESIGN.md` owns brand direction and high-level visual doctrine.
2. `apps/web/app/globals.css` owns currently implemented app tokens.
3. `apps/web/components/ui/*.tsx` owns current component primitives.
4. This document owns the screenshot-grounded audit target for product UI consistency.

## Core Rules

- Default app text is `14px`, regular or medium, with `20px` line height.
- Operational UI letter spacing is `0`. Do not add negative tracking to app controls, panels, lists, tables, or body copy.
- Use `16px` body text only for longer reading surfaces, not dense controls.
- Use one accent at a time. A page should not show several unrelated saturated colors unless it is rendering semantic state.
- Prefer soft selected fills over heavy borders for active navigation and selected rows.
- Prefer hairline separators over boxed card stacks.
- Controls are compact on desktop, but mobile hit targets still need a practical `44px` tap area.
- Do not use pure black for filled UI. Use `ink` or semantic foreground/background tokens.

## Color Tokens

These values are screenshot-derived targets. When implementing, map them to semantic CSS variables and convert to OKLCH if the token lives beside the existing app tokens.

### Neutral Roles

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `ui.canvas` | `#FFFFFF` | `#111111` | Primary page background. |
| `ui.shell` | `#F7F7F7` | `#2B2A28` | Sidebar, persistent rail, app chrome. |
| `ui.surface` | `#FFFFFF` | `#181818` | Main content surface. |
| `ui.surface.subtle` | `#F5F5F5` | `#222222` | Composer footers, quiet panels, inactive chips. |
| `ui.surface.raised` | `#FFFFFF` | `#262626` | Floating controls, cards, menu surfaces. |
| `ui.surface.selected` | `#EEEEEE` | `#3A3937` | Active nav item, selected project/chat row. |
| `ui.surface.hover` | `#F2F2F2` | `#303030` | Hover state for ghost buttons and rows. |
| `ui.border` | `#E7E7E7` | `#2F2F2F` | Default separators and hairlines. |
| `ui.border.strong` | `#D8D8D8` | `#454545` | Active outlines, stronger split-pane boundaries. |
| `ui.text` | `#202020` | `#F2F2F2` | Primary text. |
| `ui.text.muted` | `#6F6F6F` | `#B8B8B8` | Secondary labels, timestamps, descriptions. |
| `ui.text.subtle` | `#9A9A9A` | `#858585` | Tertiary labels and low-priority metadata. |
| `ui.text.disabled` | `#B8B8B8` | `#5F5F5F` | Disabled or unavailable UI. |
| `ui.placeholder` | `#C6C6C6` | `#6A6A6A` | Input placeholder text. |
| `ui.scrim` | `#FFFFFFCC` | `#111111CC` | Overlays that must preserve the same neutral feel. |

### Functional Roles

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `action.primary` | `#202020` | `#F2F2F2` | Primary action fill. Maps to current `primary`. |
| `action.primary.text` | `#FFFFFF` | `#202020` | Text/icon on primary action. |
| `action.secondary` | `#F1F1F1` | `#2A2A2A` | Secondary action fill. |
| `action.secondary.text` | `#303030` | `#E8E8E8` | Text/icon on secondary action. |
| `accent.info` | `#4C94F5` | `#7DB2FF` | Links, active dots, selected branch indicators. |
| `state.success` | `#2FA84F` | `#68D982` | Success counts, passed checks, positive diffs. |
| `state.danger` | `#D94A45` | `#FF6F6A` | Error counts, destructive actions, negative diffs. |
| `state.warning` | `#B7791F` | `#E3B35F` | Warnings and pending states. |
| `state.focus` | `#8C8C8C` | `#A0A0A0` | Focus ring color before alpha. |

### Diff And Review Roles

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `diff.add.background` | `#EAF7EC` | `#17351F` | Added-code background. |
| `diff.add.border` | `#3DB85C` | `#4FC96C` | Added-code gutter or accent. |
| `diff.remove.background` | `#FCEAEA` | `#3A1D1A` | Removed-code background. |
| `diff.remove.border` | `#D94A45` | `#D95A52` | Removed-code gutter or accent. |
| `diff.neutral.background` | `#F1F1F1` | `#2B2B2B` | Collapsed unchanged-code blocks. |

## Typography Scale

Use Inter for product UI, Berkeley Mono for code and number-heavy UI, Instrument Serif for brand/editorial H1 moments, and Bebas Neue only for the `SHIP BY SUNDAY` wordmark.

| Role | Size | Line height | Weight | Tracking | Use |
| --- | ---: | ---: | ---: | ---: | --- |
| `display.app` | `30px` | `36px` | `500` | `0` | Empty-state prompt or one major app question. |
| `title.page` | `28px` | `34px` | `500` | `0` | Page titles such as Automations. |
| `title.section` | `18px` | `26px` | `500` | `0` | Section headers with surrounding content. |
| `title.panel` | `16px` | `24px` | `600` | `0` | Panel, card, and sidebar group titles. |
| `body.reading` | `15px` | `24px` | `400` | `0` | Chat responses, explanatory paragraphs, longer prose. |
| `body.default` | `14px` | `20px` | `400` | `0` | Default UI text, lists, labels with normal emphasis. |
| `body.medium` | `14px` | `20px` | `500` | `0` | Active nav rows, button labels, selected controls. |
| `caption` | `13px` | `18px` | `400` | `0` | Secondary metadata, timestamps, small row support. |
| `micro` | `12px` | `16px` | `400` | `0` | Low-priority chrome, badges, compact helper text. |
| `code.inline` | `13px` | `20px` | `400` | `0` | Inline code chips in reading content. |
| `code.block` | `13px` | `20px` | `400` | `0` | Code panes and review diffs. |
| `number` | `13px` | `18px` | `500` | `0` | Counts, timestamps, status numerals. |

Audit note: the current global app stylesheet applies negative body letter spacing. If this library becomes the implementation source, scope that treatment to marketing/editorial surfaces or remove it from operational UI.

## Spacing Scale

The UI uses a `4px` base grid with a compact desktop rhythm.

| Token | Value | Use |
| --- | ---: | --- |
| `space.1` | `4px` | Icon/text micro gaps, tight stack corrections. |
| `space.2` | `8px` | Control icon gap, small row gap, toolbar gap. |
| `space.3` | `12px` | Default component internal gap. |
| `space.4` | `16px` | Card padding, sidebar padding, form group gap. |
| `space.5` | `20px` | Larger tile padding, page header internal gap. |
| `space.6` | `24px` | Section stack gap, main column gutters. |
| `space.8` | `32px` | Major section separation inside app pages. |
| `space.10` | `40px` | Empty-state spacing, large modal interior rhythm. |
| `space.12` | `48px` | Top/bottom app page breathing room. |
| `space.16` | `64px` | Centered empty-state vertical offset. |

Layout targets:

- Sidebar width: `260px` to `320px`.
- Narrow reading column: `720px` to `860px`.
- Split-pane review column: `560px` to `680px`.
- Gallery/tile page max width: `820px` to `920px`.
- Composer max width: `820px` to `880px`.
- Standard desktop page gutter: `24px`.
- Compact chrome gutter: `16px`.

## Radius, Borders, And Elevation

| Role | Value | Use |
| --- | ---: | --- |
| `radius.control` | `8px` | Buttons, icon buttons, nav rows. |
| `radius.input` | `12px` | Search fields, prompt composer, text inputs. |
| `radius.card` | `14px` to `16px` | Automation cards, grouped panels. |
| `radius.dialog` | `20px` | Large floating composer/modal surfaces. |
| `border.hairline` | `1px` | Dividers and split panes. |
| `ring.focus` | `3px` at 50% alpha | Keyboard focus. |

Rules:

- Use borders and background contrast before shadow.
- Do not stack cards inside cards.
- Avoid radius above `20px` except for intentional pills or large modal/composer shells.
- In dark mode, borders should be visible but not bright. Start with `ui.border`, then use `ui.border.strong` only for active boundaries.

## Buttons And Controls

Button primitives should stay close to `apps/web/components/ui/button.tsx` unless a surface has a clear reason to differ.

| Control | Height | Padding | Radius | Text | Icon |
| --- | ---: | ---: | ---: | --- | ---: |
| `button.compact` | `28px` | `10px` horizontal | `8px` | `13px / 500` | `14px` |
| `button.default` | `32px` | `10px` to `12px` horizontal | `8px` | `14px / 500` | `16px` |
| `button.large` | `40px` | `16px` to `20px` horizontal | `10px` or pill | `14px / 600` | `16px` |
| `icon.xs` | `24px` | `0` | `7px` | none | `14px` |
| `icon.sm` | `28px` | `0` | `8px` | none | `15px` |
| `icon.default` | `32px` | `0` | `8px` | none | `16px` |
| `nav.row` | `34px` to `36px` | `12px` horizontal | `8px` | `14px / 500` active | `16px` |
| `input.default` | `32px` | `10px` horizontal | `10px` to `12px` | `14px / 400` | optional `16px` |
| `composer` | `104px` to `120px` | `16px` | `18px` to `20px` | `14px` placeholder | `18px` send |

State rules:

- Primary buttons use neutral ink, not a saturated brand color.
- Ghost buttons show hover with `ui.surface.hover`, not border changes.
- Selected navigation uses `ui.surface.selected` and medium text.
- Disabled controls reduce opacity and keep text readable enough to explain state.
- Focus must be visible in both themes and should not rely on color alone.

## Cards, Rows, And Lists

Automation-style tiles from the screenshots establish the compact card pattern:

- Tile width: roughly half of an `820px` to `920px` content column.
- Tile min height: `104px` to `112px`.
- Tile padding: `20px`.
- Tile radius: `16px`.
- Tile border: `1px` quiet border, no heavy shadow.
- Icon: `20px`, aligned top-left.
- Title text: `14px` or `15px`, `20px` to `22px` line height.

Rows and lists:

- Use `border-t` or `border-b` separators for repeated items.
- Row height should generally land between `36px` and `48px`.
- Active row fill should be subtle and local to the row.
- Timestamps and counts belong in `caption` or `number`, not body-large text.

## App Layout Patterns

### Empty Workspace

- Center the primary prompt in the available work area.
- Use `display.app` for the prompt.
- Keep the composer visually wider than the prompt but not full width.
- Keep the suggestion list below the composer quiet, separated by thin rules.

### Split Review Surface

- Use a reading column plus a fixed review column.
- Reading prose can use `body.reading`.
- Code review panes use `code.block`, diff colors, and strong line-number alignment.
- Do not let the right pane inherit marketing colors or oversized headings.

### Automation Gallery

- Use one centered content column.
- Group tiles by section with clear section titles and a horizontal rule.
- Cards can sit in a two-column grid on desktop and one column on mobile.
- Keep the top-right creation action compact and aligned to the app chrome.

## Audit Checklist

Use this checklist before changing a surface and again before calling the visual cleanup done.

- Replace hard-coded grays with semantic roles from this document or existing app tokens.
- Flag `#000`, `#000000`, `black`, `text-black`, and `bg-black` in app UI unless they are being replaced with `ink`.
- Flag operational UI using negative letter spacing.
- Flag font sizes outside the scale unless they are a brand/editorial exception.
- Flag body text above `16px` in dense app surfaces.
- Flag buttons that are not `28px`, `32px`, or `40px` high.
- Flag icon-only controls that are not `24px`, `28px`, or `32px` visual size.
- Flag card radii above `20px`.
- Flag nested cards and card stacks that could become plain layout.
- Verify light and dark modes for every semantic state used on the surface.
- Verify selected, hover, focus, disabled, loading, error, and empty states where the surface supports them.
- Check at least one desktop and one mobile viewport for text wrapping and hit targets.

## Implementation Notes

Do not add this entire token set to CSS at once. Use it as an audit target, then promote only the roles needed by the touched surface.

When implementation work starts:

1. Inventory the surface's current hard-coded colors, text sizes, spacing, and component variants.
2. Map each value to an existing semantic token when possible.
3. Add new tokens only when an existing token cannot express the role cleanly.
4. Update the touched component or surface with the smallest viable diff.
5. Verify the exact route in light and dark mode before broad validation.
