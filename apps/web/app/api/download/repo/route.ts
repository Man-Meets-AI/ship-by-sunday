import { getCodebaseDownloadContext } from "@/app/api/download/repo/_server/downloads";
import {
	buildRepoGenerationManifest,
	getStarterSnapshotArchiveFileName,
} from "@shipbysunday/codebase-compiler";

export const runtime = "nodejs";

async function importCodebaseCompilerServer() {
	return import("@shipbysunday/codebase-compiler/server");
}

export async function GET() {
	const context = await getCodebaseDownloadContext();
	if (!context) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!context.workspaceState.codebaseReadiness.review.isReady) {
		return new Response("Codebase is not ready yet", { status: 409 });
	}

	const codebaseCompilerServer = await importCodebaseCompilerServer();
	const archive = await codebaseCompilerServer.buildReviewDownloadZip(
		context.canonicalProjectDefinition,
	);
	const manifest = buildRepoGenerationManifest(
		context.canonicalProjectDefinition,
	);

	return new Response(new Uint8Array(archive), {
		status: 200,
		headers: {
			"content-type": "application/zip",
			"content-disposition": `attachment; filename="${getStarterSnapshotArchiveFileName(manifest.repoName)}"`,
		},
	});
}
