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

export async function GET(request: Request) {
	try {
		const session = await requireEntitledApiSession();
		const url = new URL(request.url);
		const loginId = url.searchParams.get("loginId");
		const refresh = url.searchParams.get("refresh");
		const shouldRefreshToken = refresh === "1" || refresh === "true";

		const result = await withCodexAppServerClient(
			{ clerkUserId: session.userId },
			async (client) => {
				const accountResult = await client.readAccount(shouldRefreshToken);
				const account = accountResult.account ?? null;
				const connected = accountIsManagedChatGpt(account);
				const rateLimits = connected ? await client.readRateLimits() : null;

				await upsertViewerCodexConnection(session, {
					status: connected
						? "connected"
						: loginId
							? "connecting"
							: "disconnected",
					account,
					rateLimits,
				});

				return {
					connected,
					status: connected
						? "connected"
						: loginId
							? "connecting"
							: "disconnected",
					account,
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

		console.error("codex account/login/poll error", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Unable to poll Codex login state.",
			},
			{ status: 500 },
		);
	}
}
