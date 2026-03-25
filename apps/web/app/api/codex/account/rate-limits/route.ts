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
	return import(/* turbopackIgnore: true */ "@/features/codex/server/app-server");
}

export async function GET(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	const codexAppServer = await importCodexAppServer();

	try {
		const session = await requireProductAccessApiSession();

		const result = await codexAppServer.withCodexAppServerClient(
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
			pathname: apiRouteConfig.codexAccountRateLimits,
			source: "codex",
			defaultMessage: "Unable to read Codex rate limits.",
			capture: !codexAppServer.isCodexAppServerRuntimeError(error),
		});
	}
}
