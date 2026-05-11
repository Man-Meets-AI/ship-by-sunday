import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { headers } from "next/headers";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	classifyAdminImpersonationAuthority,
	readAdminImpersonationConfig,
	type AdminImpersonationAuthority,
} from "@/platform/admin-impersonation";
import { getConvexServerSession } from "@/platform/auth/convex-auth";
import { routeConfig } from "@/config/product";

export type AdminImpersonationCustomer = {
	clerkUserId: string;
	email: string;
	name: string | null;
	imageUrl: string | null;
	createdAt: number;
};

export type AdminImpersonationSearchResult = {
	customers: AdminImpersonationCustomer[];
	totalCount: number;
	query: string;
};

export type AdminImpersonationTargetResolution =
	| {
			ok: true;
			customer: AdminImpersonationCustomer;
	  }
	| {
			ok: false;
			status: number;
			message: string;
	  };

export type AdminImpersonationPageData = {
	adminEmail: string;
	initialCustomers: AdminImpersonationCustomer[];
	customerTotalCount: number;
	history: Awaited<ReturnType<typeof listAdminImpersonationHistory>>;
	status: Awaited<ReturnType<typeof getSupportModeStatusForAdminPage>>;
};

export const ADMIN_IMPERSONATION_PATH = "/admin/impersonation" as const;
export const ADMIN_IMPERSONATION_WORKSPACE_DESTINATION = routeConfig.appHome;

type ClerkBackendClient = Awaited<ReturnType<typeof clerkClient>>;
type ClerkUser = Awaited<ReturnType<ClerkBackendClient["users"]["getUser"]>>;

function normalizeEmail(value: string) {
	return value.trim().toLowerCase();
}

function getPrimaryEmail(user: ClerkUser) {
	const primaryEmail =
		user.emailAddresses.find(
			(emailAddress) => emailAddress.id === user.primaryEmailAddressId,
		) ??
		user.emailAddresses.find(
			(emailAddress) => emailAddress.verification?.status === "verified",
		) ??
		user.emailAddresses[0] ??
		null;

	if (!primaryEmail) {
		return null;
	}

	return {
		email: normalizeEmail(primaryEmail.emailAddress),
		verified: primaryEmail.verification?.status === "verified",
	};
}

function getNormalizedUserEmails(user: ClerkUser) {
	return user.emailAddresses.map((emailAddress) =>
		normalizeEmail(emailAddress.emailAddress),
	);
}

function userHasConfiguredAdminEmail(user: ClerkUser, adminEmails: string[]) {
	const adminEmailSet = new Set(adminEmails.map(normalizeEmail));
	return getNormalizedUserEmails(user).some((email) =>
		adminEmailSet.has(email),
	);
}

function getVerifiedAllowlistedEmail(user: ClerkUser, adminEmails: string[]) {
	const adminEmailSet = new Set(adminEmails.map(normalizeEmail));
	const emailAddress = user.emailAddresses.find((candidate) => {
		const email = normalizeEmail(candidate.emailAddress);
		return (
			adminEmailSet.has(email) && candidate.verification?.status === "verified"
		);
	});
	if (!emailAddress) {
		return null;
	}

	return {
		email: normalizeEmail(emailAddress.emailAddress),
		verified: true,
	};
}

function formatClerkName(user: ClerkUser) {
	const fullName = [user.firstName, user.lastName]
		.map((part) => part?.trim())
		.filter(Boolean)
		.join(" ");
	return fullName.length > 0 ? fullName : null;
}

function toCustomerSummary(user: ClerkUser): AdminImpersonationCustomer | null {
	const primaryEmail = getPrimaryEmail(user);
	if (!primaryEmail?.email) {
		return null;
	}

	return {
		clerkUserId: user.id,
		email: primaryEmail.email,
		name: formatClerkName(user),
		imageUrl: user.imageUrl || null,
		createdAt: user.createdAt,
	};
}

function getClerkErrorStatus(
	error: Error | { status?: number; statusCode?: number },
) {
	if ("status" in error && typeof error.status === "number") {
		return error.status;
	}
	if ("statusCode" in error && typeof error.statusCode === "number") {
		return error.statusCode;
	}
	return null;
}

export function getAdminImpersonationActionError(
	authority: AdminImpersonationAuthority,
) {
	if (authority.state === "disabled") {
		return {
			status: 404,
			message: "Admin impersonation is disabled.",
		} as const;
	}
	if (authority.state === "misconfigured") {
		return {
			status: 503,
			message: "Admin impersonation is misconfigured.",
		} as const;
	}
	if (authority.state === "not_admin") {
		return {
			status: 403,
			message: "Admin impersonation access denied.",
		} as const;
	}

	return null;
}

export async function getCurrentAdminImpersonationAuthority() {
	const authState = await auth();
	const actorClerkUserId =
		typeof authState.actor?.sub === "string" &&
		authState.actor.sub.trim().length > 0
			? authState.actor.sub
			: null;
	const authorityClerkUserId = actorClerkUserId ?? authState.userId;
	if (!authorityClerkUserId) {
		return {
			kind: "unauthenticated" as const,
			authority: null,
		};
	}

	const client = await clerkClient();
	const user = await client.users.getUser(authorityClerkUserId);
	const config = readAdminImpersonationConfig();
	const primaryEmail =
		config.state === "enabled"
			? (getVerifiedAllowlistedEmail(user, config.adminEmails) ??
				getPrimaryEmail(user))
			: getPrimaryEmail(user);
	const authority = classifyAdminImpersonationAuthority({
		config,
		identity: {
			subject: user.id,
			email: primaryEmail?.email,
			emailVerified: primaryEmail?.verified,
		},
	});

	return {
		kind: "authenticated" as const,
		authority,
		client,
		user,
	};
}

