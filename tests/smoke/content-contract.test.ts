import fs from "node:fs";
import path from "node:path";

import { getLessonById, lessonRegistry } from "@/lib/course";

function walkSourceFiles(root: string): string[] {
	return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(root, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === "node_modules" || entry.name === ".next") {
				return [];
			}
			return walkSourceFiles(fullPath);
		}

		if (!/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
			return [];
		}

		return [fullPath];
	});
}

describe("lesson content contract", () => {
	it("keeps unique slugs and embedded content on every lesson", () => {
		const seenSlugs = new Set<string>();

		for (const lesson of lessonRegistry) {
			expect(lesson.slug, `missing slug for ${lesson.id}`).toBeTruthy();
			expect(
				lesson.content,
				`missing embedded content for ${lesson.id}`,
			).toBeTruthy();
			expect(
				seenSlugs.has(lesson.slug),
				`duplicate slug ${lesson.slug} on ${lesson.id}`,
			).toBe(false);
			seenSlugs.add(lesson.slug);
		}
	});

	it("keeps learner guidance in the lesson definitions instead of content overrides", () => {
		const welcomeLesson = getLessonById("0.1");
		const problemLesson = getLessonById("1.1");
		const userLesson = getLessonById("1.2");

		expect(welcomeLesson?.workbenchSections?.[0]?.instruction).toContain(
			"smallest believable thing",
		);
		expect(problemLesson?.content.coach.examples?.[0]?.title).toBe(
			"Weak idea vs painful problem",
		);
		expect(userLesson?.content.intro).toContain(
			"Pick one of the three problems you just wrote",
		);
		expect(userLesson?.workbenchSections?.[1]?.instruction).toContain(
			"reach them this week",
		);
	});

	it("keeps candidate-problem handoff contracts explicit and internally valid", () => {
		for (const lesson of lessonRegistry) {
			if (lesson.handoff?.mode !== "select_candidate_problem") {
				continue;
			}

			const sourceLesson = lessonRegistry.find(
				(candidate) => candidate.artifact.key === lesson.handoff?.sourceArtifactKey,
			);
			expect(
				sourceLesson,
				`missing source lesson for ${lesson.id} handoff ${lesson.handoff.sourceArtifactKey}`,
			).toBeTruthy();

			const sourceFieldIds = new Set(
				(sourceLesson?.workbenchFields ?? []).map((field) => field.id),
			);

			for (const option of lesson.handoff.options) {
				expect(
					sourceFieldIds.has(option.ownerSourceFieldId),
					`${lesson.id} handoff owner field missing: ${option.ownerSourceFieldId}`,
				).toBe(true);
				expect(
					sourceFieldIds.has(option.statementSourceFieldId),
					`${lesson.id} handoff statement field missing: ${option.statementSourceFieldId}`,
				).toBe(true);
			}

			const persistedFieldIds = (lesson.handoff.persistedFields ?? []).map(
				(field) => field.targetFieldId,
			);
			expect(
				new Set(persistedFieldIds).size,
				`${lesson.id} handoff persisted fields must be unique`,
			).toBe(persistedFieldIds.length);
		}
	});

	it("removes center-workbench examples from lesson sections and fields", () => {
		for (const lesson of lessonRegistry) {
			for (const section of lesson.workbenchSections ?? []) {
				expect(
					Object.prototype.hasOwnProperty.call(section, "example"),
					`unexpected section example on ${lesson.id}:${section.id}`,
				).toBe(false);
				expect(
					Object.prototype.hasOwnProperty.call(section, "exampleLabel"),
					`unexpected section example label on ${lesson.id}:${section.id}`,
				).toBe(false);
			}

			for (const field of lesson.workbenchFields ?? []) {
				expect(
					Object.prototype.hasOwnProperty.call(field, "example"),
					`unexpected field example on ${lesson.id}:${field.id}`,
				).toBe(false);
				expect(
					Object.prototype.hasOwnProperty.call(field, "exampleLabel"),
					`unexpected field example label on ${lesson.id}:${field.id}`,
				).toBe(false);
			}
		}
	});

	it("keeps the source tree free of imports from the removed lesson-content stack", () => {
		const roots = ["app", "components", "convex", "lib"].map((segment) =>
			path.join(process.cwd(), segment),
		);
		const sourceFiles = roots.flatMap(walkSourceFiles);
		const bannedReferences = [
			"@/content" + "/lessons",
			"build-lesson-content-from-" + "blueprint.mjs",
			"content-" + "manifest",
		];

		for (const filePath of sourceFiles) {
			const source = fs.readFileSync(filePath, "utf8");
			for (const bannedReference of bannedReferences) {
				expect(
					source.includes(bannedReference),
					`${path.relative(process.cwd(), filePath)} still references ${bannedReference}`,
				).toBe(false);
			}
		}
	});
});
