import { beforeEach, describe, expect, it, vi } from "vitest";

const getPacketDownloadContextMock = vi.fn();
const buildDesignPacketArchiveMock = vi.fn();
const buildMarketingPacketArchiveMock = vi.fn();
const buildReviewDownloadZipMock = vi.fn();

vi.mock("@/features/packet-flow/server/downloads", () => ({
	getPacketDownloadContext: getPacketDownloadContextMock,
}));

vi.mock("@packet-compiler/server", () => ({
	buildBuildPacketArchive: vi.fn(),
	buildDesignPacketArchive: buildDesignPacketArchiveMock,
	buildMarketingPacketArchive: buildMarketingPacketArchiveMock,
	buildReviewDownloadZip: buildReviewDownloadZipMock,
}));

describe("packet download routes", () => {
	beforeEach(() => {
		getPacketDownloadContextMock.mockReset();
		buildDesignPacketArchiveMock.mockReset();
		buildMarketingPacketArchiveMock.mockReset();
		buildReviewDownloadZipMock.mockReset();
	});

	it("blocks packet downloads until the requested packet is ready", async () => {
		getPacketDownloadContextMock.mockResolvedValue({
			canonicalProjectDefinition: {},
			workspaceState: {
				packetReadiness: {
					design: { isReady: false },
					marketing: { isReady: false },
					build: { isReady: false },
					review: { isReady: false },
				},
			},
		});

		const { GET } = await import("@/app/api/download/packet/[stage]/route");
		const response = await GET(new Request("https://example.com"), {
			params: Promise.resolve({ stage: "design" }),
		});

		expect(response.status).toBe(409);
		expect(await response.text()).toContain("not ready");
		expect(buildDesignPacketArchiveMock).not.toHaveBeenCalled();
	});

	it("returns pack archives with outward-facing filenames", async () => {
		buildDesignPacketArchiveMock.mockResolvedValue(Buffer.from("zip"));
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

		const { GET } = await import("@/app/api/download/packet/[stage]/route");
		const response = await GET(new Request("https://example.com"), {
			params: Promise.resolve({ stage: "design" }),
		});

		expect(response.status).toBe(200);
		expect(response.headers.get("content-disposition")).toContain(
			"design-pack.zip",
		);
		expect(new Uint8Array(await response.arrayBuffer())).toHaveLength(3);
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
