import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import { renderFullPacketTree } from "../server/rendered-packet-tree";
import { buildPacketArchive } from "./build-packet-archive";

export async function buildDesignPacketArchive(
	projectDefinition: CanonicalProjectDefinition,
) {
	const renderedFiles = await renderFullPacketTree(projectDefinition);
	return buildPacketArchive(
		renderedFiles.filter(
			(file) =>
				file.path === "packet/facts/project-definition.json" ||
				file.path.startsWith("packet/design/"),
		),
	);
}
