import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildRepoGenerationManifest,
	createCompleteProjectDefinition,
	getStarterSnapshotArchiveFileName,
} from "@shipbysunday/blueprint-compiler";

const getBlueprintDownloadContextMock = vi.fn();

vi.mock("@/features/blueprint-flow/server/downloads", () => ({
	getBlueprintDownloadContext: getBlueprintDownloadContextMock,
}));

describe("blueprint download routes", () => {
	beforeEach(() => {
		getBlueprintDownloadContextMock.mockReset();
	});

	it("returns the real repo archive when review is ready", async () => {
		const canonicalProjectDefinition = createCompleteProjectDefinition();
		getBlueprintDownloadContextMock.mockResolvedValue({
			canonicalProjectDefinition,
			token: "token_123",
			workspaceState: {
				blueprintReadiness: {
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
