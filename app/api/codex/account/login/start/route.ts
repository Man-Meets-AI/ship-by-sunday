import { NextResponse } from "next/server";

import { withCodexAppServerClient } from "@/lib/codex/app-server";

import {
	requireApiSession,
	upsertViewerCodexConnection,
} from "../../../_lib/helpers";

export const runtime = "nodejs";

export async function POST() {
	try {
		const session = await requireApiSession();

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
		if (error instanceof Error && error.message === "UNAUTHORIZED") {
			return NextResponse.json(
				{ error: "Sign in before managing Codex connection." },
				{ status: 401 },
			);
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
