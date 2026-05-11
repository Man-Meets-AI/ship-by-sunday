import { getCodebaseDownloadContext } from "@/app/api/download/repo/_server/downloads";
import {
	assertSupportModeDownloadAllowedForRequest,
	recordSupportModeDownloadForRequest,
} from "@/platform/admin-impersonation/route-policy";
import {
	buildRepoGenerationManifest,
	getStarterSnapshotArchiveFileName,
} from "@shipbysunday/codebase-compiler";

export const runtime = "nodejs";

async function importCodebaseCompilerServer() {
	return import("@shipbysunday/codebase-compiler/server");
}

export async function GET(request: Request) {
	const context = await getCodebaseDownloadContext();
	if (!context) {
		return new Response("Unauthorized", { status: 401 });
	}

	if (!context.workspaceState.codebaseReadiness.review.isReady) {
		return new Response("Codebase is not ready yet", { status: 409 });
	}

	const supportModeDownloadGate =
		await assertSupportModeDownloadAllowedForRequest(request, {
			actionId: "download.reviewRepo",
		});
	if (supportModeDownloadGate.kind === "blocked") {
		return new Response(
			"Review downloads are unavailable during support mode.",
			{
				status: 403,
			},
		);
	}

	const codebaseCompilerServer = await importCodebaseCompilerServer();
	const archive = await codebaseCompilerServer.buildReviewDownloadZip(
		context.canonicalProjectDefinition,
	);
	const manifest = buildRepoGenerationManifest(
		context.canonicalProjectDefinition,
	);
	const auditResult = await recordSupportModeDownloadForRequest(request, {
		actionId: "download.reviewRepo",
		changedRecordIds: [context.canonicalProjectDefinition.productKey],
	});
	if (auditResult.kind === "not_recorded") {
		return new Response(
			"Review downloads are unavailable during support mode.",
			{
				status: 403,
			},
		);
	}

	return new Response(new Uint8Array(archive), {
		status: 200,
		headers: {
			"content-type": "application/zip",
			"content-disposition": `attachment; filename="${getStarterSnapshotArchiveFileName(manifest.repoName)}"`,
		},
	});
}
