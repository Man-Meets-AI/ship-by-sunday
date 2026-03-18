import {
	getBunnyEmbedUrl,
	hydrateLessonVideoContent,
	isLessonVideoReady,
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
});
