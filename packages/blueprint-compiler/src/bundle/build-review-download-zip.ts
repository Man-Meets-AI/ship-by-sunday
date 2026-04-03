import JSZip from "jszip";
import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import { buildRepoGenerationManifest } from "../repo-generation/build-repo-generation-manifest";
import { materializeRepoSnapshot } from "../repo-generation/materialize-repo-snapshot";

export async function buildReviewDownloadZip(
	projectDefinition: CanonicalProjectDefinition,
) {
	const zip = new JSZip();
	const manifest = buildRepoGenerationManifest(projectDefinition);
	const files = await materializeRepoSnapshot(projectDefinition);

	for (const file of files) {
		zip.file(`${manifest.repoName}/${file.path}`, file.content);
	}

	return zip.generateAsync({ type: "nodebuffer" });
}
