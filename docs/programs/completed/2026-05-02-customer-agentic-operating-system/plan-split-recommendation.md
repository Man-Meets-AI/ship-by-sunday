# Plan Split Recommendation

## Completed Child ExecPlans

The Program kept one initiative document and split implementation into child ExecPlans by dependency, not by ambition. The final completed split was:

1. `reconcile-customer-agentic-source-contract`.
   Completed at `docs/exec-plans/completed/2026-05-02-reconcile-customer-agentic-source-contract.md`. It protected generated-repo output before the generated operating pack expanded.

2. `existing-codebase-checkout-intent-routing`.
   Completed at `docs/exec-plans/completed/2026-05-04-existing-codebase-checkout-intent-routing.md`. Persist buyer starting point through homepage CTA, checkout, Stripe metadata, pending checkout claims, product access grants, checkout success, and fulfillment routing. Generated buyers go to `/codebase`; existing-codebase buyers go to `/workspace/setup`; missing or legacy intent goes to a small choice screen.

3. `existing-codebase-workspace-data-model-and-events`.
   Completed at `docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md`. Add separate existing-codebase workspace state instead of overloading generated-codebase `projectDefinitions` and `codebaseWorkflowStates`. Include `workspaceProjects`, `workspaceRunnerBindings`, `workspaceRepositoryBindings`, `doctorPassRuns`, `codebaseFindings`, later `workflowRuns`, and an append-only sync-safe runner event stream through the hosted backend.

4. `existing-codebase-setup-ui`.
   Completed at `docs/exec-plans/completed/2026-05-04-existing-codebase-setup-ui.md`. Build `/workspace/setup` as Machine Setup plus Project Setup readiness. Include local runner pairing command, daemon and one-shot states, blockers, warnings, privacy defaults, default open destination, and `Run doctor pass`. Do not show findings, abstract loop setup, or queue controls.

5. `local-runner-prototype`.
   Completed at `docs/exec-plans/completed/2026-05-04-local-runner-prototype.md`. Build `bunx ship-by-sunday setup pair <token>` with `npx` fallback, daemon and one-shot mode, local `.sbs/` state, `gh` readiness, SBS Codex profiles plus permission profiles, parse-backed config diff and backup, profile drift detection, packed-command proof, and `codex exec --json` JSONL boundaries.

6. `doctor-pass-and-sync-preview`.
   Completed at `docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md`. Productize passive probes such as `codebase-intake`, `command-proof-map`, `codex-setup-audit`, `repo-doctor-top-nine`, and `source-truth-agent-readiness`. Keep Crawl branchless, produce sync-safe JSON plus local Markdown reports, and require sync preview approval before findings upload.

7. `findings-ledger-and-decision-screens`.
   Completed at `docs/exec-plans/completed/2026-05-04-findings-ledger-and-decision-screens.md`. Build `/workspace/findings` and `/workspace/findings/[findingId]` around dense Top 9 finding rows, finding detail, buyer impact, proof path, evidence refs without raw source, permission requirements, recommended workflow, and `Approve workflow`. Consume uploaded findings from the doctor-pass plan; do not reimplement probe execution or sync preview approval.

8. `source-truth-agent-readiness-workflow`.
   Completed at `docs/exec-plans/completed/2026-05-04-source-truth-agent-readiness-workflow.md`. Ship the first Walk workflow packet. Add approval sheet, SBS profile selection, write lease, timestamped branch, docs and `.sbs/` write boundary, proof output, local diff delivery, and second explicit `Open PR`.

9. `workspace-support-surfaces`.
   Completed at `docs/exec-plans/completed/2026-05-04-workspace-support-surfaces.md`. Build `/workspace/runs`, `/workspace/loops`, and `/workspace/privacy` for Crawl and Walk. Runs show history, loops show a finding-filtered workflow catalog, and privacy shows local execution and sync boundaries with revoke and delete controls.

10. `existing-codebase-work-phase-workers`.
   Completed at `docs/exec-plans/completed/2026-05-04-existing-codebase-work-phase-workers.md`. Add the always-on local worker layer after one approved workflow works: approved queue, recurring jobs, heartbeat, run history, pause and stop controls, proof sync, blocked-state reporting, multi-machine support, and one active write lease per project.

11. `broken-app-rescue-loop`.
   Completed at `docs/exec-plans/completed/2026-05-04-broken-app-rescue-loop.md`. Add the conditional high-value workflow for customers who arrive with a concrete failure. Start with read-only reproduction and root-cause localization; patch only after approval and proof boundaries are known.

12. `managed-github-run-phase`.
   Completed at `docs/exec-plans/completed/2026-05-04-managed-github-run-phase.md`. Add premium or concierge managed GitHub execution only after local Crawl, Walk, and Work are proven. Require explicit repo access, branch and PR authority, CI visibility, storage policy, audit log, raw-source visibility rules, operator boundaries, and revocation.

13. `generated-repo-operating-pack`.
   Completed at `docs/exec-plans/completed/2026-05-05-generated-repo-operating-pack.md`. After the generated-repo source-contract plan landed, ship the customer-safe Program and ExecPlan file set, explicit generated-repo bootstrap, prompts, skills, package scripts, and tests. Keep internal archives excluded and avoid hidden `postinstall` mutation.

## Dependency Order

Crawl requires plans 2 through 7. Walk requires plan 8. The first support surfaces can land beside Crawl and Walk through plan 9. Work requires plan 10. Broken-app rescue can branch from the Walk machinery through plan 11. Managed GitHub and broader Run-phase work must wait for plan 12. Generated-repo operating-pack work can continue independently after plan 1, through plan 13.

All required child ExecPlans in this split are complete. No next child plan remains inside this Program; future update-channel implementation, concrete migration recipes, generated-repo manifest rendering, mature-repo update planning, or another paid loop should start from a new Program or fresh demand-backed planning brief.

## Boundary Rules

Use `/codebase` for generated-repo buyers and `/workspace/setup` for existing-codebase buyers.

Use `finding`, not `opportunity`, for the existing-codebase ledger.

Do not store raw source, raw terminal logs, local absolute paths, secrets, or Codex transcripts by default.

Do not make `codex app-server` the foundation of the local runner. It remains one execution surface. Local existing-codebase work should be built around explicit local runner contracts and stable CLI execution where possible.

Use direct app-server relay only in a later daemon plan that handles initialization, bidirectional JSON-RPC, thread-scoped event routing, reconnect/resume, transport auth, and browser-to-daemon isolation. Crawl should start with `codex exec --json`.

Do not ship always-on worker claims before approval gates, runner persistence, queue controls, write leases, proof sync, pause/stop controls, and blocked-state reporting exist.

Do not pull package/update-channel mechanics into Crawl. Trusted upgrades are later strategy after repeated Work-phase demand exists.
