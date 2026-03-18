import { auth } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";

import { apiConfig, limitConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import type { CodexRateLimitsResponse } from "@/features/codex/server/app-server";
import { serverEnv } from "@/platform/env/server";

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

type ViewerAccess = {
	hasAccess: boolean;
	status: string;
};

type AuthErrorCopy = {
	unauthorized: string;
	forbidden: string;
	unavailable: string;
};

export const API_UNAUTHORIZED_ERROR = "UNAUTHORIZED";
export const API_FORBIDDEN_ERROR = "FORBIDDEN";

export function getCodexTurnTimeoutMs() {
	const parsed = Number.parseInt(
		serverEnv.CODEX_APP_SERVER_TIMEOUT_MS ?? "",
		10,
	);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return limitConfig.codexTurnTimeoutDefaultMs;
	}

	return parsed;
}

export function getCodexDefaultModel() {
	return serverEnv.CODEX_APP_SERVER_MODEL ?? null;
}

export async function requireApiSession(): Promise<ApiSession> {
	const authState = await auth();
	if (!authState.userId) {
		throw new Error(API_UNAUTHORIZED_ERROR);
	}

	const token = await authState.getToken({
		template: apiConfig.convexAuthTokenTemplate,
	});
	if (!token) {
		throw new Error(API_UNAUTHORIZED_ERROR);
	}

	return {
		userId: authState.userId,
		token,
	};
}

export async function requireEntitledApiSession(): Promise<ApiSession> {
	const session = await requireApiSession();
	const access = (await fetchQuery(
		api.course.viewerAccess,
		{},
		{
			token: session.token,
		},
	)) as ViewerAccess;

	if (!access.hasAccess) {
		throw new Error(API_FORBIDDEN_ERROR);
	}

	return session;
}

export function getApiAuthErrorResponse(error: unknown, copy: AuthErrorCopy) {
	if (!(error instanceof Error)) {
		return null;
	}

	if (error.message === API_UNAUTHORIZED_ERROR) {
		return NextResponse.json({ error: copy.unauthorized }, { status: 401 });
	}

	if (error.message === API_FORBIDDEN_ERROR) {
		return NextResponse.json({ error: copy.forbidden }, { status: 403 });
	}

	if (error.message === "CODEX_APP_SERVER_DISABLED") {
		return NextResponse.json({ error: copy.unavailable }, { status: 503 });
	}

	return null;
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
