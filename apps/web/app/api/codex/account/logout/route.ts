import { apiRouteConfig } from "@/config/product";
import {
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

export async function POST(request: Request) {
	const requestId = getRequestIdFromRequest(request);
	const codexAppServer = await importCodexAppServer();

	try {
		const session = await requireProductAccessApiSession();

		await codexAppServer.withCodexAppServerClient(
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
			pathname: apiRouteConfig.codexAccountLogout,
			source: "codex",
			defaultMessage: "Unable to disconnect Codex account.",
			capture: !codexAppServer.isCodexAppServerRuntimeError(error),
		});
	}
}
