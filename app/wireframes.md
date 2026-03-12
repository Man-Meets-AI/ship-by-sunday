# Ship by Sunday — Full Wireframe Pack v1

This pack freezes the product into **2 shells** and maps every lesson to a reusable workbench pattern.

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

**Shell:** Split
**Workbench:** capture_upload
**Artifact:** Core Flow Image

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 1.5 ──────────────┬──── COACH ────┐
│ CEO 1.5                   │ Map the Core Flow                         │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ 1. Draw the flow on paper / tablet        │                │
│ [ ] Watch the example     │ 2. 5–7 steps max                          │ TRANSCRIPT     │
│ [ ] Draw the flow         │ 3. One actor first                        │ [collapsed]    │
│ [ ] Upload a photo        │                                           │                │
│                           │ [ Static template preview ]               │ EXAMPLES       │
│ Output                    │                                           │ good example   │
│ Core Flow Image           │ [Download Template]                       │ bad example    │
│                           │ [Upload Image]                            │                │
│ Next Unlock               │                                           │ RESOURCES      │
│ Scope Hammer              │ Uploaded artifact preview                 │ printable sheet│
│                           │ [ Replace ] [ Mark Complete ] [Back][Next]│                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
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

**Shell:** Split
**Workbench:** capture_upload
**Artifact:** Storyboard Image

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 2.3 ──────────────┬──── COACH ────┐
│ DESIGN 2.3                │ Storyboard the Journey                    │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ 1. Show the user moving screen to screen  │                │
│ [ ] Draw 5–7 frames       │ 2. Capture state change                   │ TRANSCRIPT     │
│ [ ] Upload storyboard     │                                           │ [collapsed]    │
│                           │ [ Static storyboard template ]            │                │
│ Output                    │ [Upload Image]                            │ EXAMPLES       │
│ Storyboard Image          │                                           │ before/after   │
│                           │ Uploaded preview                          │                │
│ Next Unlock               │ [ Replace ] [ Mark Complete ] [Back][Next]│ RESOURCES      │
│ Figma Basics for Speed    │                                           │ [collapsed]    │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 2.4 Figma Basics for Speed

**Shell:** Focus
**Workbench:** external_workspace
**Artifact:** Figma file ready

```text
┌──────────────────────────────────── FOCUS WORKSPACE 2.4 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ACTIVE] [BUILD LOCKED] [SHIP LOCKED]   [Split][Focus] │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Collapsed Objective Rail]                                                                    │
│                                                                                               │
│                              FIGMA EMBED / LAUNCH FIGMA                                      │
│                                                                                               │
│                     [ Open Figma ]   [ Open Starter File ]   [ View Hotkeys ]                │
│                                                                                               │
│ Coach PiP [video]                                                                             │
│                                                                                               │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Bottom skill rail                                                                             │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2.5 Turn Sketches Into Rough Screens

**Shell:** Focus
**Workbench:** external_workspace
**Artifact:** 3–5 Rough Screens

```text
┌──────────────────────────────────── FOCUS WORKSPACE 2.5 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ACTIVE] [BUILD LOCKED] [SHIP LOCKED]   [Split][Focus] │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Collapsed Objective Rail]                                                                    │
│                                                                                               │
│                         FIGMA EMBED / SCREEN-BUILD WORKSPACE                                 │
│                                                                                               │
│                    Left overlay: uploaded sketches / storyboard references                    │
│                    Center: live Figma                                                         │
│                                                                                               │
│ Coach PiP [video]                                                                             │
│                                                                                               │
│                    [Mark rough screens ready] [Back] [Next]                                   │
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

## 3.1 Build From the Brief

**Shell:** Split
**Workbench:** brief_assembler
**Artifact:** Agent Build Brief

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 3.1 ──────────────┬──── COACH ────┐
│ BUILD 3.1                 │ Build From the Brief                      │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Agent Brief                               │                │
│ [ ] Pull in CEO brief     │ Product: [ from CEO ]                     │ TRANSCRIPT     │
│ [ ] Pull in Design spec   │ User:    [ from CEO ]                     │ [collapsed]    │
│ [ ] Confirm v1 boundary   │ Outcome: [ from CEO ]                     │                │
│ [ ] Define first slice    │ Scope:   [ from CEO ]                     │ EXAMPLES       │
│                           │ Design:  [ from Design ]                  │ build brief    │
│ Output                    │                                           │                │
│ Agent Build Brief         │ First screen to build [ input ]           │ RESOURCES      │
│                           │ Definition of done [ multiline ]          │ starter prompt │
│ Next Unlock               │                               [Back][Next]│                │
│ Set Up the Environment    │                                           │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
```

## 3.2 Set Up the Environment

**Shell:** Focus
**Workbench:** console_checklist
**Artifact:** Working Local Environment

```text
┌──────────────────────────────────── FOCUS WORKSPACE 3.2 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ACTIVE] [SHIP LOCKED]      [Split][Focus]   │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Collapsed Objective Rail]                                                                    │
│                                                                                               │
│ Launch your local environment                                                                  │
│                                                                                               │
│ Checklist panel overlay:                                                                       │
│ [ ] Repo / starter opened                                                                      │
│ [ ] Dependencies installed                                                                     │
│ [ ] App runs locally                                                                           │
│ [ ] Screenshot / confirmation captured                                                         │
│                                                                                               │
│ Main area: terminal / IDE / setup instructions                                                 │
│ Coach PiP [video]                                                                              │
│                                                                                               │
│ [Mark environment ready] [Back] [Next]                                                         │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Bottom skill rail                                                                              │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.3 Brief the Agent Correctly

