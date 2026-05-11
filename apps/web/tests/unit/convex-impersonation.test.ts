import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createSession(overrides: Record<string, unknown> = {}) {
	return {
		_id: "session_1",
		_creationTime: 900,
		actorClerkUserId: "user_admin",
		actorEmail: "me@parkerrex.com",
		subjectClerkUserId: "user_customer",
		subjectEmail: "customer@example.com",
		reason: "Debugging checkout handoff",
		status: "active",
		setupIntegrityIssues: [],
		startedAt: 900,
		updatedAt: 900,
		expiresAt: 10_000,
		...overrides,
	};
}

describe("convex impersonation model", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			ADMIN_IMPERSONATION_ENABLED: "true",
			ADMIN_IMPERSONATION_EMAILS: "me@parkerrex.com",
		};
		vi.spyOn(Date, "now").mockReturnValue(1_000);
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("normalizes the immutable support reason", async () => {
		const { normalizeImpersonationReason } =
			await import("@/convex/impersonation/model");

		expect(normalizeImpersonationReason("  Help   debug checkout  ")).toBe(
			"Help debug checkout",
		);
		expect(() => normalizeImpersonationReason("too short")).toThrow(
			"Impersonation reason must be at least 10 characters.",
		);
		expect(() => normalizeImpersonationReason("x".repeat(501))).toThrow(
			"Impersonation reason must be 500 characters or fewer.",
		);
	});

	it("parses Clerk actor claims with the app-managed session pointer", async () => {
		const { parseClerkActorClaim } =
			await import("@/convex/impersonation/model");

		expect(
			parseClerkActorClaim({
				subject: "user_customer",
				email: "Customer@Example.com",
				emailVerified: true,
				act: {
					sub: "user_admin",
					sid: "sess_123",
					iss: "https://dashboard.clerk.com",
					impersonationSessionId: "session_1",
				},
			}),
		).toEqual({
			kind: "valid",
			subjectClerkUserId: "user_customer",
			subjectEmail: "customer@example.com",
			actorClerkUserId: "user_admin",
			clerkActorSessionId: "sess_123",
			clerkActorIssuer: "https://dashboard.clerk.com",
			impersonationSessionId: "session_1",
		});
	});

	it("parses Clerk actor claims when custom metadata is nested by the SDK", async () => {
		const { parseClerkActorClaim } =
			await import("@/convex/impersonation/model");

		expect(
			parseClerkActorClaim({
				subject: "user_customer",
				email: "customer@example.com",
				emailVerified: true,
				act: {
					sub: "user_admin",
					additionalProperties: {
						impersonationSessionId: "session_nested",
					},
				},
			}),
		).toMatchObject({
			kind: "valid",
			impersonationSessionId: "session_nested",
		});
	});

	it("creates a starting session and append-only audit event together", async () => {
		const { createImpersonationSessionHandler } =
			await import("@/convex/impersonation/model");
		const insert = vi
			.fn()
			.mockResolvedValueOnce("session_1")
			.mockResolvedValueOnce("audit_1");
		const fakeCtx = {
			db: { insert },
		} as unknown as Parameters<typeof createImpersonationSessionHandler>[0];

		const result = await createImpersonationSessionHandler(fakeCtx, {
			actorClerkUserId: "user_admin",
			actorEmail: "Me@ParkerRex.com",
			subjectClerkUserId: "user_customer",
			subjectEmail: "Customer@Example.com",
			reason: "Debugging checkout handoff",
			requestId: "req_123",
			userAgent: "vitest",
			setupIntegrityIssues: ["missing_workspace_project"],
		});

		expect(result).toEqual({
			sessionId: "session_1",
			expiresAt: 7_201_000,
			status: "starting",
		});
		expect(insert).toHaveBeenNthCalledWith(
			1,
			"impersonationSessions",
			expect.objectContaining({
				actorEmail: "me@parkerrex.com",
				subjectEmail: "customer@example.com",
				reason: "Debugging checkout handoff",
				status: "starting",
				expiresAt: 7_201_000,
				setupIntegrityIssues: ["missing_workspace_project"],
			}),
		);
		expect(insert).toHaveBeenNthCalledWith(
			2,
			"impersonationAuditEvents",
			expect.objectContaining({
				sessionId: "session_1",
				eventType: "session_started",
				result: "success",
				actionId: "impersonation.session.starting",
			}),
		);
	});

	it("begins admin sessions with setup-integrity warnings", async () => {
		const { beginAdminImpersonationSessionHandler } =
			await import("@/convex/impersonation/model");
		const insert = vi
			.fn()
			.mockResolvedValueOnce("session_1")
			.mockResolvedValueOnce("audit_1");
		const query = vi.fn((table: string) => {
			if (table === "productAccessGrants") {
				return {
					withIndex: vi.fn(() => ({
						unique: vi.fn().mockResolvedValue(null),
					})),
				};
			}
			return {
				withIndex: vi.fn(() => ({
					take: vi.fn().mockResolvedValue([]),
				})),
			};
		});
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_admin",
					email: "me@parkerrex.com",
					emailVerified: true,
				}),
			},
			db: { insert, query },
		} as unknown as Parameters<typeof beginAdminImpersonationSessionHandler>[0];

		const result = await beginAdminImpersonationSessionHandler(fakeCtx, {
			subjectClerkUserId: "user_customer",
			subjectEmail: "customer@example.com",
			reason: "Debugging customer setup",
		});

		expect(result.sessionId).toBe("session_1");
		expect(insert).toHaveBeenNthCalledWith(
			1,
			"impersonationSessions",
			expect.objectContaining({
				actorClerkUserId: "user_admin",
				setupIntegrityIssues: [
					"missing_product_access_grant",
					"missing_workspace_project",
				],
			}),
		);
	});

	it("lazily expires active sessions when observed through the mutation path", async () => {
		const { observeSupportModeStatusHandler } =
			await import("@/convex/impersonation/model");
		const patch = vi.fn();
		const insert = vi.fn().mockResolvedValue("audit_1");
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_customer",
					email: "customer@example.com",
					emailVerified: true,
					act: { sub: "user_admin", impersonationSessionId: "session_1" },
				}),
			},
			db: {
				get: vi.fn().mockResolvedValue(createSession({ expiresAt: 1_000 })),
				patch,
				insert,
			},
		} as unknown as Parameters<typeof observeSupportModeStatusHandler>[0];

		const status = await observeSupportModeStatusHandler(fakeCtx);

		expect(status.state).toBe("expired");
		expect(patch).toHaveBeenCalledWith("session_1", {
			status: "expired",
			updatedAt: 1_000,
		});
		expect(insert).toHaveBeenCalledWith(
			"impersonationAuditEvents",
			expect.objectContaining({
				eventType: "session_expired",
				result: "success",
			}),
		);
	});

	it("keeps misconfigured actor sessions visible and blocked", async () => {
		process.env.ADMIN_IMPERSONATION_EMAILS = "";
		const { observeSupportModeStatusHandler } =
			await import("@/convex/impersonation/model");
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_customer",
					email: "customer@example.com",
					emailVerified: true,
					act: { sub: "user_admin", impersonationSessionId: "session_1" },
				}),
			},
			db: {
				get: vi.fn().mockResolvedValue(createSession()),
			},
		} as unknown as Parameters<typeof observeSupportModeStatusHandler>[0];

		await expect(
			observeSupportModeStatusHandler(fakeCtx),
		).resolves.toMatchObject({
			state: "misconfigured",
			stopEligible: true,
			customerEmail: "customer@example.com",
		});
	});

	it("blocks unclassified support-mode writes and records audit", async () => {
		const { evaluateSupportModeWritePolicyHandler } =
			await import("@/convex/impersonation/model");
		const insert = vi.fn().mockResolvedValue("audit_1");
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_customer",
					email: "customer@example.com",
					emailVerified: true,
					act: { sub: "user_admin", impersonationSessionId: "session_1" },
				}),
			},
			db: {
				get: vi.fn().mockResolvedValue(createSession()),
				patch: vi.fn(),
				insert,
			},
		} as unknown as Parameters<typeof evaluateSupportModeWritePolicyHandler>[0];

		await expect(
			evaluateSupportModeWritePolicyHandler(fakeCtx, {
				actionId: "workspace.project.update",
			}),
		).resolves.toEqual({
			kind: "blocked",
			blockReason: "unclassified_write",
		});
		expect(insert).toHaveBeenCalledWith(
			"impersonationAuditEvents",
			expect.objectContaining({
				eventType: "write_attempted",
				actionId: "workspace.project.update",
				result: "blocked",
				blockReason: "unclassified_write",
			}),
		);
	});

	it("records and returns a blocked allowed-write preflight before an expired support-mode mutation runs", async () => {
		const { assertSupportModeWriteAllowedHandler } =
			await import("@/convex/impersonation/model");
		const patch = vi.fn();
		const insert = vi.fn().mockResolvedValue("audit_1");
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_customer",
					email: "customer@example.com",
					emailVerified: true,
					act: { sub: "user_admin", impersonationSessionId: "session_1" },
				}),
			},
			db: {
				get: vi.fn().mockResolvedValue(createSession({ expiresAt: 999 })),
				patch,
				insert,
			},
		} as unknown as Parameters<typeof assertSupportModeWriteAllowedHandler>[0];

		await expect(
			assertSupportModeWriteAllowedHandler(fakeCtx, {
				actionId: "course.lesson.saveDraft",
			}),
		).resolves.toEqual({
			kind: "blocked",
			blockReason: "support_session_expired",
		});
		expect(patch).toHaveBeenCalledWith("session_1", {
			status: "expired",
			updatedAt: 1_000,
		});
		expect(insert).toHaveBeenCalledWith(
			"impersonationAuditEvents",
			expect.objectContaining({
				eventType: "write_attempted",
				actionId: "course.lesson.saveDraft",
				result: "blocked",
				blockReason: "support_session_expired",
			}),
		);
	});

	it("does not record successful downloads for expired support-mode sessions", async () => {
		const { recordSupportModeDownloadAttemptHandler } =
			await import("@/convex/impersonation/model");
		const patch = vi.fn();
		const insert = vi.fn().mockResolvedValue("audit_1");
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_customer",
					email: "customer@example.com",
					emailVerified: true,
					act: { sub: "user_admin", impersonationSessionId: "session_1" },
				}),
			},
			db: {
				get: vi.fn().mockResolvedValue(createSession({ expiresAt: 999 })),
				patch,
				insert,
			},
		} as unknown as Parameters<
			typeof recordSupportModeDownloadAttemptHandler
		>[0];

		await expect(
			recordSupportModeDownloadAttemptHandler(fakeCtx, {
				actionId: "download.reviewRepo",
				result: "success",
				changedRecordIds: ["product_1"],
			}),
		).resolves.toEqual({
			kind: "not_recorded",
			reason: "support_session_expired",
		});
		expect(insert).toHaveBeenCalledWith(
			"impersonationAuditEvents",
			expect.objectContaining({
				eventType: "download_attempted",
				actionId: "download.reviewRepo",
				result: "blocked",
				blockReason: "support_session_expired",
			}),
		);
	});

	it("does not record route audit events without a valid server assertion", async () => {
		process.env.ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET = "a".repeat(32);
		const {
			recordServerBlockedSupportModeActionHandler,
			recordServerSupportModeDownloadAttemptHandler,
		} = await import("@/convex/impersonation/model");
		const insert = vi.fn().mockResolvedValue("audit_1");
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_customer",
					email: "customer@example.com",
					emailVerified: true,
					act: { sub: "user_admin", impersonationSessionId: "session_1" },
				}),
			},
			db: {
				get: vi.fn().mockResolvedValue(createSession()),
				patch: vi.fn(),
				insert,
			},
		} as unknown as Parameters<
			typeof recordServerBlockedSupportModeActionHandler
		>[0];
		const serverAssertion = {
			issuedAt: 1_000,
			nonce: "nonce_1",
			payload: "{}",
			signature: "not-a-valid-signature",
		};

		await expect(
			recordServerBlockedSupportModeActionHandler(fakeCtx, {
				actionId: "codex.account.read",
				blockReason: "external_side_effect_blocked",
				eventType: "external_action_blocked",
				serverAssertion,
			}),
		).resolves.toEqual({
			kind: "not_recorded",
			reason: "secret_access_blocked",
		});
		await expect(
			recordServerSupportModeDownloadAttemptHandler(fakeCtx, {
				actionId: "download.reviewRepo",
				result: "success",
				changedRecordIds: ["product_1"],
				serverAssertion,
			}),
		).resolves.toEqual({
			kind: "not_recorded",
			reason: "secret_access_blocked",
		});
		expect(insert).not.toHaveBeenCalled();
	});
});
