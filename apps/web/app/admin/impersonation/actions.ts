"use server";

import { auth } from "@clerk/nextjs/server";

import type { Id } from "@/convex/_generated/dataModel";

import {
	ADMIN_IMPERSONATION_WORKSPACE_DESTINATION,
	beginConvexImpersonationSession,
	markConvexImpersonationHandoffActive,
	markConvexImpersonationStartFailed,
	requireAdminImpersonationActionContext,
	resolveAdminImpersonationTarget,
	searchAdminImpersonationCustomers,
} from "./_server/admin-impersonation-server";

export type StartAdminImpersonationResult =
	| {
			ok: true;
			token: string;
			sessionId: Id<"impersonationSessions">;
			destination: string;
	  }
	| {
			ok: false;
			status: number;
			message: string;
			sessionId?: Id<"impersonationSessions">;
	  };

export async function searchAdminImpersonationCustomersAction(query: string) {
	const authState = await auth();
	const context = await requireAdminImpersonationActionContext(authState);
	if (!context.ok) {
		return {
			ok: false as const,
			status: context.status,
			message: context.message,
		};
	}

	const result = await searchAdminImpersonationCustomers(
		{ query, limit: 8 },
		context.client,
	);
	return {
		ok: true as const,
		...result,
	};
}

export async function startAdminImpersonationAction(input: {
	subjectClerkUserId: string;
	subjectEmail: string;
	reason: string;
}): Promise<StartAdminImpersonationResult> {
	const authState = await auth();
	const context = await requireAdminImpersonationActionContext(authState);
	if (!context.ok) {
		return {
			ok: false,
			status: context.status,
			message: context.message,
		};
	}

	let sessionId: Id<"impersonationSessions"> | null = null;

	try {
		const target = await resolveAdminImpersonationTarget(
			{
				subjectClerkUserId: input.subjectClerkUserId,
				subjectEmail: input.subjectEmail,
			},
			context.client,
		);
		if (!target.ok) {
			return {
				ok: false,
				status: target.status,
				message: target.message,
			};
		}

		const session = await beginConvexImpersonationSession({
			subjectClerkUserId: target.customer.clerkUserId,
			subjectEmail: target.customer.email,
			reason: input.reason,
		});
		sessionId = session.sessionId;

		const actorToken = await context.client.actorTokens.create({
			userId: target.customer.clerkUserId,
			actor: {
				sub: context.admin.clerkUserId,
				additionalProperties: {
					impersonationSessionId: session.sessionId,
				},
			},
			expiresInSeconds: 120,
			sessionMaxDurationInSeconds: 2 * 60 * 60,
		});

		if (!actorToken.token) {
			await markConvexImpersonationStartFailed({
				sessionId: session.sessionId,
				failureReason: "clerk_actor_token_failed",
			});
			return {
				ok: false,
				status: 502,
				message: "Clerk did not return an actor-token ticket.",
				sessionId: session.sessionId,
			};
		}

		return {
			ok: true,
			token: actorToken.token,
			sessionId: session.sessionId,
			destination: ADMIN_IMPERSONATION_WORKSPACE_DESTINATION,
		};
	} catch (error) {
		if (sessionId) {
			await markConvexImpersonationStartFailed({
				sessionId,
				failureReason: "unexpected_error",
			}).catch(() => null);
		}

		return {
			ok: false,
			status: 500,
			message:
				error instanceof Error
					? error.message
					: "Unable to start impersonation.",
			...(sessionId ? { sessionId } : undefined),
		};
	}
}

export async function completeAdminImpersonationHandoffAction() {
	const authState = await auth();
	const context = await requireAdminImpersonationActionContext(authState);
	if (!context.ok) {
		return {
			ok: false as const,
			status: context.status,
			message: context.message,
		};
	}

	await markConvexImpersonationHandoffActive();
	return { ok: true as const };
}

export async function failAdminImpersonationHandoffAction(
	sessionId: Id<"impersonationSessions">,
) {
	const authState = await auth();
	const context = await requireAdminImpersonationActionContext(authState);
	if (!context.ok) {
		return {
			ok: false as const,
			status: context.status,
			message: context.message,
		};
	}

	await markConvexImpersonationStartFailed({
		sessionId,
		failureReason: "session_handoff_failed",
	});
	return { ok: true as const };
}
