import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import { apiConfig, limitConfig, productConfig } from "@/config/product";
import { captureServerError } from "@/features/observability/server/capture-server-error";

export const CODEX_APP_SERVER_DISABLED_ERROR = "CODEX_APP_SERVER_DISABLED";

type JsonRpcId = number;

type JsonRpcRequest = {
	jsonrpc: "2.0";
	id: JsonRpcId;
	method: string;
	params?: unknown;
};

type JsonRpcResponse = {
	jsonrpc: "2.0";
	id: JsonRpcId;
	result?: unknown;
	error?: {
		code: number;
		message: string;
		data?: unknown;
	};
};

type JsonRpcNotification = {
	jsonrpc: "2.0";
	method: string;
	params?: unknown;
};

type RpcMessage = JsonRpcResponse | JsonRpcNotification;

type PendingRequest = {
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
	timeout: NodeJS.Timeout;
};

type NotificationListener = (notification: JsonRpcNotification) => void;

type LoginStartResponse = {
	type: "chatgpt";
	loginId: string;
	authUrl: string;
};

type AccountResponse =
	| {
			type: "chatgpt";
			email: string;
			planType: string;
	  }
	| {
			type: "apiKey";
	  };

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

type ThreadStartResponse = {
	thread: {
		id: string;
	};
};

type TurnCompletedNotification = {
	threadId: string;
	turn: {
		status: "completed" | "interrupted" | "failed" | "inProgress";
		error: {
			message: string;
		} | null;
	};
};

type ItemCompletedNotification = {
	threadId: string;
	item: {
		type: string;
		text?: string;
	};
};

type AgentMessageDeltaNotification = {
	threadId: string;
	delta: string;
};

type ThreadReadResponse = {
	thread: {
		turns: Array<{
			status: "completed" | "interrupted" | "failed" | "inProgress";
			items: Array<{
				type: string;
				text?: string;
			}>;
			error: {
				message: string;
			} | null;
		}>;
	};
};

export type CodexTurnResult = {
	status: "completed" | "interrupted" | "failed";
	text: string;
	errorMessage: string | null;
};

type CodexAppServerClientOptions = {
	clerkUserId: string;
	requestId?: string | null;
	pathname?: string | null;
	timeoutMs?: number;
};

type CodexRuntimeIncidentCode =
	| "codex_app_server_spawn_failed"
	| "codex_app_server_process_error"
	| "codex_app_server_exited"
	| "codex_app_server_bad_stdout"
	| "codex_app_server_request_timeout"
	| "codex_app_server_stdin_write_failed"
	| "codex_app_server_request_dropped"
	| "codex_app_server_stderr";

function toErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}

function normalizeThreadTerminalStatus(
	status: string,
): "completed" | "interrupted" | "failed" {
	if (
		status === "completed" ||
		status === "interrupted" ||
		status === "failed"
	) {
		return status;
	}

	return "failed";
}

export class CodexAppServerRuntimeError extends Error {
	constructor(
		public readonly incidentCode: CodexRuntimeIncidentCode,
		message: string,
		public readonly incidentDetails: Record<string, unknown> | null = null,
	) {
		super(message);
		this.name = incidentCode;
	}
}

export function isCodexAppServerRuntimeError(
	error: unknown,
): error is CodexAppServerRuntimeError {
	return error instanceof CodexAppServerRuntimeError;
}

function isCodexAppServerEnabled() {
	const explicit = process.env.CODEX_APP_SERVER_ENABLED?.trim().toLowerCase();
	if (explicit === "true" || explicit === "1") {
		return true;
	}
	if (explicit === "false" || explicit === "0") {
		return false;
	}

	return !process.env.VERCEL;
}

export function getCodexAppServerUnavailableMessage() {
	return "Codex app-server is disabled in this deployment. Enable it only on a runtime that can spawn the Codex binary and persist per-user state.";
}

async function getCodexUserHome(clerkUserId: string) {
	const hash = createHash("sha256")
		.update(clerkUserId)
		.digest("hex")
		.slice(0, limitConfig.codexUserStateHashLength);
	const configuredRoot = process.env.CODEX_APP_SERVER_HOME_ROOT;
	const dir = configuredRoot
		? path.join(configuredRoot, hash)
		: path.join(homedir(), `.${productConfig.appId}`, "codex-user-state", hash);
	await mkdir(dir, { recursive: true });
	return dir;
}