**Shell:** Focus
**Workbench:** external_workspace
**Artifact:** First Implemented Slice

```text
┌──────────────────────────────────── FOCUS WORKSPACE 3.3 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ACTIVE] [SHIP LOCKED]      [Split][Focus]   │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Collapsed Objective Rail]                                                                    │
│                                                                                               │
│ Agent / IDE Workspace                                                                          │
│ ┌───────────────────────────────┬───────────────────────────────────────────────────────────┐ │
│ │ Prompt brief drawer           │ Code / builder area                                       │ │
│ │ - product brief               │                                                           │ │
│ │ - design spec                 │                                                           │ │
│ │ - first slice                 │                                                           │ │
│ └───────────────────────────────┴───────────────────────────────────────────────────────────┘ │
│ Coach PiP [video]                                                                              │
│ [Capture result] [Back] [Next]                                                                 │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.4 Build the Core Flow

**Shell:** Focus
**Workbench:** external_workspace
**Artifact:** Core Flow Working Locally

```text
┌──────────────────────────────────── FOCUS WORKSPACE 3.4 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ACTIVE] [SHIP LOCKED]      [Split][Focus]   │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Collapsed Objective Rail]                                                                    │
│                                                                                               │
│ IDE / Builder Workspace                                                                        │
│                                                                                               │
│ Side overlay: Core flow checklist                                                              │
│ [ ] Step 1 works                                                                               │
│ [ ] Step 2 works                                                                               │
│ [ ] Step 3 works                                                                               │
│ [ ] End state works                                                                            │
│                                                                                               │
│ Coach PiP [video]                                                                              │
│                                                                                               │
│ [Mark core flow working] [Back] [Next]                                                         │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.5 Debug Without Spiraling

**Shell:** Focus
**Workbench:** tracker_log
**Artifact:** Blocker Log + Working App

```text
┌──────────────────────────────────── FOCUS WORKSPACE 3.5 ────────────────────────────────────┐
│ SHIP BY SUNDAY      [CEO ✓] [DESIGN ✓] [BUILD ACTIVE] [SHIP LOCKED]      [Split][Focus]   │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Collapsed Objective Rail]                                                                    │
│                                                                                               │
│ Debug Log                                                                                      │
│ ┌─────────────┬──────────────┬──────────────┬────────────┐                                    │
│ │ Blocker     │ What caused  │ Fix tried    │ Resolved?  │                                    │
│ ├─────────────┼──────────────┼──────────────┼────────────┤                                    │
│ │ [text]      │ [text]       │ [text]       │ [yes/no]   │                                    │
│ └─────────────┴──────────────┴──────────────┴────────────┘                                    │
│                                                                                               │
│ IDE / preview remains primary                                                                  │
│ Coach PiP [video]                                                                              │
│ [Mark app stable] [Back] [Next]                                                                │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.6 Build Wrap-Up

**Shell:** Split
**Workbench:** brief_assembler
**Artifact:** Working Local App + Build Summary

```text
┌──── CURRENT OBJECTIVE ────┬────────────── WORKBENCH 3.6 ──────────────┬──── COACH ────┐
│ BUILD 3.6                 │ Build Wrap-Up                             │ WATCH          │
│                           │                                           │ [video]        │
│ Checklist                 │ Build Summary                             │                │
│ [ ] Confirm local app     │ - brief used                             │ TRANSCRIPT     │
│ [ ] Confirm core flow     │ - core flow complete                     │ [collapsed]    │
│ [ ] Capture blockers      │ - blocker log                            │                │
│ [ ] Save next handoff     │ - local run confirmation                 │ EXAMPLES       │
│                           │                                           │ sample handoff │
│ Output                    │ What is working now? [ multiline ]       │                │
│ Build Summary             │ What is not built yet? [ multiline ]     │ RESOURCES      │
│                           │ Local URL / repo ref [ input ]           │ [collapsed]    │
│ Next Unlock               │                               [Back][Next]│                │
│ Ship 4.1                  │                                           │                │
└───────────────────────────┴───────────────────────────────────────────┴────────────────┘
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

3.1 Build From the Brief
3.2 Set Up the Environment
3.3 Brief the Agent Correctly
3.4 Build the Core Flow
3.5 Debug Without Spiraling
3.6 Build Wrap-Up

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
