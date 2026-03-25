import type { CanonicalProjectFacts } from "../canonical-project-definition/project-definition";
import {
	AGENT_READY_PACKS_LABEL,
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	PROMPT_PACK_LABEL,
} from "../public-artifact-contract";
import { renderBulletList, renderSection } from "./render-helpers";
import type { RenderedPacketFile } from "./render-types";

export function renderPacketReadme(
	facts: CanonicalProjectFacts,
): RenderedPacketFile {
	return {
		path: "packet/README.md",
		content: [
			`# ${facts.product_name} ${AGENT_READY_PACKS_LABEL}`,
			"",
			`${facts.product_summary}`,
			"",
			renderSection(
				"Who It Is For",
				`${facts.primary_user}\n\n${facts.problem_statement}`,
			),
			"",
			renderSection(
				"Expected Outcome",
				`${facts.outcome_statement}\n\nSuccess looks like: ${facts.success_looks_like}`,
			),
			"",
			renderSection(
				"Included Files",
				renderBulletList([
					"facts/project-definition.json",
					DESIGN_PACK_LABEL,
					MARKETING_PACK_LABEL,
					BUILD_PACK_LABEL,
					PROMPT_PACK_LABEL,
				]),
			),
			"",
			renderSection(
				"Delivery Model",
				[
					`Distribution model: ${facts.distribution_model}`,
					`Install destination: ${facts.install_destination}`,
					`Domain placeholder: ${facts.domain ?? "your-domain-here.example"}`,
					`Support email placeholder: ${facts.support_email ?? "support@example.com"}`,
				].join("\n"),
			),
		].join("\n"),
	};
}