export class CodexAppServerClient {
	private child: ChildProcessWithoutNullStreams | null = null;
	private buffer = "";
	private nextId = 1;
	private closed = false;
	private pending = new Map<number, PendingRequest>();
	private reportedRuntimeKeys = new Set<string>();
	private listeners = new Set<NotificationListener>();
	private readonly requestTimeoutMs: number;

	constructor(private readonly options: CodexAppServerClientOptions) {
		this.requestTimeoutMs = Math.max(
			limitConfig.codexAppServerRequestTimeoutMinMs,
			options.timeoutMs ?? limitConfig.codexAppServerRequestTimeoutDefaultMs,
		);
	}

	async initialize() {
		if (this.child) {
			return;
		}

		if (!isCodexAppServerEnabled()) {
			throw new Error(CODEX_APP_SERVER_DISABLED_ERROR);
		}

		const codexHome = await getCodexUserHome(this.options.clerkUserId);
		const codexBinary = process.env.CODEX_BINARY?.trim() || "codex";

		try {
			this.child = spawn(
				/* turbopackIgnore: true */ codexBinary,
				["app-server"],
				{
					stdio: ["pipe", "pipe", "pipe"],
					env: {
						...process.env,
						CODEX_HOME: codexHome,
					},
				},
			);
		} catch (error) {
			const runtimeError = this.createRuntimeError(
				"codex_app_server_spawn_failed",
				"Unable to spawn the Codex app-server.",
				{
					binary: codexBinary,
					originalMessage: toErrorMessage(error),
				},
			);
			this.reportRuntimeIncident(runtimeError);
			throw runtimeError;
		}

		this.child.stdout.setEncoding("utf8");
		this.child.stdout.on("data", (chunk: string) => {
			this.handleStdoutChunk(chunk);
		});

		this.child.stderr.setEncoding("utf8");
		this.child.stderr.on("data", (chunk: string) => {
			const stderr = chunk.trim();
			if (!stderr) {
				return;
			}

			console.warn("[codex-app-server]", stderr);
			if (shouldEscalateStderr(stderr)) {
				this.reportRuntimeIncident(
					this.createRuntimeError(
						"codex_app_server_stderr",
						"Codex app-server wrote an error to stderr.",
						{
							stderr,
						},
					),
				);
			}
		});

		this.child.on("error", (error) => {
			this.closed = true;
			const runtimeError = this.createRuntimeError(
				"codex_app_server_process_error",
				"Codex app-server process emitted an error event.",
				{
					originalMessage: toErrorMessage(error),
				},
			);
			this.reportRuntimeIncident(runtimeError);
			for (const pending of this.pending.values()) {
				clearTimeout(pending.timeout);
				pending.reject(runtimeError);
			}
			this.pending.clear();
		});

		this.child.on("exit", (code, signal) => {
			this.closed = true;
			const runtimeError = this.createRuntimeError(
				"codex_app_server_exited",
				`Codex app-server exited (code=${code ?? "null"}, signal=${signal ?? "null"}).`,
				{
					code: code ?? null,
					signal: signal ?? null,
				},
			);
			this.reportRuntimeIncident(runtimeError);
			for (const [id, pending] of this.pending.entries()) {
				clearTimeout(pending.timeout);
				pending.reject(
					this.createRuntimeError(
						"codex_app_server_exited",
						`${runtimeError.message} Pending request id=${id}.`,
						{
							code: code ?? null,
							signal: signal ?? null,
							pendingRequestId: id,
						},
					),
				);
			}
			this.pending.clear();
		});

		await this.request("initialize", {
			clientInfo: {
				name: productConfig.appId,
				title: productConfig.name,
				version: apiConfig.codexAppServerClientVersion,
			},
			capabilities: {
				experimentalApi: true,
			},
		});
	}

