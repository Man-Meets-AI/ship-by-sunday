# Ship by Sunday — Full Wireframe Pack v1

This pack freezes the product into **3 shells** and maps every lesson to a reusable workbench pattern.

**Rule:** stop designing bespoke screens.
Each lesson = **shell + workbench + artifact**.

---

# 0. Global UI System

## Shell A — Split Shell

Use when the lesson output is created inside the product.

Regions:

- **Top HUD** = macro progression
- **Left Objective Drawer** = checklist / output / unlock
- **Center Workbench** = primary action surface
- **Right Coach Dock** = watch / transcript / examples / resources
- **Bottom Skill Rail** = lesson progression within current block

Default state:

- objective drawer open
- coach dock open
- transcript collapsed
- examples collapsed

## Shell B — Focus Shell

Use when the real work happens in Figma, code, deploy tools, or recording tools.

Regions:

- **Top HUD** = macro progression
- **Center Workbench** = near full width
- **Coach PiP** = movable mini player
- **Objective Drawer** = collapsed by default
- **Bottom Skill Rail** = persistent

Default state:

- objective drawer collapsed
- coach in PiP
- transcript/resources in overlays

## Shell C — Watch Shell

Use when the in-product job is simply to watch the lesson and move on.

Regions:

- **Top HUD** = macro progression
- **Center Video Surface** = large lesson video or placeholder
- **Footer Actions** = back + complete
- **Bottom Skill Rail** = persistent

Default state:

- no split/focus toggle
- no objective drawer
- no coach dock
- future Build lessons can opt into this shell individually when they are truly watch-only

## Workbench Types

- `guided_form`
- `score_table`
- `collector_board`
- `capture_upload`
- `scope_split`
- `brief_assembler`
- `console_checklist`
- `tracker_log`
- `external_workspace`

## Shared Controls

Top right view controls:

- **Split**
- **Focus**
- **Coach**

Objective drawer states:

- expanded
- collapsed rail

Coach states:

- docked
- minimized
- PiP

---

# 1. Dashboard / Mission Map

**Shell:** Mission map home
**Artifact:** none — navigation / system overview

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ SHIP BY SUNDAY                                              PROGRESS: 0/XX  │
│ MISSION   ARTIFACTS   SETTINGS                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ MISSION                                                                    │
│ Ship an app by Sunday                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ BUILDER ROLES                                                              │
│ CEO → DESIGN → BUILD → SHIP                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ MISSION MAP                                                                 │
│ CEO      ◐──○──○──○──○──○──○                                                │
│ DESIGN   ○──○──○──○──○──○──○                                                │
│ BUILD    ○──○──○──○──○──○                                                   │
│ SHIP     ○──○──○──○──○──○                                                   │
│                                                                            │
│ [ Hover card ] Lesson title / output / status                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ RECENT ARTIFACTS                                                           │
│ None yet                                                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# CEO Block

## 1.1 Start With the Problem

**Shell:** Split
**Workbench:** guided_form
**Artifact:** 3 Candidate Problems

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 1.1 ──────────────┬──── COACH ────┐
│ CEO 1.1                   │ Start With the Problem                    │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Prompt: Write 3 problems from your life   │                │
│ [ ] Write 3 problems      │ or work worth solving.                    │ TRANSCRIPT     │
│ [ ] Name who has each     │                                           │ [collapsed]    │
│                           │ Problem 1 [ multiline ]                   │                │
│ Output                    │ Problem 2 [ multiline ]                   │ EXAMPLES       │
│ 3 Candidate Problems      │ Problem 3 [ multiline ]                   │ [collapsed]    │
│                           │                                           │                │
│ Next Unlock               │ [Save Draft]                    [Next]    │ RESOURCES      │
│ Pick One User             │                                           │ [collapsed]    │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 1.2 Pick One User

**Shell:** Split
**Workbench:** guided_form
**Artifact:** User Statement

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 1.2 ──────────────┬──── COACH ────┐
│ CEO 1.2                   │ Pick One User                             │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Chosen Problem [ pinned from 1.1 ]        │                │
│ [ ] Carry forward problem │                                           │ TRANSCRIPT     │
│ [ ] Name one specific     │ This app is for... [ single line ]        │ [collapsed]    │
│ [ ] Confirm reachable     │                                           │                │
│                           │ When this problem hits... [ multiline ]   │ EXAMPLES       │
│ Output                    │                                           │ weak vs strong │
│ User Statement            │ How they solve it today [ multiline ]     │ examples       │
│                           │                                           │                │
│ Next Unlock               │ Why I can reach them this week [ text ]   │ RESOURCES      │
│ Define the Outcome        │                               [Back][Next]│ [collapsed]    │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 1.3 Define the Outcome

