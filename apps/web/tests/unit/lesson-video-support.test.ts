import {
	attachGeneratedLessonMedia,
	getLessonVideoAsset,
	getBunnyEmbedUrl,
	getVideoAsset,
	hydrateLessonVideoContent,
	isLessonVideoReady,
	resolveLessonVideoUrl,
} from "@/features/course/lesson/model/video";
import { getLessonById } from "@/features/course/lesson/model";
import { resolveLessonVideoAssetId } from "@/features/course/lesson/model/video-assignments";

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

	it("resolves lesson ids to canonical Bunny asset ids", () => {
		expect(resolveLessonVideoAssetId("1.1")).toBe("0.1");
		expect(resolveLessonVideoAssetId("1.2")).toBe("0.2");
		expect(resolveLessonVideoAssetId("1.3")).toBe("1.2");
		expect(resolveLessonVideoAssetId("3.2")).toBe("3.2");

		expect(getVideoAsset("0.1")?.videoId).toBe(
			"0df1d1d2-098a-425b-b6eb-3c465f0a32e1",
		);
		expect(getLessonVideoAsset({ id: "1.9" })?.videoId).toBe(
			"0ca98e98-f8c2-40d8-88f1-15a97d1b4c8d",
		);
		expect(getLessonVideoAsset({ id: "3.2" })?.videoId).toBe(
			"374f9017-6573-426e-b2d4-270cbf1f747e",
		);
		expect(getLessonVideoAsset(null)).toBeNull();
	});

	it("falls back to the lesson title when Bunny metadata does not provide one", () => {
		const lesson = getLessonById("1.3");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.3 to exist.");
		}

		const hydratedLesson = attachGeneratedLessonMedia({
			...lesson,
			content: {
				...lesson.content,
				coach: {
					...lesson.content.coach,
					video: {
						status: "ready",
						provider: "bunny",
						libraryId: 619172,
						videoId: "b0173058-5cf9-4a93-b865-8bb6e48fd5f7",
					},
				},
			},
		});

		expect(hydratedLesson.content.coach.video).toMatchObject({
			title: "Start With the Problem",
			videoId: "b0173058-5cf9-4a93-b865-8bb6e48fd5f7",
		});
	});
});
