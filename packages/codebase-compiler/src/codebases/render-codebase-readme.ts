import type { CanonicalProjectFacts } from "../canonical-project-definition/project-definition";
import {
	AGENT_READY_PACKS_LABEL,
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	PROMPT_PACK_LABEL,
} from "../public-artifact-contract";
import { GENERATED_DOCS_README_PATH } from "../generated-docs/generated-doc-paths";
import { renderBulletList, renderSection } from "./render-helpers";
import type { RenderedCodebaseFile } from "./render-types";

function isPlaceholderDomain(value: string | undefined) {
	return !value || /example\.com$/i.test(value);
}

function isPlaceholderEmail(value: string | undefined) {
	return !value || /@example\.com$/i.test(value);
}

function sanitizeInstallDestination(value: string) {
	return value.replace(/\bCodebase\b/g, "generated repo");
}

export function renderCodebaseReadme(
	facts: CanonicalProjectFacts,
): RenderedCodebaseFile {
	const deliveryLines = [
		`Distribution model: ${facts.distribution_model}`,
		`Install destination: ${sanitizeInstallDestination(facts.install_destination)}`,
		isPlaceholderDomain(facts.domain)
			? "Domain: not set yet. Replace the placeholder before launch."
			: `Domain: ${facts.domain}`,
		isPlaceholderEmail(facts.support_email)
			? "Support email: not set yet. Replace the placeholder before launch."
			: `Support email: ${facts.support_email}`,
	];

	return {
		path: GENERATED_DOCS_README_PATH,
		content: [
			`# ${facts.product_name} ${AGENT_READY_PACKS_LABEL}`,
			"",
			`${facts.product_summary}`,
			"",
			renderSection(
				"How To Use This Folder",
				[
					"Start with root `DESIGN.md` for the visual system.",
					"Use `facts/project-definition.json` and `facts/design-system.json` when a tool or teammate needs machine-readable context.",
					"Use the Design, Marketing, and Build packs as working guidance while you turn the starter into the shipped product.",
				].join("\n"),
			),
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
					"facts/design-system.json",
					DESIGN_PACK_LABEL,
					MARKETING_PACK_LABEL,
					BUILD_PACK_LABEL,
					PROMPT_PACK_LABEL,
				]),
			),
			"",
			renderSection("Delivery Model", deliveryLines.join("\n")),
		].join("\n"),
	};
}
