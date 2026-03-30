import { fetchMutation } from "convex/nextjs";
import { getPacketDownloadContext } from "@/features/packet-flow/server/downloads";
import { getStarterSnapshotArchiveFileName } from "@packet-compiler";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

async function importPacketCompilerServer() {
	return import("@manmeetsai/packet-compiler/server");
}

export async function GET() {
	const context = await getPacketDownloadContext();
	if (!context) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!context.workspaceState.packetReadiness.review.isReady) {
		return new Response("Starter Snapshot is not ready yet", { status: 409 });
	}

	const packetCompilerServer = await importPacketCompilerServer();
	const archive = await packetCompilerServer.buildReviewDownloadZip(
		context.canonicalProjectDefinition,
	);
	await fetchMutation(
		api.packet.unlockExecuteShip,
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
