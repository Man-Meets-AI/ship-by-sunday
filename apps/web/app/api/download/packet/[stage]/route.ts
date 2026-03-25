import { notFound } from "next/navigation";
import { getPacketDownloadContext } from "@/features/packet-flow/server/downloads";
import { getPublicPacketArchiveFileName } from "@packet-compiler";

export const runtime = "nodejs";

async function importPacketCompilerServer() {
	return import(/* turbopackIgnore: true */ "@packet-compiler/server");
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ stage: string }> },
) {
	const { stage } = await params;
	const archiveStage =
		stage === "build" || stage === "design" || stage === "marketing"
			? stage
			: null;
	if (!archiveStage) {
		notFound();
	}

	const context = await getPacketDownloadContext();
	if (!context) {
		return new Response("Unauthorized", { status: 401 });
	}

	const readinessKey =
		stage === "build" ? "build" : (stage as "design" | "marketing");
	if (!context.workspaceState.packetReadiness[readinessKey].isReady) {
		return new Response("Pack is not ready yet", { status: 409 });
	}

	const packetCompilerServer = await importPacketCompilerServer();
	const builderByStage = {
		build: packetCompilerServer.buildBuildPacketArchive,
		design: packetCompilerServer.buildDesignPacketArchive,
		marketing: packetCompilerServer.buildMarketingPacketArchive,
	} as const;
	const archive = await builderByStage[archiveStage](
		context.canonicalProjectDefinition,
	);

	return new Response(new Uint8Array(archive), {
		status: 200,
		headers: {
			"content-type": "application/zip",
			"content-disposition": `attachment; filename="${getPublicPacketArchiveFileName(archiveStage)}"`,
		},
	});
}
