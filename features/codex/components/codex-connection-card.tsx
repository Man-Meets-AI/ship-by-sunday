"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiRouteConfig } from "@/config/product";

type CodexAccount =
	| {
			type: "chatgpt";
			email: string;
			planType: string;
	  }
	| {
			type: "apiKey";
	  }
	| null;

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

type RateLimitsPayload = {
	rateLimits: RateLimitSnapshot;
	rateLimitsByLimitId: Record<string, RateLimitSnapshot> | null;
} | null;

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
	status: "connected" | "connecting" | "disconnected";
	account: CodexAccount;
	rateLimits: RateLimitsPayload;
};

function getApiErrorMessage(payload: unknown) {
	if (!payload || typeof payload !== "object" || !("error" in payload)) {
		return null;
	}

	const value = (payload as { error?: unknown }).error;
	return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function isAccountReadResponse(
	payload: unknown,
): payload is AccountReadResponse {
	if (!payload || typeof payload !== "object") {
		return false;
	}

	const record = payload as Record<string, unknown>;
	return "connected" in record && "account" in record;
}

function isPollResponse(payload: unknown): payload is PollResponse {
	if (!payload || typeof payload !== "object") {
		return false;
	}

	const record = payload as Record<string, unknown>;
	return "status" in record && "connected" in record;
}

function formatResetTimestamp(epochSeconds: number | null) {
	if (!epochSeconds) {
		return "n/a";
	}

	try {
		return new Date(epochSeconds * 1000).toLocaleString();
	} catch {
		return "n/a";
	}
}

function RateLimitRow({
	label,
	window,
}: {
	label: string;
	window: RateLimitWindow | null;
}) {
	if (!window) {
		return (
			<div className="grid grid-cols-[auto_1fr] gap-x-2 text-[11px] leading-relaxed text-product-muted">
				<span>{label}</span>
				<span>n/a</span>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-[auto_1fr] gap-x-2 text-[11px] leading-relaxed text-product-muted">
			<span>{label}</span>
			<span>
				{window.usedPercent}% used, resets{" "}
				{formatResetTimestamp(window.resetsAt)}
			</span>
		</div>
	);
}

export function CodexConnectionCard() {
	const [isLoading, setIsLoading] = useState(true);
	const [isStartingLogin, setIsStartingLogin] = useState(false);
	const [isPolling, setIsPolling] = useState(false);
	const [isRefreshingLimits, setIsRefreshingLimits] = useState(false);
	const [isDisconnecting, setIsDisconnecting] = useState(false);
	const [account, setAccount] = useState<CodexAccount>(null);
	const [rateLimits, setRateLimits] = useState<RateLimitsPayload>(null);
	const [connected, setConnected] = useState(false);
	const [pendingLoginId, setPendingLoginId] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<{
		tone: "neutral" | "error";
		message: string;
	} | null>(null);

	const activeRateLimits = useMemo(() => {
		if (!rateLimits) {
			return [];
		}

		const fromMap = rateLimits.rateLimitsByLimitId
			? Object.values(rateLimits.rateLimitsByLimitId)
			: [];
		if (fromMap.length > 0) {
			return fromMap;
		}

		return [rateLimits.rateLimits];
	}, [rateLimits]);

	const loadConnection = useCallback(async () => {
		setIsLoading(true);
		setFeedback(null);

		try {
			const response = await fetch(apiRouteConfig.codexAccountRead, {
				method: "GET",
			});
			const data = (await response.json().catch(() => null)) as
				| AccountReadResponse
				| { error?: string }
				| null;
			if (!response.ok) {
				setFeedback({
					tone: "error",
					message:
						getApiErrorMessage(data) ?? "Unable to load Codex account state.",
				});
				return;
			}
			if (!isAccountReadResponse(data)) {
				setFeedback({
					tone: "error",
					message: "Unexpected Codex account payload.",
				});
				return;
			}

			setAccount(data.account ?? null);
			setRateLimits(data.rateLimits ?? null);
			setConnected(Boolean(data.connected));
		} catch {
			setFeedback({
				tone: "error",
				message: "Unable to load Codex account state.",
			});
		} finally {
			setIsLoading(false);
		}
	}, []);

	async function startManagedLogin() {
		setIsStartingLogin(true);
		setFeedback(null);

		try {
			const response = await fetch(apiRouteConfig.codexAccountLoginStart, {
				method: "POST",
			});
			const data = (await response.json().catch(() => null)) as
				| LoginStartResponse
				| { error?: string }
				| null;
			if (!response.ok || !data || !("authUrl" in data) || !data.authUrl) {
				setFeedback({
					tone: "error",
					message: getApiErrorMessage(data) ?? "Unable to start Codex login.",
				});
				return;
			}

			setPendingLoginId(data.loginId);
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
			setIsStartingLogin(false);
		}
	}

	async function pollLoginStatus() {
		setIsPolling(true);
		setFeedback(null);

		try {
			const params = new URLSearchParams();
			if (pendingLoginId) {
				params.set("loginId", pendingLoginId);
			}
			params.set("refresh", "true");

			const response = await fetch(
				`${apiRouteConfig.codexAccountLoginPoll}?${params.toString()}`,
				{
					method: "GET",
				},
			);
			const data = (await response.json().catch(() => null)) as
				| PollResponse
				| { error?: string }
				| null;
			if (!response.ok) {
				setFeedback({
					tone: "error",
					message:
						getApiErrorMessage(data) ?? "Unable to check Codex login status.",
				});
				return;
			}
			if (!isPollResponse(data)) {
				setFeedback({
					tone: "error",
					message: "Unexpected Codex login payload.",
				});
				return;
			}

			setConnected(Boolean(data.connected));
			setAccount(data.account ?? null);
			setRateLimits(data.rateLimits ?? null);
			if (data.connected) {
				setPendingLoginId(null);
				setFeedback({
					tone: "neutral",
					message: "Codex account connected.",
				});
			} else {
				setFeedback({
					tone: "neutral",
					message: "Login is still pending.",
				});
			}
		} catch {
			setFeedback({
				tone: "error",
				message: "Unable to check Codex login status.",
			});
		} finally {
			setIsPolling(false);
		}
	}

	async function refreshRateLimits() {
		setIsRefreshingLimits(true);
		setFeedback(null);

		try {
			const response = await fetch(apiRouteConfig.codexAccountRateLimits, {
				method: "GET",
			});
			const data = (await response.json().catch(() => null)) as {
				connected: boolean;
				rateLimits: RateLimitsPayload;
				error?: string;
			} | null;
			if (!response.ok) {
				setFeedback({
					tone: "error",
					message:
						getApiErrorMessage(data) ?? "Unable to refresh Codex rate limits.",
				});
				return;
			}

			setConnected(Boolean(data?.connected));
			setRateLimits(data?.rateLimits ?? null);
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
			setIsRefreshingLimits(false);
		}
	}

	async function disconnectAccount() {
		setIsDisconnecting(true);
		setFeedback(null);

		try {
			const response = await fetch(apiRouteConfig.codexAccountLogout, {
				method: "POST",
			});
			const data = (await response.json().catch(() => null)) as {
				ok?: boolean;
				error?: string;
			} | null;
			if (!response.ok) {
				setFeedback({
					tone: "error",
					message:
						getApiErrorMessage(data) ?? "Unable to disconnect Codex account.",
				});
				return;
			}

			setConnected(false);
			setAccount(null);
			setRateLimits(null);
			setPendingLoginId(null);
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
			setIsDisconnecting(false);
		}
	}

	useEffect(() => {
		void loadConnection();
	}, [loadConnection]);

	return (
		<section className="rounded-none border border-product-border bg-product-surface/78 p-5 shadow-panel backdrop-blur-xl">
			<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
				Codex account
			</p>
			<h2 className="mt-3 font-display text-2xl uppercase leading-none tracking-[0.08em] text-product-text">
				Connect your subscription
			</h2>
			<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-product-muted">
				Use your own ChatGPT/Codex subscription for in-lesson generation.
			</p>

			{isLoading ? (
				<p className="mt-4 text-sm font-medium text-product-muted">
					Loading Codex connection...
				</p>
			) : (
				<div className="mt-4 space-y-4">
					<div className="rounded-none border border-product-border/70 bg-product-surface px-3 py-3">
						<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
							Status
						</p>
						<p className="mt-1 text-sm font-medium text-product-text">
							{connected ? "Connected" : "Not connected"}
						</p>
						{account?.type === "chatgpt" ? (
							<p className="mt-2 text-xs leading-relaxed text-product-muted">
								{account.email} · plan {account.planType}
							</p>
						) : null}
					</div>

					{activeRateLimits.length > 0 ? (
						<div className="rounded-none border border-product-border/70 bg-product-surface px-3 py-3">
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
								Rate limits
							</p>
							<div className="mt-2 space-y-3">
								{activeRateLimits.map((snapshot) => {
									const key = snapshot.limitId ?? "default";
									return (
										<div
											key={key}
											className="space-y-1 border-b border-product-border/50 pb-2 last:border-b-0 last:pb-0"
										>
											<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-product-text">
												{snapshot.limitName ?? snapshot.limitId ?? "default"}
											</p>
											<RateLimitRow label="Primary" window={snapshot.primary} />
											<RateLimitRow
												label="Secondary"
												window={snapshot.secondary}
											/>
										</div>
									);
								})}
							</div>
						</div>
					) : null}

					<div className="flex flex-wrap items-center gap-2">
						{connected ? (
							<>
								<button
									type="button"
									onClick={() => void refreshRateLimits()}
									disabled={isRefreshingLimits}
									className="rounded-none border border-product-border bg-product-surface px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-product-text transition-colors hover:border-product-accent hover:text-product-accent disabled:cursor-not-allowed disabled:opacity-70"
								>
									{isRefreshingLimits ? "Refreshing..." : "Refresh limits"}
								</button>
								<button
									type="button"
									onClick={() => void disconnectAccount()}
									disabled={isDisconnecting}
									className="rounded-none border border-product-border bg-product-surface px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-product-text transition-colors hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-70"
								>
									{isDisconnecting ? "Disconnecting..." : "Disconnect"}
								</button>
							</>
						) : (
							<>
								<button
									type="button"
									onClick={() => void startManagedLogin()}
									disabled={isStartingLogin}
									className="rounded-none border border-product-accent bg-product-chip px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg disabled:cursor-not-allowed disabled:opacity-70"
								>
									{isStartingLogin
										? "Opening login..."
										: "Connect Codex account"}
								</button>
								<button
									type="button"
									onClick={() => void pollLoginStatus()}
									disabled={isPolling}
									className="rounded-none border border-product-border bg-product-surface px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-product-text transition-colors hover:border-product-accent hover:text-product-accent disabled:cursor-not-allowed disabled:opacity-70"
								>
									{isPolling ? "Checking..." : "Check login status"}
								</button>
							</>
						)}
					</div>

					<div aria-live="polite" className="min-h-[1.2rem]">
						{feedback ? (
							<p
								className={`text-[11px] font-medium leading-snug ${
									feedback.tone === "error"
										? "text-danger"
										: "text-product-muted"
								}`}
							>
								{feedback.message}
							</p>
						) : null}
					</div>
				</div>
			)}
		</section>
	);
}
