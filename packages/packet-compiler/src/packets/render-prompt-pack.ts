import type { CanonicalProjectFacts } from "../canonical-project-definition/project-definition";
import type { RenderedPacketFile } from "./render-types";

export function renderPromptPack(
	facts: CanonicalProjectFacts,
): RenderedPacketFile[] {
	return [
		{
			path: "packet/prompts/marketing.md",
			content: [
				`# ${facts.product_name} Marketing Prompt`,
				"",
				`Use this packet to create marketing assets for ${facts.primary_user}.`,
				"",
				`Problem: ${facts.problem_statement}`,
				`Outcome: ${facts.outcome_statement}`,
				`Voice: ${facts.brand_voice_summary}`,
				`Approved claims: ${facts.approved_claims.join("; ")}`,
			].join("\n"),
		},
		{
			path: "packet/prompts/implementation.md",
			content: [
				`# ${facts.product_name} Implementation Prompt`,
				"",
				`Objective: ${facts.objective}`,
				`Outcome: ${facts.user_visible_outcome}`,
				`Next slice: ${facts.selected_next_slice}`,
				`Acceptance criteria: ${facts.acceptance_criteria.join("; ")}`,
			].join("\n"),
		},
		{
			path: "packet/prompts/qa.md",
			content: [
				`# ${facts.product_name} QA Prompt`,
				"",
				`Demo flow: ${facts.demo_flow}`,
				`Validation plan: ${facts.validation_plan.join("; ")}`,
				`Distribution model: ${facts.distribution_model}`,
			].join("\n"),
		},
		{
			path: "packet/prompts/deploy.md",
			content: [
				`# ${facts.product_name} Deploy Prompt`,
				"",
				`Install destination: ${facts.install_destination}`,
				`Domain: ${facts.domain ?? "your-domain-here.example"}`,
				`Support email: ${facts.support_email ?? "support@example.com"}`,
				`Pricing: ${facts.price_display} (${facts.currency})`,
			].join("\n"),
		},
	];
}
