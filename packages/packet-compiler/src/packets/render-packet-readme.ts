import type { CanonicalProjectFacts } from "../canonical-project-definition/project-definition";
import { renderBulletList, renderSection } from "./render-helpers";
import type { RenderedPacketFile } from "./render-types";

export function renderPacketReadme(
	facts: CanonicalProjectFacts,
): RenderedPacketFile {
	return {
		path: "packet/README.md",
		content: [
			`# ${facts.product_name} Packet`,
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
					"design packet",
					"marketing packet",
					"build packet",
					"prompt pack",
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
