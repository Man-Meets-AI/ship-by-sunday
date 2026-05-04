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
import {
	buildBuildPackReadinessManifest,
	type BuildPackBlocker,
	type BuildPackCustomerInputItem,
	type BuildPackEvidenceRow,
	type BuildPackFirstSlicePlan,
	type BuildPackReadinessManifest,
	type BuildPackReviewPack,
	type BuildPackStarterFileReference,
	type BuildPackValidationEntry,
	type BuildPackVerificationPersona,
	type BuildPackWeakFactWarning,
} from "../readiness/build-pack-readiness";
import type {
	OpenAiCodebaseTemplates,
	RenderedCodebaseFile,
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

function renderRequirementRows(
	values: readonly string[],
	evidenceSource: string,
	status = "Not started",
) {
	return values
		.map((value) => `| ${value} | ${evidenceSource} | ${status} | |`)
		.join("\n");
}

function escapeTableCell(value: string) {
	return value.replaceAll("\n", "<br>").replaceAll("|", "\\|");
}

function renderRunnableCommandBlock(
	validationEntries: readonly BuildPackValidationEntry[],
) {
	const runnableCommands = validationEntries.flatMap((entry) =>
		entry.type === "runnable" ? [entry.command] : [],
	);

	if (runnableCommands.length === 0) {
		return "No runnable validation commands are currently resolved. Resolve blocked or manual validation entries before claiming completion.";
	}

	return renderCodeBlock(runnableCommands);
}

function renderValidationEntryProof(entry: BuildPackValidationEntry) {
	if (entry.type === "runnable") {
		return `\`${entry.command}\``;
	}
	if (entry.type === "manual") {
		return entry.proofInstructions;
	}

	return entry.reason;
}

function renderValidationEntryScript(entry: BuildPackValidationEntry) {
	if (entry.type === "runnable") {
		return `\`${entry.scriptName}\``;
	}

	return "n/a";
}

function renderValidationEntryEvidence(entry: BuildPackValidationEntry) {
	if (entry.type === "blocked") {
		return entry.customerQuestion;
	}

	return entry.evidence;
}

function renderValidationManifestTable(
	validationEntries: readonly BuildPackValidationEntry[],
) {
	return [
		"| Source validation step | Type | Package script | Proof path | Evidence required |",
		"|---|---|---|---|---|",
		...validationEntries.map(
			(entry) =>
				`| ${escapeTableCell(entry.sourceStep)} | ${entry.type} | ${renderValidationEntryScript(entry)} | ${escapeTableCell(renderValidationEntryProof(entry))} | ${escapeTableCell(renderValidationEntryEvidence(entry))} |`,
		),
	].join("\n");
}

function renderValidationEntrySummary(
	validationEntries: readonly BuildPackValidationEntry[],
) {
	return validationEntries
		.map((entry) => {
			if (entry.type === "runnable") {
				return `runnable: ${entry.command} (${entry.scriptName})`;
			}
			return `${entry.type}: ${entry.sourceStep}`;
		})
		.join("; ");
}

function renderValidationRequirementRows(
	validationEntries: readonly BuildPackValidationEntry[],
	evidenceSourcePrefix: string,
) {
	return validationEntries
		.map(
			(entry) =>
				`| Validation: ${escapeTableCell(entry.sourceStep)} | ${evidenceSourcePrefix} (${entry.type}) | Not started | |`,
		)
		.join("\n");
}

function renderCustomerInputTable(
	customerInputItems: readonly BuildPackCustomerInputItem[],
) {
	if (customerInputItems.length === 0) {
		return "No placeholder-friendly customer-input fields are currently missing or placeholder-like.";
	}

	return [
		"| Field | Fact key | Status | Required action |",
		"|---|---|---|---|",
		...customerInputItems.map(
			(item) =>
				`| ${item.fieldLabel} | \`${item.factKey}\` | ${item.status} | ${escapeTableCell(item.requiredAction)} |`,
		),
	].join("\n");
}

function renderWeakFactWarningTable(
	weakFactWarnings: readonly BuildPackWeakFactWarning[],
) {
	if (weakFactWarnings.length === 0) {
		return "No weak-fact warnings were generated from the current Codebase facts.";
	}

	return [
		"| Fact | Fact key | Severity | Issue | Required action |",
		"|---|---|---|---|---|",
		...weakFactWarnings.map(
			(warning) =>
				`| ${warning.factLabel} | \`${warning.factKey}\` | ${warning.severity} | ${escapeTableCell(warning.issue)} | ${escapeTableCell(warning.requiredAction)} |`,
		),
	].join("\n");
}

function renderBlockerTable(blockers: readonly BuildPackBlocker[]) {
	if (blockers.length === 0) {
		return "No generated blockers. Resolve customer-input work and run validation before making production claims.";
	}

	return [
		"| Source | Reason | Required action |",
		"|---|---|---|",
		...blockers.map(
			(blocker) =>
				`| ${escapeTableCell(blocker.source)} | ${escapeTableCell(blocker.reason)} | ${escapeTableCell(blocker.requiredAction)} |`,
		),
	].join("\n");
}

function renderStarterFileTable(
	starterFiles: readonly BuildPackStarterFileReference[],
) {
	return [
		"| File | Why the first-slice agent reads it |",
		"|---|---|",
		...starterFiles.map(
			(file) => `| \`${file.path}\` | ${escapeTableCell(file.reason)} |`,
		),
	].join("\n");
}

function renderFirstSlicePlan(firstSlicePlan: BuildPackFirstSlicePlan) {
	return [
		renderSection(
			"Slice Decision",
			[
				`- Title: ${firstSlicePlan.title}`,
				`- Objective: ${firstSlicePlan.objective}`,
				`- User-visible outcome: ${firstSlicePlan.userVisibleOutcome}`,
				`- First flow step: ${firstSlicePlan.flowFocus}`,
			].join("\n"),
		),
		"",
		renderSection(
			"Capabilities To Preserve Or Introduce",
			renderBulletList(firstSlicePlan.capabilities),
		),
		"",
		renderSection("Scope In", renderBulletList(firstSlicePlan.scopeIn)),
		"",
		renderSection("Scope Out", renderBulletList(firstSlicePlan.scopeOut)),
		"",
		renderSection(
			"Starter File Reading Order",
			renderStarterFileTable(firstSlicePlan.starterFiles),
		),
		"",
		renderSection(
			"Execution Steps",
			renderNumberedList(firstSlicePlan.executionSteps),
		),
		"",
		renderSection(
			"Proof Requirements",
			renderBulletList(firstSlicePlan.proofRequirements),
		),
		"",
		renderSection("Stop Before", renderBulletList(firstSlicePlan.stopBefore)),
	].join("\n");
}

function renderVerificationPersonaTable(
	personas: readonly BuildPackVerificationPersona[],
) {
	return [
		"| Persona | Verification lens | Evidence to collect |",
		"|---|---|---|",
		...personas.map(
			(persona) =>
				`| ${escapeTableCell(persona.name)} | ${escapeTableCell(persona.lens)} | ${escapeTableCell(persona.evidence)} |`,
		),
	].join("\n");
}

function renderEvidenceTable(evidenceRows: readonly BuildPackEvidenceRow[]) {
	return [
		"| Item | Evidence source | Status | Notes |",
		"|---|---|---|---|",
		...evidenceRows.map(
			(row) =>
				`| ${escapeTableCell(row.item)} | ${escapeTableCell(row.evidenceSource)} | ${row.status} | |`,
		),
	].join("\n");
}

function renderReviewPack(reviewPack: BuildPackReviewPack) {
	return [
		renderSection("Review Prompt", reviewPack.reviewPrompt),
		"",
		renderSection(
			"Verification Personas",
			renderVerificationPersonaTable(reviewPack.verificationPersonas),
		),
		"",
		renderSection(
			"Expected Demo Proof",
			renderBulletList(reviewPack.expectedDemoProof),
		),
		"",
		renderSection(
			"Regression Checks",
			renderBulletList(reviewPack.regressionChecks),
		),
		"",
		renderSection(
			"Evidence Table",
			renderEvidenceTable(reviewPack.evidenceRows),
		),
	].join("\n");
}

function renderReadinessDocument(
	facts: CanonicalProjectFacts,
	readinessManifest: BuildPackReadinessManifest,
) {
	return [
		`# ${facts.product_name} Build Pack Readiness`,
		"",
		renderSection(
			"Readiness Verdict",
			[
				`- First slice: ${readinessManifest.firstSlice.title}`,
				`- Confidence state: ${readinessManifest.firstSlice.confidence}`,
				`- Confidence label: ${readinessManifest.firstSlice.confidenceLabel}`,
				`- Rationale: ${readinessManifest.firstSlice.rationale}`,
				"- Autonomy limit: clean-room replay proof has not run yet, so do not claim autonomous build readiness from this file alone.",
			].join("\n"),
		),
		"",
		renderSection(
			"First Slice Scope",
			[
				`- Objective: ${facts.objective}`,
				`- User-visible outcome: ${facts.user_visible_outcome}`,
				`- Scope in: ${renderInlineList(facts.scope_in)}`,
				`- Scope out: ${renderInlineList(facts.scope_out)}`,
				`- Acceptance criteria: ${renderInlineList(facts.acceptance_criteria)}`,
			].join("\n"),
		),
		"",
		renderSection(
			"Derived First Slice Plan",
			renderFirstSlicePlan(readinessManifest.firstSlice.plan),
		),
		"",
		renderSection(
			"Validation Manifest",
			renderValidationManifestTable(readinessManifest.validationEntries),
		),
		"",
		renderSection(
			"Runnable Commands",
			renderRunnableCommandBlock(readinessManifest.validationEntries),
		),
		"",
		renderSection("Blockers", renderBlockerTable(readinessManifest.blockers)),
		"",
		renderSection(
			"Customer Input Work",
			renderCustomerInputTable(readinessManifest.customerInputItems),
		),
		"",
		renderSection(
			"Weak Fact Warnings",
			renderWeakFactWarningTable(readinessManifest.weakFactWarnings),
		),
		"",
		renderSection(
			"Ask Customer Before",
			renderBulletList(readinessManifest.questionGates),
		),
		"",
		renderSection(
			"Readiness Limits",
			renderBulletList(readinessManifest.readinessLimits),
		),
	].join("\n");
}

export function renderBuildCodebase(
	facts: CanonicalProjectFacts,
	templates: OpenAiCodebaseTemplates,
): RenderedCodebaseFile[] {
	const readinessManifest = buildBuildPackReadinessManifest(facts);
	const firstSlicePlan = readinessManifest.firstSlice.plan;
	const reviewPack = readinessManifest.reviewPack;
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
		"`docs/build/docs/readiness.md`",
		"`docs/build/docs/prompt.md`",
		"`docs/build/docs/plans.md`",
		"`docs/build/docs/review.md`",
		"repo code and tests",
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
		"- Relevant docs: `README.md`, `DESIGN.md`, `docs/index.md`, `docs/facts/project-definition.json`, `docs/build/docs/readiness.md`, `docs/build/docs/plans.md`, `docs/build/docs/implement.md`, and `docs/build/docs/review.md`",
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
		renderValidationRequirementRows(
			readinessManifest.validationEntries,
			"Typed validation manifest evidence",
		),
		`| Demo flow: ${facts.demo_flow} | Browser, CLI, or reviewer-observable demo notes | Not started | |`,
	].join("\n");
	const initialMilestoneName = readinessManifest.firstSlice.title;
	const preflightChecklist = [
		"- [ ] Read `AGENTS.md` and the nearest nested `AGENTS.md` for touched files.",
		"- [ ] Read `README.md`, `DESIGN.md`, `docs/index.md`, and `docs/facts/project-definition.json`.",
		"- [ ] Read `docs/build/docs/readiness.md`, `docs/build/docs/prompt.md`, `docs/build/docs/plans.md`, `docs/build/docs/implement.md`, `docs/build/docs/review.md`, and `docs/build/docs/documentation.md`.",
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
		"Read `AGENTS.md`, `DESIGN.md`, `docs/index.md`, `docs/facts/project-definition.json`, `docs/build/docs/readiness.md`, `docs/build/docs/prompt.md`, `docs/build/docs/plans.md`, `docs/build/docs/implement.md`, `docs/build/docs/review.md`, and `docs/build/docs/documentation.md` before editing.",
		"",
		`Objective: ${facts.objective}`,
		`User-visible outcome: ${facts.user_visible_outcome}`,
		`Done when: ${facts.done_when}`,
		"",
		"Keep the work scoped to M1. Do not change product promise, billing, auth, data model, production credentials, or placeholder facts without customer confirmation. Update `docs/build/docs/documentation.md` with assumptions, changed files, validation results, and the requirement-to-evidence checklist before handoff.",
		"",
		"Use the typed validation manifest in `docs/build/docs/readiness.md` and `docs/build/docs/plans.md`, complete the evidence table in `docs/build/docs/review.md`, then summarize exactly what passed, failed, or was blocked.",
		"```",
	].join("\n");
	const handoffSourceFiles = [
		"- `AGENTS.md`",
		"- `DESIGN.md`",
		"- `docs/index.md`",
		"- `docs/facts/project-definition.json`",
		"- `docs/build/docs/readiness.md`",
		"- `docs/build/docs/prompt.md`",
		"- `docs/build/docs/plans.md`",
		"- `docs/build/docs/implement.md`",
		"- `docs/build/docs/review.md`",
		"- `docs/build/docs/documentation.md`",
	].join("\n");
	const handoffCompletionEvidence = [
		"- Changed files and why each file changed",
		"- Requirement-to-evidence checklist status",
		"- Review evidence table status from `docs/build/docs/review.md`",
		"- Validation commands run with pass, fail, blocked, or skipped status",
		"- Demo or reviewer-observable behavior proof",
		"- Remaining blockers or customer decisions needed",
	].join("\n");
	const milestoneMap = [
		"| Milestone | Outcome | Acceptance criteria | Validation proof | Status |",
		"|---|---|---|---|---|",
		`| M1 - ${initialMilestoneName} | ${facts.user_visible_outcome} | ${renderInlineList(facts.acceptance_criteria)} | ${renderValidationEntrySummary(readinessManifest.validationEntries)} | Not started |`,
	].join("\n");
	const firstMilestonePlan = [
		`### M1 - ${initialMilestoneName}`,
		"",
		renderFirstSlicePlan(firstSlicePlan),
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
		renderSection(
			"Validation manifest",
			[
				renderValidationManifestTable(readinessManifest.validationEntries),
				"",
				"Runnable commands:",
				"",
				renderRunnableCommandBlock(readinessManifest.validationEntries),
			].join("\n"),
		),
		"",
		renderSection(
			"Evidence required",
			[
				"- Requirement-to-evidence entry added to `docs/build/docs/documentation.md`",
				"- Validation output summarized with pass/fail/blocked status",
				"- Demo or repro steps recorded when behavior changed",
				"- Review evidence table updated in `docs/build/docs/review.md` and verification notes attached in `docs/testing/run-report.md` when the change needs command, browser, log, or artifact proof.",
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
		renderValidationRequirementRows(
			readinessManifest.validationEntries,
			"Pending typed validation evidence",
		),
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
			path: getGeneratedBuildDetailDocPath("readiness.md"),
			content: renderReadinessDocument(facts, readinessManifest),
		},
		{
			path: getGeneratedBuildDetailDocPath("review.md"),
			content: [
				`# ${facts.product_name} Review And Verification Pack`,
				"",
				renderSection(
					"Review Source Of Truth",
					[
						"- Read `docs/build/docs/readiness.md` before review.",
						"- Use the derived first-slice plan as the scope boundary.",
						"- Use this file to record review, verification, demo, regression, and evidence status.",
						"- Put command, browser, log, or artifact details in `docs/testing/run-report.md` when evidence needs more room than this table.",
						"- Do not mark the slice complete until every required evidence row is passing, blocked with a customer question, or explicitly out of scope.",
					].join("\n"),
				),
				"",
				renderReviewPack(reviewPack),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDetailDocPath("agent-handoff.md"),
			content: [
				`# ${facts.product_name} Agent Handoff`,
				"",
				renderSection(
					"Readiness First",
					[
						"Read `docs/build/docs/readiness.md` before using the copy-ready prompt.",
						`Current first-slice confidence state: ${readinessManifest.firstSlice.confidence}.`,
						"Read `docs/build/docs/review.md` before final handoff so review and verification evidence are planned from the start.",
						"Resolve blockers and customer-input work before making production readiness claims.",
					].join("\n"),
				),
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
					"Typed Validation Manifest",
					renderValidationManifestTable(readinessManifest.validationEntries),
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
						"Typed validation manifest:",
						"",
						renderValidationManifestTable(readinessManifest.validationEntries),
						"",
						"Runnable commands:",
						"",
						renderRunnableCommandBlock(readinessManifest.validationEntries),
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
						`Build toward the derived first slice: ${firstSlicePlan.title}. Start with the flow step "${firstSlicePlan.flowFocus}" and keep rendering, orchestration, domain logic, and provider I/O behind clear boundaries.`,
					].join("\n"),
				),
				"",
				renderSection(
					"Source Facts To Preserve",
					[
						"- Product facts: `docs/facts/project-definition.json`",
						"- Visual system: `DESIGN.md`",
						"- Readiness manifest: `docs/build/docs/readiness.md`",
						"- Current task contract: `docs/build/docs/prompt.md`",
						"- Review and verification pack: `docs/build/docs/review.md`",
						"- Existing app conventions: inspect the owning files before editing",
					].join("\n"),
				),
				"",
				renderSection(
					"Active Milestone Selection",
					`M1 is active by default: ${initialMilestoneName}. It is derived from the first flow step "${firstSlicePlan.flowFocus}", the must-have capabilities, scope boundaries, acceptance criteria, and generated starter files. Treat it as the smallest complete user-visible slice unless the customer updates this plan.`,
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
						"- `docs/build/docs/readiness.md` defines first-slice confidence, typed validation, blockers, and customer-input work.",
						"- `docs/build/docs/prompt.md` defines the current task contract.",
						"- `docs/build/docs/plans.md` defines the active milestone and validation commands.",
						"- `docs/build/docs/review.md` defines the review prompt, verification lenses, regression checks, and evidence table.",
						"- `docs/testing/run-report.md` is the repo-local place for detailed command, browser, log, or artifact evidence.",
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
						"4. Use the typed validation manifest to run commands, collect manual proof, or resolve blockers.",
						"5. Fix failures before moving to any unrelated work.",
						"6. Update `docs/build/docs/review.md`, `docs/testing/run-report.md`, and `docs/build/docs/documentation.md` with assumptions, files changed, validation evidence, demo notes, review evidence, and remaining risks.",
					].join("\n"),
				),
				"",
				renderSection("Customer Question Gate", customerQuestionGate),
				"",
				renderSection(
					"Typed Validation Manifest",
					[
						renderValidationManifestTable(readinessManifest.validationEntries),
						"",
						"Runnable commands:",
						"",
						renderRunnableCommandBlock(readinessManifest.validationEntries),
					].join("\n"),
				),
				"",
				renderSection("Demo Flow", facts.demo_flow),
				"",
				renderSection(
					"Derived First Slice Plan",
					renderFirstSlicePlan(firstSlicePlan),
				),
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
						`- Readiness confidence: ${readinessManifest.firstSlice.confidence}`,
						"- Overall status: Not started",
						"- Last updated: Generated from the current Codebase snapshot",
					].join("\n"),
				),
				"",
				renderSection(
					"What Is Done",
					[
						"- Codebase facts generated at `docs/facts/project-definition.json`",
						"- Design source generated at `DESIGN.md`",
						"- Build readiness, prompt, plan, implementation runbook, review and verification pack, and documentation log generated under `docs/build/docs/`",
					].join("\n"),
				),
				"",
				renderSection(
					"What Is Next",
					`Start M1: ${initialMilestoneName}. Use \`docs/build/docs/readiness.md\` as the readiness source, \`docs/build/docs/prompt.md\` as the task contract, \`docs/build/docs/plans.md\` as the milestone source, and \`docs/build/docs/review.md\` as the review and verification evidence source.`,
				),
				"",
				renderSection(
					"Assumptions",
					[
						"| Assumption | Why it is safe | Evidence | Revisit when |",
						"|---|---|---|---|",
						`| Generated product facts define the first build slice | The Codebase compiler emitted the fact file, readiness manifest, review pack, and Build Pack together | \`docs/facts/project-definition.json\`, \`docs/build/docs/readiness.md\`, \`docs/build/docs/prompt.md\`, \`docs/build/docs/review.md\` | Customer changes product promise, scope, pricing, auth, billing, or target user |`,
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
						"### Typed validation manifest",
						"",
						renderValidationManifestTable(readinessManifest.validationEntries),
						"",
						"### Runnable commands",
						"",
						renderRunnableCommandBlock(readinessManifest.validationEntries),
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
						"- Summary: Generated from the current Codebase facts.",
						"- Files changed: none yet",
						"- Validation: not started",
						`- Next step: execute M1 and update this file with evidence.`,
					].join("\n"),
				),
			].join("\n"),
		},
	];
}
