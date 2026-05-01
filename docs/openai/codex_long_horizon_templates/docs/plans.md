# PLANS.md

## Initiative

[Name]

## Goal

[One paragraph summary of the desired end state.]

## Non-goals

- [...]
- [...]

## Constraints

- [...]
- [...]

## Architecture intent

[Describe the intended shape of the solution before implementation sprawls.]

## Source facts to preserve

- Product facts: `docs/facts/project-definition.json`
- Visual system: `DESIGN.md`
- Current task contract: `docs/prompt.md`
- Existing app conventions: [files / folders / tests]

## Active milestone selection

Before implementation begins, mark exactly one milestone as active. The active milestone should be the smallest complete user-visible slice that advances the task without forcing unrelated refactors.

## Milestone map

| Milestone | Outcome | Acceptance criteria | Validation commands | Status |
|---|---|---|---|---|
| M1 | [...] | [...] | `[...]` | Not started |
| M2 | [...] | [...] | `[...]` | Not started |
| M3 | [...] | [...] | `[...]` | Not started |

## Detailed milestone plans

### M1 — [Name]

**Objective**

[What this milestone accomplishes.]

**User-visible result**

[What changes for the user, buyer, operator, or reviewer when this milestone is done.]

**Owned files / boundaries**

- Primary files: [...]
- Files to avoid unless explicitly needed: [...]
- External systems touched: [...]

**Tasks**

1. [...]
2. [...]
3. [...]

**Acceptance criteria**

- [ ] [...]
- [ ] [...]

**Validation commands**

```bash
# Run these before moving on
...
...
```

**Evidence required**

- [ ] Requirement-to-evidence entry added to `docs/documentation.md`.
- [ ] Validation output summarized with pass/fail/blocked status.
- [ ] Demo or repro steps recorded when behavior changed.

**Notes / decisions**

- [...]

### M2 — [Name]

**Objective**

[...]

**Tasks**

1. [...]
2. [...]
3. [...]

**Acceptance criteria**

- [ ] [...]
- [ ] [...]

**Validation commands**

```bash
...
...
```

**Notes / decisions**

- [...]

### M3 — [Name]

**Objective**

[...]

**Tasks**

1. [...]
2. [...]
3. [...]

**Acceptance criteria**

- [ ] [...]
- [ ] [...]

**Validation commands**

```bash
...
...
```

**Notes / decisions**

- [...]

## Stop-and-fix rule

If a milestone validation fails:
1. stop forward progress,
2. diagnose the failure,
3. repair the failure,
4. rerun validation,
5. only then continue.

Do not mark a failed validation as a follow-up unless the failure is unrelated to the active milestone and the reason is recorded in `docs/documentation.md`.

## Risks and unknowns

- [...]
- [...]
- [...]

## Rollback / escape hatch

[Describe how to back out or reduce blast radius if the approach goes sideways.]
