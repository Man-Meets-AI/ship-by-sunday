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
			path: getGeneratedBuildDetailDocPath("prompt.md"),
			content: [
				...buildSummary,
				"",
				renderSection("Product Fact Inputs", productFactInputs),
				"",
				renderSection("Scope Boundaries", scopeBoundaries),
				"",
				renderSection(
					"Validation Plan",
					renderBulletList(facts.validation_plan),
				),
				"",
				renderTemplateAppendix(templates.buildPrompt),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDetailDocPath("plans.md"),
			content: [
				...buildSummary,
				"",
				renderSection("Risks", renderBulletList(facts.risks)),
				"",
				renderSection("Dependencies", renderBulletList(facts.dependencies)),
				"",
				renderTemplateAppendix(templates.buildPlans),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDetailDocPath("implement.md"),
			content: [
				...buildSummary,
				"",
				renderSection("Demo Flow", facts.demo_flow),
				"",
				renderSection("Next Slice", facts.selected_next_slice),
				"",
				renderTemplateAppendix(templates.buildImplement),
			].join("\n"),
		},
		{
			path: getGeneratedBuildDetailDocPath("documentation.md"),
			content: [
				...buildSummary,
				"",
				renderSection("Open Questions", renderBulletList(facts.open_questions)),
				"",
				renderTemplateAppendix(templates.buildDocumentation),
			].join("\n"),
		},
	];
}
