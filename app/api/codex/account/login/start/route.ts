import { NextResponse } from "next/server";

import {
	getCodexAppServerUnavailableMessage,
	withCodexAppServerClient,
} from "@/lib/codex/app-server";

import {
	getApiAuthErrorResponse,
	requireEntitledApiSession,
	upsertViewerCodexConnection,
} from "../../../_lib/helpers";

export const runtime = "nodejs";

export async function POST() {
	try {
		const session = await requireEntitledApiSession();

		const result = await withCodexAppServerClient(
			{ clerkUserId: session.userId },
			async (client) => {
				const login = await client.loginStartManagedChatGPT();
				await upsertViewerCodexConnection(session, {
					status: "connecting",
					account: null,
					rateLimits: null,
				});

				return login;
			},
		);

		return NextResponse.json({
			ok: true,
			loginId: result.loginId,
			authUrl: result.authUrl,
		});
	} catch (error) {
		const authErrorResponse = getApiAuthErrorResponse(error, {
			unauthorized: "Sign in before managing Codex connection.",
			forbidden: "Course access is required before managing Codex connection.",
			unavailable: getCodexAppServerUnavailableMessage(),
		});
		if (authErrorResponse) {
			return authErrorResponse;
		}

		console.error("codex account/login/start error", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Unable to start Codex account login.",
			},
			{ status: 500 },
		);
	}
}