**Shell:** Split
**Workbench:** guided_form
**Artifact:** Outcome Statement

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 1.3 ──────────────┬──── COACH ────┐
│ CEO 1.3                   │ Define the Outcome                        │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Chosen Problem [ pinned ]                 │                │
│ [ ] Use chosen user       │ User Statement [ pinned ]                 │ TRANSCRIPT     │
│ [ ] Write one clear       │                                           │ [collapsed]    │
│     user-facing outcome   │ One clear outcome statement               │                │
│ [ ] Keep it observable    │ [ single-line input ]                     │ EXAMPLES       │
│                           │                                           │ outcome good/  │
│ Output                    │ Success looks like... [ multiline ]       │ bad            │
│ Outcome Statement         │                                           │                │
│                           │ What will be different for the user?      │ RESOURCES      │
│ Next Unlock               │ [ multiline ]                             │ [collapsed]    │
│ Light Research            │                               [Back][Next]│                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 1.4 Light Research, Not a Thesis

**Shell:** Split
**Workbench:** score_table
**Artifact:** Research Notes

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 1.4 ──────────────┬──── COACH ────┐
│ CEO 1.4                   │ Light Research, Not a Thesis              │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Import research                           │                │
│ [ ] Add 2–3 competitors   │ [ Copy prompt ] [ readonly prompt block ] │ TRANSCRIPT     │
│ [ ] Note what they do     │ [ paste ChatGPT response textarea ]       │ [collapsed]    │
│ [ ] Extract 2–3 insights  │ [ Import into table ] [ success / error ] │                │
│                           │                                           │ EXAMPLES       │
│ Output                    │ Research Table                            │ sample row      │
│ Research Notes            │ ┌────────────┬─────────┬─────────┬──────┐ │                │
│                           │ │ Competitor │ Good    │ Poor    │Care? │ │ RESOURCES      │
│ Next Unlock               │ ├────────────┼─────────┼─────────┼──────┤ │ worksheet only │
│ Map the Core Flow         │ │ [input]    │ [text]  │ [text]  │[text]│ │                │
│                           │ │ [input]    │ [text]  │ [text]  │[text]│ │                │
│                           │ └────────────┴─────────┴─────────┴──────┘ │                │
│                           │ Key pattern I noticed [ multiline ]       │                │
│                           │                               [Back][Next]│                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 1.5 Map the Core Flow

**Shell:** Focus
**Workbench:** paper_photo_upload
**Artifact:** Core Flow Image

```text
┌────────────────────────────── WORKBENCH 1.5 ──────────────────────────────┐
│ Map the Core Flow                                                         │
│                                                                           │
│ WATCH FIRST                                                               │
│ [ large lesson video ]                                                    │
│                                                                           │
│ DO THIS NOW                                                               │
│ 1. Watch the walkthrough                                                  │
│ 2. Draw the core flow on paper in 5–7 steps                               │
│ 3. Take one clear photo                                                   │
│ 4. Upload it here                                                         │
│                                                                           │
│ UPLOAD THE PHOTO                                                          │
│ [ file input ]                                                            │
│ [ uploaded image preview ]                                                │
│                                                                           │
│ NEED CONTEXT?                                                             │
│ [ Our user ] [ Outcome statement ]                                        │
│                                                                           │
│ [Back]                                                     [Complete]     │
└───────────────────────────────────────────────────────────────────────────┘
```

## 1.6 Scope Hammer

**Shell:** Split
**Workbench:** scope_split
**Artifact:** Scope Boundary

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 1.6 ──────────────┬──── COACH ────┐
│ CEO 1.6                   │ Scope Hammer                              │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ IN SCOPE                  OUT OF SCOPE    │                │
│ [ ] Keep the core path    │ ┌──────────────────┐     ┌──────────────┐ │ TRANSCRIPT     │
│ [ ] Remove fantasy items  │ │ + Add item       │     │ + Add item   │ │ [collapsed]    │
│ [ ] Leave with a tighter  │ │ • item           │     │ • item       │ │                │
│     v1                    │ │ • item           │     │ • item       │ │ EXAMPLES       │
│                           │ └──────────────────┘     └──────────────┘ │ scope examples │
│ Output                    │                                           │                │
│ Scope Boundary            │ Why this is enough for v1 [ multiline ]   │ RESOURCES      │
│                           │                                           │ [collapsed]    │
│ Next Unlock               │                               [Back][Next]│                │
│ CEO Wrap-Up               │                                           │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 1.7 CEO Wrap-Up

