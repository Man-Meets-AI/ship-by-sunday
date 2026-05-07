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
});
