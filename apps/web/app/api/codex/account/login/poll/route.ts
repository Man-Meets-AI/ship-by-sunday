import { apiRouteConfig } from "@/config/product";
import {
	accountIsManagedChatGpt,
	getApiAuthErrorResponse,
	requireProductAccessApiSession,
	upsertViewerCodexConnection,
} from "@/features/codex/server/route-helpers";
import { getUnexpectedApiErrorResponse } from "@/features/observability/server/api-error-response";
import {
	getRequestIdFromRequest,
	jsonWithRequestId,
} from "@/features/observability/server/request-id";

export const runtime = "nodejs";

async function importCodexAppServer() {
	return import(
		/* turbopackIgnore: true */ "@/features/codex/server/app-server"
	);
}

export async function GET(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	const codexAppServer = await importCodexAppServer();

	try {
		const session = await requireProductAccessApiSession();
		const url = new URL(request.url);
		const loginId = url.searchParams.get("loginId");
		const refresh = url.searchParams.get("refresh");
		const shouldRefreshToken = refresh === "1" || refresh === "true";

		const result = await codexAppServer.withCodexAppServerClient(
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
			error,
			{
				unauthorized: "Sign in before managing Codex connection.",
				forbidden:
					"Product access is required before managing Codex connection.",
				unavailable: codexAppServer.getCodexAppServerUnavailableMessage(),
			},
			requestId,
		);
		if (authErrorResponse) {
			return authErrorResponse;
		}

		return await getUnexpectedApiErrorResponse({
			error,
			requestId,
			pathname: apiRouteConfig.codexAccountLoginPoll,
			source: "codex",
			defaultMessage: "Unable to poll Codex login state.",
			capture: !codexAppServer.isCodexAppServerRuntimeError(error),
		});
	}
}
