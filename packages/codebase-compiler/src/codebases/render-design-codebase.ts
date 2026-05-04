import type { CanonicalProjectFacts } from "../canonical-project-definition/project-definition";
import { DESIGN_PACK_LABEL } from "../public-artifact-contract";
import { getGeneratedDesignDocPath } from "../generated-docs/generated-doc-paths";
import {
	renderBulletList,
	renderSection,
	renderTemplateAppendix,
} from "./render-helpers";
import type {
	OpenAiCodebaseTemplates,
	RenderedCodebaseFile,
} from "./render-types";

export function renderDesignCodebase(
	facts: CanonicalProjectFacts,
	templates: OpenAiCodebaseTemplates,
): RenderedCodebaseFile[] {
	const summary = [
		`# ${facts.product_name} ${DESIGN_PACK_LABEL}`,
		"",
		renderSection("Surface", `Surface type: ${facts.surface_type}`),
		"",
		renderSection("Flow", renderBulletList(facts.screen_sequence)),
		"",
		renderSection(
			"Must-Have Capabilities",
			renderBulletList(facts.must_have_capabilities),
		),
		"",
		renderSection(
			"Design References",
			renderBulletList(facts.design_references),
		),
		"",
		renderSection(
			"Direction",
			[
				`Visual thesis: ${facts.visual_thesis}`,
				`Content plan: ${facts.content_plan}`,
				`Interaction thesis: ${facts.interaction_thesis}`,
				`Hero goal: ${facts.hero_goal}`,
				`Primary CTA: ${facts.primary_cta}`,
				`Existing system mode: ${facts.existing_system_mode}`,
			].join("\n"),
		),
	];

	return [
		{
			path: getGeneratedDesignDocPath("AGENTS.md"),
			content: [
				...summary,
				"",
				renderTemplateAppendix(templates.designAgents),
			].join("\n"),
		},
		{
			path: getGeneratedDesignDocPath("CHECKLIST.md"),
			content: [
				...summary,
				"",
				renderSection("Proof Strategy", facts.proof_strategy),
				"",
				renderTemplateAppendix(templates.designChecklist),
			].join("\n"),
		},
		{
			path: getGeneratedDesignDocPath("PLANS.md"),
			content: [
				...summary,
				"",
				renderSection("Scope", renderBulletList(facts.scope_in)),
				"",
				renderSection("Non-Goals", renderBulletList(facts.non_goals)),
				"",
				renderTemplateAppendix(templates.designPlans),
			].join("\n"),
		},
		{
			path: getGeneratedDesignDocPath("documentation.md"),
			content: [
				...summary,
				"",
				renderSection("Tokens", facts.design_tokens),
				"",
				renderSection(
					"System Details",
					[
						`Typography: ${facts.typography_direction}`,
						`Imagery: ${facts.imagery_direction}`,
						`Layout: ${facts.layout_direction}`,
						`Copy tone: ${facts.copy_tone}`,
					].join("\n"),
				),
				"",
				renderTemplateAppendix(templates.designDocumentation),
			].join("\n"),
		},
	];
}
