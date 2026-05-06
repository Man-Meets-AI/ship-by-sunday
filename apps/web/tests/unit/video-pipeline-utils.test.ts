import {
	buildCutOptionsFromArgv,
	buildLessonMediaEntry,
	compareLessonIds,
	extractLessonDefinitions,
	extractLessonMediaMap,
	getVideoOutputCandidate,
	parseLessonFilename,
	renderLessonMediaModule,
	validateReadyVideoFiles,
} from "@/scripts/lib/lesson-video-pipeline.mjs";

describe("lesson video pipeline helpers", () => {
	it("sorts lesson ids numerically instead of lexically", () => {
		expect(["3.10", "3.2", "0.2", "0.1"].sort(compareLessonIds)).toEqual([
			"0.1",
			"0.2",
			"3.2",
			"3.10",
		]);
	});

	it("extracts lesson ids and titles from lesson source text", () => {
		const source = `
		{
			id: "2.4",
			title: "Figma Basics for Speed",
		},
		{
			title: "Nested helper title that should be ignored",
		},
		{
			id: "3.2",
			title: "Map the Repo and Starter",
		},
		`;

		expect(extractLessonDefinitions(source)).toEqual([
			{ id: "2.4", title: "Figma Basics for Speed" },
			{ id: "3.2", title: "Map the Repo and Starter" },
		]);
	});

	it("parses valid lesson filenames", () => {
		expect(parseLessonFilename("2.4--figma-basics.mp4")).toEqual({
			fileName: "2.4--figma-basics.mp4",
			sourceKey: "2.4",
			slug: "figma-basics",
			extension: ".mp4",
		});
		expect(parseLessonFilename("3-17--core-ux-build3.mp4")).toEqual({
			fileName: "3-17--core-ux-build3.mp4",
			sourceKey: "3-17",
			slug: "core-ux-build3",
			extension: ".mp4",
		});
		expect(parseLessonFilename("notes.txt")).toBeNull();
	});

	it("round-trips generated lesson media modules deterministically", () => {
		const source = renderLessonMediaModule({
			"3.2": {
				status: "ready",
				provider: "bunny",
				libraryId: 619172,
				videoId: "video-3-2",
			},
			"2.4": {
				status: "ready",
				provider: "bunny",
				libraryId: 619172,
				videoId: "video-2-4",
			},
		});

		expect(source.indexOf('"2.4"')).toBeLessThan(source.indexOf('"3.2"'));
		expect(extractLessonMediaMap(source)).toEqual({
			"2.4": {
				status: "ready",
				provider: "bunny",
				libraryId: 619172,
				videoId: "video-2-4",
			},
			"3.2": {
				status: "ready",
				provider: "bunny",
				libraryId: 619172,
				videoId: "video-3-2",
			},
		});
	});

	it("keeps Bunny thumbnail filenames in generated media entries", () => {
		expect(
			buildLessonMediaEntry({
				libraryId: 619172,
				videoId: "video-3-2",
				lessonTitle: "Map the Repo and Starter",
				bunnyVideo: {
					length: 209,
					thumbnailFileName: "thumbnail.jpg",
				},
			}),
		).toEqual({
			status: "ready",
			provider: "bunny",
			libraryId: 619172,
			videoId: "video-3-2",
			title: "Map the Repo and Starter",
			thumbnailFileName: "thumbnail.jpg",
			durationLabel: "3m 29s",
		});
	});

	it("rejects invalid, duplicate, and already-attached lesson files", () => {
		const { readyItems, errors } = validateReadyVideoFiles({
			fileNames: [
				"2.4--figma-basics.mp4",
				"2.4--second-cut.mp4",
				"notes.txt",
				"9.9--missing.mp4",
			],
			validLessons: [
				{ id: "2.4", title: "Figma Basics for Speed" },
				{ id: "3.2", title: "Map the Repo and Starter" },
			],
			existingMedia: {
				"3.2": {
					status: "ready",
					provider: "bunny",
					libraryId: 619172,
					videoId: "video-3-2",
				},
			},
			replaceLessonIds: new Set(["2.4"]),
		});

		expect(readyItems).toEqual([
			{
				attachmentMode: "lesson",
				fileName: "2.4--figma-basics.mp4",
				lessonId: "2.4",
				sourceKey: "2.4",
				slug: "figma-basics",
				extension: ".mp4",
				lessonTitle: "Figma Basics for Speed",
			},
			{
				attachmentMode: "unattached",
				fileName: "9.9--missing.mp4",
				lessonId: null,
				sourceKey: "9.9",
				slug: "missing",
				extension: ".mp4",
				lessonTitle: null,
			},
		]);
		expect(errors).toEqual([
			"2.4--second-cut.mp4: source key 2.4 appears more than once in Ready.",
			"notes.txt: expected <lessonId>--<slug>.<video extension> with a supported video file extension.",
		]);
	});

	it("blocks replacing existing media unless explicitly allowed", () => {
		const { readyItems, errors } = validateReadyVideoFiles({
			fileNames: ["3.2--repo-map.mp4"],
			validLessons: [{ id: "3.2", title: "Map the Repo and Starter" }],
			existingMedia: {
				"3.2": {
					status: "ready",
					provider: "bunny",
					libraryId: 619172,
					videoId: "existing-video",
				},
			},
			replaceLessonIds: new Set(),
		});

		expect(readyItems).toEqual([]);
		expect(errors).toEqual([
			"3.2--repo-map.mp4: lesson 3.2 already has generated media. Use --replace 3.2 to overwrite the local media map entry.",
		]);
	});

	it("parses cut-stage flags for publish and direct cut runs", () => {
		expect(
			buildCutOptionsFromArgv([
				"--detect-restarts",
				"--min-silence=0.8",
				"--padding",
				"120",
				"--merge-gap=0.45",
				"--python-bin",
				"/tmp/python",
				"--no-keep-start",
			]),
		).toEqual({
			skipCut: false,
			detectRestarts: true,
			minSilence: 0.8,
			minSpeech: null,
			padding: 120,
			mergeGap: 0.45,
			keepStart: false,
			pythonBin: "/tmp/python",
		});
	});

	it("prefers the explicit Auphonic video output over audio files that also end in mp4", () => {
		expect(
			getVideoOutputCandidate([
				{
					format: "aac",
					ending: "mp4",
					download_url: "/audio.mp4",
				},
				{
					format: "video",
					ending: "",
					download_url: "/video.mp4",
				},
			]),
		).toEqual({
			format: "video",
			ending: "",
			download_url: "/video.mp4",
		});
	});
});