**Shell:** Split
**Workbench:** brief_assembler
**Artifact:** Product Brief

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 1.7 ──────────────┬──── COACH ────┐
│ CEO 1.7                   │ CEO Wrap-Up                               │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Brief Preview                             │                │
│ [ ] Review all CEO inputs │ ┌───────────────────────────────────────┐ │ TRANSCRIPT     │
│ [ ] Confirm the brief     │ │ PROBLEM                               │ │ [collapsed]    │
│ [ ] Lock the artifact     │ │ [ from 1.1 ]                          │ │                │
│                           │ │ USER                                  │ │ EXAMPLES       │
│ Output                    │ │ [ from 1.2 ]                          │ │ strong brief   │
│ Product Brief             │ │ OUTCOME                               │ │                │
│                           │ │ [ from 1.3 ]                          │ │ RESOURCES      │
│ Next Unlock               │ │ RESEARCH NOTES                        │ │ [collapsed]    │
│ Design 2.1                │ │ [ from 1.4 ]                          │ │                │
│                           │ │ CORE FLOW                             │ │                │
│                           │ │ [ image from 1.5 ]                    │ │                │
│                           │ │ SCOPE                                 │ │                │
│                           │ │ [ from 1.6 ]                          │ │                │
│                           │ └───────────────────────────────────────┘ │                │
│                           │ [Export PDF] [Lock Brief] [Back][Next]   │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

---

# DESIGN Block

## 2.1 Find References First

**Shell:** Split
**Workbench:** collector_board
**Artifact:** Reference Board

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 2.1 ──────────────┬──── COACH ────┐
│ DESIGN 2.1                │ Find References First                     │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Search / paste links                      │                │
│ [ ] Add 5–10 references   │ [ search / paste URL field ] [Add]        │ TRANSCRIPT     │
│ [ ] Save what you like    │                                           │ [collapsed]    │
│ [ ] Tag patterns          │ Board Grid                                │                │
│                           │ ┌────┐ ┌────┐ ┌────┐                      │ EXAMPLES       │
│ Output                    │ │img │ │img │ │img │                      │ reference types│
│ Reference Board           │ │tag │ │tag │ │tag │                      │                │
│                           │ └────┘ └────┘ └────┘                      │ RESOURCES      │
│ Next Unlock               │                                           │ inspiration    │
│ Sketch Before Software    │ Notes: What patterns keep repeating?      │ sources        │
│                           │ [ multiline ]                  [Back][Next]│                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 2.2 Sketch Before Software

**Shell:** Split
**Workbench:** capture_upload
**Artifact:** Sketch Set

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 2.2 ──────────────┬──── COACH ────┐
│ DESIGN 2.2                │ Sketch Before Software                    │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ 1. Sketch the main screens                │                │
│ [ ] Draw 3–5 rough screens│ 2. Keep them ugly                         │ TRANSCRIPT     │
│ [ ] Upload sketches       │ 3. Focus on structure                     │ [collapsed]    │
│                           │                                           │                │
│ Output                    │ [ Template / prompt card ]                │ EXAMPLES       │
│ Sketch Set                │ [Upload Image(s)]                         │ sketch examples│
│                           │                                           │                │
│ Next Unlock               │ Uploaded previews grid                    │ RESOURCES      │
│ Storyboard the Journey    │ [ Replace ] [ Mark Complete ] [Back][Next]│ printable page │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 2.3 Storyboard the Journey

**Shell:** Focus
**Workbench:** capture_upload
**Artifact:** Storyboard Image

