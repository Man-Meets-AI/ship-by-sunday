import { beforeEach, describe, expect, it, vi } from "vitest";

const getPacketDownloadContextMock = vi.fn();
const buildReviewDownloadZipMock = vi.fn();

vi.mock("@/features/packet-flow/server/downloads", () => ({
	getPacketDownloadContext: getPacketDownloadContextMock,
}));

vi.mock("@manmeetsai/packet-compiler/server", () => ({
	buildReviewDownloadZip: buildReviewDownloadZipMock,
}));

describe("packet download routes", () => {
	beforeEach(() => {
		getPacketDownloadContextMock.mockReset();
		buildReviewDownloadZipMock.mockReset();
	});

	it("returns the repo archive when review is ready", async () => {
		buildReviewDownloadZipMock.mockResolvedValue(Buffer.from("zip"));
		getPacketDownloadContextMock.mockResolvedValue({
			canonicalProjectDefinition: { facts: {} },
			workspaceState: {
				packetReadiness: {
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
		expect(response.headers.get("content-disposition")).toContain(
			"starter-snapshot.zip",
		);
		expect(new Uint8Array(await response.arrayBuffer())).toHaveLength(3);
	});
});
