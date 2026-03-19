import {
	getBunnyEmbedUrl,
	hydrateLessonVideoContent,
	isLessonVideoReady,
	resolveLessonMediaKey,
	resolveLessonVideoUrl,
} from "@/features/course/lesson/model/video";

describe("lesson video helpers", () => {
	it("builds Bunny embed urls deterministically", () => {
		expect(getBunnyEmbedUrl(619172, "video-guid")).toBe(
			"https://player.mediadelivery.net/embed/619172/video-guid",
		);
	});

	it("hydrates Bunny lesson videos with a derived player url", () => {
		const hydratedVideo = hydrateLessonVideoContent({
			status: "ready",
			provider: "bunny",
			libraryId: 619172,
			videoId: "video-guid",
			title: "Deploy the App",
		});

		expect(hydratedVideo?.url).toBe(
			"https://player.mediadelivery.net/embed/619172/video-guid",
		);
	});

	it("treats Bunny videos with ids as ready even before url hydration", () => {
		const bunnyVideo = {
			status: "ready" as const,
			provider: "bunny" as const,
			libraryId: 619172,
			videoId: "video-guid",
		};

		expect(isLessonVideoReady(bunnyVideo)).toBe(true);
		expect(resolveLessonVideoUrl(bunnyVideo)).toBe(
			"https://player.mediadelivery.net/embed/619172/video-guid",
		);
	});

	it("allows lesson videos to be remapped independently from the media slots", () => {
		expect(resolveLessonMediaKey("1.1")).toBe("0.1");
		expect(resolveLessonMediaKey("1.2")).toBe("0.2");
		expect(resolveLessonMediaKey("1.3")).toBe("1.2");
		expect(resolveLessonMediaKey("1.4")).toBe("1.3");
		expect(resolveLessonMediaKey("1.9")).toBe("1.7");
	});
});
