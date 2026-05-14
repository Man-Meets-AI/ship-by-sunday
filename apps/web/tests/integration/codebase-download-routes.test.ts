import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildRepoGenerationManifest,
	createDefaultStarterTemplateProjectDefinition,
	createCompleteProjectDefinition,
	getStarterSnapshotArchiveFileName,
} from "@shipbysunday/codebase-compiler";
import JSZip from "jszip";
import { createStarterTemplateDownloadToken } from "@/lib/download/starter-template-download-token";
import { resetRequestRateLimitBucketsForTests } from "@/app/api/_lib/request-rate-limit";

const getCodebaseDownloadContextMock = vi.fn();
const assertSupportModeDownloadAllowedForRequestMock = vi.fn();
const recordSupportModeDownloadForRequestMock = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@/app/api/download/repo/_server/downloads", () => ({
	getCodebaseDownloadContext: getCodebaseDownloadContextMock,
}));

vi.mock("@/platform/admin-impersonation/route-policy", () => ({
	assertSupportModeDownloadAllowedForRequest:
		assertSupportModeDownloadAllowedForRequestMock,
	recordSupportModeDownloadForRequest: recordSupportModeDownloadForRequestMock,
}));

describe("codebase download routes", () => {
	beforeEach(() => {
		resetRequestRateLimitBucketsForTests();
		getCodebaseDownloadContextMock.mockReset();
		assertSupportModeDownloadAllowedForRequestMock
			.mockReset()
			.mockResolvedValue({ kind: "not_impersonating" });
		recordSupportModeDownloadForRequestMock
			.mockReset()
			.mockResolvedValue({ kind: "not_impersonating" });
	});

	it("returns the real repo archive when review is ready", async () => {
		const canonicalProjectDefinition = createCompleteProjectDefinition();
		getCodebaseDownloadContextMock.mockResolvedValue({
			canonicalProjectDefinition,
			token: "token_123",
			workspaceState: {
				codebaseReadiness: {
					design: { isReady: true },
					marketing: { isReady: true },
					build: { isReady: true },
					review: { isReady: true },
				},
			},
		});

		const { GET } = await import("@/app/api/download/repo/route");
		const response = await GET(
			new Request("https://example.test/api/download/repo"),
		);
		const archiveBytes = new Uint8Array(await response.arrayBuffer());
		const manifest = buildRepoGenerationManifest(canonicalProjectDefinition);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("application/zip");
		expect(response.headers.get("content-disposition")).toBe(
			`attachment; filename="${getStarterSnapshotArchiveFileName(manifest.repoName)}"`,
		);
		expect(assertSupportModeDownloadAllowedForRequestMock).toHaveBeenCalledWith(
			expect.any(Request),
			{
				actionId: "download.reviewRepo",
			},
		);
		expect(recordSupportModeDownloadForRequestMock).toHaveBeenCalledWith(
			expect.any(Request),
			{
				actionId: "download.reviewRepo",
				changedRecordIds: [canonicalProjectDefinition.productKey],
			},
		);
		expect(archiveBytes.length).toBeGreaterThan(100);
		expect(Array.from(archiveBytes.slice(0, 2))).toEqual([80, 75]);
	});

	it("returns the direct Starter template archive from default facts", async () => {
		const projectDefinition = createDefaultStarterTemplateProjectDefinition();
		const manifest = buildRepoGenerationManifest(projectDefinition);
		const token = createStarterTemplateDownloadToken();

		const { GET } = await import("@/app/api/download/starter-template/route");
		const response = await GET(
			new Request(
				`https://example.test/api/download/starter-template?downloadToken=${token}`,
				{
					headers: {
						"x-forwarded-for": "203.0.113.7",
					},
				},
			),
		);
		const archiveBytes = new Uint8Array(await response.arrayBuffer());
		const zip = await JSZip.loadAsync(archiveBytes);
		const entries = Object.keys(zip.files).sort();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("application/zip");
		expect(response.headers.get("cache-control")).toBe("private, no-store");
		expect(response.headers.get("content-disposition")).toBe(
			`attachment; filename="${getStarterSnapshotArchiveFileName(manifest.repoName)}"`,
		);
		expect(getCodebaseDownloadContextMock).not.toHaveBeenCalled();
		expect(Array.from(archiveBytes.slice(0, 2))).toEqual([80, 75]);
		expect(entries).toEqual(
			expect.arrayContaining([
				"ai-chat-starter/docs/facts/template-source.json",
				"ai-chat-starter/docs/facts/project-definition.json",
				"ai-chat-starter/apps/web/src/app/(app)/chat/page.tsx",
			]),
		);
	});

	it("rejects direct Starter template downloads without a signed token", async () => {
		const { GET } = await import("@/app/api/download/starter-template/route");
		const response = await GET(
			new Request("https://example.test/api/download/starter-template", {
				headers: {
					"x-forwarded-for": "203.0.113.9",
				},
			}),
		);

		expect(response.status).toBe(403);
		expect(response.headers.get("content-type")).not.toBe("application/zip");
		expect(getCodebaseDownloadContextMock).not.toHaveBeenCalled();
	});

	it("rate-limits direct Starter template attempts before archive generation", async () => {
		const { GET } = await import("@/app/api/download/starter-template/route");
		const responses = await Promise.all(
			Array.from({ length: 11 }, () =>
				GET(
					new Request("https://example.test/api/download/starter-template", {
						headers: {
							"x-forwarded-for": "203.0.113.8",
						},
					}),
				),
			),
		);

		expect(responses.at(-1)?.status).toBe(429);
		expect(responses.at(-1)?.headers.get("retry-after")).toBe("60");
		expect(getCodebaseDownloadContextMock).not.toHaveBeenCalled();
	});
});
