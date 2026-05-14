import {
	applyOpenAIStreamEvent,
	createOpenAIStreamState,
	getCompletedOpenAIStreamResponse,
	parseServerSentEventFrame,
} from "../../../templates/starter-app/source/src/lib/chat/openai-stream";

describe("starter chat OpenAI stream handling", () => {
	it("requires a completed response before returning stream success", async () => {
		const deltas: string[] = [];
		const state = createOpenAIStreamState();

		await applyOpenAIStreamEvent({
			event: {
				response: { id: "resp_partial" },
				type: "response.created",
			},
			onDelta: async (delta) => {
				deltas.push(delta);
			},
			state,
		});
		await applyOpenAIStreamEvent({
			event: {
				delta: "partial",
				type: "response.output_text.delta",
			},
			onDelta: async (delta) => {
				deltas.push(delta);
			},
			state,
		});

		expect(() => getCompletedOpenAIStreamResponse(state)).toThrow(
			/OpenAI stream ended before the response completed/,
		);
		expect(deltas).toEqual(["partial"]);
	});

	it("rejects failed response events instead of treating them as complete", async () => {
		const state = createOpenAIStreamState();

		await expect(
			applyOpenAIStreamEvent({
				event: {
					response: {
						error: { message: "The model failed while streaming." },
						id: "resp_failed",
						status: "failed",
					},
					type: "response.failed",
				},
				onDelta: async () => {},
				state,
			}),
		).rejects.toThrow("The model failed while streaming.");
		expect(() => getCompletedOpenAIStreamResponse(state)).toThrow(
			/OpenAI stream ended before the response completed/,
		);
	});

	it("returns the completed response id after a successful stream", async () => {
		const deltas: string[] = [];
		const state = createOpenAIStreamState();

		await applyOpenAIStreamEvent({
			event: {
				delta: "hello",
				type: "response.output_text.delta",
			},
			onDelta: async (delta) => {
				deltas.push(delta);
			},
			state,
		});
		await applyOpenAIStreamEvent({
			event: {
				response: {
					id: "resp_completed",
					output_text: "fallback text",
					status: "completed",
				},
				type: "response.completed",
			},
			onDelta: async (delta) => {
				deltas.push(delta);
			},
			state,
		});

		expect(getCompletedOpenAIStreamResponse(state)).toEqual({
			responseId: "resp_completed",
		});
		expect(deltas).toEqual(["hello"]);
	});

	it("parses CRLF server-sent event frames", () => {
		expect(
			parseServerSentEventFrame(
				'event: response.completed\r\ndata: {"type":"response.completed","response":{"id":"resp_123"}}',
			),
		).toEqual({
			response: { id: "resp_123" },
			type: "response.completed",
		});
	});
});
