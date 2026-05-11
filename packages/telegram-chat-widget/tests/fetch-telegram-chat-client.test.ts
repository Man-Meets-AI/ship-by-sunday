import {
	type FetchTelegramChatFetch,
	createFetchTelegramChatClient,
} from "../src/adapters/fetch";
import { createTelegramChatTestThreadState } from "../src/testing";
import { describe, expect, it } from "vitest";

type FetchCall = {
	readonly input: RequestInfo | URL;
	readonly init: RequestInit | undefined;
};

describe("fetch telegram chat client", () => {
	it("loads the support thread through the default messages route", async () => {
		const threadState = createTelegramChatTestThreadState();
		const calls: FetchCall[] = [];
		const fetchImpl: FetchTelegramChatFetch = async (input, init) => {
			calls.push({ input, init });
			return jsonResponse(threadState);
		};

		const client = createFetchTelegramChatClient({ fetchImpl });

		await expect(client.loadThread()).resolves.toEqual(threadState);
		expect(calls).toHaveLength(1);
		expect(calls[0]?.input).toBe("/api/support/messages");
		expect(calls[0]?.init?.method).toBe("GET");
		expect(calls[0]?.init?.cache).toBe("no-store");
	});

	it("sends a text message through the current app route shape", async () => {
		const threadState = createTelegramChatTestThreadState();
		const calls: FetchCall[] = [];
		const fetchImpl: FetchTelegramChatFetch = async (input, init) => {
			calls.push({ input, init });
			return jsonResponse(threadState);
		};
		const client = createFetchTelegramChatClient({
			fetchImpl,
			messagesEndpoint: "/custom/messages",
		});

		await expect(
			client.sendMessage({
				kind: "message",
				messageText: "  I need help  ",
				pagePath: "/dashboard",
				entrySurface: "workspace_support_widget",
				attachment: null,
			}),
		).resolves.toEqual(threadState);

		expect(calls[0]?.input).toBe("/custom/messages");
		expect(calls[0]?.init?.method).toBe("POST");
		expect(readJsonBody(calls[0]?.init?.body)).toEqual({
			messageText: "I need help",
			pagePath: "/dashboard",
			entrySurface: "workspace_support_widget",
			attachment: null,
		});
	});

	it("flattens structured bug reports for today's message endpoint", async () => {
		const threadState = createTelegramChatTestThreadState();
		const calls: FetchCall[] = [];
		const fetchImpl: FetchTelegramChatFetch = async (input, init) => {
			calls.push({ input, init });
			return jsonResponse(threadState);
		};
		const client = createFetchTelegramChatClient({ fetchImpl });

		await client.sendMessage({
			kind: "bug_report",
			bugReport: {
				summary: "The publish button is inert",
				steps: "Opened the workspace and clicked Publish",
				expected: "A publish dialog opens",
				impact: "blocked",
				pagePath: "/workspace/project",
				viewport: "1280x720",
				userAgent: "Test Browser",
			},
			pagePath: "/workspace/project",
			entrySurface: "workspace_support_widget",
			attachment: null,
		});

		const requestBody = readJsonBody(calls[0]?.init?.body);
		expect(requestBody.messageText).toContain("Bug report");
		expect(requestBody.messageText).toContain(
			"What happened: The publish button is inert",
		);
		expect(requestBody.pagePath).toBe("/workspace/project");
	});

	it("prepares and uploads one screenshot before sending the message", async () => {
		const threadState = createTelegramChatTestThreadState();
		const screenshot = new File(["pixels"], " bad/path.png ", {
			type: "image/png",
		});
		const calls: FetchCall[] = [];
		const fetchImpl: FetchTelegramChatFetch = async (input, init) => {
			calls.push({ input, init });
			if (calls.length === 1) {
				return jsonResponse({
					uploadUrl: "https://uploads.example/screenshot",
				});
			}
			if (calls.length === 2) {
				return jsonResponse({ storageId: "storage_123" });
			}

			return jsonResponse(threadState);
		};
		const client = createFetchTelegramChatClient({
			fetchImpl,
			attachmentsEndpoint: "/custom/attachments",
		});

		await client.sendMessage({
			kind: "message",
			messageText: "See attached",
			pagePath: "/checkout",
			entrySurface: "homepage_support_widget",
			attachment: {
				kind: "screenshot",
				file: screenshot,
			},
		});

		expect(calls.map((call) => call.input)).toEqual([
			"/custom/attachments",
			"https://uploads.example/screenshot",
			"/api/support/messages",
		]);
		expect(readJsonBody(calls[0]?.init?.body)).toEqual({
			fileName: "bad_path.png",
			contentType: "image/png",
			size: screenshot.size,
		});
		expect(calls[1]?.init?.body).toBe(screenshot);
		expect(readJsonBody(calls[2]?.init?.body).attachment).toEqual({
			kind: "screenshot",
			fileName: "bad_path.png",
			contentType: "image/png",
			size: screenshot.size,
			storageId: "storage_123",
		});
	});

	it("propagates backend errors and rejects invalid thread responses", async () => {
		const failingClient = createFetchTelegramChatClient({
			fetchImpl: async () =>
				jsonResponse({ error: "Please wait a moment." }, { status: 429 }),
		});
		await expect(failingClient.loadThread()).rejects.toThrow(
			"Please wait a moment.",
		);

		const invalidClient = createFetchTelegramChatClient({
			fetchImpl: async () => jsonResponse({ ok: true }),
		});
		await expect(invalidClient.loadThread()).rejects.toThrow(
			"Support returned an invalid response.",
		);
	});
});

function jsonResponse(body: unknown, init?: ResponseInit) {
	return new Response(JSON.stringify(body), {
		status: init?.status ?? 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

function readJsonBody(body: BodyInit | null | undefined) {
	if (typeof body !== "string") {
		throw new Error("Expected a JSON string body.");
	}

	return JSON.parse(body) as Record<string, unknown>;
}
