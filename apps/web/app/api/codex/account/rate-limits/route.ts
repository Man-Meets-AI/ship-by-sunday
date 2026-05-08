import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import {
	getCodexAppServerUnavailableMessage,
	isCodexAppServerRuntimeError,
	withCodexAppServerClient,
} from "@/platform/codex/app-server-service";
import {
	accountIsManagedChatGpt,
	getApiAuthErrorResponse,
	requireProductAccessApiSession,
	upsertViewerCodexConnection,
} from "@/app/api/codex/_server/route-helpers";
import { getUnexpectedApiErrorResponse } from "@/platform/observability/api-error-response";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/platform/observability/request-id";
import { recordBlockedSupportModeActionForRequest } from "@/platform/admin-impersonation/route-policy";

export const runtime = "nodejs";

export async function GET(request: Request) {
	const requestId = getRequestIdFromRequest(request);

	try {
		const session = await requireProductAccessApiSession();
		if (
			await recordBlockedSupportModeActionForRequest(request, {
				actionId: "codex.account.rateLimits",
				blockReason: "external_side_effect_blocked",
			})
		) {
			return jsonWithRequestId(
				{
					error: "Codex rate-limit reads are unavailable during support mode.",
				},
				{ status: 403 },
				requestId,
			);
		}

		const result = await withCodexAppServerClient(
			{
				clerkUserId: session.userId,
				requestId,
				pathname: apiRouteConfig.codexAccountRateLimits,
			},
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

		return jsonWithRequestId(result, undefined, requestId);
	} catch (error) {
		const authErrorResponse = getApiAuthErrorResponse(
			error instanceof Error ? error : String(error),
			{
				unauthorized: "Sign in before managing Codex connection.",
				forbidden:
					"Product access is required before managing Codex connection.",
				unavailable: getCodexAppServerUnavailableMessage(),
			},
			requestId,
		);
		if (authErrorResponse) {
			return authErrorResponse;
		}

		return await getUnexpectedApiErrorResponse({
			error: error instanceof Error ? error : String(error),
			requestId,
			pathname: apiRouteConfig.codexAccountRateLimits,
			source: "codex",
			defaultMessage: "Unable to read Codex rate limits.",
			capture: !(error instanceof Error && isCodexAppServerRuntimeError(error)),
		});
	}
}
