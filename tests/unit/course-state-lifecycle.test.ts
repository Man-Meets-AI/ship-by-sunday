import {
	COURSE_SLUG,
	FIELD_SHAPE_VERSION_FIELD_ID,
	getLessonById,
} from "@/lib/course";
import {
	getLessonState,
	getMissionState,
	listArtifacts,
	saveLessonDraft,
} from "@/convex/course";

const clerkUserId = "user_test_course_state";

function createStaleCompletedLessonState() {
	const lesson = getLessonById("1.1");
	if (!lesson) {
		throw new Error("Lesson 1.1 must exist for course-state lifecycle tests.");
	}

	return {
		_id: "lesson_state_1",
		_creationTime: 1,
		clerkUserId,
		courseSlug: COURSE_SLUG,
		lessonId: lesson.id,
		blockId: lesson.block,
		status: "completed" as const,
		artifactKey: lesson.artifact.key,
		artifactType: lesson.artifact.type,
		fieldValues: {
			problem_1:
				"Startup operators lose action items after meetings and waste time rebuilding them.",
		},
		startedAt: 10,
		updatedAt: 20,
		lastViewedAt: 30,
		completedAt: 40,
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

	it("treats incompatible completed rows as available instead of completed in mission state", async () => {
		const staleState = createStaleCompletedLessonState();
		const ctx = createCourseCtx({ lessonStates: [staleState] });

		const mission = await (getMissionState as any)._handler(ctx);
		const missionLesson = mission.blocks
			.flatMap(
				(block: { lessons: Array<{ id: string; status: string }> }) =>
					block.lessons,
			)
			.find((lesson: { id: string }) => lesson.id === "1.1");

		expect(mission.progressCount).toBe(0);
		expect(missionLesson?.status).toBe("available");
	});

	it("reopens an incompatible completed lesson as unlocked with a clean draft state", async () => {
		const staleState = createStaleCompletedLessonState();
		const ctx = createCourseCtx({ lessonStates: [staleState] });

		const lessonState = await (getLessonState as any)._handler(ctx, {
			lessonId: "1.1",
		});

		expect(lessonState).toMatchObject({
			accessStatus: "unlocked",
			status: "not_started",
			fieldValues: {},
			pinnedArtifacts: [],
		});
	});

	it("omits incompatible completed rows from the artifacts list", async () => {
		const staleState = createStaleCompletedLessonState();
		const ctx = createCourseCtx({ lessonStates: [staleState] });

		const artifacts = await (listArtifacts as any)._handler(ctx);

		expect(artifacts).toEqual([]);
	});

	it("allows draft resaves against an incompatible completed row without re-querying the lesson row", async () => {
		const staleState = createStaleCompletedLessonState();
		const patch = vi.fn().mockResolvedValue(undefined);
		const insert = vi.fn().mockResolvedValue("new_lesson_state");
		const ctx = createCourseCtx({
			lessonStates: [staleState],
			patch,
			insert,
		});
		const fixedNow = 1_700_000_000_000;

		vi.spyOn(Date, "now").mockReturnValue(fixedNow);

		const result = await (saveLessonDraft as any)._handler(ctx, {
			lessonId: "1.1",
			fieldValues: {
				problem_1_who: "Startup operators",
				problem_1_pain:
					"They lose action items after meetings and waste time rebuilding them.",
			},
		});

		expect(result).toEqual({ savedAt: fixedNow });
		expect(insert).not.toHaveBeenCalled();
		expect(patch).toHaveBeenCalledWith(
			staleState._id,
			expect.objectContaining({
				status: "completed",
				updatedAt: fixedNow,
				lastViewedAt: fixedNow,
				fieldValues: expect.objectContaining({
					problem_1_who: "Startup operators",
					problem_1_pain:
						"They lose action items after meetings and waste time rebuilding them.",
					[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
				}),
			}),
		);
	});
});
