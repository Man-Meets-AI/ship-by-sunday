import fs from "node:fs";
import path from "node:path";

import { productConfig } from "@/config/product";
import {
	getLessonById,
	getStudentFacingLessons,
	lessonRegistry,
} from "@/features/course/lesson/model";
import { legacyLessonRedirects } from "@/features/course/lesson/utils/legacy-routes";
import { homePageContent } from "@/features/marketing/content/home";

describe("lesson content contract", () => {
	it("keeps unique slugs and embedded content on every lesson", () => {
		const seenSlugs = new Set<string>();

		for (const lesson of lessonRegistry) {
			expect(lesson.slug).toBeTruthy();
			expect(lesson.content).toBeTruthy();
			expect(seenSlugs.has(lesson.slug)).toBe(false);
			seenSlugs.add(lesson.slug);
		}
	});

	it("keeps product config and public marketing content aligned", () => {
		expect(productConfig.name).toBeTruthy();
		expect(productConfig.courseSlug).toMatch(/^[a-z0-9-]+$/);
		expect(homePageContent.hero.body).toContain(productConfig.name);
		expect(homePageContent.pricingSection.priceDisplay).toBe(
			productConfig.priceDisplay,
		);
		expect(homePageContent.footerWordmark).toBe(productConfig.name);
	});

	it("keeps redirects pointed at supported destinations in the new sequence", () => {
		for (const [lessonId, destination] of Object.entries(
			legacyLessonRedirects,
		)) {
			expect(lessonId).toMatch(/^\d+\.\d+$/);

			if (destination === "/mission") {
				expect(lessonId).toBe("0.0");
				continue;
			}

			expect(destination.startsWith("/lesson/")).toBe(true);
			expect(getLessonById(destination.replace("/lesson/", ""))).toBeTruthy();
		}
	});

	it("keeps the Bunny-first kickoff and bridge lessons live in the registry", () => {
		expect(getLessonById("1.0")?.title).toBe("CEO Kickoff");
		expect(getLessonById("2.0")?.title).toBe("Design References");
		expect(getLessonById("3.0")?.title).toBe("Build Kickoff");
		expect(getLessonById("4.0")?.title).toBe("Product Review");
		expect(getLessonById("1.8")).toBeNull();
		expect(getLessonById("2.3")).toBeNull();
		expect(getLessonById("4.1")).toBeNull();
	});

	it("keeps the live curriculum watch-first after Start Here", () => {
		const studentLessons = getStudentFacingLessons();
		const watchLessons = studentLessons.filter(
			(lesson) => !lesson.id.startsWith("0."),
		);

		expect(watchLessons.every((lesson) => lesson.shell === "watch")).toBe(true);
		expect(
			watchLessons.every((lesson) => lesson.workbench === "external_workspace"),
		).toBe(true);
	});

	it("keeps the watch-first lesson sources centralized in the new factory", () => {
		const source = fs.readFileSync(
			path.join(
				process.cwd(),
				"features/course/lesson/model/video-lesson-factory.ts",
			),
			"utf8",
		);

		expect(source).toContain("createVideoLesson");
		expect(source).toContain('shell: "watch"');
		expect(source).toContain('workbench: "external_workspace"');
		expect(source).toContain("requireReadyVideoForCompletion: true");
	});
});
