import { getProductShellBlockNavigationTarget } from "@/features/course/shared/utils/product-shell-navigation";

describe("product shell block navigation", () => {
	it("prefers the current or next available lesson inside an unlocked block", () => {
		const target = getProductShellBlockNavigationTarget({
			id: "DESIGN",
			lessons: [
				{
					id: "2.1",
					status: "completed",
				},
				{
					id: "2.2",
					status: "in_progress",
				},
				{
					id: "2.3",
					status: "available",
				},
			],
		});

		expect(target).toMatchObject({
			blockId: "DESIGN",
			lessonId: "2.2",
			href: "/lesson/2.2",
			status: "in_progress",
		});
	});

	it("falls back to the first unlocked lesson for completed blocks", () => {
		const target = getProductShellBlockNavigationTarget({
			id: "CEO",
			lessons: [
				{
					id: "1.1",
					status: "completed",
				},
				{
					id: "1.2",
					status: "completed",
				},
			],
		});

		expect(target).toMatchObject({
			blockId: "CEO",
			lessonId: "1.1",
			href: "/lesson/1.1",
			status: "completed",
		});
	});

	it("returns null for fully locked blocks", () => {
		const target = getProductShellBlockNavigationTarget({
			id: "BUILD",
			lessons: [
				{
					id: "3.1",
					status: "locked",
				},
				{
					id: "3.2",
					status: "locked",
				},
			],
		});

		expect(target).toBeNull();
	});
});
