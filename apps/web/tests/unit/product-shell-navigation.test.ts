import { getAppShellBlockNavigationTarget } from "@/features/course/shared/utils/app-shell-navigation";

describe("product shell block navigation", () => {
	it("prefers the current or next available lesson inside an unlocked block", () => {
		const target = getAppShellBlockNavigationTarget({
			id: "DESIGN",
			lessons: [
				{
					lessonKey: "2.1",
					displayLabel: "2.1",
					status: "completed",
				},
				{
					lessonKey: "2.2",
					displayLabel: "2.2",
					status: "in_progress",
				},
				{
					lessonKey: "2.3",
					displayLabel: "2.3",
					status: "available",
				},
			],
		});

		expect(target).toMatchObject({
			blockId: "DESIGN",
			lessonKey: "2.2",
			href: "/lesson/find-references-first",
			status: "in_progress",
		});
	});

	it("falls back to the first unlocked lesson for completed blocks", () => {
		const target = getAppShellBlockNavigationTarget({
			id: "CEO",
			lessons: [
				{
					lessonKey: "1.1",
					displayLabel: "1.1",
					status: "completed",
				},
				{
					lessonKey: "1.2",
					displayLabel: "1.2",
					status: "completed",
				},
			],
		});

		expect(target).toMatchObject({
			blockId: "CEO",
			lessonKey: "1.1",
			href: "/lesson/welcome-to-ship-by-sunday",
			status: "completed",
		});
	});

	it("returns null for fully locked blocks", () => {
		const target = getAppShellBlockNavigationTarget({
			id: "BUILD",
			lessons: [
				{
					lessonKey: "3.1",
					displayLabel: "3.1",
					status: "locked",
				},
				{
					lessonKey: "3.2",
					displayLabel: "3.2",
					status: "locked",
				},
			],
		});

		expect(target).toBeNull();
	});
});
