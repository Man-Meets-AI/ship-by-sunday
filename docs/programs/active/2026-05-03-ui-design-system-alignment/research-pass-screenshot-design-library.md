---
title: 'Screenshot Design Library Research Pass'
summary: 'Research pass translating the attached Codex UI screenshots and the new UI design library into Program requirements.'
docType: 'program_research'
status: 'active'
read_when:
  - 'Rechecking the screenshot basis for UI design-system alignment.'
  - 'Writing a child ExecPlan for color, typography, spacing, or controls.'
---

# Screenshot Design Library Research Pass

The attached screenshots show a compact desktop-tool UI rather than a marketing page. The common visual language is neutral, low-saturation, and sparse. Light mode uses a white main canvas, a very pale sidebar shell, soft selected-row fills, and thin separators. Dark mode uses a near-black canvas, a warmer dark sidebar shell, dark raised cards, and quiet gray dividers. Saturated color appears only for links, active dots, diff states, and status counts.

The design library at `docs/design-docs/ui-design-library.md` turns that screenshot language into durable reference roles. Its most important rules for implementation are that default app text is `14px`, operational UI letter spacing should be `0`, selected rows should use a soft fill instead of a heavy outline, and buttons should stay in the compact `28px`, `32px`, and `40px` height family.

The screenshots also make color the largest first improvement. A user notices inconsistent foreground, shell, card, selected, hover, and divider values before they notice minor spacing differences. A color pass can bring light and dark app UI into one coherent family without redesigning every surface at once.

The screenshot-derived color roles should be treated as audit targets, not as a license to add every possible token in one commit. The Program should promote tokens when a touched surface needs them. In practice, the first child slice should focus on app-neutral roles, action roles, semantic state roles, and review/diff roles because those are the places where inconsistency is most visible across light and dark UI.

The screenshot reference does not require marketing sections to lose intentional editorial colors. Black homepage hero sections, Figma-derived branch art, and pack illustrations can remain brand surfaces as long as shared app components and protected product routes do not inherit ad hoc hard-coded grays.

The missing local screenshot path named in the prompt was unavailable. The design library and this Program are based on the attached images that were present in the conversation.
