import { NextResponse } from "next/server";

import {
	getCodexAppServerUnavailableMessage,
	withCodexAppServerClient,
} from "@/features/codex/server/app-server";

import {
	accountIsManagedChatGpt,
	getApiAuthErrorResponse,
	requireEntitledApiSession,
	upsertViewerCodexConnection,
} from "@/features/codex/server/route-helpers";

export const runtime = "nodejs";

export async function GET() {
	try {
		const session = await requireEntitledApiSession();

		const result = await withCodexAppServerClient(
			{ clerkUserId: session.userId },
			async (client) => {
				const accountResult = await client.readAccount(false);
				const account = accountResult.account ?? null;

				if (!accountIsManagedChatGpt(account)) {
					await upsertViewerCodexConnection(session, {
						status: "disconnected",
						account,
						rateLimits: null,
					});

					return {
						connected: false,
						rateLimits: null,
					};
				}

				const rateLimits = await client.readRateLimits();
				await upsertViewerCodexConnection(session, {
					status: "connected",
					account,
					rateLimits,
				});

				return {
					connected: true,
					rateLimits,
				};
			},
		);

		return NextResponse.json(result);
	} catch (error) {
		const authErrorResponse = getApiAuthErrorResponse(error, {
			unauthorized: "Sign in before managing Codex connection.",
			forbidden: "Course access is required before managing Codex connection.",
			unavailable: getCodexAppServerUnavailableMessage(),
		});
		if (authErrorResponse) {
			return authErrorResponse;
		}

		console.error("codex account/rate-limits error", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Unable to read Codex rate limits.",
			},
			{ status: 500 },
		);
	}
}
