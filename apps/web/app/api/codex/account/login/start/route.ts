import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { getRateLimitedResponse } from "@/app/api/_lib/request-rate-limit";
import {
	getCodexAppServerUnavailableMessage,
	isCodexAppServerRuntimeError,
	withCodexAppServerClient,
} from "@/platform/codex/app-server-service";
import {
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

export async function POST(request: Request) {
	const requestId = getRequestIdFromRequest(request);

	try {
		const session = await requireProductAccessApiSession();
		const rateLimitedResponse = getRateLimitedResponse({
			bucket: "codex.account.login.start",
			identity: session.userId,
			request,
			limit: 3,
			windowMs: 60_000,
		});
		if (rateLimitedResponse) {
			return rateLimitedResponse;
		}

		if (
			await recordBlockedSupportModeActionForRequest(request, {
				actionId: "codex.account.login.start",
				blockReason: "external_side_effect_blocked",
			})
		) {
			return jsonWithRequestId(
				{ error: "Codex account login is unavailable during support mode." },
				{ status: 403 },
				requestId,
			);
		}

		const result = await withCodexAppServerClient(
			{
				clerkUserId: session.userId,
				requestId,
				pathname: apiRouteConfig.codexAccountLoginStart,
			},
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

		return jsonWithRequestId(
			{
				ok: true,
				loginId: result.loginId,
				authUrl: result.authUrl,
			},
			undefined,
			requestId,
		);
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
			pathname: apiRouteConfig.codexAccountLoginStart,
			source: "codex",
			defaultMessage: "Unable to start Codex account login.",
			capture: !(error instanceof Error && isCodexAppServerRuntimeError(error)),
		});
	}
}
