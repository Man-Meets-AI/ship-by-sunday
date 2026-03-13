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
		const buildWrapUpLesson = getLessonById("3.10");

		expect(ceoWrapUpLesson).toBeTruthy();
		expect(designWrapUpLesson).toBeTruthy();
		expect(buildWrapUpLesson).toBeTruthy();
		expect(ceoWrapUpLesson?.workbench).toBe("brief_assembler");
		expect(designWrapUpLesson?.workbench).toBe("brief_assembler");
		expect(buildWrapUpLesson?.workbench).toBe("brief_assembler");
		expect(ceoWrapUpLesson?.briefAssembler?.variant).toBe("stage_unlock");
		expect(designWrapUpLesson?.briefAssembler?.variant).toBe("stage_unlock");
		expect(buildWrapUpLesson?.briefAssembler?.variant).toBe("stage_unlock");
		expect(ceoWrapUpLesson?.briefAssembler).toMatchObject({
			preset: "ceo",
			heroEyebrow: "CEO block complete",
			heroTitle: "CEO brief ready to lock",
			nextStepLabel: "DESIGN 2.1 — Find References First",
			completionCtaLabel: "Unlock Design",
		});
		expect(designWrapUpLesson?.briefAssembler).toMatchObject({
			preset: "design",
			heroEyebrow: "Design block complete",
			heroTitle: "Build unlocked",
			nextStepLabel: "BUILD 3.1 — Lock Build Path and Scope",
			completionCtaLabel: "Unlock Build",
		});
		expect(buildWrapUpLesson?.briefAssembler).toMatchObject({
			preset: "build",
			leadVideo: true,
			heroEyebrow: "Build block complete",
			heroTitle: "Ship unlocked",
			nextStepLabel: "SHIP 4.1 — Ship the Core, Not the Fantasy",
			completionCtaLabel: "Unlock Ship",
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
		expect(
			(buildWrapUpLesson?.pinnedArtifacts ?? []).length,
		).toBeGreaterThanOrEqual(4);
	});

	it("keeps the Build block rewired into the 10-lesson production flow", () => {
		const kickoffLesson = getLessonById("3.1");
		const orientationLesson = getLessonById("3.2");
		const toolingLesson = getLessonById("3.3");
		const integrationLesson = getLessonById("3.4");
		const sandboxLesson = getLessonById("3.5");
		const planLesson = getLessonById("3.6");
		const firstSliceLesson = getLessonById("3.7");
		const coreUxLesson = getLessonById("3.8");
		const debugLesson = getLessonById("3.9");
		const handoffLesson = getLessonById("3.10");

		expect(kickoffLesson).toBeTruthy();
		expect(orientationLesson).toBeTruthy();
		expect(toolingLesson).toBeTruthy();
		expect(integrationLesson).toBeTruthy();
		expect(sandboxLesson).toBeTruthy();
		expect(planLesson).toBeTruthy();
		expect(firstSliceLesson).toBeTruthy();
		expect(coreUxLesson).toBeTruthy();
		expect(debugLesson).toBeTruthy();
		expect(handoffLesson).toBeTruthy();

		expect(kickoffLesson).toMatchObject({
			title: "Lock Build Path and Scope",
			workbench: "build_kickoff",
			fieldShapeVersion: 3,
		});
		expect(kickoffLesson?.workbenchFields?.map((field) => field.id)).toEqual([
			"build_path",
			"first_slice",
			"definition_of_done",
		]);
		expect(orientationLesson?.title).toBe("Map the Repo and Starter");
		expect(orientationLesson).toMatchObject({
			shell: "focus",
			availableLayoutModes: ["focus"],
			coachVideoPlacement: "workbench",
		});
		expect(
			orientationLesson?.workbenchFields?.map((field) => field.id),
		).toEqual([
			"repo_orientation_checklist",
			"startup_command",
			"repo_map_notes",
		]);
		expect(toolingLesson?.title).toBe("Install MCPs and Skills");
		expect(toolingLesson?.workbench).toBe("guided_form");
		expect(integrationLesson?.title).toBe("Wire DB, Auth, and Payments");
		expect(integrationLesson?.workbench).toBe("external_workspace");
		expect(sandboxLesson?.title).toBe("Switch to Sandbox and Boot Local");
		expect(sandboxLesson?.shell).toBe("watch");
		expect(planLesson?.title).toBe("Read and Execute AI Plans");
		expect(planLesson?.workbench).toBe("guided_form");
		expect(firstSliceLesson?.title).toBe("Implement the First Slice");
		expect(coreUxLesson?.shell).toBe("watch");
		expect(coreUxLesson?.workbenchFields ?? []).toEqual([]);
		expect(debugLesson?.shell).toBe("watch");
		expect(debugLesson?.workbenchFields ?? []).toEqual([]);
		expect(handoffLesson?.artifact.label).toBe("Local Build Handoff");
		expect(handoffLesson?.briefAssembler?.preset).toBe("build");
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
