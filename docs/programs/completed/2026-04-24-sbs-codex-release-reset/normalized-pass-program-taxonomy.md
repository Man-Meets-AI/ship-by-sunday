# Program Taxonomy Normalized

## Facts

- The source taxonomy says this initiative needs one Program packet above several child ExecPlans.
- The source taxonomy split the work into current-state/Codex reference, command surface and CLI deletion, QA control-plane deletion, CI workflow replacement, release tags and artifacts, branch policy and promotion, and test strategy/proof migration.
- The source taxonomy explicitly separated CLI deletion from QA deletion, QA deletion from test deletion, CI replacement from branch policy, release tags from release readiness, and branch policy from test strategy.
- `docs/programs/PROGRAMS.md` requires a Program folder with `program.md`, research passes, normalized memos, convergence packet, dependency graph, plan split, cross-repo review, planning brief, and current planning brief pointer.
- `bun run programs:lint` is the packet validation surface once the full Program packet exists.

## Recommendation

Use the taxonomy as a boundary contract for convergence. The future decision packet should compare tracks without collapsing them prematurely, and the future plan split should keep CLI, QA, CI, release tags, branch policy, test migration, and docs/GitHub automation as separable implementation slices unless dependency analysis proves they must combine.

## Risks

- Combining CLI deletion, QA retirement, and CI replacement into one slice would create unnecessary blast radius.
- Treating tag release as sufficient release readiness would ignore Vercel, Convex, billing, and entitlement proof.
- Treating the rejected Dub-style harness plan as an execution source would reintroduce stale direction.
- Creating child ExecPlans before convergence would force implementers to resolve unresolved Program-level decisions inside execution plans.

## Code Seams

- `docs/programs/PROGRAMS.md`
- `docs/programs/README.md`
- `docs/prompts/program-normalize-pass.md`
- `docs/prompts/program-converged-decision-packet.md`
- `docs/prompts/program-dependency-graph.md`
- `docs/prompts/program-plan-split-recommendation.md`
- `docs/prompts/program-cross-repo-review.md`
- `docs/prompts/program-planning-brief.md`
- this Program folder
- future child ExecPlans under `docs/exec-plans/active/`

## Proposed Slices

1. Finish normalized memos for every research pass.
2. Write a convergence packet that chooses the direction without implementation detail.
3. Write a dependency graph that separates true blockers from parallelizable cleanup.
4. Write a plan split recommendation with bounded child ExecPlans.
5. Write `planning-brief-1.md` only after the split is reviewed.

