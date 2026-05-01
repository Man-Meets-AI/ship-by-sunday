import type { CanonicalProjectFacts } from "../canonical-project-definition/project-definition";
import { BUILD_PACK_LABEL } from "../public-artifact-contract";
import {
	getGeneratedBuildDetailDocPath,
	getGeneratedBuildDocPath,
} from "../generated-docs/generated-doc-paths";
import {
	renderBulletList,
	renderSection,
	renderTemplateAppendix,
} from "./render-helpers";
import type {
	OpenAiBlueprintTemplates,
	RenderedBlueprintFile,
} from "./render-types";

function renderNumberedList(values: readonly string[]) {
	return values.map((value, index) => `${index + 1}. ${value}`).join("\n");
}

function renderInlineList(values: readonly string[]) {
	return values.join("; ");
}

function renderCodeBlock(lines: readonly string[]) {
	return ["```bash", ...lines, "```"].join("\n");
}

function buildValidationCommand(validationStep: string) {
	const normalizedStep = validationStep.toLowerCase();

	if (normalizedStep.includes("compiler")) {
		return "bun run --cwd packages/blueprint-compiler test";
	}
	if (normalizedStep.includes("typecheck")) {
		return "bun run typecheck";
	}
	if (normalizedStep.includes("lint")) {
		return "bun lint";
	}
	if (normalizedStep.includes("format")) {
		return "bun run format:check";
	}
	if (normalizedStep.includes("build")) {
		return "bun run build";
	}
	if (normalizedStep.includes("integration")) {
		return "bun run test:integration";
	}
	if (normalizedStep.includes("unit")) {
		return "bun run test:unit";
	}
	if (normalizedStep.includes("e2e") || normalizedStep.includes("sandbox")) {
		return "bun run test:e2e:sandbox";
	}

	return `# ${validationStep}`;
}

function renderRequirementRows(
	values: readonly string[],
	evidenceSource: string,
	status = "Not started",
) {
	return values
		.map((value) => `| ${value} | ${evidenceSource} | ${status} | |`)
		.join("\n");
}

