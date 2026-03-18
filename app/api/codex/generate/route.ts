import { NextResponse } from "next/server";
import { z } from "zod";

import {
	getCodexAppServerUnavailableMessage,
	withCodexAppServerClient,
} from "@/features/codex/server/app-server";

import {
	accountIsManagedChatGpt,
	getApiAuthErrorResponse,
	getCodexDefaultModel,
	getCodexTurnTimeoutMs,
	recordCodexRun,
	requireEntitledApiSession,
	upsertViewerCodexConnection,
} from "@/features/codex/server/route-helpers";

const generateRequestSchema = z.object({
	templateId: z.enum([
		"competitor_research",
		"scope_boundary",
		"visual_direction_guide",
	]),
	prompt: z.string().min(1),
	lessonId: z.string().min(1).optional(),
	model: z.string().min(1).optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
	let parsedInput: z.infer<typeof generateRequestSchema> | null = null;
	let session: {
		userId: string;
		token: string;
	} | null = null;
	const startedAt = Date.now();

	try {
		const entitledSession = await requireEntitledApiSession();
		session = entitledSession;
		const body = (await request.json().catch(() => null)) as unknown;
		const parsed = generateRequestSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid generation payload." },
				{ status: 400 },
			);
		}
		const requestInput = parsed.data;
		parsedInput = requestInput;

		const output = await withCodexAppServerClient(
			{ clerkUserId: entitledSession.userId },
			async (client) => {
				const accountResult = await client.readAccount(false);
				const account = accountResult.account ?? null;

				if (!accountIsManagedChatGpt(account)) {
					await upsertViewerCodexConnection(entitledSession, {
						status: "disconnected",
						account,
						rateLimits: null,
					});

					return {
						kind: "disconnected" as const,
						error: "Connect your Codex account in Settings before generating.",
					};
				}

				const generation = await client.generateText({
					prompt: requestInput.prompt,
					model: requestInput.model ?? getCodexDefaultModel(),
					turnTimeoutMs: getCodexTurnTimeoutMs(),
				});

				let rateLimits = null;
				try {
					rateLimits = await client.readRateLimits();
				} catch (error) {
					console.warn("codex rate-limits read failed after generation", error);
				}

				await upsertViewerCodexConnection(entitledSession, {
					status: generation.status === "completed" ? "connected" : "error",
					account,
					rateLimits,
				});

				return {
					kind: "generated" as const,
					generation,
					account,
					rateLimits,
				};
			},
		);

		if (output.kind === "disconnected") {
			await recordCodexRun(entitledSession, {
				lessonId: requestInput.lessonId,
				templateId: requestInput.templateId,
				status: "error",
				latencyMs: Date.now() - startedAt,
				errorCode: "account_not_connected",
			});

			return NextResponse.json(
				{
					error: output.error,
					code: "account_not_connected",
				},
				{ status: 409 },
			);
		}

		const text = output.generation.text.trim();
		if (output.generation.status !== "completed" || text.length === 0) {
			await recordCodexRun(entitledSession, {
				lessonId: requestInput.lessonId,
				templateId: requestInput.templateId,
				status: "error",
				latencyMs: Date.now() - startedAt,
				errorCode: "generation_failed",
			});

			return NextResponse.json(
				{
					error:
						output.generation.errorMessage ??
						"Codex generation did not complete successfully.",
					code: "generation_failed",
				},
				{ status: 502 },
			);
		}

		await recordCodexRun(entitledSession, {
			lessonId: requestInput.lessonId,
			templateId: requestInput.templateId,
			status: "success",
			latencyMs: Date.now() - startedAt,
		});

		return NextResponse.json({
			ok: true,
			output: text,
			account: output.account,
			rateLimits: output.rateLimits,
		});
	} catch (error) {
		const authErrorResponse = getApiAuthErrorResponse(error, {
			unauthorized: "Sign in before using Codex generation.",
			forbidden: "Course access is required before using Codex generation.",
			unavailable: getCodexAppServerUnavailableMessage(),
		});
		if (authErrorResponse) {
			return authErrorResponse;
		}

		if (session && parsedInput) {
			try {
				await recordCodexRun(session, {
					lessonId: parsedInput.lessonId,
					templateId: parsedInput.templateId,
					status: "error",
					latencyMs: Date.now() - startedAt,
					errorCode: "server_error",
				});
			} catch (persistError) {
				console.error("codex run persistence error", persistError);
			}
		}

		console.error("codex generate error", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Codex generation failed.",
				code: "server_error",
			},
			{ status: 500 },
		);
	}
}
