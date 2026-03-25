import {
	parseCanonicalProjectDefinition,
	type CanonicalProjectDefinition,
} from "../canonical-project-definition/project-definition";
import { renderBuildPacket } from "../packets/render-build-packet";
import { renderDesignPacket } from "../packets/render-design-packet";
import { renderMarketingPacket } from "../packets/render-marketing-packet";
import { renderPacketReadme } from "../packets/render-packet-readme";
import { renderPromptPack } from "../packets/render-prompt-pack";
import type { RenderedPacketFile } from "../packets/render-types";
import { loadOpenAiPacketTemplates } from "./template-loader";

export async function renderFullPacketTree(
	projectDefinition: CanonicalProjectDefinition,
) {
	const canonicalProjectDefinition =
		parseCanonicalProjectDefinition(projectDefinition);
	const templates = await loadOpenAiPacketTemplates();
	const factsJsonFile: RenderedPacketFile = {
		path: "packet/facts/project-definition.json",
		content: JSON.stringify(canonicalProjectDefinition, null, 2),
	};

	return [
		renderPacketReadme(canonicalProjectDefinition.facts),
		factsJsonFile,
		...renderDesignPacket(canonicalProjectDefinition.facts, templates),
		...renderMarketingPacket(canonicalProjectDefinition.facts, templates),
		...renderBuildPacket(canonicalProjectDefinition.facts, templates),
		...renderPromptPack(canonicalProjectDefinition.facts),
	];
}
