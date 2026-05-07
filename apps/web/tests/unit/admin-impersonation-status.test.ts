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

describe("admin impersonation status model", () => {
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

	it("reports normal admin readiness without exposing token internals", async () => {
		const { getSupportModeStatusHandler } =
			await import("@/convex/impersonation/model");
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_admin",
					email: "me@parkerrex.com",
					emailVerified: true,
				}),
			},
			db: { get: vi.fn() },
		} as unknown as Parameters<typeof getSupportModeStatusHandler>[0];

		const status = await getSupportModeStatusHandler(fakeCtx);

		expect(status).toEqual({
			state: "normal",
			startEligible: true,
			stopEligible: false,
			customerEmail: null,
			reason: null,
			timeRemainingMs: null,
			integrityWarnings: [],
		});
		expect(status).not.toHaveProperty("actorClerkUserId");
		expect(status).not.toHaveProperty("impersonationSessionId");
	});

	it("classifies raw Clerk Dashboard impersonation as unsupported", async () => {
		const { getSupportModeStatusHandler } =
			await import("@/convex/impersonation/model");
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_customer",
					email: "customer@example.com",
					emailVerified: true,
					act: { sub: "user_admin", sid: "sess_123" },
				}),
			},
			db: { get: vi.fn() },
		} as unknown as Parameters<typeof getSupportModeStatusHandler>[0];

		await expect(getSupportModeStatusHandler(fakeCtx)).resolves.toMatchObject({
			state: "unsupported_clerk_dashboard_impersonation",
			startEligible: false,
			stopEligible: false,
		});
	});

	it("returns an active UI-safe status for a valid app-managed session", async () => {
		const { getSupportModeStatusHandler } =
			await import("@/convex/impersonation/model");
		const fakeCtx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({
					subject: "user_customer",
					email: "customer@example.com",
					emailVerified: true,
					act: {
						sub: "user_admin",
						sid: "sess_123",
						impersonationSessionId: "session_1",
					},
				}),
			},
			db: { get: vi.fn().mockResolvedValue(createSession()) },
		} as unknown as Parameters<typeof getSupportModeStatusHandler>[0];

		await expect(getSupportModeStatusHandler(fakeCtx)).resolves.toMatchObject({
			state: "active",
			startEligible: false,
			stopEligible: true,
			customerEmail: "customer@example.com",
			reason: "Debugging checkout handoff",
			timeRemainingMs: 9_000,
		});
	});

	it("lazily invalidates active sessions when the kill switch is off", async () => {
		process.env.ADMIN_IMPERSONATION_ENABLED = "false";
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
					act: {
						sub: "user_admin",
						sid: "sess_123",
						impersonationSessionId: "session_1",
					},
				}),
			},
			db: {
				get: vi.fn().mockResolvedValue(createSession()),
				patch,
				insert,
			},
		} as unknown as Parameters<typeof observeSupportModeStatusHandler>[0];

		const status = await observeSupportModeStatusHandler(fakeCtx);

		expect(status.state).toBe("kill_switch_disabled");
		expect(patch).toHaveBeenCalledWith("session_1", {
			status: "invalidated",
			updatedAt: 1_000,
			invalidatedAt: 1_000,
			invalidationReason: "feature_disabled",
		});
		expect(insert).toHaveBeenCalledWith(
			"impersonationAuditEvents",
			expect.objectContaining({
				eventType: "session_invalidated",
				result: "blocked",
				actionId: "impersonation.session.feature_disabled",
			}),
		);
	});
});
