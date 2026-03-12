import {
	COURSE_SLUG,
	FIELD_SHAPE_VERSION_FIELD_ID,
	getLessonById,
} from "@/lib/course";
import { getLessonState } from "@/convex/course";
import {
	getCompletionIssues,
	prepareFieldValuesForPersistence,
} from "@/lib/course/registry";

const clerkUserId = "user_test_sketch_upload";

function createCompletedLessonState(
	lessonId: string,
	fieldValues: Record<string, unknown> = {},
) {
	const lesson = getLessonById(lessonId);
	if (!lesson) {
		throw new Error(`Lesson ${lessonId} must exist for sketch upload tests.`);
	}

	return {
		_id: `lesson_state_${lessonId}`,
		_creationTime: 1,
		clerkUserId,
		courseSlug: COURSE_SLUG,
		lessonId: lesson.id,
		blockId: lesson.block,
		status: "completed" as const,
		artifactKey: lesson.artifact.key,
		artifactType: lesson.artifact.type,
		fieldValues,
		startedAt: 10,
		updatedAt: 20,
		lastViewedAt: 30,
		completedAt: 40,
	};
}

function createCourseCtx({
	lessonStates = [],
}: { lessonStates?: Array<Record<string, unknown>> } = {}) {
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
									"Unexpected lessonStates unique query during sketch upload test.",
								);
							}),
						})),
					};
				}

				throw new Error(`Unexpected table query: ${table}`);
			}),
		},
		storage: {
			getUrl: vi.fn().mockResolvedValue("https://example.com/upload"),
		},
	};
}

describe("sketch upload course state", () => {
	it("strips preview-only data from multi-image sketch uploads before persistence", () => {
		const lesson = getLessonById("2.2");
		expect(lesson).toBeTruthy();

		expect(
			prepareFieldValuesForPersistence(lesson!, {
				sketch_upload: [
					{
						kind: "upload",
						status: "stored",
						fileName: "screen-1.jpg",
						storageId: "sketch-1",
						previewUrl: "blob:http://localhost/sketch-1",
					},
					{
						kind: "upload",
						status: "stored",
						fileName: "screen-2.jpg",
						storageId: "sketch-2",
						url: "https://example.com/sketch-2.jpg",
						previewUrl: "blob:http://localhost/sketch-2",
					},
				],
			}),
		).toEqual({
			[FIELD_SHAPE_VERSION_FIELD_ID]: 1,
			sketch_upload: [
				{
					kind: "upload",
					status: "stored",
					fileName: "screen-1.jpg",
					mimeType: undefined,
					size: undefined,
					storageId: "sketch-1",
				},
				{
					kind: "upload",
					status: "stored",
					fileName: "screen-2.jpg",
					mimeType: undefined,
					size: undefined,
					storageId: "sketch-2",
				},
			],
		});
	});

	it("treats one stored sketch image as enough to complete lesson 2.2", () => {
		const lesson = getLessonById("2.2");
		expect(lesson).toBeTruthy();

		const issues = getCompletionIssues(lesson!, {
			sketch_upload: [
				{
					kind: "upload",
					status: "stored",
					fileName: "screen-1.jpg",
					storageId: "sketch-1",
				},
			],
		});

		expect(issues).toEqual([]);
	});

	it("hydrates stored sketch upload arrays with signed urls on read", async () => {
		const ctx = createCourseCtx({
			lessonStates: [
				createCompletedLessonState("1.7"),
				createCompletedLessonState("2.1"),
				createCompletedLessonState("2.2", {
					sketch_upload: [
						{
							kind: "upload",
							status: "stored",
							fileName: "screen-1.jpg",
							storageId: "sketch-1",
						},
						{
							kind: "upload",
							status: "stored",
							fileName: "screen-2.jpg",
							storageId: "sketch-2",
						},
					],
				}),
			],
		});

		const lessonState = await (getLessonState as any)._handler(ctx, {
			lessonId: "2.2",
		});

		expect(lessonState).toMatchObject({
			accessStatus: "unlocked",
			status: "completed",
			fieldValues: {
				sketch_upload: [
					expect.objectContaining({
						fileName: "screen-1.jpg",
						storageId: "sketch-1",
						url: "https://example.com/upload",
					}),
					expect.objectContaining({
						fileName: "screen-2.jpg",
						storageId: "sketch-2",
						url: "https://example.com/upload",
					}),
				],
			},
		});
	});
});
