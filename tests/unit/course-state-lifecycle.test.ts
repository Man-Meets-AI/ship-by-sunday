import { afterEach, describe, expect, it, vi } from "vitest";

import {
	completeLesson,
	getLessonState,
	getMissionState,
	getResumeDestination,
	markLessonViewed,
	saveLessonDraft,
} from "@/convex/course";
import { COURSE_SLUG } from "@/features/course/lesson/model";

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
				if (table === "productAccessGrants") {
					return {
						withIndex: vi.fn(() => ({
							unique: vi.fn().mockResolvedValue({
								_id: "product_access_1",
								_creationTime: 1,
								clerkUserId,
								status: "granted",
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

type CourseCtx = ReturnType<typeof createCourseCtx>;

const getMissionStateHandler = getMissionState as unknown as {
	_handler: (ctx: CourseCtx) => Promise<{
		progressCount: number;
		blocks: Array<{ lessons: Array<{ id: string }> }>;
	}>;
};

const getResumeDestinationHandler = getResumeDestination as unknown as {
	_handler: (ctx: CourseCtx) => Promise<{
		destination: string;
		lessonId: string | null;
	}>;
};

const completeLessonHandler = completeLesson as unknown as {
	_handler: (
		ctx: CourseCtx,
		args: { lessonId: string; fieldValues: Record<string, unknown> },
	) => Promise<{ completedAt: number; nextLessonId: string | null }>;
};

const saveLessonDraftHandler = saveLessonDraft as unknown as {
	_handler: (
		ctx: CourseCtx,
		args: { lessonId: string; fieldValues: Record<string, unknown> },
	) => Promise<{ savedAt: number }>;
};

const markLessonViewedHandler = markLessonViewed as unknown as {
	_handler: (
		ctx: CourseCtx,
		args: { lessonId: string },
	) => Promise<{ viewedAt: number; created: boolean }>;
};

const getLessonStateHandler = getLessonState as unknown as {
	_handler: (
		ctx: CourseCtx,
		args: { lessonId: string },
	) => Promise<{ accessStatus: string }>;
};

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

		const mission = await getMissionStateHandler._handler(ctx);

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

		const resume = await getResumeDestinationHandler._handler(ctx);

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
				createLessonState("1.1", {
					blockId: "CEO",
					artifactKey: "weekend_shipping_goal",
					artifactType: "brief",
					status: "completed",
				}),
				createLessonState("1.2", {
					blockId: "CEO",
					artifactKey: "sprint_setup_state",
					artifactType: "checklist",
					status: "completed",
				}),
				createLessonState("1.3", {
					blockId: "CEO",
					artifactKey: "candidate_problems",
					artifactType: "mixed",
					status: "completed",
				}),
				createLessonState("1.4", {
					blockId: "CEO",
					artifactKey: "user_statement",
					artifactType: "mixed",
					status: "completed",
				}),
			],
		});
		const fixedNow = 1_700_000_000_100;

		vi.spyOn(Date, "now").mockReturnValue(fixedNow);

		const result = await completeLessonHandler._handler(ctx, {
			lessonId: "1.5",
			fieldValues: {
				messaging_person: "Operators",
				messaging_problem: "Action items get lost after meetings.",
				messaging_what_it_does:
					"Turn notes into a clear recap they can send fast.",
				messaging_benefit: "Fewer dropped follow-ups and less re-work.",
				outcome_statement_body:
					"Operators leave each meeting with a clear action list they can send within minutes.",
				__fieldShapeVersion: 2,
			},
		});

		expect(result).toEqual({
			completedAt: fixedNow,
			nextLessonId: "1.6",
		});
		expect(insert).toHaveBeenCalledWith(
			"lessonStates",
			expect.objectContaining({
				lessonId: "1.5",
				artifactKey: "outcome_statement",
				status: "completed",
				completedAt: fixedNow,
			}),
		);
	});

	it("returns locked for the first Build lesson until Design is completed", async () => {
		const ctx = createCourseCtx();

		const lessonState = await getLessonStateHandler._handler(ctx, {
			lessonId: "3.0",
		});

		expect(lessonState).toEqual({
			accessStatus: "locked",
		});
	});

	it("throws the structured incomplete-lesson error when Start Here fields are missing", async () => {
		const ctx = createCourseCtx();

		await expect(
			completeLessonHandler._handler(ctx, {
				lessonId: "1.1",
				fieldValues: {},
			}),
		).rejects.toMatchObject({
			data: expect.objectContaining({
				code: "INCOMPLETE_LESSON",
				message: "Finish the required work before continuing.",
			}),
		});
	});

	it("creates a draft state for an unlocked lesson without an existing record", async () => {
		const insert = vi.fn().mockResolvedValue("draft_lesson_state");
		const ctx = createCourseCtx({
			insert,
		});
		const fixedNow = 1_700_000_000_200;

		vi.spyOn(Date, "now").mockReturnValue(fixedNow);

		const result = await saveLessonDraftHandler._handler(ctx, {
			lessonId: "1.1",
			fieldValues: {},
		});

		expect(result).toEqual({
			savedAt: fixedNow,
		});
		expect(insert).toHaveBeenCalledWith(
			"lessonStates",
			expect.objectContaining({
				clerkUserId,
				courseSlug: COURSE_SLUG,
				lessonId: "1.1",
				status: "in_progress",
				fieldValues: expect.objectContaining({
					__fieldShapeVersion: 1,
				}),
				startedAt: fixedNow,
				updatedAt: fixedNow,
				lastViewedAt: fixedNow,
			}),
		);
	});

	it("marks an existing lesson as viewed without duplicating its state", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const ctx = createCourseCtx({
			lessonStates: [
				createLessonState("1.1", {
					blockId: "CEO",
					artifactKey: "weekend_shipping_goal",
					artifactType: "brief",
					status: "in_progress",
				}),
			],
			patch,
		});
		const fixedNow = 1_700_000_000_300;

		vi.spyOn(Date, "now").mockReturnValue(fixedNow);

		const result = await markLessonViewedHandler._handler(ctx, {
			lessonId: "1.1",
		});

		expect(result).toEqual({
			viewedAt: fixedNow,
			created: false,
		});
		expect(patch).toHaveBeenCalledWith(
			"lesson_state_1.1_in_progress",
			expect.objectContaining({
				lastViewedAt: fixedNow,
				updatedAt: 20,
			}),
		);
	});
});
