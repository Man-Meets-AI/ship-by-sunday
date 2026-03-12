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
			"Pick the problem to carry forward",
		);
		expect(userLesson?.workbenchSections?.[1]?.instruction).toContain(
			"reach them this week",
		);
	});

	it("keeps stage-unlock wrap-up lessons declarative and pointed at a real next step", () => {
		const ceoWrapUpLesson = getLessonById("1.7");
		const designWrapUpLesson = getLessonById("2.7");

		expect(ceoWrapUpLesson).toBeTruthy();
		expect(designWrapUpLesson).toBeTruthy();
		expect(ceoWrapUpLesson?.workbench).toBe("brief_assembler");
		expect(designWrapUpLesson?.workbench).toBe("brief_assembler");
		expect(ceoWrapUpLesson?.briefAssembler?.variant).toBe("stage_unlock");
		expect(designWrapUpLesson?.briefAssembler?.variant).toBe("stage_unlock");
		expect(ceoWrapUpLesson?.briefAssembler).toMatchObject({
			preset: "ceo",
			heroEyebrow: "CEO block complete",
			heroTitle: "Design unlocked",
			nextStepLabel: "DESIGN 2.1 — Find References First",
			completionCtaLabel: "Unlock Design",
		});
		expect(designWrapUpLesson?.briefAssembler).toMatchObject({
			preset: "design",
			heroEyebrow: "Design block complete",
			heroTitle: "Build unlocked",
			nextStepLabel: "BUILD 3.1 — Generate the Build Prompt",
			completionCtaLabel: "Unlock Build",
		});
		expect(
			ceoWrapUpLesson?.briefAssembler?.skills?.length,
		).toBeGreaterThanOrEqual(4);
		expect(
			designWrapUpLesson?.briefAssembler?.skills?.length,
		).toBeGreaterThanOrEqual(5);
		expect(
			(ceoWrapUpLesson?.pinnedArtifacts ?? []).length,
		).toBeGreaterThanOrEqual(4);
		expect(
			(designWrapUpLesson?.pinnedArtifacts ?? []).length,
		).toBeGreaterThanOrEqual(5);
	});

	it("keeps the Build block rewired around a kickoff prompt and local handoff", () => {
		const kickoffLesson = getLessonById("3.1");
		const starterLesson = getLessonById("3.2");
		const firstScreenLesson = getLessonById("3.3");
		const handoffLesson = getLessonById("3.6");

		expect(kickoffLesson).toBeTruthy();
		expect(starterLesson).toBeTruthy();
		expect(firstScreenLesson).toBeTruthy();
		expect(handoffLesson).toBeTruthy();

		expect(kickoffLesson).toMatchObject({
			title: "Generate the Build Prompt",
			workbench: "build_kickoff",
			fieldShapeVersion: 2,
		});
		expect(kickoffLesson?.workbenchFields?.map((field) => field.id)).toEqual([
			"build_path",
			"first_slice",
			"definition_of_done",
		]);
		expect(starterLesson?.title).toBe("Get the Starter Running");
		expect(starterLesson?.shell).toBe("watch");
		expect(starterLesson?.workbenchFields ?? []).toEqual([]);
		expect(firstScreenLesson?.title).toBe("Build the First Screen");
		expect(handoffLesson?.artifact.label).toBe("Local Build Handoff");
	});

	it("keeps candidate-problem handoff contracts explicit and internally valid", () => {
		for (const lesson of lessonRegistry) {
			if (lesson.handoff?.mode !== "select_candidate_problem") {
				continue;
			}

			const sourceLesson = lessonRegistry.find(
				(candidate) =>
					candidate.artifact.key === lesson.handoff?.sourceArtifactKey,
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
