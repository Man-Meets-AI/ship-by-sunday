import { NextResponse } from "next/server";

import { withCodexAppServerClient } from "@/lib/codex/app-server";

import {
	accountIsManagedChatGpt,
	requireApiSession,
	upsertViewerCodexConnection,
} from "../../_lib/helpers";

export const runtime = "nodejs";

export async function GET() {
	try {
		const session = await requireApiSession();

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
		if (error instanceof Error && error.message === "UNAUTHORIZED") {
			return NextResponse.json(
				{ error: "Sign in before managing Codex connection." },
				{ status: 401 },
			);
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