	private handleStdoutChunk(chunk: string) {
		this.buffer += chunk;
		let newlineIndex = this.buffer.indexOf("\n");
		while (newlineIndex >= 0) {
			const line = this.buffer.slice(0, newlineIndex).trim();
			this.buffer = this.buffer.slice(newlineIndex + 1);
			newlineIndex = this.buffer.indexOf("\n");
			if (!line) {
				continue;
			}

			let message: RpcMessage;
			try {
				message = JSON.parse(line) as RpcMessage;
			} catch {
				console.warn("[codex-app-server] non-json line:", line);
				this.reportRuntimeIncident(
					this.createRuntimeError(
						"codex_app_server_bad_stdout",
						"Codex app-server emitted a non-JSON stdout line.",
						{
							line,
						},
					),
				);
				continue;
			}

			if ("id" in message) {
				const pending = this.pending.get(message.id);
				if (!pending) {
					continue;
				}
				clearTimeout(pending.timeout);
				this.pending.delete(message.id);
				if (message.error) {
					pending.reject(
						new Error(
							`${message.error.message} (rpc code ${message.error.code})`,
						),
					);
				} else {
					pending.resolve(message.result);
				}
				continue;
			}

			if ("method" in message) {
				for (const listener of this.listeners) {
					listener(message);
				}
			}
		}
	}

