import { fetchMutation } from "convex/nextjs";
import { getBlueprintDownloadContext } from "@/features/blueprint-flow/server/downloads";
import { getStarterSnapshotArchiveFileName } from "@blueprint-compiler";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

async function importBlueprintCompilerServer() {
	return import("@manmeetsai/blueprint-compiler/server");
}

export async function GET() {
	const context = await getBlueprintDownloadContext();
	if (!context) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!context.workspaceState.blueprintReadiness.review.isReady) {
		return new Response("Starter Snapshot is not ready yet", { status: 409 });
	}

	const blueprintCompilerServer = await importBlueprintCompilerServer();
	const archive = await blueprintCompilerServer.buildReviewDownloadZip(
		context.canonicalProjectDefinition,
	);
	await fetchMutation(
		api.blueprint.unlockExecuteShip,
		{},
		{ token: context.token },
	);

	return new Response(new Uint8Array(archive), {
		status: 200,
		headers: {
			"content-type": "application/zip",
			"content-disposition": `attachment; filename="${getStarterSnapshotArchiveFileName()}"`,
		},
	});
}
