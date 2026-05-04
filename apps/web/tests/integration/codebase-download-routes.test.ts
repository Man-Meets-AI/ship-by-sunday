import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildRepoGenerationManifest,
	createCompleteProjectDefinition,
	getStarterSnapshotArchiveFileName,
} from "@shipbysunday/codebase-compiler";

const getCodebaseDownloadContextMock = vi.fn();

vi.mock("@/app/api/download/repo/_server/downloads", () => ({
	getCodebaseDownloadContext: getCodebaseDownloadContextMock,
}));

describe("codebase download routes", () => {
	beforeEach(() => {
		getCodebaseDownloadContextMock.mockReset();
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
		const response = await GET();
		const archiveBytes = new Uint8Array(await response.arrayBuffer());
		const manifest = buildRepoGenerationManifest(canonicalProjectDefinition);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("application/zip");
		expect(response.headers.get("content-disposition")).toBe(
			`attachment; filename="${getStarterSnapshotArchiveFileName(manifest.repoName)}"`,
		);
		expect(archiveBytes.length).toBeGreaterThan(100);
		expect(Array.from(archiveBytes.slice(0, 2))).toEqual([80, 75]);
	});
});
