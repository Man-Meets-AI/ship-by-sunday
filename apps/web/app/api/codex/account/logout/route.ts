import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
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
		if (
			await recordBlockedSupportModeActionForRequest(request, {
				actionId: "codex.account.logout",
				blockReason: "external_side_effect_blocked",
			})
		) {
			return jsonWithRequestId(
				{ error: "Codex account logout is unavailable during support mode." },
				{ status: 403 },
				requestId,
			);
		}

		await withCodexAppServerClient(
			{
				clerkUserId: session.userId,
				requestId,
				pathname: apiRouteConfig.codexAccountLogout,
			},
			async (client) => {
				await client.logout();
			},
		);

		await upsertViewerCodexConnection(session, {
			status: "disconnected",
			account: null,
			rateLimits: null,
		});

		return jsonWithRequestId(
			{
				ok: true,
				connected: false,
			},
			undefined,
			requestId,
		);
	} catch (error) {
		const authErrorResponse = getApiAuthErrorResponse(
			error,
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
			error,
			requestId,
			pathname: apiRouteConfig.codexAccountLogout,
			source: "codex",
			defaultMessage: "Unable to disconnect Codex account.",
			capture: !isCodexAppServerRuntimeError(error),
		});
	}
}
