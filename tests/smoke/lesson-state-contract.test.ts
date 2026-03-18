import fs from "node:fs";
import path from "node:path";

function readSource(relativePath: string) {
	return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("lesson state contract", () => {
	it("keeps the lesson route free of duplicated lesson content props", () => {
		const source = readSource("app/lesson/[lessonId]/page.tsx");

		expect(source).toContain("<LessonPage");
		expect(source).not.toContain("lessonContent={");
	});

	it("resolves static lesson definitions locally in the lesson page", () => {
		const source = readSource(
			"features/course/lesson/components/lesson-page.tsx",
		);

		expect(source).toContain("const lesson = getLesson(lessonId);");
		expect(source).toContain("const lessonContent = lesson.content;");
		expect(source).not.toContain("lessonState.lesson");
		expect(source).toContain("{lesson.id} {lesson.shortTitle}");
		expect(source).toContain(
			'{lesson.prevLessonId ?? "the previous unlocked lesson"} first.',
		);
	});

	it("keeps Convex lesson state payloads limited to dynamic data", () => {
		const source = readSource("convex/course/lessonState.ts");
		const getLessonStateBlock = source.slice(
			source.indexOf("export async function getLessonStateHandler("),
			source.indexOf("export const saveLessonDraftArgs ="),
		);

		expect(getLessonStateBlock).toContain('accessStatus: "locked"');
		expect(getLessonStateBlock).toContain(
			"fieldValues: await hydrateUploadUrls(",
		);
		expect(getLessonStateBlock).toContain("status: lessonStateIsCompatible");
		expect(getLessonStateBlock).toContain("pinnedArtifacts,");
		expect(getLessonStateBlock).not.toContain("requiredLessonId:");
		expect(getLessonStateBlock).not.toContain("shortTitle:");
		expect(getLessonStateBlock).not.toMatch(/\blesson\s*:/);
	});

	it("keeps convex/course.ts as the stable API entrypoint after the split", () => {
		const source = readSource("convex/course.ts");

		expect(source).toContain('from "./course/lessonState"');
		expect(source).toContain('from "./course/mission"');
		expect(source).toContain('from "./course/artifacts"');
		expect(source).toContain("export const getLessonState = query({");
		expect(source).toContain("handler: getLessonStateHandler,");
	});
});