```text
┌──────────────────────────────────── FOCUS WORKSPACE 2.3 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ACTIVE] [BUILD LOCKED] [SHIP LOCKED]                    │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Storyboard the Journey                                                                       │
│ Storyboard this offline on paper, tablet, or Excalidraw. One clean image is enough.        │
│                                                                                               │
│ [ Printable storyboard worksheet ]                                                            │
│ [ Do this now / timebox / finish with ]                                                       │
│ [ Sketch Set context ]                                                                        │
│ [ Upload storyboard image ]                                                                   │
│ [ Uploaded preview ]                                                                          │
│                                                                                               │
│                                                       [Back] [Complete Lesson]               │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2.4 Figma Basics for Speed

**Shell:** Watch
**Workbench:** external_workspace
**Artifact:** Figma file ready

```text
┌──────────────────────────────────── WATCH SHELL 2.4 ─────────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ACTIVE] [BUILD LOCKED] [SHIP LOCKED]                    │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2.4   FIGMA FILE READY   8-10 MIN                                                            │
│ FIGMA BASICS FOR SPEED                                                                       │
│ This is enough Figma to keep the sprint moving.                                              │
│                                                                                               │
│                                [ lesson video / placeholder ]                                │
│                                                                                               │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                           [Back] [Complete lesson]           │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Bottom skill rail                                                                             │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2.5 Turn Sketches Into Rough Screens

**Shell:** Watch
**Workbench:** external_workspace
**Artifact:** 3–5 Rough Screens

```text
┌──────────────────────────────────── WATCH SHELL 2.5 ────────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ACTIVE] [BUILD LOCKED] [SHIP LOCKED]                    │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2.5   3-5 ROUGH SCREENS   10-12 MIN                                                           │
│ TURN SKETCHES INTO ROUGH SCREENS                                                              │
│ Your job is clarity, not beauty.                                                              │
│                                                                                               │
│                                [ lesson video / placeholder ]                                │
│                                                                                               │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                           [Back] [Complete lesson]           │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Bottom skill rail                                                                             │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2.6 Choose a Visual Direction

**Shell:** Split
**Workbench:** guided_form
**Artifact:** Visual Direction

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 2.6 ──────────────┬──── COACH ────┐
│ DESIGN 2.6                │ Choose a Visual Direction                  │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Reference snapshots [ pinned ]             │                │
│ [ ] Pick a direction      │ Rough screens [ pinned ]                  │ TRANSCRIPT     │
│ [ ] Write 3 style rules   │                                           │ [collapsed]    │
│ [ ] Name what to avoid    │ Style Rule 1 [ input ]                    │                │
│                           │ Style Rule 2 [ input ]                    │ EXAMPLES       │
│ Output                    │ Style Rule 3 [ input ]                    │ visual rules   │
│ Visual Direction          │ Avoid... [ input ]                        │                │
│                           │                                           │ RESOURCES      │
│ Next Unlock               │ Direction summary preview                 │ [collapsed]    │
│ Design Wrap-Up            │                               [Back][Next]│                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 2.7 Design Wrap-Up

**Shell:** Split
**Workbench:** brief_assembler
**Artifact:** Design Spec

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 2.7 ──────────────┬──── COACH ────┐
│ DESIGN 2.7                │ Design Wrap-Up                            │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Design Spec Preview                       │                │
│ [ ] Review references     │ ┌───────────────────────────────────────┐ │ TRANSCRIPT     │
│ [ ] Review sketches       │ │ REFERENCE BOARD                       │ │ [collapsed]    │
│ [ ] Review storyboard     │ │ [ thumbnails ]                        │ │                │
│ [ ] Review style rules    │ │ SKETCHES                              │ │ EXAMPLES       │
│                           │ │ [ uploads ]                           │ │ sample spec    │
│ Output                    │ │ STORYBOARD                            │ │                │
│ Design Spec               │ │ [ upload ]                            │ │ RESOURCES      │
│                           │ │ ROUGH SCREENS                         │ │ [collapsed]    │
│ Next Unlock               │ │ [ figma link / previews ]             │ │                │
│ Build 3.1                 │ │ VISUAL DIRECTION                      │ │                │
│                           │ │ [ style rules ]                       │ │                │
│                           │ └───────────────────────────────────────┘ │                │
│                           │ [Lock Design Spec] [Back][Next]          │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

---

# BUILD Block

## 3.1 Lock Build Path and Scope

**Shell:** Split
**Workbench:** build_kickoff
**Artifact:** Agent Build Brief

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 3.1 ──────────────┬──── COACH ────┐
│ BUILD 3.1                 │ Lock Build Path and Scope                 │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Agent Brief                               │                │
│ [ ] Pull in CEO brief     │ Product: [ from CEO ]                     │ TRANSCRIPT     │
│ [ ] Pull in Design spec   │ User:    [ from CEO ]                     │ [collapsed]    │
│ [ ] Confirm v1 boundary   │ Outcome: [ from CEO ]                     │                │
│ [ ] Define first slice    │ Scope:   [ from CEO ]                     │ EXAMPLES       │
│                           │ Design:  [ from Design ]                  │ build brief    │
│ Output                    │                                           │                │
│ Agent Build Brief         │ First slice to build [ input ]            │ RESOURCES      │
│                           │ Definition of done [ multiline ]          │ starter prompt │
│ Next Unlock               │                               [Back][Next]│                │
│ Map the Repo and Starter  │                                           │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 3.2 Map the Repo and Starter

**Shell:** Watch
**Workbench:** external_workspace
**Artifact:** Repo Orientation Notes

```text
┌──────────────────────────────────── WATCH SHELL 3.2 ─────────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ACTIVE] [SHIP LOCKED]                         │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ BUILD 3.2     Repo Orientation Notes      8-10 min                                            │
│                                                                                               │
│ Map the Repo and Starter                                                                       │
│ Lock scripts, key files, and env locations before wiring providers or building screens.       │
│                                                                                               │
│ ┌───────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                                           │ │
│ │                                Lesson video                                               │ │
│ │                  Watch the repo-orientation walkthrough first                             │ │
│ │                                                                                           │ │
│ └───────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                               │
│ [Back] [Complete lesson]                                                                       │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Bottom skill rail                                                                              │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.3 Install MCPs and Skills