export function renderBuildBlueprint(
	facts: CanonicalProjectFacts,
	templates: OpenAiBlueprintTemplates,
): RenderedBlueprintFile[] {
	const buildSummary = [
		`# ${facts.product_name} ${BUILD_PACK_LABEL}`,
		"",
		renderSection("Objective", facts.objective),
		"",
		renderSection("User-Visible Outcome", facts.user_visible_outcome),
		"",
		renderSection("Deliverables", renderBulletList(facts.deliverables)),
		"",
		renderSection(
			"Acceptance Criteria",
			renderBulletList(facts.acceptance_criteria),
		),
	];
	const productFactInputs = [
		`- Task name: ${facts.selected_next_slice}`,
		`- Product name: ${facts.product_name}`,
		`- Product summary: ${facts.product_summary}`,
		`- Primary user: ${facts.primary_user}`,
		`- Problem statement: ${facts.problem_statement}`,
		`- v1 rationale: ${facts.v1_rationale}`,
		`- Buyer AI promise: ${facts.buyer_ai_promise}`,
	].join("\n");
	const scopeBoundaries = [
		"### Scope in",
		"",
		renderBulletList(facts.scope_in),
		"",
		"### Scope out",
		"",
		renderBulletList(facts.scope_out),
		"",
		"### Non-goals",
		"",
		renderBulletList(facts.non_goals),
	].join("\n");
	const authorityOrder = renderNumberedList([
		"`docs/facts/project-definition.json`",
		"`DESIGN.md`",
		"`docs/build/docs/prompt.md`",
		"`docs/build/docs/plans.md`",
		"repo code and tests",
		"current chat context",
	]);
	const implementationTarget = [
		`- Primary surface: ${facts.surface_type}`,
		"- Owning files: `apps/web/`, `DESIGN.md`, `docs/facts/project-definition.json`, and the Build Pack under `docs/build/`",
		"- Supporting files: `docs/design/`, `docs/marketing/`, `docs/prompts/`, and `docs/testing/`",
		`- User path affected: ${facts.demo_flow}`,
		`- Data or external systems touched: ${renderInlineList(facts.dependencies)}`,
	].join("\n");
	const inputsAndContext = [
		"- Relevant code paths: inspect the route, feature, package, or script touched by the active milestone before editing",
		"- Relevant docs: `README.md`, `DESIGN.md`, `docs/index.md`, `docs/facts/project-definition.json`, `docs/build/docs/plans.md`, and `docs/build/docs/implement.md`",
		`- Existing checks to start from: ${renderInlineList(facts.validation_plan)}`,
		`- Prior decisions to preserve: ${facts.v1_rationale}`,
	].join("\n");
	const autonomyContract = [
		"- Safe assumptions the agent may make: use the generated facts, scope boundaries, design system, and existing repo conventions when they already answer the implementation question",
		"- Decisions that require customer confirmation: product promise changes, new user roles, billing or auth behavior, data model changes, legal/compliance posture, production credentials, or replacing placeholder facts with real production values",
		"- Expected documentation updates: update `docs/build/docs/documentation.md` with changed files, assumptions, validation results, and requirement evidence before handoff",
		"- Forbidden shortcuts or fake-success patterns: do not hide missing facts with fake production defaults, do not claim validation that did not run, and do not widen scope beyond the active milestone without updating `docs/build/docs/plans.md`",
	].join("\n");
	const promptAuditRows = [
		renderRequirementRows(
			facts.deliverables,
			"Code/docs diff plus focused proof",
		),
		renderRequirementRows(
			facts.acceptance_criteria,
			"Focused tests, route proof, or demo evidence",
		),
		renderRequirementRows(facts.validation_plan, "Command output"),
		`| Demo flow: ${facts.demo_flow} | Browser, CLI, or reviewer-observable demo notes | Not started | |`,
	].join("\n");
	const initialMilestoneName = facts.selected_next_slice;
	const validationCommands = facts.validation_plan.map(buildValidationCommand);
	const preflightChecklist = [
		"- [ ] Read `AGENTS.md` and the nearest nested `AGENTS.md` for touched files.",
		"- [ ] Read `README.md`, `DESIGN.md`, `docs/index.md`, and `docs/facts/project-definition.json`.",
		"- [ ] Read `docs/build/docs/prompt.md`, `docs/build/docs/plans.md`, `docs/build/docs/implement.md`, and `docs/build/docs/documentation.md`.",
		"- [ ] Inspect the owning production files before editing.",
		"- [ ] Confirm M1 is still the active milestone or update `docs/build/docs/plans.md` first.",
		"- [ ] Write down any behavior-affecting assumptions in `docs/build/docs/documentation.md`.",
	].join("\n");
	const customerQuestionGate = [
		"| Proceed without asking | Ask customer first |",
		"|---|---|",
		"| The fact file, prompt, design source, and current code point to one clear implementation path. | The decision changes product promise, pricing, auth, billing, data model, legal/compliance posture, or production credentials. |",
		"| A value is already represented in `docs/facts/project-definition.json` or `DESIGN.md`. | A placeholder fact must become a real domain, email, provider key, proof asset, or production claim. |",
		"| The change stays inside M1 and preserves scope boundaries. | The work would add a new surface, target user, provider, workflow, or non-goal. |",
	].join("\n");
	const copyReadyAgentPrompt = [
		"```text",
		`Build M1 for ${facts.product_name}: ${initialMilestoneName}.`,
		"",
		"Read `AGENTS.md`, `DESIGN.md`, `docs/index.md`, `docs/facts/project-definition.json`, `docs/build/docs/prompt.md`, `docs/build/docs/plans.md`, `docs/build/docs/implement.md`, and `docs/build/docs/documentation.md` before editing.",
		"",
		`Objective: ${facts.objective}`,
		`User-visible outcome: ${facts.user_visible_outcome}`,
		`Done when: ${facts.done_when}`,
		"",
		"Keep the work scoped to M1. Do not change product promise, billing, auth, data model, production credentials, or placeholder facts without customer confirmation. Update `docs/build/docs/documentation.md` with assumptions, changed files, validation results, and the requirement-to-evidence checklist before handoff.",
		"",
		"Run the suggested validation commands from `docs/build/docs/plans.md`, then summarize exactly what passed, failed, or was skipped.",
		"```",
	].join("\n");
	const handoffSourceFiles = [
		"- `AGENTS.md`",
		"- `DESIGN.md`",
		"- `docs/index.md`",
		"- `docs/facts/project-definition.json`",
		"- `docs/build/docs/prompt.md`",
		"- `docs/build/docs/plans.md`",
		"- `docs/build/docs/implement.md`",
		"- `docs/build/docs/documentation.md`",
	].join("\n");
	const handoffCompletionEvidence = [
		"- Changed files and why each file changed",
		"- Requirement-to-evidence checklist status",
		"- Validation commands run with pass, fail, blocked, or skipped status",
		"- Demo or reviewer-observable behavior proof",
		"- Remaining blockers or customer decisions needed",
	].join("\n");
	const milestoneMap = [
		"| Milestone | Outcome | Acceptance criteria | Validation commands | Status |",
		"|---|---|---|---|---|",
		`| M1 - ${initialMilestoneName} | ${facts.user_visible_outcome} | ${renderInlineList(facts.acceptance_criteria)} | ${renderInlineList(validationCommands)} | Not started |`,
	].join("\n");
	const firstMilestonePlan = [
		`### M1 - ${initialMilestoneName}`,
		"",
		renderSection("Objective", facts.objective),
		"",
		renderSection("User-visible result", facts.user_visible_outcome),
		"",
		renderSection(
			"Owned files / boundaries",
			[
				"- Primary files: inspect and edit only the files needed for the active product slice",
				"- Files to avoid unless explicitly needed: generated facts, provider secrets, unrelated routes, unrelated tests, and broad design-system rewrites",
				`- External systems touched: ${renderInlineList(facts.dependencies)}`,
			].join("\n"),
		),
		"",
		renderSection("Tasks", renderNumberedList(facts.deliverables)),
		"",
		renderSection(
			"Acceptance criteria",
			renderBulletList(facts.acceptance_criteria),
		),
		"",
		renderSection("Validation commands", renderCodeBlock(validationCommands)),
		"",
		renderSection(
			"Evidence required",
			[
				"- Requirement-to-evidence entry added to `docs/build/docs/documentation.md`",
				"- Validation output summarized with pass/fail/blocked status",
				"- Demo or repro steps recorded when behavior changed",
			].join("\n"),
		),
	].join("\n");
	const initialDocumentationAuditRows = [
		renderRequirementRows(
			facts.deliverables,
			"Pending first implementation diff",
		),
		renderRequirementRows(
			facts.acceptance_criteria,
			"Pending focused validation and demo notes",
		),
		renderRequirementRows(facts.validation_plan, "Pending command output"),
		`| Demo flow: ${facts.demo_flow} | Pending demo notes | Not started | |`,
	].join("\n");

	return [
		{
			path: getGeneratedBuildDocPath("AGENTS.md"),
			content: [
				...buildSummary,
				"",
				renderTemplateAppendix(templates.buildAgents),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDocPath("CHECKLIST.md"),
			content: [
				...buildSummary,
				"",
				renderSection("Constraints", renderBulletList(facts.constraints)),
				"",
				renderTemplateAppendix(templates.buildChecklist),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDetailDocPath("agent-handoff.md"),
			content: [
				`# ${facts.product_name} Agent Handoff`,
				"",
				renderSection("Start Prompt", copyReadyAgentPrompt),
				"",
				renderSection("Required Source Files", handoffSourceFiles),
				"",
				renderSection("Current Milestone", initialMilestoneName),
				"",
				renderSection("Objective", facts.objective),
				"",
				renderSection("User-Visible Outcome", facts.user_visible_outcome),
				"",
				renderSection("Scope Boundaries", scopeBoundaries),
				"",
				renderSection("Customer Question Gate", customerQuestionGate),
				"",
				renderSection(
					"Suggested Validation Commands",
					renderCodeBlock(validationCommands),
				),
				"",
				renderSection(
					"Required Completion Evidence",
					handoffCompletionEvidence,
				),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDetailDocPath("prompt.md"),
			content: [
				...buildSummary,
				"",
				renderSection("Authority Order", authorityOrder),
				"",
				renderSection("Product Fact Inputs", productFactInputs),
				"",
				renderSection("Implementation Target", implementationTarget),
				"",
				renderSection("Scope Boundaries", scopeBoundaries),
				"",
				renderSection("Constraints", renderBulletList(facts.constraints)),
				"",
				renderSection("Inputs and Context", inputsAndContext),
				"",
				renderSection("Autonomy Contract", autonomyContract),
				"",
				renderSection("Customer Question Gate", customerQuestionGate),
				"",
				renderSection("Copy-Ready Agent Prompt", copyReadyAgentPrompt),
				"",
				renderSection("Done When", facts.done_when),
				"",
				renderSection(
					"Completion Audit Checklist",
					[
						"| Requirement | Evidence source | Status | Notes |",
						"|---|---|---|---|",
						promptAuditRows,
					].join("\n"),
				),
				"",
				renderSection(
					"Validation / Demo Flow",
					[
						renderNumberedList(facts.validation_plan),
						"",
						"Suggested commands:",
						"",
						renderCodeBlock(validationCommands),
						"",
						`Demo: ${facts.demo_flow}`,
					].join("\n"),
				),
				"",
				renderSection(
					"Risks / Edge Cases To Watch",
					renderBulletList(facts.risks),
				),
				"",
				renderSection("Open Questions", renderBulletList(facts.open_questions)),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDetailDocPath("plans.md"),
			content: [
				...buildSummary,
				"",
				renderSection("Goal", facts.objective),
				"",
				renderSection("Non-Goals", renderBulletList(facts.non_goals)),
				"",
				renderSection("Constraints", renderBulletList(facts.constraints)),
				"",
				renderSection(
					"Architecture Intent",
					[
						facts.core_flow_summary,
						"",
						`Build toward the selected first slice: ${facts.selected_next_slice}. Keep rendering, orchestration, domain logic, and provider I/O behind clear boundaries.`,
					].join("\n"),
				),
				"",
				renderSection(
					"Source Facts To Preserve",
					[
						"- Product facts: `docs/facts/project-definition.json`",
						"- Visual system: `DESIGN.md`",
						"- Current task contract: `docs/build/docs/prompt.md`",
						"- Existing app conventions: inspect the owning files before editing",
					].join("\n"),
				),
				"",
				renderSection(
					"Active Milestone Selection",
					`M1 is active by default: ${initialMilestoneName}. Treat it as the smallest complete user-visible slice unless the customer updates this plan.`,
				),
				"",
				renderSection("Milestone Map", milestoneMap),
				"",
				renderSection("Detailed Milestone Plans", firstMilestonePlan),
				"",
				renderSection("Risks", renderBulletList(facts.risks)),
				"",
				renderSection("Dependencies", renderBulletList(facts.dependencies)),
				"",
				renderSection(
					"Stop-And-Fix Rule",
					[
						"1. Stop forward progress when a milestone validation fails.",
						"2. Diagnose the failure against the touched production path.",
						"3. Repair the failure before moving to another milestone.",
						"4. Rerun validation.",
						"5. Continue only after the result is passing or the unrelated blocker is documented.",
					].join("\n"),
				),
				"",
				renderSection(
					"Rollback / Escape Hatch",
					"Keep the slice small enough to revert by file-level diff. If the approach starts changing product scope, stop and update this plan before coding further.",
				),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDetailDocPath("implement.md"),
			content: [
				...buildSummary,
				"",
				renderSection(
					"Source Of Truth",
					[
						"- `docs/facts/project-definition.json` defines the generated product facts.",
						"- `DESIGN.md` defines the visual system.",
						"- `docs/build/docs/prompt.md` defines the current task contract.",
						"- `docs/build/docs/plans.md` defines the active milestone and validation commands.",
						"- `docs/build/docs/documentation.md` is the live status and evidence log.",
					].join("\n"),
				),
				"",
				renderSection("Preflight Checklist", preflightChecklist),
				"",
				renderSection(
					"Operating Procedure",
					[
						"1. Confirm M1 is active: " + initialMilestoneName,
						"2. Inspect only the code paths needed for M1.",
						"3. Make the smallest complete change that satisfies the acceptance criteria.",
						"4. Run the suggested validation commands.",
						"5. Fix failures before moving to any unrelated work.",
						"6. Update `docs/build/docs/documentation.md` with assumptions, files changed, validation evidence, demo notes, and remaining risks.",
					].join("\n"),
				),
				"",
				renderSection("Customer Question Gate", customerQuestionGate),
				"",
				renderSection(
					"Suggested Validation Commands",
					renderCodeBlock(validationCommands),
				),
				"",
				renderSection("Demo Flow", facts.demo_flow),
				"",
				renderSection("Next Slice", facts.selected_next_slice),
				"",
				renderSection(
					"Finalization Rules",
					[
						"- Confirm every item in `docs/build/docs/prompt.md` under Done When and Completion Audit Checklist has evidence.",
						"- Review the diff for unrelated scope, hidden placeholder defaults, secrets, missing tests, and product-scope drift.",
						"- If any validation cannot run, record the exact reason in `docs/build/docs/documentation.md`.",
						"- Final handoff must name what changed, what was verified, and what remains blocked.",
					].join("\n"),
				),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDetailDocPath("documentation.md"),
			content: [
				...buildSummary,
				"",
				renderSection(
					"Current Status",
					[
						`- Initiative: ${facts.product_name} Build Pack`,
						`- Current milestone: ${initialMilestoneName}`,
						"- Overall status: Not started",
						"- Last updated: Generated from the current Blueprint snapshot",
					].join("\n"),
				),
				"",
				renderSection(
					"What Is Done",
					[
						"- Blueprint facts generated at `docs/facts/project-definition.json`",
						"- Design source generated at `DESIGN.md`",
						"- Build prompt, plan, implementation runbook, and documentation log generated under `docs/build/docs/`",
					].join("\n"),
				),
				"",
				renderSection(
					"What Is Next",
					`Start M1: ${initialMilestoneName}. Use \`docs/build/docs/prompt.md\` as the task contract and \`docs/build/docs/plans.md\` as the milestone source.`,
				),
				"",
				renderSection(
					"Assumptions",
					[
						"| Assumption | Why it is safe | Evidence | Revisit when |",
						"|---|---|---|---|",
						`| Generated product facts define the first build slice | The Blueprint compiler emitted the fact file and Build Pack together | \`docs/facts/project-definition.json\`, \`docs/build/docs/prompt.md\` | Customer changes product promise, scope, pricing, auth, billing, or target user |`,
					].join("\n"),
				),
				"",
				renderSection(
					"Requirement-To-Evidence Checklist",
					[
						"| Requirement | Evidence source | Status | Notes |",
						"|---|---|---|---|",
						initialDocumentationAuditRows,
					].join("\n"),
				),
				"",
				renderSection(
					"Validation Log",
					[
						"### Generated baseline",
						"- Commands run: none yet",
						"- Result: Not started",
						"- Notes: First implementation agent must run the validation plan before claiming completion.",
					].join("\n"),
				),
				"",
				renderSection(
					"How To Run / Demo",
					[
						"### Validation plan",
						"",
						renderNumberedList(facts.validation_plan),
						"",
						"### Suggested commands",
						"",
						renderCodeBlock(validationCommands),
						"",
						"### Demo flow",
						"",
						facts.demo_flow,
					].join("\n"),
				),
				"",
				renderSection("Open Questions", renderBulletList(facts.open_questions)),
				"",
				renderSection(
					"Change Log",
					[
						"### Generated baseline",
						`- Milestone: ${initialMilestoneName}`,
						"- Summary: Generated from the current Blueprint facts.",
						"- Files changed: none yet",
						"- Validation: not started",
						`- Next step: execute M1 and update this file with evidence.`,
					].join("\n"),
				),
			].join("\n"),
		},
	];
}