	private async request<T = unknown>(
		method: string,
		params?: unknown,
	): Promise<T> {
		if (!this.child || this.closed) {
			throw new Error("Codex app-server is not running.");
		}

		const id = this.nextId++;
		const request: JsonRpcRequest = {
			jsonrpc: "2.0",
			id,
			method,
			params,
		};

		const payload = `${JSON.stringify(request)}\n`;

		return await new Promise<T>((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				const runtimeError = this.createRuntimeError(
					"codex_app_server_request_timeout",
					`Timed out waiting for codex app-server response (${method}).`,
					{
						method,
					},
				);
				this.reportRuntimeIncident(runtimeError);
				reject(runtimeError);
			}, this.requestTimeoutMs);

			this.pending.set(id, {
				resolve: (value) => resolve(value as T),
				reject,
				timeout,
			});

			const child = this.child;
			if (!child) {
				clearTimeout(timeout);
				this.pending.delete(id);
				const runtimeError = this.createRuntimeError(
					"codex_app_server_request_dropped",
					"Codex app-server exited before the request was sent.",
					{
						method,
					},
				);
				this.reportRuntimeIncident(runtimeError);
				reject(runtimeError);
				return;
			}

			child.stdin.write(payload, (error) => {
				if (!error) {
					return;
				}

				clearTimeout(timeout);
				this.pending.delete(id);
				const runtimeError = this.createRuntimeError(
					"codex_app_server_stdin_write_failed",
					`Failed to write request to the Codex app-server (${method}).`,
					{
						method,
						originalMessage: toErrorMessage(error),
					},
				);
				this.reportRuntimeIncident(runtimeError);
				reject(runtimeError);
			});
		});
	}

	onNotification(listener: NotificationListener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	async loginStartManagedChatGPT() {
		const response = await this.request<LoginStartResponse>(
			"account/login/start",
			{ type: "chatgpt" },
		);

		if (response.type !== "chatgpt") {
			throw new Error("Unexpected login response type from Codex app-server.");
		}

		return response;
	}

	async cancelLogin(loginId: string) {
		return await this.request<{ status: string }>("account/login/cancel", {
			loginId,
		});
	}

	async readAccount(refreshToken = false) {
		const result = await this.request<{
			account: AccountResponse | null;
			requiresOpenaiAuth: boolean;
		}>("account/read", { refreshToken });

		return result;
	}

	async readRateLimits() {
		return await this.request<CodexRateLimitsResponse>(
			"account/rateLimits/read",
			undefined,
		);
	}

	async logout() {
		await this.request("account/logout", undefined);
	}

	async generateText({
		prompt,
		model,
		turnTimeoutMs = 60_000,
	}: {
		prompt: string;
		model?: string | null;
		turnTimeoutMs?: number;
	}) {
		const threadParams: Record<string, unknown> = {
			experimentalRawEvents: false,
			persistExtendedHistory: false,
		};
		if (model) {
			threadParams.model = model;
		}

		const threadResponse = await this.request<ThreadStartResponse>(
			"thread/start",
			threadParams,
		);
		const threadId = threadResponse.thread.id;

		let streamedDelta = "";
		const completedMessages: string[] = [];

		const turnPromise = new Promise<CodexTurnResult>((resolve, reject) => {
			const timeout = setTimeout(() => {
				off();
				reject(
					new Error("Timed out waiting for Codex generation to complete."),
				);
			}, turnTimeoutMs);

			const off = this.onNotification((notification) => {
				if (
					notification.method === "item/agentMessage/delta" &&
					(notification.params as AgentMessageDeltaNotification)?.threadId ===
						threadId
				) {
					streamedDelta +=
						(notification.params as AgentMessageDeltaNotification).delta ?? "";
					return;
				}

				if (
					notification.method === "item/completed" &&
					(notification.params as ItemCompletedNotification)?.threadId ===
						threadId
				) {
					const item = (notification.params as ItemCompletedNotification).item;
					if (item?.type === "agentMessage" && typeof item.text === "string") {
						completedMessages.push(item.text);
					}
					return;
				}

				if (
					notification.method === "turn/completed" &&
					(notification.params as TurnCompletedNotification)?.threadId ===
						threadId
				) {
					const params = notification.params as TurnCompletedNotification;
					const terminalStatus = normalizeThreadTerminalStatus(
						params.turn.status,
					);
					const mergedText =
						completedMessages.join("\n\n").trim() || streamedDelta.trim();
					clearTimeout(timeout);
					off();
					resolve({
						status: terminalStatus,
						text: mergedText,
						errorMessage: params.turn.error?.message ?? null,
					});
				}
			});
		});

		await this.request("turn/start", {
			threadId,
			input: [
				{
					type: "text",
					text: prompt,
					text_elements: [],
				},
			],
		});

		let result = await turnPromise;

		if (!result.text) {
			try {
				const threadState = await this.request<ThreadReadResponse>(
					"thread/read",
					{
						threadId,
						includeTurns: true,
					},
				);
				const turns = threadState.thread.turns;
				const lastTurn = turns[turns.length - 1];
				const fallback = (lastTurn?.items ?? [])
					.filter((item) => item.type === "agentMessage")
					.map((item) => item.text ?? "")
					.join("\n\n")
					.trim();
				if (fallback) {
					result = {
						...result,
						text: fallback,
					};
				}
			} catch (error) {
				console.warn("[codex-app-server] thread/read fallback failed:", error);
			}
		}

		return result;
	}

	async close() {
		if (!this.child || this.closed) {
			return;
		}

		const child = this.child;

		await new Promise<void>((resolve) => {
			let settled = false;
			const settle = () => {
				if (settled) {
					return;
				}
				settled = true;
				resolve();
			};

			child.once("exit", () => {
				this.closed = true;
				settle();
			});

			child.kill("SIGTERM");

			setTimeout(() => {
				if (!settled) {
					child.kill("SIGKILL");
				}
			}, 2_000);

			setTimeout(() => {
				settle();
			}, 3_000);
		});
	}

	private createRuntimeError(
		incidentCode: CodexRuntimeIncidentCode,
		message: string,
		incidentDetails: Record<string, unknown> | null = null,
	) {
		return new CodexAppServerRuntimeError(
			incidentCode,
			message,
			incidentDetails,
		);
	}

	private reportRuntimeIncident(error: CodexAppServerRuntimeError) {
		const incidentKey = JSON.stringify([
			error.incidentCode,
			error.message,
			error.incidentDetails,
		]);
		if (this.reportedRuntimeKeys.has(incidentKey)) {
			return;
		}
		this.reportedRuntimeKeys.add(incidentKey);

		void captureServerError({
			source: "codex",
			error,
			requestId: this.options.requestId,
			pathname: this.options.pathname,
			userId: this.options.clerkUserId,
			code: error.incidentCode,
			severity: "high",
			surface: "runtime_error",
			details: error.incidentDetails,
		});
	}
}

export async function withCodexAppServerClient<T>(
	options: CodexAppServerClientOptions,
	handler: (client: CodexAppServerClient) => Promise<T>,
) {
	const client = new CodexAppServerClient(options);
	try {
		await client.initialize();
		return await handler(client);
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}

		throw new Error(toErrorMessage(error));
	} finally {
		await client.close();
	}
}

function shouldEscalateStderr(stderr: string) {
	return /\b(error|fatal|panic|exception|enoent)\b/i.test(stderr);
}
