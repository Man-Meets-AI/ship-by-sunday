import { beforeEach, describe, expect, it, vi } from "vitest";

const getBlueprintDownloadContextMock = vi.fn();
const buildReviewDownloadZipMock = vi.fn();

vi.mock("@/features/blueprint-flow/server/downloads", () => ({
	getBlueprintDownloadContext: getBlueprintDownloadContextMock,
}));

vi.mock("@blueprint-compiler/server", () => ({
	buildReviewDownloadZip: buildReviewDownloadZipMock,
}));

describe("blueprint download routes", () => {
	beforeEach(() => {
		getBlueprintDownloadContextMock.mockReset();
		buildReviewDownloadZipMock.mockReset();
	});

	it("returns the repo archive when review is ready", async () => {
		buildReviewDownloadZipMock.mockResolvedValue(Buffer.from("zip"));
		getBlueprintDownloadContextMock.mockResolvedValue({
			canonicalProjectDefinition: { facts: {} },
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

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("application/zip");
		expect(response.headers.get("content-disposition")).toBe(
			'attachment; filename="ship-by-sunday-blueprint.zip"',
		);
		expect(new Uint8Array(await response.arrayBuffer())).toHaveLength(3);
	});
});
