import { getBlueprintDownloadContext } from "@/features/blueprint-flow/server/downloads";
import { getStarterSnapshotArchiveFileName } from "@shipbysunday/blueprint-compiler";

export const runtime = "nodejs";

async function importBlueprintCompilerServer() {
	return import("@shipbysunday/blueprint-compiler/server");
}

export async function GET() {
	const context = await getBlueprintDownloadContext();
	if (!context) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!context.workspaceState.blueprintReadiness.review.isReady) {
		return new Response("Blueprint is not ready yet", { status: 409 });
	}

	const blueprintCompilerServer = await importBlueprintCompilerServer();
	const archive = await blueprintCompilerServer.buildReviewDownloadZip(
		context.canonicalProjectDefinition,
	);

	return new Response(new Uint8Array(archive), {
		status: 200,
		headers: {
			"content-type": "application/zip",
			"content-disposition": `attachment; filename="${getStarterSnapshotArchiveFileName()}"`,
		},
	});
}
