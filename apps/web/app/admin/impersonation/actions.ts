"use server";

import type { Id } from "@/convex/_generated/dataModel";

import {
	ADMIN_IMPERSONATION_WORKSPACE_DESTINATION,
	beginConvexImpersonationSession,
	markConvexImpersonationHandoffActive,
	markConvexImpersonationStartFailed,
	requireAdminImpersonationActionContext,
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
	const context = await requireAdminImpersonationActionContext();
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
	const context = await requireAdminImpersonationActionContext();
	if (!context.ok) {
		return {
			ok: false,
			status: context.status,
			message: context.message,
		};
	}

	const subjectEmail = input.subjectEmail.trim().toLowerCase();
	let sessionId: Id<"impersonationSessions"> | null = null;

	try {
		const session = await beginConvexImpersonationSession({
			subjectClerkUserId: input.subjectClerkUserId,
			subjectEmail,
			reason: input.reason,
		});
		sessionId = session.sessionId;

		const actorToken = await context.client.actorTokens.create({
			userId: input.subjectClerkUserId,
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
	await markConvexImpersonationHandoffActive();
	return { ok: true as const };
}

export async function failAdminImpersonationHandoffAction(
	sessionId: Id<"impersonationSessions">,
) {
	await markConvexImpersonationStartFailed({
		sessionId,
		failureReason: "session_handoff_failed",
	});
	return { ok: true as const };
}
