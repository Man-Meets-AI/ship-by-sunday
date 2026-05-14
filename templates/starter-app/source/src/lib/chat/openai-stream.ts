type OpenAIResponseError = {
  message?: string;
};

type OpenAIResponsePayload = {
  id?: string;
  output?: unknown;
  output_text?: string;
  status?: string;
  error?: OpenAIResponseError;
};

export type OpenAIStreamEvent = {
  type?: string;
  delta?: string;
  response?: OpenAIResponsePayload;
  error?: OpenAIResponseError;
};

export type OpenAIStreamState = {
  completed: boolean;
  emittedText: boolean;
  responseId?: string;
};

export function createOpenAIStreamState(): OpenAIStreamState {
  return {
    completed: false,
    emittedText: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function extractOutputTextFromOpenAIResponse(value: unknown): string {
  if (!isRecord(value)) {
    return "";
  }

  if (typeof value.output_text === "string") {
    return value.output_text;
  }

  if (!Array.isArray(value.output)) {
    return "";
  }

  return value.output
    .flatMap((item) => {
      if (!isRecord(item) || !Array.isArray(item.content)) {
        return [];
      }

      return item.content.flatMap((contentPart) => {
        if (!isRecord(contentPart)) {
          return [];
        }

        if (typeof contentPart.text === "string") {
          return [contentPart.text];
        }

        return [];
      });
    })
    .join("");
}

export function parseServerSentEventFrame(frame: string) {
  const data = frame
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trimStart())
    .join("\n")
    .trim();

  if (!data || data === "[DONE]") {
    return null;
  }

  return JSON.parse(data) as OpenAIStreamEvent;
}

function getOpenAIStreamFailureMessage(event: OpenAIStreamEvent) {
  if (event.type === "error") {
    return event.error?.message ?? "OpenAI returned a streaming error.";
  }

  if (
    event.type === "response.failed" ||
    event.type === "response.incomplete" ||
    event.type === "response.cancelled" ||
    event.response?.status === "failed" ||
    event.response?.status === "incomplete" ||
    event.response?.status === "cancelled"
  ) {
    return (
      event.response?.error?.message ??
      event.error?.message ??
      "OpenAI did not complete the streamed response."
    );
  }

  return null;
}

export async function applyOpenAIStreamEvent(args: {
  event: OpenAIStreamEvent;
  onDelta: (delta: string) => Promise<void>;
  state: OpenAIStreamState;
}) {
  const failureMessage = getOpenAIStreamFailureMessage(args.event);

  if (failureMessage) {
    throw new Error(failureMessage);
  }

  if (args.event.response?.id) {
    args.state.responseId = args.event.response.id;
  }

  if (args.event.type === "response.output_text.delta" && args.event.delta) {
    args.state.emittedText = true;
    await args.onDelta(args.event.delta);
  }

  if (args.event.type !== "response.completed") {
    return;
  }

  args.state.completed = true;

  if (!args.event.response || args.state.emittedText) {
    return;
  }

  const completedText = extractOutputTextFromOpenAIResponse(
    args.event.response,
  );

  if (completedText) {
    await args.onDelta(completedText);
  }
}

export function getCompletedOpenAIStreamResponse(state: OpenAIStreamState) {
  if (!state.completed) {
    throw new Error("OpenAI stream ended before the response completed.");
  }

  return {
    responseId: state.responseId,
  };
}
