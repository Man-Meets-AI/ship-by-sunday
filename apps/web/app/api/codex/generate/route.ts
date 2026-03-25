import { z } from "zod";

import { apiRouteConfig } from "@/config/product";
import {
	accountIsManagedChatGpt,
	getApiAuthErrorResponse,
	getCodexDefaultModel,
	getCodexTurnTimeoutMs,
	recordCodexRun,
	requireProductAccessApiSession,
	upsertViewerCodexConnection,
} from "@/features/codex/server/route-helpers";
import { captureServerError } from "@/features/observability/server/capture-server-error";
import { getUnexpectedApiErrorResponse } from "@/features/observability/server/api-error-response";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/features/observability/server/request-id";

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

async function importCodexAppServer() {
	return import(
		/* turbopackIgnore: true */ "@/features/codex/server/app-server"
	);
}

export async function POST(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	const codexAppServer = await importCodexAppServer();
	let parsedInput: z.infer<typeof generateRequestSchema> | null = null;
	let session: {
		userId: string;
		token: string;
	} | null = null;
	const startedAt = Date.now();

	try {
		const productAccessSession = await requireProductAccessApiSession();
		session = productAccessSession;
		const body = (await request.json().catch(() => null)) as unknown;
		const parsed = generateRequestSchema.safeParse(body);
		if (!parsed.success) {
			return jsonWithRequestId(
				{ error: "Invalid generation payload." },
				{ status: 400 },
				requestId,
			);
		}
		const requestInput = parsed.data;
		parsedInput = requestInput;

		const output = await codexAppServer.withCodexAppServerClient(
			{
				clerkUserId: productAccessSession.userId,
				requestId,
				pathname: apiRouteConfig.codexGenerate,
			},
			async (client) => {
				const accountResult = await client.readAccount(false);
				const account = accountResult.account ?? null;

				if (!accountIsManagedChatGpt(account)) {
					await upsertViewerCodexConnection(productAccessSession, {
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

				await upsertViewerCodexConnection(productAccessSession, {
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
			await recordCodexRun(productAccessSession, {
				lessonId: requestInput.lessonId,
				templateId: requestInput.templateId,
				status: "error",
				latencyMs: Date.now() - startedAt,
				errorCode: "account_not_connected",
			});

			return jsonWithRequestId(
				{
					error: output.error,
					code: "account_not_connected",
				},
				{ status: 409 },
				requestId,
			);
		}

		const text = output.generation.text.trim();
		if (output.generation.status !== "completed" || text.length === 0) {
			await recordCodexRun(productAccessSession, {
				lessonId: requestInput.lessonId,
				templateId: requestInput.templateId,
				status: "error",
				latencyMs: Date.now() - startedAt,
				errorCode: "generation_failed",
			});

			return jsonWithRequestId(
				{
					error:
						output.generation.errorMessage ??
						"Codex generation did not complete successfully.",
					code: "generation_failed",
					requestId,
				},
				{ status: 502 },
				requestId,
			);
		}

		await recordCodexRun(productAccessSession, {
			lessonId: requestInput.lessonId,
			templateId: requestInput.templateId,
			status: "success",
			latencyMs: Date.now() - startedAt,
		});

		return jsonWithRequestId(
			{
				ok: true,
				output: text,
				account: output.account,
				rateLimits: output.rateLimits,
			},
			undefined,
			requestId,
		);
	} catch (error) {
		const authErrorResponse = getApiAuthErrorResponse(
			error,
			{
				unauthorized: "Sign in before using Codex generation.",
				forbidden: "Product access is required before using Codex generation.",
				unavailable: codexAppServer.getCodexAppServerUnavailableMessage(),
			},
			requestId,
		);
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
				await captureServerError({
					source: "codex",
					error: persistError,
					requestId,
					pathname: apiRouteConfig.codexGenerate,
					userId: session.userId,
					code: "codex_run_persistence_error",
				});
			}
		}

		return await getUnexpectedApiErrorResponse({
			error,
			requestId,
			pathname: apiRouteConfig.codexGenerate,
			source: "codex",
			defaultMessage: "Codex generation failed.",
			userId: session?.userId ?? null,
			capture: !codexAppServer.isCodexAppServerRuntimeError(error),
		});
	}
}