**Shell:** Focus
**Workbench:** guided_form
**Artifact:** Tooling Stack Ready

```text
┌──────────────────────────────────── FOCUS WORKSPACE 3.3 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ACTIVE] [SHIP LOCKED]      [Split][Focus]   │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Collapsed Objective Rail]                                                                    │
│                                                                                               │
│ Guided setup workspace                                                                         │
│ ┌───────────────────────────────┬───────────────────────────────────────────────────────────┐ │
│ │ Tooling checklist             │ Setup notes                                               │ │
│ │ - Figma MCP                   │                                                           │ │
│ │ - Playwright MCP              │                                                           │ │
│ │ - provider skills             │                                                           │ │
│ └───────────────────────────────┴───────────────────────────────────────────────────────────┘ │
│ Coach PiP [video]                                                                              │
│ [Save tooling stack] [Back] [Next]                                                             │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.4 Wire DB, Auth, and Payments

**Shell:** Focus
**Workbench:** external_workspace
**Artifact:** Integration Setup Complete

```text
┌──────────────────────────────────── FOCUS WORKSPACE 3.4 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ACTIVE] [SHIP LOCKED]                        │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│ BUILD 3.4 · Integration Setup Complete · 12-15 min                                             │
│ Wire DB, Auth, and Payments                                                                    │
│ Set env keys, auth templates, Stripe objects, and webhook flow before implementation expands. │
│                                                                                               │
│ ┌───────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                Lesson video                                               │ │
│ │                 Watch the integration walkthrough before continuing                       │ │
│ │                                                                                           │ │
│ └───────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                               │
│ [Save integration setup] [Back] [Next]                                                         │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.5 Switch to Sandbox and Boot Local

**Shell:** Watch
**Workbench:** external_workspace
**Artifact:** Working Local Environment

```text
┌──────────────────────────────────── WATCH SHELL 3.5 ────────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ACTIVE] [SHIP LOCKED]                        │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│ BUILD 3.5 · Working Local Environment · 8-10 min                                               │
│ Switch to Sandbox and Boot Local                                                               │
│ Switch to test keys, refresh webhook values, and verify a clean local baseline run.           │
│                                                                                               │
│ ┌───────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                Lesson video                                               │ │
│ │                    Watch the sandbox/local-baseline walkthrough first                     │ │
│ │                                                                                           │ │
│ └───────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                               │
│ [Back] [Complete lesson]                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.10 Finalize Build Handoff and Unlock Ship

**Shell:** Focus
**Workbench:** brief_assembler
**Artifact:** Local Build Handoff

```text
┌─────────────────────────────────── FOCUS WORKSPACE 3.10 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ACTIVE] [SHIP LOCKED]                        │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│ ┌───────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                Lesson video                                               │ │
│ │                   Watch the Build wrap-up before moving into Ship                        │ │
│ │                                                                                           │ │
│ └───────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                               │
│ Build block complete                                                                          │
│ Ship unlocked                                                                                 │
│ Next: SHIP 4.1 — Ship the Core, Not the Fantasy                                               │
│                                                                                               │
│ Stats: [Path] [Environment] [Core UX] [Stability]                                             │
│                                                                                               │
│ What Ship now has                                                                             │
│ - Build plan                                                                                  │
│ - Local environment                                                                           │
│ - Core UX                                                                                     │
│ - Stability pass                                                                              │
│                                                                                               │
│ Skills you flexed: Prompt control / Slice planning / Local setup / Debugging                  │
│                                                                                               │
│ [Back] [Unlock Ship]                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# SHIP Block

