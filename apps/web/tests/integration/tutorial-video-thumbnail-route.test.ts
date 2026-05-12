import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/video/thumbnails/[videoId]/route";

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(async () => ({
		userId: "user_123",
		getToken: vi.fn(async () => "convex-token"),
	})),
}));

vi.mock("convex/nextjs", () => ({
	fetchQuery: vi.fn(async () => ({ hasAccess: true })),
}));

function createThumbnailRequest(videoId: string) {
	return new Request(`https://example.test/api/video/thumbnails/${videoId}`);
}

describe("GET /api/video/thumbnails/[videoId]", () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
	});

	it("rejects unknown Bunny video IDs without fetching upstream", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		const response = await GET(createThumbnailRequest("missing-video"), {
			params: Promise.resolve({ videoId: "missing-video" }),
		});

		expect(response.status).toBe(404);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("proxies known Bunny thumbnails with the player referer", async () => {
		const upstreamBody = new Uint8Array([1, 2, 3]);
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(upstreamBody, {
				status: 200,
				headers: {
					"content-type": "image/jpeg",
				},
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const videoId = "0df1d1d2-098a-425b-b6eb-3c465f0a32e1";
		const response = await GET(createThumbnailRequest(videoId), {
			params: Promise.resolve({ videoId }),
		});

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("image/jpeg");
		expect(response.headers.get("cache-control")).toContain("s-maxage");
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(upstreamBody);
		expect(fetchMock).toHaveBeenCalledWith(
			`https://vz-fd54da20-4b1.b-cdn.net/${videoId}/thumbnail.jpg`,
			{
				headers: {
					Accept: "image/*",
					Referer: `https://player.mediadelivery.net/embed/619172/${videoId}`,
				},
				cache: "force-cache",
			},
		);
	});

	it("maps upstream failures to a non-cacheable bad gateway", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response("nope", { status: 403 }));
		vi.stubGlobal("fetch", fetchMock);

		const videoId = "0df1d1d2-098a-425b-b6eb-3c465f0a32e1";
		const response = await GET(createThumbnailRequest(videoId), {
			params: Promise.resolve({ videoId }),
		});

		expect(response.status).toBe(502);
		expect(response.headers.get("cache-control")).toBe("no-store");
	});
});
