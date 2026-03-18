import { COURSE_SLUG } from "@/features/course/lesson/model";
import {
	completeLesson,
	getLessonState,
	getMissionState,
	getResumeDestination,
} from "@/convex/course";

const clerkUserId = "user_test_course_state";

function createLessonState(
	lessonId: string,
	options: {
		blockId?: "CEO" | "DESIGN" | "BUILD" | "SHIP";
		artifactKey?: string;
		artifactType?: string;
		status?: "not_started" | "in_progress" | "completed";
		fieldValues?: Record<string, unknown>;
		lastViewedAt?: number;
		updatedAt?: number;
		startedAt?: number;
		completedAt?: number;
	} = {},
) {
	return {
		_id: `lesson_state_${lessonId}_${options.status ?? "not_started"}`,
		_creationTime: 1,
		clerkUserId,
		courseSlug: COURSE_SLUG,
		lessonId,
		blockId: options.blockId ?? "CEO",
		status: options.status ?? "not_started",
		artifactKey: options.artifactKey ?? `${lessonId}-artifact`,
		artifactType: options.artifactType ?? "video",
		fieldValues: options.fieldValues ?? {},
		startedAt: options.startedAt ?? 10,
		updatedAt: options.updatedAt ?? 20,
		lastViewedAt: options.lastViewedAt ?? 30,
		...(options.status === "completed"
			? { completedAt: options.completedAt ?? 40 }
			: {}),
	};
}

function createCourseCtx({
	lessonStates = [],
	patch = vi.fn().mockResolvedValue(undefined),
	insert = vi.fn().mockResolvedValue("new_lesson_state"),
}: {
	lessonStates?: Array<Record<string, unknown>>;
	patch?: ReturnType<typeof vi.fn>;
	insert?: ReturnType<typeof vi.fn>;
} = {}) {
	return {
		auth: {
			getUserIdentity: vi.fn().mockResolvedValue({ subject: clerkUserId }),
		},
		db: {
			query: vi.fn((table: string) => {
				if (table === "courseEntitlements") {
					return {
						withIndex: vi.fn(() => ({
							unique: vi.fn().mockResolvedValue({
								_id: "entitlement_1",
								_creationTime: 1,
								clerkUserId,
								courseSlug: COURSE_SLUG,
								status: "active",
								source: "manual",
								grantedAt: 1,
								updatedAt: 1,
							}),
						})),
					};
				}

				if (table === "lessonStates") {
					return {
						withIndex: vi.fn(() => ({
							collect: vi.fn().mockResolvedValue(lessonStates),
							unique: vi.fn(() => {
								throw new Error(
									"Unexpected lessonStates unique query during lifecycle test.",
								);
							}),
						})),
					};
				}

				throw new Error(`Unexpected table query: ${table}`);
			}),
			patch,
			insert,
		},
		storage: {
			getUrl: vi.fn().mockResolvedValue("https://example.com/upload"),
		},
	};
}

describe("course state lifecycle", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("ignores removed-lesson state when calculating mission progress", async () => {
		const ctx = createCourseCtx({
			lessonStates: [
				createLessonState("2.7", {
					blockId: "DESIGN",
					artifactKey: "legacy-design-wrap",
					status: "completed",
				}),
			],
		});

		const mission = await (getMissionState as any)._handler(ctx);

		expect(mission.progressCount).toBe(0);
		expect(
			mission.blocks.flatMap(
				(block: { lessons: Array<{ id: string }> }) => block.lessons,
			),
		).not.toContainEqual(expect.objectContaining({ id: "2.7" }));
	});

	it("resumes to mission when the only stored lesson is no longer in the curriculum", async () => {
		const ctx = createCourseCtx({
			lessonStates: [
				createLessonState("2.7", {
					blockId: "DESIGN",
					artifactKey: "legacy-design-wrap",
					status: "completed",
					lastViewedAt: 999,
				}),
			],
		});

		const resume = await (getResumeDestination as any)._handler(ctx);

		expect(resume).toEqual({
			destination: "/mission",
			lessonId: null,
		});
	});

	it("completes a Bunny-driven lesson and returns the next lesson id", async () => {
		const insert = vi.fn().mockResolvedValue("new_lesson_state");
		const ctx = createCourseCtx({
			insert,
			lessonStates: [
				createLessonState("0.1", {
					blockId: "CEO",
					artifactKey: "weekend_shipping_goal",
					artifactType: "text",
					status: "completed",
				}),
				createLessonState("0.2", {
					blockId: "CEO",
					artifactKey: "sprint_setup_state",
					artifactType: "checklist",
					status: "completed",
				}),
			],
		});
		const fixedNow = 1_700_000_000_100;

		vi.spyOn(Date, "now").mockReturnValue(fixedNow);

		const result = await (completeLesson as any)._handler(ctx, {
			lessonId: "1.0",
			fieldValues: {},
		});

		expect(result).toEqual({
			completedAt: fixedNow,
			nextLessonId: "1.1",
		});
		expect(insert).toHaveBeenCalledWith(
			"lessonStates",
			expect.objectContaining({
				lessonId: "1.0",
				status: "completed",
				completedAt: fixedNow,
			}),
		);
	});

	it("returns locked for the first Build lesson until Design is completed", async () => {
		const ctx = createCourseCtx();

		const lessonState = await (getLessonState as any)._handler(ctx, {
			lessonId: "3.0",
		});

		expect(lessonState).toEqual({
			accessStatus: "locked",
		});
	});

	it("throws the structured incomplete-lesson error when Start Here fields are missing", async () => {
		const ctx = createCourseCtx();

		await expect(
			(completeLesson as any)._handler(ctx, {
				lessonId: "0.1",
				fieldValues: {},
			}),
		).rejects.toMatchObject({
			data: expect.objectContaining({
				code: "INCOMPLETE_LESSON",
				message: "Finish the required work before continuing.",
			}),
		});
	});
});
