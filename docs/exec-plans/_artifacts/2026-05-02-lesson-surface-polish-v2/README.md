# Lesson surface polish v2 — proof bundle

This folder holds **browser proof** assets for [2026-05-02-lesson-surface-polish-v2.md](../../active/2026-05-02-lesson-surface-polish-v2.md).

## How to capture (operator)

1. Run `bun --cwd apps/web run dev`, sign in with a Clerk user whose **Review** is unlocked (bonus lessons available).
2. Use viewports **1440×?** (desktop) and **390×?** (mobile). Toggle **light** and **dark** theme. Repeat with DevTools **prefers-reduced-motion: reduce**.
3. Routes and arcs:
   - `/lesson/build-kickoff` and `/lesson/iterate-the-product-with-ai`: load → eyebrow + title + video frame → open each coach tab → toggle an objective → copy prompt → open Lesson Map from intro alert → Tab inside map → Escape → Close → Next lesson.
   - Same route signed in with Review **locked** → `BonusRouteStatePanel`.
4. Network: confirm exactly **one** `POST` to `/api/execute-ship/bonus-lesson-viewed` per lesson load; save payload + response (200) screenshot.
5. Naming suggestion: `desktop-light-watch-shell.png`, `mobile-dark-lesson-map.png`, etc.

## Optional video

Record one short screen capture of the full dwell arc (normal motion) for stakeholder sharing.

## Automated coverage (this PR)

- `apps/web/tests/integration-ui/lesson-map-surface.test.tsx` — focus trap, Escape, Close, ARIA.
- `apps/web/tests/integration-ui/lesson-video-controls.test.tsx` — controls copy, `postMessage` forwarding mocks, fullscreen mock.

## Bunny embed note

Keyboard forwarding uses **player.js-shaped** `postMessage` (`context: "player.js"`, `version: "1"`, methods `getPaused`, `play`, `pause`, `getCurrentTime`, `setCurrentTime`). If a given Bunny build stops answering these messages, shortcuts fall back to focusing the iframe and using in-player controls; the **Video controls** row still documents intended keys.
