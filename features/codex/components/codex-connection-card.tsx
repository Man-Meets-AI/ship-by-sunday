"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiRouteConfig } from "@/config/product";
import { assert } from "@/features/course/lesson/lib/assert";

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
	account: CodexAccount;
	rateLimits: RateLimitsPayload;
};

type ErrorResponse = {
	error: string;
};

type RequestState =
	| "loading"
	| "idle"
	| "starting_login"
	| "polling"
	| "refreshing_limits"
	| "disconnecting";

type ConnectionState = {
	connected: boolean;
	account: CodexAccount;
	rateLimits: RateLimitsPayload;
	pendingLoginId: string | null;
};

const emptyConnectionState: ConnectionState = {
	connected: false,
	account: null,
	rateLimits: null,
	pendingLoginId: null,
};

function getRateLimitSnapshots(rateLimits: RateLimitsPayload) {
	if (!rateLimits) {
		return [];
	}

	if (rateLimits.rateLimitsByLimitId) {
		return Object.values(rateLimits.rateLimitsByLimitId);
	}

	return [rateLimits.rateLimits];
}

function formatResetTimestamp(epochSeconds: number | null) {
	if (!epochSeconds) {
		return "n/a";
	}

	return new Date(epochSeconds * 1000).toLocaleString();
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
	const [requestState, setRequestState] = useState<RequestState>("loading");
	const [connection, setConnection] =
		useState<ConnectionState>(emptyConnectionState);
	const [feedback, setFeedback] = useState<{
		tone: "neutral" | "error";
		message: string;
	} | null>(null);
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
						message: data.error,
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
					message: data.error,
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
					message: data.error,
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
			if (data.connected) {
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
				| {
						connected: boolean;
						rateLimits: RateLimitsPayload;
				  }
				| ErrorResponse;
			if (!response.ok) {
				assert("error" in data, "Missing Codex rate limit error message.");
				setFeedback({
					tone: "error",
					message: data.error,
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
					message: data.error,
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

			{requestState === "loading" ? (
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
							{connection.connected ? "Connected" : "Not connected"}
						</p>
						{connection.account?.type === "chatgpt" ? (
							<p className="mt-2 text-xs leading-relaxed text-product-muted">
								{connection.account.email} · plan {connection.account.planType}
							</p>
						) : null}
					</div>

					{rateLimitSnapshots.length > 0 ? (
						<div className="rounded-none border border-product-border/70 bg-product-surface px-3 py-3">
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
								Rate limits
							</p>
							<div className="mt-2 space-y-3">
								{rateLimitSnapshots.map((snapshot) => {
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
						{connection.connected ? (
							<>
								<Button
									type="button"
									onClick={() => void refreshRateLimits()}
									disabled={requestState === "refreshing_limits"}
									variant="outline"
									size="default"
								>
									{requestState === "refreshing_limits"
										? "Refreshing..."
										: "Refresh limits"}
								</Button>
								<Button
									type="button"
									onClick={() => void disconnectAccount()}
									disabled={requestState === "disconnecting"}
									variant="destructive"
									size="default"
								>
									{requestState === "disconnecting"
										? "Disconnecting..."
										: "Disconnect"}
								</Button>
							</>
						) : (
							<>
								<Button
									type="button"
									onClick={() => void startManagedLogin()}
									disabled={requestState === "starting_login"}
									variant="secondary"
									size="default"
								>
									{requestState === "starting_login"
										? "Opening login..."
										: "Connect Codex account"}
								</Button>
								<Button
									type="button"
									onClick={() => void pollLoginStatus()}
									disabled={requestState === "polling"}
									variant="outline"
									size="default"
								>
									{requestState === "polling"
										? "Checking..."
										: "Check login status"}
								</Button>
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
