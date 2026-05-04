import { beforeEach, describe, expect, it, vi } from "vitest";

const loadViewerCourseStateMock = vi.fn();
const getCodebaseWorkflowStateByClerkUserIdMock = vi.fn();

vi.mock("@/convex/course/shared", () => ({
	loadViewerCourseState: loadViewerCourseStateMock,
}));

vi.mock("@/convex/codebase/workflowState", () => ({
	getCodebaseWorkflowStateByClerkUserId:
		getCodebaseWorkflowStateByClerkUserIdMock,
}));

describe("getBonusRouteStateHandler", () => {
	beforeEach(() => {
		loadViewerCourseStateMock.mockReset();
		getCodebaseWorkflowStateByClerkUserIdMock.mockReset();
		vi.resetModules();
	});

	it("ignores lesson-state history that predates the execute unlock", async () => {
		loadViewerCourseStateMock.mockResolvedValue({
			clerkUserId: "user_123",
			lessonStates: [
				{
					lessonKey: "start-with-the-problem",
					lastViewedAt: 100,
					startedAt: 100,
					updatedAt: 100,
				},
			],
		});
		getCodebaseWorkflowStateByClerkUserIdMock.mockResolvedValue({
			executeShipUnlockedAt: 200,
		});

		const { getBonusRouteStateHandler } =
			await import("@/convex/course/bonusRoute");

		await expect(getBonusRouteStateHandler({} as never)).resolves.toEqual({
			hasStartedBonusLesson: false,
		});
	});

	it("marks the bonus as started once a lesson view lands after unlock", async () => {
		loadViewerCourseStateMock.mockResolvedValue({
			clerkUserId: "user_123",
			lessonStates: [
				{
					lessonKey: "iterate-the-product-with-ai",
					lastViewedAt: 250,
					startedAt: 250,
					updatedAt: 250,
				},
			],
		});
		getCodebaseWorkflowStateByClerkUserIdMock.mockResolvedValue({
			executeShipUnlockedAt: 200,
		});

		const { getBonusRouteStateHandler } =
			await import("@/convex/course/bonusRoute");

		await expect(getBonusRouteStateHandler({} as never)).resolves.toEqual({
			hasStartedBonusLesson: true,
		});
	});

	it("ignores unknown lesson-state rows even if their timestamps are after unlock", async () => {
		loadViewerCourseStateMock.mockResolvedValue({
			clerkUserId: "user_123",
			lessonStates: [
				{
					lessonKey: "legacy-dead-lesson",
					lastViewedAt: 250,
					startedAt: 250,
					updatedAt: 250,
				},
			],
		});
		getCodebaseWorkflowStateByClerkUserIdMock.mockResolvedValue({
			executeShipUnlockedAt: 200,
		});

		const { getBonusRouteStateHandler } =
			await import("@/convex/course/bonusRoute");

		await expect(getBonusRouteStateHandler({} as never)).resolves.toEqual({
			hasStartedBonusLesson: false,
		});
	});
});
