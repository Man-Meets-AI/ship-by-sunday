import type {
	CodexAppServerClientOptions,
	CodexAppServerRuntimeClient,
} from "@/features/codex/server/app-server-contracts";

export {
	getCodexAppServerUnavailableMessage,
	isCodexAppServerRuntimeError,
	type CodexAppServerClientOptions,
	type CodexAppServerRuntimeClient,
	type CodexRateLimitsResponse,
} from "@/features/codex/server/app-server-contracts";

export async function withCodexAppServerClient<T>(
	options: CodexAppServerClientOptions,
	handler: (client: CodexAppServerRuntimeClient) => Promise<T>,
) {
	const runtime = await import(
		/* turbopackIgnore: true */ "@/features/codex/server/app-server"
	);
	return await runtime.withCodexAppServerClient(options, handler);
}
