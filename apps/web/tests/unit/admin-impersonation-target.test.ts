import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { resolveAdminImpersonationTarget } from "@/app/admin/impersonation/_server/admin-impersonation-server";

function createClerkUser(input: {
	id: string;
	email: string;
	emailVerified?: boolean;
}) {
	return {
		id: input.id,
		firstName: null,
		lastName: null,
		imageUrl: "",
		createdAt: 1_000,
		primaryEmailAddressId: "email_1",
		emailAddresses: [
			{
				id: "email_1",
				emailAddress: input.email,
				verification: {
					status: input.emailVerified === false ? "unverified" : "verified",
				},
			},
		],
	};
}

describe("admin impersonation target resolution", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			ADMIN_IMPERSONATION_ENABLED: "true",
			ADMIN_IMPERSONATION_EMAILS: "me@parkerrex.com,admin@example.com",
		};
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("rejects forged emails that do not match the target Clerk user", async () => {
		const client = {
			users: {
				getUser: vi
					.fn()
					.mockResolvedValue(
						createClerkUser({ id: "user_admin_2", email: "admin@example.com" }),
					),
			},
		};

		await expect(
			resolveAdminImpersonationTarget(
				{
					subjectClerkUserId: "user_admin_2",
					subjectEmail: "customer@example.com",
				},
				client as never,
			),
		).resolves.toMatchObject({
			ok: false,
			status: 409,
		});
	});

	it("rejects configured admins even when the supplied email matches", async () => {
		const client = {
			users: {
				getUser: vi
					.fn()
					.mockResolvedValue(
						createClerkUser({ id: "user_admin_2", email: "admin@example.com" }),
					),
			},
		};

		await expect(
			resolveAdminImpersonationTarget(
				{
					subjectClerkUserId: "user_admin_2",
					subjectEmail: "admin@example.com",
				},
				client as never,
			),
		).resolves.toMatchObject({
			ok: false,
			status: 403,
		});
	});
});
