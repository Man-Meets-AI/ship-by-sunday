import { NextResponse } from "next/server";

import {
	getCodexAppServerUnavailableMessage,
	withCodexAppServerClient,
} from "@/lib/codex/app-server";

import {
	getApiAuthErrorResponse,
	requireEntitledApiSession,
	upsertViewerCodexConnection,
} from "../../_lib/helpers";

export const runtime = "nodejs";

export async function POST() {
	try {
		const session = await requireEntitledApiSession();

		await withCodexAppServerClient(
			{ clerkUserId: session.userId },
			async (client) => {
				await client.logout();
			},
		);

		await upsertViewerCodexConnection(session, {
			status: "disconnected",
			account: null,
			rateLimits: null,
		});

		return NextResponse.json({
			ok: true,
			connected: false,
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

		console.error("codex account/logout error", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Unable to disconnect Codex account.",
			},
			{ status: 500 },
		);
	}
}
