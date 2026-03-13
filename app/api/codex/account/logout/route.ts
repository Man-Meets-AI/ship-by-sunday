import { NextResponse } from "next/server";

import { withCodexAppServerClient } from "@/lib/codex/app-server";

import {
	requireApiSession,
	upsertViewerCodexConnection,
} from "../../_lib/helpers";

export const runtime = "nodejs";

export async function POST() {
	try {
		const session = await requireApiSession();

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
		if (error instanceof Error && error.message === "UNAUTHORIZED") {
			return NextResponse.json(
				{ error: "Sign in before managing Codex connection." },
				{ status: 401 },
			);
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
