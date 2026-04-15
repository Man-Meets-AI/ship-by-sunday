import {
	isBunnyEmbedUrl,
	verifyBunnyEmbedUrl,
} from "@/features/course/lesson/lib/video-verification";

describe("video verification helpers", () => {
	it("accepts Bunny embed urls and rejects everything else", () => {
		expect(
			isBunnyEmbedUrl(
				"https://player.mediadelivery.net/embed/619172/video-guid",
			),
		).toBe(true);
		expect(
			isBunnyEmbedUrl(
				"https://iframe.mediadelivery.net/play/619172/video-guid",
			),
		).toBe(true);
		expect(
			isBunnyEmbedUrl("https://player.mediadelivery.net/embed/619172"),
		).toBe(false);
		expect(
			isBunnyEmbedUrl(
				"http://player.mediadelivery.net/embed/619172/video-guid",
			),
		).toBe(false);
		expect(isBunnyEmbedUrl("https://example.com/embed/619172/video-guid")).toBe(
			false,
		);
	});

	it("marks successful Bunny responses as ready", async () => {
		const fetchMock = vi.fn(
			async () => new Response("", { status: 200 }),
		) as typeof fetch;

		await expect(
			verifyBunnyEmbedUrl(
				"https://player.mediadelivery.net/embed/619172/video-guid",
				fetchMock,
			),
		).resolves.toEqual({
			kind: "ready",
			httpStatus: 200,
		});
	});

	it("marks missing Bunny responses as unavailable", async () => {
		const fetchMock = vi.fn(
			async () => new Response("", { status: 404 }),
		) as typeof fetch;

		await expect(
			verifyBunnyEmbedUrl(
				"https://player.mediadelivery.net/embed/619172/video-guid",
				fetchMock,
			),
		).resolves.toEqual({
			kind: "unavailable",
			httpStatus: 404,
		});
	});

	it("fails closed for invalid urls before any network request", async () => {
		const fetchMock = vi.fn() as typeof fetch;

		await expect(
			verifyBunnyEmbedUrl(
				"https://example.com/embed/619172/video-guid",
				fetchMock,
			),
		).resolves.toEqual({
			kind: "unavailable",
			httpStatus: null,
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
