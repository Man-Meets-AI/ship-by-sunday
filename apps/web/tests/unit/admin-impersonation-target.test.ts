import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { authMock, clerkClientMock } = vi.hoisted(() => ({
	authMock: vi.fn(),
	clerkClientMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
	clerkClient: clerkClientMock,
}));

import {
	getCurrentAdminImpersonationAuthority,
	resolveAdminImpersonationTarget,
	searchAdminImpersonationCustomers,
} from "@/app/(app)/admin/impersonation/_server/admin-impersonation-server";

function createClerkUser(input: {
	id: string;
	email: string;
	secondaryEmail?: string;
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
			...(input.secondaryEmail
				? [
						{
							id: "email_2",
							emailAddress: input.secondaryEmail,
							verification: {
								status: "verified",
							},
						},
					]
				: []),
		],
	};
}

describe("admin impersonation target resolution", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		authMock.mockReset();
		clerkClientMock.mockReset();
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

	it("rejects configured admins when the allowlisted email is secondary", async () => {
		const client = {
			users: {
				getUser: vi.fn().mockResolvedValue(
					createClerkUser({
						id: "user_admin_secondary",
						email: "customer@example.com",
						secondaryEmail: "admin@example.com",
					}),
				),
			},
		};

		await expect(
			resolveAdminImpersonationTarget(
				{
					subjectClerkUserId: "user_admin_secondary",
					subjectEmail: "customer@example.com",
				},
				client as never,
			),
		).resolves.toMatchObject({
			ok: false,
			status: 403,
		});
	});

	it("excludes search results with allowlisted secondary admin emails", async () => {
		const client = {
			users: {
				getUserList: vi.fn().mockResolvedValue({
					totalCount: 2,
					data: [
						createClerkUser({
							id: "user_admin_secondary",
							email: "customer@example.com",
							secondaryEmail: "admin@example.com",
						}),
						createClerkUser({
							id: "user_customer",
							email: "buyer@example.com",
						}),
					],
				}),
			},
		};

		await expect(
			searchAdminImpersonationCustomers({ limit: 8 }, client as never),
		).resolves.toMatchObject({
			customers: [
				{
					clerkUserId: "user_customer",
					email: "buyer@example.com",
				},
			],
		});
	});

	it("classifies the actor admin while an impersonated customer session is active", async () => {
		const getUser = vi.fn().mockResolvedValue(
			createClerkUser({
				id: "user_admin",
				email: "primary@example.com",
				secondaryEmail: "me@parkerrex.com",
			}),
		);
		authMock.mockResolvedValue({
			userId: "user_customer",
			actor: { sub: "user_admin" },
		});
		clerkClientMock.mockResolvedValue({
			users: { getUser },
		});

		await expect(
			getCurrentAdminImpersonationAuthority(),
		).resolves.toMatchObject({
			kind: "authenticated",
			authority: {
				state: "admin",
				clerkUserId: "user_admin",
				email: "me@parkerrex.com",
			},
			user: {
				id: "user_admin",
			},
		});
		expect(getUser).toHaveBeenCalledWith("user_admin");
	});
});
