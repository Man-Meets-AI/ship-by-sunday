import { getPacketDownloadContext } from "@/features/packet-flow/server/downloads";

export const runtime = "nodejs";

async function importPacketCompilerServer() {
	return import(/* turbopackIgnore: true */ "@packet-compiler/server");
}

export async function GET() {
	const context = await getPacketDownloadContext();
	if (!context) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!context.workspaceState.packetReadiness.review.isReady) {
		return new Response("Repo snapshot is not ready yet", { status: 409 });
	}

	const packetCompilerServer = await importPacketCompilerServer();
	const archive = await packetCompilerServer.buildReviewDownloadZip(
		context.canonicalProjectDefinition,
	);

	return new Response(new Uint8Array(archive), {
		status: 200,
		headers: {
			"content-type": "application/zip",
			"content-disposition": 'attachment; filename="starter-repo.zip"',
		},
	});
}
