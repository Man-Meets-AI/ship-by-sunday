import {
	getSkillRailNavigation,
	getSkillRailShortcutDirection,
	isEditableShortcutTarget,
	shouldHandleSkillRailShortcut,
	type SkillRailLesson,
} from "@/components/skill-rail-navigation";

const sampleLessons: SkillRailLesson[] = [
	{
		id: "1.1",
		shortTitle: "Problem",
		status: "completed",
	},
	{
		id: "1.2",
		shortTitle: "User",
		status: "in_progress",
	},
	{
		id: "1.3",
		shortTitle: "Outcome",
		status: "locked",
	},
];

const crossStageLessons: SkillRailLesson[] = [
	{
		id: "1.6",
		shortTitle: "Scope",
		status: "completed",
	},
	{
		id: "1.7",
		shortTitle: "Brief",
		status: "completed",
	},
	{
		id: "2.1",
		shortTitle: "References",
		status: "available",
	},
	{
		id: "2.2",
		shortTitle: "Sketch",
		status: "completed",
	},
];

describe("skill rail navigation", () => {
	it("keeps completed previous lessons navigable and blocks locked next lessons", () => {
		const navigation = getSkillRailNavigation(sampleLessons, "1.2");

		expect(navigation.previousTarget).toMatchObject({
			id: "1.1",
			href: "/lesson/1.1",
			status: "completed",
		});
		expect(navigation.nextTarget).toBeNull();
	});

	it("disables navigation at the start and end of a stage", () => {
		const first = getSkillRailNavigation(sampleLessons, "1.1");
		const last = getSkillRailNavigation(
			[sampleLessons[0], sampleLessons[1]],
			"1.2",
		);

		expect(first.previousTarget).toBeNull();
		expect(last.nextTarget).toBeNull();
	});

	it("crosses forward to the next stage's first lesson when it is unlocked", () => {
		const navigation = getSkillRailNavigation(crossStageLessons, "1.7");

		expect(navigation.nextTarget).toMatchObject({
			id: "2.1",
			href: "/lesson/2.1",
			status: "available",
		});
	});

	it("crosses backward to the previous stage's last lesson symmetrically", () => {
		const navigation = getSkillRailNavigation(crossStageLessons, "2.1");

		expect(navigation.previousTarget).toMatchObject({
			id: "1.7",
			href: "/lesson/1.7",
			status: "completed",
		});
	});

	it("still blocks cross-stage navigation when the adjacent boundary lesson is locked", () => {
		const navigation = getSkillRailNavigation(
			[
				{
					id: "1.7",
					shortTitle: "Brief",
					status: "completed",
				},
				{
					id: "2.1",
					shortTitle: "References",
					status: "locked",
				},
			],
			"1.7",
		);

		expect(navigation.nextTarget).toBeNull();
	});
});

describe("skill rail shortcuts", () => {
	it("maps Q and E to previous and next", () => {
		expect(getSkillRailShortcutDirection("q")).toBe("previous");
		expect(getSkillRailShortcutDirection("Q")).toBe("previous");
		expect(getSkillRailShortcutDirection("e")).toBe("next");
		expect(getSkillRailShortcutDirection("Escape")).toBeNull();
	});

	it("ignores shortcuts in editable targets", () => {
		expect(
			isEditableShortcutTarget({
				tagName: "input",
			} as EventTarget),
		).toBe(true);
		expect(
			isEditableShortcutTarget({
				tagName: "div",
				isContentEditable: true,
			} as EventTarget),
		).toBe(true);
		expect(
			isEditableShortcutTarget({
				tagName: "div",
				getAttribute: (name: string) =>
					name === "contenteditable" ? "plaintext-only" : null,
			} as EventTarget),
		).toBe(true);
		expect(
			isEditableShortcutTarget({
				tagName: "button",
			} as EventTarget),
		).toBe(false);
	});

	it("only handles unmodified Q/E presses outside editable fields", () => {
		expect(
			shouldHandleSkillRailShortcut({
				key: "q",
				target: {
					tagName: "body",
				} as EventTarget,
			}),
		).toBe(true);
		expect(
			shouldHandleSkillRailShortcut({
				key: "e",
				target: {
					tagName: "body",
				} as EventTarget,
				metaKey: true,
			}),
		).toBe(false);
		expect(
			shouldHandleSkillRailShortcut({
				key: "q",
				target: {
					tagName: "textarea",
				} as EventTarget,
			}),
		).toBe(false);
		expect(
			shouldHandleSkillRailShortcut({
				key: "w",
				target: {
					tagName: "body",
				} as EventTarget,
			}),
		).toBe(false);
	});
});
