"use client";

import { useEffect, useState } from "react";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { assert } from "@/lib/assert";
import {
	emptyConnectionState,
	getRateLimitSnapshots,
	type CodexAccount,
	type ConnectionState,
	type FeedbackState,
	type RateLimitsPayload,
	type RequestState,
} from "@/app/(protected)/_components/codex-connection-card/codex-connection-card-model";

type ErrorResponse = {
	error: string;
};

type AccountReadResponse = {
	connected: boolean;
	requiresOpenaiAuth: boolean;
	account: CodexAccount;
	rateLimits: RateLimitsPayload;
};

type LoginStartResponse = {
	ok: boolean;
	loginId: string;
	authUrl: string;
};

type PollResponse = {
	connected: boolean;
	account: CodexAccount;
	rateLimits: RateLimitsPayload;
};

type RefreshLimitsResponse = {
	connected: boolean;
	rateLimits: RateLimitsPayload;
};

function getResponseError(data: ErrorResponse | null) {
	return data?.error ?? "Unexpected Codex response.";
}

export function useCodexConnectionCard() {
	const [requestState, setRequestState] = useState<RequestState>("loading");
	const [connection, setConnection] =
		useState<ConnectionState>(emptyConnectionState);
	const [feedback, setFeedback] = useState<FeedbackState | null>(null);
	const rateLimitSnapshots = getRateLimitSnapshots(connection.rateLimits);

	useEffect(() => {
		async function loadConnection() {
			setRequestState("loading");
			setFeedback(null);

			try {
				const response = await fetch(apiRouteConfig.codexAccountRead, {
					method: "GET",
				});
				const data = (await response.json()) as
					| AccountReadResponse
					| ErrorResponse;

				if (!response.ok) {
					assert("error" in data, "Missing Codex account error message.");
					setFeedback({
						tone: "error",
						message: getResponseError(data),
					});
					return;
				}

				assert("connected" in data, "Unexpected Codex account payload.");
				setConnection((current) => ({
					...current,
					connected: data.connected,
					account: data.account,
					rateLimits: data.rateLimits,
				}));
			} catch {
				setFeedback({
					tone: "error",
					message: "Unable to load Codex account state.",
				});
			} finally {
				setRequestState("idle");
			}
		}

		void loadConnection();
	}, []);

	async function startManagedLogin() {
		setRequestState("starting_login");
		setFeedback(null);

		try {
			const response = await fetch(apiRouteConfig.codexAccountLoginStart, {
				method: "POST",
			});
			const data = (await response.json()) as
				| LoginStartResponse
				| ErrorResponse;

			if (!response.ok) {
				assert("error" in data, "Missing Codex login error message.");
				setFeedback({
					tone: "error",
					message: getResponseError(data),
				});
				return;
			}

			assert("authUrl" in data, "Missing Codex auth URL.");
			assert("loginId" in data, "Missing Codex login id.");
			setConnection((current) => ({
				...current,
				pendingLoginId: data.loginId,
			}));
			window.open(data.authUrl, "_blank", "noopener,noreferrer");
			setFeedback({
				tone: "neutral",
				message:
					"Finish login in the opened tab, then click Check login status here.",
			});
		} catch {
			setFeedback({
				tone: "error",
				message: "Unable to start Codex login.",
			});
		} finally {
			setRequestState("idle");
		}
	}

	async function pollLoginStatus() {
		setRequestState("polling");
		setFeedback(null);

		try {
			const params = new URLSearchParams();
			if (connection.pendingLoginId) {
				params.set("loginId", connection.pendingLoginId);
			}
			params.set("refresh", "true");

			const response = await fetch(
				`${apiRouteConfig.codexAccountLoginPoll}?${params.toString()}`,
				{
					method: "GET",
				},
			);
			const data = (await response.json()) as PollResponse | ErrorResponse;
			if (!response.ok) {
				assert("error" in data, "Missing Codex poll error message.");
				setFeedback({
					tone: "error",
					message: getResponseError(data),
				});
				return;
			}

			assert("connected" in data, "Unexpected Codex login payload.");
			setConnection((current) => ({
				...current,
				connected: data.connected,
				account: data.account,
				rateLimits: data.rateLimits,
				pendingLoginId: data.connected ? null : current.pendingLoginId,
			}));
			setFeedback({
				tone: "neutral",
				message: data.connected
					? "Codex account connected."
					: "Login is still pending.",
			});
		} catch {
			setFeedback({
				tone: "error",
				message: "Unable to check Codex login status.",
			});
		} finally {
			setRequestState("idle");
		}
	}

	async function refreshRateLimits() {
		setRequestState("refreshing_limits");
		setFeedback(null);

		try {
			const response = await fetch(apiRouteConfig.codexAccountRateLimits, {
				method: "GET",
			});
			const data = (await response.json()) as
				| RefreshLimitsResponse
				| ErrorResponse;
			if (!response.ok) {
				assert("error" in data, "Missing Codex rate limit error message.");
				setFeedback({
					tone: "error",
					message: getResponseError(data),
				});
				return;
			}

			assert("connected" in data, "Unexpected Codex rate limit payload.");
			setConnection((current) => ({
				...current,
				connected: data.connected,
				rateLimits: data.rateLimits,
			}));
			setFeedback({
				tone: "neutral",
				message: "Rate limits refreshed.",
			});
		} catch {
			setFeedback({
				tone: "error",
				message: "Unable to refresh Codex rate limits.",
			});
		} finally {
			setRequestState("idle");
		}
	}

	async function disconnectAccount() {
		setRequestState("disconnecting");
		setFeedback(null);

		try {
			const response = await fetch(apiRouteConfig.codexAccountLogout, {
				method: "POST",
			});
			const data = (await response.json()) as { ok: boolean } | ErrorResponse;
			if (!response.ok) {
				assert("error" in data, "Missing Codex disconnect error message.");
				setFeedback({
					tone: "error",
					message: getResponseError(data),
				});
				return;
			}

			setConnection(emptyConnectionState);
			setFeedback({
				tone: "neutral",
				message: "Codex account disconnected.",
			});
		} catch {
			setFeedback({
				tone: "error",
				message: "Unable to disconnect Codex account.",
			});
		} finally {
			setRequestState("idle");
		}
	}

	return {
		requestState,
		connection,
		feedback,
		rateLimitSnapshots,
		startManagedLogin,
		pollLoginStatus,
		refreshRateLimits,
		disconnectAccount,
	};
}
