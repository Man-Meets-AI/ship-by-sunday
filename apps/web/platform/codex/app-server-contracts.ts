import type { JsonObject } from "@/lib/json-value";

export const CODEX_APP_SERVER_DISABLED_ERROR = "CODEX_APP_SERVER_DISABLED";

export type CodexAppServerClientOptions = {
	clerkUserId: string;
	requestId?: string | null;
	pathname?: string | null;
	timeoutMs?: number;
};

export type CodexRuntimeIncidentCode =
	| "codex_app_server_spawn_failed"
	| "codex_app_server_process_error"
	| "codex_app_server_exited"
	| "codex_app_server_bad_stdout"
	| "codex_app_server_request_timeout"
	| "codex_app_server_stdin_write_failed"
	| "codex_app_server_request_dropped"
	| "codex_app_server_stderr";

type RateLimitWindow = {
	usedPercent: number;
	windowDurationMins: number | null;
	resetsAt: number | null;
};

type RateLimitSnapshot = {
	limitId: string | null;
	limitName: string | null;
	primary: RateLimitWindow | null;
	secondary: RateLimitWindow | null;
	credits: {
		hasCredits: boolean;
		unlimited: boolean;
		balance: string;
	} | null;
	planType: string | null;
};

export type CodexRateLimitsResponse = {
	rateLimits: RateLimitSnapshot;
	rateLimitsByLimitId: Record<string, RateLimitSnapshot> | null;
};

export type CodexLoginStartResponse = {
	type: "chatgpt";
	loginId: string;
	authUrl: string;
};

export type CodexAccountResponse =
	| {
			type: "chatgpt";
			email: string;
			planType: string;
	  }
	| {
			type: "apiKey";
	  };

export type CodexTurnResult = {
	status: "completed" | "interrupted" | "failed";
	text: string;
	errorMessage: string | null;
};

export type CodexGenerationRequest = {
	prompt: string;
	model?: string | null;
	turnTimeoutMs?: number;
};

export type CodexAppServerRuntimeClient = {
	loginStartManagedChatGPT: () => Promise<CodexLoginStartResponse>;
	readAccount: (refreshToken?: boolean) => Promise<{
		account: CodexAccountResponse | null;
		requiresOpenaiAuth: boolean;
	}>;
	readRateLimits: () => Promise<CodexRateLimitsResponse>;
	logout: () => Promise<void>;
	generateText: (params: CodexGenerationRequest) => Promise<CodexTurnResult>;
};

export class CodexAppServerRuntimeError extends Error {
	constructor(
		public readonly incidentCode: CodexRuntimeIncidentCode,
		message: string,
		public readonly incidentDetails: JsonObject | null = null,
	) {
		super(message);
		this.name = incidentCode;
	}
}

export function isCodexAppServerRuntimeError(
	error: Error | null | undefined,
): error is CodexAppServerRuntimeError {
	return error instanceof CodexAppServerRuntimeError;
}

export function getCodexAppServerUnavailableMessage() {
	return "Codex app-server is disabled in this deployment. Enable it only on a runtime that can spawn the Codex binary and persist per-user state.";
}
