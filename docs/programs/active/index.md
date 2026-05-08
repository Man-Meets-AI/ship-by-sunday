---
title: "Active Programs"
summary: "Entry point for unfinished Program documents that still describe an active multi-slice initiative."
docType: "readme"
status: "active"
read_when:
  - "Starting work from a durable Program document."
  - "Checking whether a multi-slice initiative already has an active Program."
---

# Active Programs

Keep new and unfinished Program folders in this directory.

An active Program should describe the larger initiative that sits above several ExecPlans and should remain here until the initiative is actually complete.

Use [PROGRAMS.md](../PROGRAMS.md) as the contract before creating or updating a Program folder in this directory.

Each active Program lives at:

- `docs/programs/active/<YYYY-MM-DD-program-id>/`

Inside that folder:

- `program.md` is the canonical Program document
- the research passes, normalized tracks, synthesis artifacts, planning briefs, and `current-planning-brief.txt` live beside it

Active Program folders:

- `docs/programs/active/2026-05-07-sbs-worker-foundations-installer/` - productized Worker Foundations installer that installs visible repo-local Program, ExecPlan, prompt, validator, and Worker source into another repo.
- `docs/programs/active/2026-05-06-telegram-support-bot/` - first-party landing-page support chat, Convex support thread state, dedicated Telegram operator bot, and structured support actions.
- `docs/programs/active/2026-05-05-admin-user-impersonation/` - Clerk actor-token admin impersonation, Convex actor visibility, audit logging, support UI, and release proof.
- `docs/programs/active/2026-05-05-worker-generate-tutorials-ia/` - Generate Codebase, Tutorials, and Worker IA migration with capability-based access, canonical routes, navigation, copy, and runtime compatibility.

Completed Program packets live under `docs/programs/completed/`.
