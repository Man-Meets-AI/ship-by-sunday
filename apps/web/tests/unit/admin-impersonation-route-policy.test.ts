import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMutationMock, getConvexServerSessionMock, serverEnv } = vi.hoisted(
	() => ({
		fetchMutationMock: vi.fn(),
		getConvexServerSessionMock: vi.fn(),
		serverEnv: {
			ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET:
				"support-mode-route-audit-test-secret",
			CLERK_SECRET_KEY: undefined as string | undefined,
		},
	}),
);

vi.mock("server-only", () => ({}));

vi.mock("convex/nextjs", () => ({
	fetchMutation: fetchMutationMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		impersonation: {
			observeSupportModeStatus: "impersonation.observeSupportModeStatus",
			recordBlockedSupportModeAction:
				"impersonation.recordBlockedSupportModeAction",
			recordSupportModeDownloadAttempt:
				"impersonation.recordSupportModeDownloadAttempt",
		},
	},
}));

vi.mock("@/platform/auth/convex-auth", () => ({
	getConvexServerSession: getConvexServerSessionMock,
}));

vi.mock("@/platform/env/server", () => ({
	serverEnv,
}));

import { parseSupportModeRouteAuditPayload } from "@/platform/admin-impersonation";
import {
	assertSupportModeDownloadAllowedForRequest,
	recordBlockedSupportModeActionForRequest,
} from "@/platform/admin-impersonation/route-policy";

function createRequest() {
	return new Request("https://example.com/api/test", {
		headers: {
			"user-agent": "vitest",
			"x-request-id": "req_route_policy",
		},
	});
}

describe("admin impersonation route policy", () => {
	beforeEach(() => {
		fetchMutationMock.mockReset();
		getConvexServerSessionMock.mockReset();
		getConvexServerSessionMock.mockResolvedValue({
			token: "convex_token",
		});
	});

	it("returns false without a Convex token and does not write audit", async () => {
		getConvexServerSessionMock.mockResolvedValue({ token: null });

		await expect(
			recordBlockedSupportModeActionForRequest(createRequest(), {
				actionId: "codex.account.read",
				blockReason: "external_side_effect_blocked",
			}),
		).resolves.toBe(false);
		expect(fetchMutationMock).not.toHaveBeenCalled();
	});

	it("signs server route audit assertions before blocking support-mode actions", async () => {
		fetchMutationMock.mockResolvedValue({
			kind: "recorded",
			sessionId: "session_1",
		});

		await expect(
			recordBlockedSupportModeActionForRequest(createRequest(), {
				actionId: "codex.account.read",
				blockReason: "external_side_effect_blocked",
			}),
		).resolves.toBe(true);

		const mutationArgs = fetchMutationMock.mock.calls[0]?.[1];
		const assertion = mutationArgs.serverAssertion;
		expect(assertion.signature).toMatch(/^[a-f0-9]{64}$/);
		expect(JSON.stringify(assertion)).not.toContain(
			serverEnv.ADMIN_IMPERSONATION_ROUTE_AUDIT_SECRET,
		);
		expect(parseSupportModeRouteAuditPayload(assertion.payload)).toMatchObject({
			actionId: "codex.account.read",
			blockReason: "external_side_effect_blocked",
			eventType: "external_action_blocked",
			purpose: "blocked_action",
			result: "blocked",
		});
	});

	it("fails closed when a blocked route audit is not recorded", async () => {
		fetchMutationMock.mockResolvedValue({
			kind: "not_recorded",
			reason: "secret_access_blocked",
		});

		await expect(
			recordBlockedSupportModeActionForRequest(createRequest(), {
				actionId: "stripe.checkout.createSession",
				blockReason: "billing_action_blocked",
			}),
		).rejects.toThrow(
			"Support-mode route audit was not recorded before blocking stripe.checkout.createSession.",
		);
	});

	it("fails closed when a blocked download audit is not recorded", async () => {
		fetchMutationMock
			.mockResolvedValueOnce({ state: "expired" })
			.mockResolvedValueOnce({
				kind: "not_recorded",
				reason: "secret_access_blocked",
			});

		await expect(
			assertSupportModeDownloadAllowedForRequest(createRequest(), {
				actionId: "download.reviewRepo",
			}),
		).rejects.toThrow(
			"Support-mode route audit was not recorded before blocking download.reviewRepo.",
		);
	});
});
