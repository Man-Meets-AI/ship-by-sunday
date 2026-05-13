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
				actionId: "codex.account.login.poll",
				blockReason: "external_side_effect_blocked",
			})
		) {
			return jsonWithRequestId(
				{ error: "Codex login polling is unavailable during support mode." },
				{ status: 403 },
				requestId,
			);
		}
		const url = new URL(request.url);
		const loginId = url.searchParams.get("loginId");
		const refresh = url.searchParams.get("refresh");
		const shouldRefreshToken = refresh === "1" || refresh === "true";

		const result = await withCodexAppServerClient(
			{
				clerkUserId: session.userId,
				requestId,
				pathname: apiRouteConfig.codexAccountLoginPoll,
			},
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
			pathname: apiRouteConfig.codexAccountLoginPoll,
			source: "codex",
			defaultMessage: "Unable to poll Codex login state.",
			capture: !(error instanceof Error && isCodexAppServerRuntimeError(error)),
		});
	}
}
