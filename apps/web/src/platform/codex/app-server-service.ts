import "server-only";

import type {
	CodexAppServerClientOptions,
	CodexAppServerRuntimeClient,
} from "@/platform/codex/app-server-contracts";

export {
	getCodexAppServerUnavailableMessage,
	isCodexAppServerRuntimeError,
	type CodexAppServerClientOptions,
	type CodexAppServerRuntimeClient,
	type CodexRateLimitsResponse,
} from "@/platform/codex/app-server-contracts";

export async function withCodexAppServerClient<T>(
	options: CodexAppServerClientOptions,
	handler: (client: CodexAppServerRuntimeClient) => Promise<T>,
) {
	const runtime = await import(
		/* turbopackIgnore: true */ "@/platform/codex/app-server"
	);
	return await runtime.withCodexAppServerClient(options, handler);
}