export async function requireAdminImpersonationActionContext() {
	const authContext = await getCurrentAdminImpersonationAuthority();
	if (authContext.kind === "unauthenticated") {
		return {
			ok: false as const,
			status: 401,
			message: "Sign in before using admin impersonation.",
		};
	}

	const error = getAdminImpersonationActionError(authContext.authority);
	if (error || authContext.authority.state !== "admin") {
		return {
			ok: false as const,
			...(error ?? {
				status: 403,
				message: "Admin impersonation access denied.",
			}),
		};
	}

	return {
		ok: true as const,
		client: authContext.client,
		admin: authContext.authority,
		user: authContext.user,
	};
}

export async function searchAdminImpersonationCustomers(
	input: { query?: string | null; limit?: number },
	client?: ClerkBackendClient,
): Promise<AdminImpersonationSearchResult> {
	const resolvedClient = client ?? (await clerkClient());
	const query = input.query?.trim().toLowerCase() ?? "";
	const limit = Math.min(Math.max(input.limit ?? 8, 1), 20);
	const config = readAdminImpersonationConfig();
	const response = await resolvedClient.users.getUserList({
		limit,
		offset: 0,
		orderBy: "-created_at",
		...(query ? { query } : undefined),
	});
	const customers = response.data.flatMap((user) => {
		if (userHasConfiguredAdminEmail(user, config.adminEmails)) {
			return [];
		}

		const customer = toCustomerSummary(user);
		return customer ? [customer] : [];
	});

	return {
		customers,
		totalCount: response.totalCount,
		query,
	};
}

export async function resolveAdminImpersonationTarget(
	input: { subjectClerkUserId: string; subjectEmail: string },
	client?: ClerkBackendClient,
): Promise<AdminImpersonationTargetResolution> {
	const subjectClerkUserId = input.subjectClerkUserId.trim();
	if (subjectClerkUserId.length === 0) {
		return {
			ok: false,
			status: 400,
			message: "Choose a customer before starting impersonation.",
		};
	}

	const requestedEmail = normalizeEmail(input.subjectEmail);
	const resolvedClient = client ?? (await clerkClient());
	let user: ClerkUser;
	try {
		user = await resolvedClient.users.getUser(subjectClerkUserId);
	} catch (error) {
		const clerkErrorStatus =
			error instanceof Error || (typeof error === "object" && error !== null)
				? getClerkErrorStatus(error)
				: null;
		if (clerkErrorStatus === 404) {
			return {
				ok: false,
				status: 404,
				message: "Selected Clerk user was not found.",
			};
		}
		throw error;
	}

	const customer = toCustomerSummary(user);
	if (!customer) {
		return {
			ok: false,
			status: 400,
			message: "Selected Clerk user does not have an email address.",
		};
	}
	if (customer.email !== requestedEmail) {
		return {
			ok: false,
			status: 409,
			message: "Selected customer changed. Search again before impersonating.",
		};
	}
	const config = readAdminImpersonationConfig();
	if (userHasConfiguredAdminEmail(user, config.adminEmails)) {
		return {
			ok: false,
			status: 403,
			message: "Configured admins cannot be impersonated.",
		};
	}

	return { ok: true, customer };
}

async function getConvexTokenOrThrow() {
	const session = await getConvexServerSession();
	if (!session.token) {
		throw new Error("Missing Convex auth token.");
	}
	return session.token;
}

export async function listAdminImpersonationHistory() {
	const token = await getConvexTokenOrThrow();
	return await fetchQuery(
		api.impersonation.listAdminSessionHistory,
		{},
		{ token },
	);
}

export async function getSupportModeStatusForAdminPage() {
	const token = await getConvexTokenOrThrow();
	return await fetchQuery(
		api.impersonation.getSupportModeStatus,
		{},
		{ token },
	);
}

export async function loadAdminImpersonationPageData(): Promise<
	{ ok: true; data: AdminImpersonationPageData } | { ok: false; status: number }
> {
	const context = await requireAdminImpersonationActionContext();
	if (!context.ok) {
		return { ok: false, status: context.status };
	}

	const [customerSearch, history, status] = await Promise.all([
		searchAdminImpersonationCustomers({ limit: 8 }, context.client),
		listAdminImpersonationHistory(),
		getSupportModeStatusForAdminPage(),
	]);

	return {
		ok: true,
		data: {
			adminEmail: context.admin.email,
			initialCustomers: customerSearch.customers,
			customerTotalCount: customerSearch.totalCount,
			history,
			status,
		},
	};
}

export async function getRequestMetadata() {
	const requestHeaders = await headers();
	return {
		requestId: requestHeaders.get("x-request-id"),
		userAgent: requestHeaders.get("user-agent"),
		ipHash: null,
	};
}

export async function beginConvexImpersonationSession(input: {
	subjectClerkUserId: string;
	subjectEmail: string;
	reason: string;
}) {
	const token = await getConvexTokenOrThrow();
	return await fetchMutation(
		api.impersonation.beginAdminSession,
		{
			...input,
			...(await getRequestMetadata()),
		},
		{ token },
	);
}

export async function markConvexImpersonationStartFailed(input: {
	sessionId: Id<"impersonationSessions">;
	failureReason:
		| "clerk_actor_token_failed"
		| "session_handoff_failed"
		| "unexpected_error";
}) {
	const token = await getConvexTokenOrThrow();
	return await fetchMutation(
		api.impersonation.markAdminSessionStartFailed,
		input,
		{ token },
	);
}

export async function markConvexImpersonationHandoffActive() {
	const token = await getConvexTokenOrThrow();
	return await fetchMutation(
		api.impersonation.markCurrentSessionActive,
		{},
		{ token },
	);
}
