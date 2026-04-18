# Codex Long-Horizon Task Checklist

Use this before, during, and after any substantial Codex run.

---

## 1) Task Definition

- [ ] The goal is explicit and concrete.
- [ ] The expected deliverable is named.
- [ ] "Done when" criteria are written down.
- [ ] Non-goals are written down.
- [ ] Hard constraints are listed.
- [ ] Relevant repo, product, and architecture context is attached.
- [ ] User-visible behavior is described, not just implementation wishes.
- [ ] For bugs: exact repro steps are included.
- [ ] For UI work: screenshots / mocks / examples are attached when available.
- [ ] For risky work: rollback expectations are defined.

## 2) Durable Memory Setup

- [ ] `AGENTS.md` exists at repo root.
- [ ] `docs/prompt.md` exists for the current initiative.
- [ ] `docs/plans.md` exists for milestone sequencing.
- [ ] `docs/implement.md` exists for runbook / execution rules.
- [ ] `docs/documentation.md` exists for live status and audit logging.
- [ ] Instructions are split by permanence:
  - [ ] durable repo rules in `AGENTS.md`
  - [ ] task spec in `docs/prompt.md`
  - [ ] sequencing in `docs/plans.md`
  - [ ] operating behavior in `docs/implement.md`
  - [ ] evolving state in `docs/documentation.md`
- [ ] Any directory-specific rules have local nested `AGENTS.md` files.

## 3) Planning Quality

- [ ] A plan exists before major implementation starts.
- [ ] The plan is milestone-based.
- [ ] Each milestone is small enough to finish in one loop.
- [ ] Each milestone has acceptance criteria.
- [ ] Each milestone has concrete validation commands.
- [ ] The plan defines a stop-and-fix rule.
- [ ] The plan documents key decisions to prevent oscillation.
- [ ] The plan names intended architecture / file ownership boundaries.
- [ ] Risks and unknowns are listed.
- [ ] Dependencies are called out.

## 4) Environment and Safety

- [ ] The sandbox/approval mode is appropriate for the task.
- [ ] Network access is enabled only if actually needed.
- [ ] Required env vars, services, and seed data are documented.
- [ ] Worktree or branch strategy is decided before concurrent runs begin.
- [ ] Local setup/bootstrap commands are documented.
- [ ] Dangerous commands or forbidden paths are explicitly disallowed.
- [ ] External tool output is treated as untrusted input.

## 5) Execution Discipline

- [ ] Codex reads `AGENTS.md` first.
- [ ] Codex reads `docs/prompt.md` before changing code.
- [ ] Codex follows `docs/plans.md` milestone by milestone.
- [ ] Codex follows `docs/implement.md` as the runbook.
- [ ] Diffs stay scoped to the active milestone.
- [ ] Progress is logged continuously in `docs/documentation.md`.
- [ ] When a check fails, Codex repairs before moving forward.
- [ ] Scope creep is explicitly rejected unless the plan is updated.
- [ ] Major course corrections are recorded.

## 6) Verification Loop

- [ ] Validation runs after every milestone.
- [ ] Relevant checks are included:
  - [ ] tests
  - [ ] lint
  - [ ] typecheck
  - [ ] build
  - [ ] smoke/demo flow
- [ ] Failed checks are fixed before proceeding.
- [ ] If a validation step cannot run, the reason is logged.
- [ ] Diff review happens before marking work done.
- [ ] Final behavior is verified, not just compilation.

## 7) Long-Session Hygiene

- [ ] One thread/session is used per coherent task.
- [ ] The same thread is reused while the task is active.
- [ ] Context compaction/summarization is used when the session grows large.
- [ ] Forking only happens for true branches in approach.
- [ ] Durable docs are treated as the memory backbone, not chat history alone.

## 8) Parallelism

- [ ] Concurrent work is isolated with worktrees or equivalent.
- [ ] No two active runs edit the same files without isolation.
- [ ] Shared setup steps for worktrees are documented.
- [ ] Merge / handoff expectations are written down.

## 9) Reusable Workflow Extraction

- [ ] Repeated prompt patterns are candidates for skills.
- [ ] External context/tool access is a candidate for MCP.
- [ ] Automations are only added after the manual workflow is reliable.
- [ ] Any newly learned recurring rule is moved into durable instructions.

## 10) Review and Handoff

- [ ] Final summary names what changed.
- [ ] Final summary names what was verified.
- [ ] Final summary names open issues / follow-ups.
- [ ] Final summary includes run/demo instructions.
- [ ] Final summary notes any skipped validation and why.
- [ ] Relevant docs were updated along with the code.

---

## Official OpenAI Source Set

Use these as the canonical references behind this checklist.

- Best practices: `https://developers.openai.com/codex/learn/best-practices/`
- AGENTS.md guide: `https://developers.openai.com/codex/guides/agents-md/`
- Customization: `https://developers.openai.com/codex/concepts/customization/`
- Run long horizon tasks with Codex: `https://developers.openai.com/blog/run-long-horizon-tasks-with-codex/`
- Prompting guide: `https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide/`
- Skills: `https://developers.openai.com/codex/skills/`
- Worktrees: `https://developers.openai.com/codex/app/worktrees/`
- Automations: `https://developers.openai.com/codex/app/automations/`
- App features: `https://developers.openai.com/codex/app/features/`
- Building an AI-native engineering team: `https://developers.openai.com/codex/guides/build-ai-native-engineering-team/`
