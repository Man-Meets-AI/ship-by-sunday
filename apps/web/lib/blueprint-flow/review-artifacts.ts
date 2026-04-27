import {
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
} from "@shipbysunday/blueprint-compiler";
import {
	getBlueprintPageSectionHref,
	type BlueprintPageSectionId,
} from "@/lib/blueprint-flow/blueprint-page-sections";

export const reviewArtifacts = [
	{
		id: "design",
		title: DESIGN_PACK_LABEL,
		includedPath: "docs/design/",
		summary:
			"Agent guidance, checklist, plan, and documentation generated from the blueprint design inputs.",
		sectionIds: ["design"] as const,
		primarySectionId: "design" as const,
		sectionLabel: "Design",
	},
	{
		id: "marketing",
		title: MARKETING_PACK_LABEL,
		includedPath: "docs/marketing/",
		summary:
			"Offer, claims, channel, and messaging docs generated from the blueprint plus compiler-owned preview.",
		sectionIds: [
			"foundation",
			"problem",
			"outcome",
			"generated-preview",
		] as const,
		primarySectionId: "problem" as const,
		sectionLabel: "Blueprint",
	},
	{
		id: "build",
		title: BUILD_PACK_LABEL,
		includedPath: "docs/build/",
		summary:
			"Implementation guidance and long-horizon build docs generated from pricing plus setup inputs.",
		sectionIds: ["pricing", "setup"] as const,
		primarySectionId: "pricing" as const,
		sectionLabel: "Blueprint",
	},
] as const;

export type ReviewArtifactId = (typeof reviewArtifacts)[number]["id"];

export function getReviewArtifactHref(sectionId: BlueprintPageSectionId) {
	return getBlueprintPageSectionHref(sectionId);
}
