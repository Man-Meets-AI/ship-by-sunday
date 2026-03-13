import { auth } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import type { CodexRateLimitsResponse } from "@/lib/codex/app-server";
import { serverEnv } from "@/lib/env/server";

type ManagedChatGptAccount = {
	type: "chatgpt";
	email: string;
	planType: string;
};

type CodexAccount = ManagedChatGptAccount | { type: "apiKey" } | null;

export type ApiSession = {
	userId: string;
	token: string;
};

export function getCodexTurnTimeoutMs() {
	const parsed = Number.parseInt(
		serverEnv.CODEX_APP_SERVER_TIMEOUT_MS ?? "",
		10,
	);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return 60_000;
	}

	return parsed;
}

export function getCodexDefaultModel() {
	return serverEnv.CODEX_APP_SERVER_MODEL ?? null;
}

export async function requireApiSession(): Promise<ApiSession> {
	const authState = await auth();
	if (!authState.userId) {
		throw new Error("UNAUTHORIZED");
	}

	const token = await authState.getToken();
	if (!token) {
		throw new Error("UNAUTHORIZED");
	}

	return {
		userId: authState.userId,
		token,
	};
}

export function accountIsManagedChatGpt(
	account: CodexAccount,
): account is ManagedChatGptAccount {
	return Boolean(account && account.type === "chatgpt");
}

export async function upsertViewerCodexConnection(
	session: ApiSession,
	params: {
		status: "connecting" | "connected" | "disconnected" | "error";
		account: CodexAccount;
		rateLimits?: CodexRateLimitsResponse | null;
	},
) {
	const accountId = accountIsManagedChatGpt(params.account)
		? params.account.email
		: undefined;
	const planType = accountIsManagedChatGpt(params.account)
		? params.account.planType
		: undefined;
	const connectedAt =
		params.status === "connected"
			? Date.now()
			: params.status === "connecting"
				? undefined
				: undefined;

	return await fetchMutation(
		api.codex.upsertViewerConnection,
		{
			authMode: "managed_chatgpt",
			status: params.status,
			accountId,
			planType,
			connectedAt,
			lastRateLimitSnapshot: params.rateLimits?.rateLimitsByLimitId ?? null,
		},
		{
			token: session.token,
		},
	);
}

export async function recordCodexRun(
	session: ApiSession,
	params: {
		lessonId?: string;
		templateId: string;
		status: "success" | "error";
		latencyMs?: number;
		errorCode?: string;
	},
) {
	return await fetchMutation(
		api.codex.recordRun,
		{
			lessonId: params.lessonId,
			templateId: params.templateId,
			status: params.status,
			latencyMs: params.latencyMs,
			errorCode: params.errorCode,
		},
		{
			token: session.token,
		},
	);
}