## 4.1 Ship the Core, Not the Fantasy

**Shell:** Split
**Workbench:** console_checklist
**Artifact:** Ship Checklist

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 4.1 ──────────────┬──── COACH ────┐
│ SHIP 4.1                  │ Ship the Core, Not the Fantasy            │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Ship Checklist                             │                │
│ [ ] Remove nonessential   │ [ ] Core flow works                        │ TRANSCRIPT     │
│ [ ] Confirm one clear     │ [ ] No broken route                        │ [collapsed]    │
│     path                  │ [ ] Main CTA visible                       │                │
│ [ ] Prep for deploy       │ [ ] Basic polish only                      │ EXAMPLES       │
│                           │ [ ] Ready to deploy                        │ launch-ready   │
│ Output                    │                                            │ example        │
│ Ship Checklist            │ Any last thing to cut? [ input ]           │                │
│                           │                                [Back][Next]│ RESOURCES      │
│ Next Unlock               │                                            │ [collapsed]    │
│ Deploy the App            │                                            │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 4.2 Deploy the App

**Shell:** Focus
**Workbench:** external_workspace
**Artifact:** Live URL

```text
┌──────────────────────────────────── FOCUS WORKSPACE 4.2 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ✓] [SHIP ACTIVE]          [Split][Focus]    │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Collapsed Objective Rail]                                                                    │
│                                                                                               │
│ DEPLOY                                                                                         │
│ [ Open deploy platform ]                                                                      │
│                                                                                               │
│ Live URL field: [ https://your-app-url.com ] [ Verify ]                                      │
│                                                                                               │
│ Verification state:                                                                            │
│ STATUS: DEPLOYING... / LIVE                                                                    │
│                                                                                               │
│ Coach PiP [video]                                                                              │
│ [Mark live] [Back] [Next]                                                                      │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 4.3 Record a Simple Demo

**Shell:** Split
**Workbench:** capture_upload
**Artifact:** Demo Clip

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 4.3 ──────────────┬──── COACH ────┐
│ SHIP 4.3                  │ Record a Simple Demo                      │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ 1. Show the main problem                  │                │
│ [ ] Record 30–60 sec clip │ 2. Show the app solving it                │ TRANSCRIPT     │
│ [ ] Upload the clip       │ 3. End on live URL                        │ [collapsed]    │
│                           │                                           │                │
│ Output                    │ [ Record prompt card ]                    │ EXAMPLES       │
│ Demo Clip                 │ [Upload Video]                            │ demo examples  │
│                           │                                           │                │
│ Next Unlock               │ Uploaded video preview                    │ RESOURCES      │
│ Send It to Real Humans    │ [ Replace ] [ Mark Complete ] [Back][Next]│ script prompt  │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 4.4 Send It to Real Humans

**Shell:** Split
**Workbench:** tracker_log
**Artifact:** Send Log

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 4.4 ──────────────┬──── COACH ────┐
│ SHIP 4.4                  │ Send It to Real Humans                    │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Send Tracker                               │                │
│ [ ] Make 5 sends          │ ┌─────────┬─────────────┬──────────┬─────┐ │ TRANSCRIPT     │
│ [ ] Log who got it        │ │ Person  │ Channel     │ Sent?    │Reply│ │ [collapsed]    │
│ [ ] Capture responses     │ ├─────────┼─────────────┼──────────┼─────┤ │                │
│                           │ │ [text]  │ [text]      │ [yes/no] │[txt]│ │ EXAMPLES       │
│ Output                    │ │ [text]  │ [text]      │ [yes/no] │[txt]│ │ send scripts    │
│ Send Log                  │ └─────────┴─────────────┴──────────┴─────┘ │                │
│                           │                                           │ RESOURCES      │
│ Next Unlock               │ [Add Row]                      [Back][Next]│ templates      │
│ Capture Feedback          │                                           │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 4.5 Capture Feedback and Plan V2

**Shell:** Split
**Workbench:** tracker_log
**Artifact:** Feedback Log + V2 Priorities

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 4.5 ──────────────┬──── COACH ────┐
│ SHIP 4.5                  │ Capture Feedback and Plan V2              │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Feedback Log                               │                │
│ [ ] Add user feedback     │ ┌─────────┬────────────┬───────────────┐   │ TRANSCRIPT     │
│ [ ] Group patterns        │ │ Source  │ What they  │ Priority       │   │ [collapsed]    │
│ [ ] Name top 3 v2 items   │ │         │ said       │                │   │                │
│                           │ ├─────────┼────────────┼───────────────┤   │ EXAMPLES       │
│ Output                    │ │ [text]  │ [text]     │ [1/2/3]       │   │ feedback types │
│ Feedback Log              │ └─────────┴────────────┴───────────────┘   │                │
│ V2 Priorities             │                                             │ RESOURCES      │
│                           │ Top 3 V2 Priorities                         │ [collapsed]    │
│ Next Unlock               │ 1 [ input ]  2 [ input ]  3 [ input ]      │                │
│ Final Wrap                │                                [Back][Next] │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 4.6 Final Wrap

**Shell:** Split
**Workbench:** brief_assembler
**Artifact:** Final Mission Record

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 4.6 ──────────────┬──── COACH ────┐
│ SHIP 4.6                  │ Final Wrap                                │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ MISSION COMPLETE                           │                │
│ [ ] Confirm live URL      │                                           │ TRANSCRIPT     │
│ [ ] Confirm demo clip     │ Live URL        [ from 4.2 ]              │ [collapsed]    │
│ [ ] Confirm sends         │ Demo Clip       [ from 4.3 ]              │                │
│ [ ] Confirm feedback log  │ Send Log        [ from 4.4 ]              │ EXAMPLES       │
│                           │ V2 Priorities   [ from 4.5 ]              │ [collapsed]    │
│ Output                    │                                           │                │
│ Final Mission Record      │ Reflection: What did I ship? [ multiline ]│ RESOURCES      │
│                           │ Reflection: What is next? [ multiline ]   │ [collapsed]    │
│ Reward                    │                                           │                │
│ APP STATUS: LIVE          │ [Export Record] [Complete Sprint]         │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

---

# Bottom Skill Rail Mapping

## CEO

1.1 Start With the Problem
1.2 Pick One User
1.3 Define the Outcome
1.4 Light Research
1.5 Map the Core Flow
1.6 Scope Hammer
1.7 CEO Wrap-Up

## DESIGN

2.1 Find References First
2.2 Sketch Before Software
2.3 Storyboard the Journey
2.4 Figma Basics for Speed
2.5 Turn Sketches Into Rough Screens
2.6 Choose a Visual Direction
2.7 Design Wrap-Up

## BUILD

3.1 Lock Build Path and Scope
3.2 Map the Repo and Starter
3.3 Install MCPs and Skills
3.4 Wire DB, Auth, and Payments
3.5 Switch to Sandbox and Boot Local
3.6 Read and Execute AI Plans
3.7 Implement the First Slice
3.8 Build the Core UX End-to-End
3.9 Debug and Stabilize Without Spiraling
3.10 Finalize Build Handoff and Unlock Ship

## SHIP

4.1 Ship the Core, Not the Fantasy
4.2 Deploy the App
4.3 Record a Simple Demo
4.4 Send It to Real Humans
4.5 Capture Feedback and Plan V2
4.6 Final Wrap

---

# Build Notes

## What should be coded as reusable components first

1. `LessonShellSplit`
2. `LessonShellFocus`
3. `ObjectiveDrawer`
4. `CoachDock`
5. `CoachPiP`
6. `WorkbenchRenderer`
7. `ArtifactPreviewCard`
8. `SkillRail`
9. `LessonRegistry`
10. `ArtifactStore`

## What should NOT be custom-built right now

- drag-and-drop flow mapper
- in-app sketch editor
- in-app storyboard editor
- full Figma replacement
- full IDE replacement

Use upload / embed / link patterns instead.

## Progress Counter Note

The visual system can keep `0 / 21` as placeholder for now, but the lesson registry should be the source of truth before engineering freeze.
