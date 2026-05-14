import { getRateLimitedResponse } from "@/app/api/_lib/request-rate-limit";
import {
	getStarterTemplateDownloadTokenFromRequest,
	verifyStarterTemplateDownloadToken,
} from "@/lib/download/starter-template-download-token";
import {
	buildRepoGenerationManifest,
	createDefaultStarterTemplateProjectDefinition,
	getStarterSnapshotArchiveFileName,
} from "@shipbysunday/codebase-compiler";

export const runtime = "nodejs";

async function importCodebaseCompilerServer() {
	return import("@shipbysunday/codebase-compiler/server");
}

export async function GET(request: Request) {
	const rateLimitedResponse = getRateLimitedResponse({
		bucket: "download.starterTemplate",
		request,
		limit: 10,
		windowMs: 60_000,
	});
	if (rateLimitedResponse) {
		return rateLimitedResponse;
	}

	const tokenStatus = verifyStarterTemplateDownloadToken(
		getStarterTemplateDownloadTokenFromRequest(request),
	);
	if (tokenStatus.kind === "missing_secret") {
		return new Response("Starter template downloads are not configured.", {
			status: 503,
		});
	}
	if (tokenStatus.kind !== "valid") {
		return new Response(
			"Starter template download link is invalid or expired.",
			{
				status: 403,
			},
		);
	}

	const projectDefinition = createDefaultStarterTemplateProjectDefinition();
	const codebaseCompilerServer = await importCodebaseCompilerServer();
	const archive =
		await codebaseCompilerServer.buildReviewDownloadZip(projectDefinition);
	const manifest = buildRepoGenerationManifest(projectDefinition);

	return new Response(new Uint8Array(archive), {
		status: 200,
		headers: {
			"content-type": "application/zip",
			"content-disposition": `attachment; filename="${getStarterSnapshotArchiveFileName(manifest.repoName)}"`,
			"cache-control": "private, no-store",
		},
	});
}
