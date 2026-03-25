import type { CanonicalProjectFacts } from "../canonical-project-definition/project-definition";
import {
	renderBulletList,
	renderSection,
	renderTemplateAppendix,
} from "./render-helpers";
import { BUILD_PACK_LABEL } from "../public-artifact-contract";
import type { OpenAiPacketTemplates, RenderedPacketFile } from "./render-types";

export function renderBuildPacket(
	facts: CanonicalProjectFacts,
	templates: OpenAiPacketTemplates,
): RenderedPacketFile[] {
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

	return [
		{
			path: "packet/build/AGENTS.md",
			content: [
				...buildSummary,
				"",
				renderTemplateAppendix(templates.buildAgents),
			].join("\n"),
		},
		{
			path: "packet/build/CHECKLIST.md",
			content: [
				...buildSummary,
				"",
				renderSection("Constraints", renderBulletList(facts.constraints)),
				"",
				renderTemplateAppendix(templates.buildChecklist),
			].join("\n"),
		},
		{
			path: "packet/build/docs/prompt.md",
			content: [
				...buildSummary,
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
			path: "packet/build/docs/plans.md",
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
			path: "packet/build/docs/implement.md",
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
			path: "packet/build/docs/documentation.md",
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
