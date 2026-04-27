import {
	getSkillRailNavigation,
	getSkillRailShortcutDirection,
	isEditableShortcutTarget,
	isInteractiveShortcutTarget,
	type SkillRailLesson,
	shouldHandleSkillRailShortcut,
} from "@/lib/course/shared/utils/skill-rail-navigation";

function createRailLesson(
	lessonKey: string,
	displayLabel: string,
	shortTitle: string,
	status: SkillRailLesson["status"],
): SkillRailLesson {
	return {
		lessonKey,
		displayLabel,
		shortTitle,
		status,
	};
}

const sampleLessons: SkillRailLesson[] = [
	createRailLesson("welcome-to-ship-by-sunday", "1.1", "Problem", "completed"),
	createRailLesson("how-the-sprint-works", "1.2", "User", "in_progress"),
	createRailLesson("start-with-the-problem", "1.3", "Outcome", "locked"),
];

const crossStageLessons: SkillRailLesson[] = [
	createRailLesson(
		"light-research-not-a-thesis",
		"1.6",
		"Research",
		"completed",
	),
	createRailLesson("ceo-wrap-up", "1.8", "Wrap", "completed"),
	createRailLesson("ceo-skills", "1.9", "Skills", "completed"),
	createRailLesson("design-references", "2.0", "Refs", "completed"),
	createRailLesson("map-the-core-flow", "2.1", "Scope", "available"),
	createRailLesson("find-references-first", "2.2", "Find", "completed"),
];

function asEventTarget<T extends object>(value: T): EventTarget {
	return value as unknown as EventTarget;
}

describe("skill rail navigation", () => {
	it("keeps completed previous lessons navigable and blocks locked next lessons", () => {
		const navigation = getSkillRailNavigation(
			sampleLessons,
			"how-the-sprint-works",
		);

		expect(navigation.previousTarget).toMatchObject({
			lessonKey: "welcome-to-ship-by-sunday",
			displayLabel: "1.1",
			href: "/lesson/welcome-to-ship-by-sunday",
			status: "completed",
		});
		expect(navigation.nextTarget).toBeNull();
	});

	it("disables navigation at the start and end of a stage", () => {
		const first = getSkillRailNavigation(
			sampleLessons,
			"welcome-to-ship-by-sunday",
		);
		const last = getSkillRailNavigation(
			[sampleLessons[0], sampleLessons[1]],
			"how-the-sprint-works",
		);

		expect(first.previousTarget).toBeNull();
		expect(last.nextTarget).toBeNull();
	});

	it("crosses forward to the next lesson when the Design entry is unlocked", () => {
		const navigation = getSkillRailNavigation(
			crossStageLessons,
			"design-references",
		);

		expect(navigation.nextTarget).toMatchObject({
			lessonKey: "map-the-core-flow",
			displayLabel: "2.1",
			href: "/lesson/map-the-core-flow",
			status: "available",
		});
	});

	it("crosses backward to the previous stage's last lesson symmetrically", () => {
		const navigation = getSkillRailNavigation(
			crossStageLessons,
			"map-the-core-flow",
		);

		expect(navigation.previousTarget).toMatchObject({
			lessonKey: "design-references",
			displayLabel: "2.0",
			href: "/lesson/design-references",
			status: "completed",
		});
	});

	it("still blocks cross-stage navigation when the adjacent boundary lesson is locked", () => {
		const navigation = getSkillRailNavigation(
			[
				{
					lessonKey: "design-references",
					displayLabel: "2.0",
					shortTitle: "Refs",
					status: "completed",
				},
				{
					lessonKey: "map-the-core-flow",
					displayLabel: "2.1",
					shortTitle: "Scope",
					status: "locked",
				},
			],
			"design-references",
		);

		expect(navigation.nextTarget).toBeNull();
	});
});

describe("skill rail shortcuts", () => {
	it("maps arrow keys to previous and next while keeping Q/E as fallback aliases", () => {
		expect(getSkillRailShortcutDirection("ArrowLeft")).toBe("previous");
		expect(getSkillRailShortcutDirection("arrowright")).toBe("next");
		expect(getSkillRailShortcutDirection("q")).toBe("previous");
		expect(getSkillRailShortcutDirection("Q")).toBe("previous");
		expect(getSkillRailShortcutDirection("e")).toBe("next");
		expect(getSkillRailShortcutDirection("Escape")).toBeNull();
	});

	it("ignores shortcuts in editable targets", () => {
		expect(
			isEditableShortcutTarget({
				tagName: "input",
			} as unknown as EventTarget),
		).toBe(true);
		expect(
			isEditableShortcutTarget({
				tagName: "div",
				isContentEditable: true,
			} as unknown as EventTarget),
		).toBe(true);
		expect(
			isEditableShortcutTarget({
				tagName: "div",
				getAttribute: (name: string) =>
					name === "contenteditable" ? "plaintext-only" : null,
			} as unknown as EventTarget),
		).toBe(true);
		expect(
			isEditableShortcutTarget({
				tagName: "button",
			} as unknown as EventTarget),
		).toBe(false);
	});

	it("blocks arrow shortcuts on interactive media and controls", () => {
		expect(
			isInteractiveShortcutTarget({
				tagName: "video",
			} as unknown as EventTarget),
		).toBe(true);
		expect(
			isInteractiveShortcutTarget({
				tagName: "button",
			} as unknown as EventTarget),
		).toBe(true);
		expect(
			isInteractiveShortcutTarget({
				tagName: "div",
				getAttribute: (name: string) => (name === "role" ? "button" : null),
			} as unknown as EventTarget),
		).toBe(true);
		expect(
			isInteractiveShortcutTarget({
				tagName: "div",
			} as unknown as EventTarget),
		).toBe(false);
	});

	it("only handles unmodified navigation presses outside editable or interactive targets", () => {
		expect(
			shouldHandleSkillRailShortcut({
				key: "ArrowLeft",
				target: asEventTarget({
					tagName: "body",
				}),
			}),
		).toBe(true);
		expect(
			shouldHandleSkillRailShortcut({
				key: "ArrowRight",
				target: asEventTarget({
					tagName: "body",
				}),
				metaKey: true,
			}),
		).toBe(false);
		expect(
			shouldHandleSkillRailShortcut({
				key: "q",
				target: asEventTarget({
					tagName: "textarea",
				}),
			}),
		).toBe(false);
		expect(
			shouldHandleSkillRailShortcut({
				key: "ArrowRight",
				target: asEventTarget({
					tagName: "video",
				}),
			}),
		).toBe(false);
		expect(
			shouldHandleSkillRailShortcut({
				key: "w",
				target: asEventTarget({
					tagName: "body",
				}),
			}),
		).toBe(false);
	});
});
