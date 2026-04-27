import {
	recordStarterRepoProvisioningResultHandler,
	requestStarterRepoAccessHandler,
	resetStarterRepoAccessHandler,
} from "@/convex/course/starterRepoAccess";
import { COURSE_SLUG } from "@/lib/course/lesson/model";

const clerkUserId = "user_test_starter_repo";

function createStarterRepoRecord(
	status: "requested" | "invited" | "accepted" | "failed",
	overrides: Record<string, unknown> = {},
) {
	return {
		_id: "starter_repo_1",
		_creationTime: 1,
		clerkUserId,
		courseSlug: COURSE_SLUG,
		githubUsername: "ParkerRex",
		githubUsernameLower: "parkerrex",
		status,
		requestedAt: 10,
		updatedAt: 10,
		...overrides,
	};
}

function createCourseCtx({
	record = null,
	hasAccess = true,
}: {
	record?: Record<string, unknown> | null;
	hasAccess?: boolean;
} = {}) {
	let currentRecord = record;
	const patch = vi.fn().mockImplementation(async (_id, updates) => {
		currentRecord = { ...(currentRecord ?? {}), ...updates };
	});
	const insert = vi.fn().mockImplementation(async (_table, value) => {
		currentRecord = {
			_id: "starter_repo_1",
			_creationTime: 1,
			...value,
		};
		return "starter_repo_1";
	});

	return {
		ctx: {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({ subject: clerkUserId }),
			},
			db: {
				query: vi.fn((table: string) => {
					if (table === "productAccessGrants") {
						return {
							withIndex: vi.fn(() => ({
								unique: vi.fn().mockResolvedValue(
									hasAccess
										? {
												_id: "product_access_1",
												_creationTime: 1,
												clerkUserId,
												status: "granted",
												source: "manual",
												grantedAt: 1,
												updatedAt: 1,
											}
										: null,
								),
							})),
						};
					}

					if (table === "starterRepoAccess") {
						return {
							withIndex: vi.fn((_indexName: string) => ({
								unique: vi.fn().mockResolvedValue(currentRecord),
								collect: vi
									.fn()
									.mockResolvedValue(currentRecord ? [currentRecord] : []),
							})),
						};
					}

					throw new Error(`Unexpected table query: ${table}`);
				}),
				insert,
				patch,
			},
		},
		getRecord: () => currentRecord,
		insert,
		patch,
	};
}

describe("starter repo access handlers", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("creates the first starter repo request from a normalized username", async () => {
		const { ctx, insert, getRecord } = createCourseCtx();
		vi.spyOn(Date, "now").mockReturnValue(100);

		const result = await requestStarterRepoAccessHandler(ctx as never, {
			githubUsername: "  @ParkerRex  ",
		});

		expect(insert).toHaveBeenCalledWith(
			"starterRepoAccess",
			expect.objectContaining({
				githubUsername: "ParkerRex",
				githubUsernameLower: "parkerrex",
				status: "requested",
				requestedAt: 100,
			}),
		);
		expect(getRecord()).toMatchObject({
			githubUsername: "ParkerRex",
			status: "requested",
		});
		expect(result).toMatchObject({
			githubUsername: "ParkerRex",
			status: "requested",
		});
	});

	it("allows edits while requested or failed by resetting the request state", async () => {
		const { ctx, patch, getRecord } = createCourseCtx({
			record: createStarterRepoRecord("failed", {
				lastError: "GitHub user was not found.",
				invitedAt: 20,
				invitationId: "123",
			}),
		});
		vi.spyOn(Date, "now").mockReturnValue(200);

		await requestStarterRepoAccessHandler(ctx as never, {
			githubUsername: "@ShipBySunday",
		});

		expect(patch).toHaveBeenCalledWith(
			"starter_repo_1",
			expect.objectContaining({
				githubUsername: "ShipBySunday",
				githubUsernameLower: "shipbysunday",
				status: "requested",
				requestedAt: 200,
				lastError: undefined,
				invitedAt: undefined,
				invitationId: undefined,
			}),
		);
		expect(getRecord()).toMatchObject({
			githubUsername: "ShipBySunday",
			status: "requested",
			lastError: undefined,
		});
	});

	it("locks edits once the invite has been sent", async () => {
		const { ctx } = createCourseCtx({
			record: createStarterRepoRecord("invited", {
				invitedAt: 20,
			}),
		});

		await expect(
			requestStarterRepoAccessHandler(ctx as never, {
				githubUsername: "@AnotherUser",
			}),
		).rejects.toThrow("Starter repo access is already locked");
	});

	it("locks edits once starter repo access is accepted", async () => {
		const { ctx } = createCourseCtx({
			record: createStarterRepoRecord("accepted", {
				invitedAt: 20,
				acceptedAt: 30,
			}),
		});

		await expect(
			requestStarterRepoAccessHandler(ctx as never, {
				githubUsername: "@AnotherUser",
			}),
		).rejects.toThrow("Starter repo access is already locked");
	});

	it("records accepted provisioning results", async () => {
		const { ctx, getRecord } = createCourseCtx({
			record: createStarterRepoRecord("requested"),
		});
		vi.spyOn(Date, "now").mockReturnValue(300);

		const result = await recordStarterRepoProvisioningResultHandler(
			ctx as never,
			{
				clerkUserId,
				status: "accepted",
			},
		);

		expect(getRecord()).toMatchObject({
			status: "accepted",
			acceptedAt: 300,
		});
		expect(result).toMatchObject({
			status: "accepted",
		});
	});

	it("resets invited records back to requested", async () => {
		const { ctx, getRecord } = createCourseCtx({
			record: createStarterRepoRecord("invited", {
				invitedAt: 50,
				invitationId: "999",
			}),
		});
		vi.spyOn(Date, "now").mockReturnValue(400);

		const result = await resetStarterRepoAccessHandler(ctx as never, {
			clerkUserId,
		});

		expect(getRecord()).toMatchObject({
			status: "requested",
			requestedAt: 400,
			invitedAt: undefined,
			invitationId: undefined,
		});
		expect(result).toMatchObject({
			status: "requested",
		});
	});
});
