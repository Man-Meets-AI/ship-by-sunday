import type { CanonicalProjectFacts } from "../canonical-project-definition/project-definition";
import {
	renderBulletList,
	renderSection,
	renderTemplateAppendix,
} from "./render-helpers";
import { MARKETING_PACK_LABEL } from "../public-artifact-contract";
import type { OpenAiPacketTemplates, RenderedPacketFile } from "./render-types";

export function renderMarketingPacket(
	facts: CanonicalProjectFacts,
	templates: OpenAiPacketTemplates,
): RenderedPacketFile[] {
	const introduction = [
		`# ${facts.product_name} ${MARKETING_PACK_LABEL}`,
		"",
		`${facts.product_summary}`,
		"",
		renderSection("Marketing Goals", renderBulletList(facts.marketing_goals)),
		"",
		renderSection("Channel Scope", renderBulletList(facts.channel_scope)),
	];

	return [
		{
			path: "packet/marketing/README.md",
			content: [
				...introduction,
				"",
				renderSection("Brand Voice", facts.brand_voice_summary),
				"",
				renderTemplateAppendix(templates.marketingReadme),
			].join("\n"),
		},
		{
			path: "packet/marketing/AGENTS.md",
			content: [
				...introduction,
				"",
				renderSection(
					"Approved Claims",
					renderBulletList(facts.approved_claims),
				),
				"",
				renderSection("Do Not Say", renderBulletList(facts.do_not_say_rules)),
				"",
				renderTemplateAppendix(templates.marketingAgents),
			].join("\n"),
		},
		{
			path: "packet/marketing/CHECKLIST.md",
			content: [
				...introduction,
				"",
				renderSection("Workflow Map", renderBulletList(facts.workflow_map)),
				"",
				renderSection("Research Needs", renderBulletList(facts.research_needs)),
				"",
				renderTemplateAppendix(templates.marketingChecklist),
			].join("\n"),
		},
		{
			path: "packet/marketing/PLANS.md",
			content: [
				...introduction,
				"",
				renderSection(
					"Content Workflows",
					renderBulletList(facts.content_workflows),
				),
				"",
				renderSection("Proof Sources", renderBulletList(facts.proof_sources)),
				"",
				renderTemplateAppendix(templates.marketingPlans),
			].join("\n"),
		},
		{
			path: "packet/marketing/documentation.md",
			content: [
				...introduction,
				"",
				renderSection("Creative Spec", facts.creative_spec),
				"",
				renderSection(
					"Analytics Needs",
					renderBulletList(facts.analytics_needs),
				),
				"",
				renderTemplateAppendix(templates.marketingDocumentation),
			].join("\n"),
		},
	];
}
