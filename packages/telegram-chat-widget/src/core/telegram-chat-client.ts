import type {
	TelegramChatBugReportPayload,
	TelegramChatEntrySurface,
	TelegramChatThreadState,
} from "./telegram-chat-types";

export type TelegramChatOutgoingScreenshot = {
	readonly kind: "screenshot";
	readonly file: File;
};

type TelegramChatSendBaseInput = {
	readonly pagePath: string;
	readonly entrySurface: TelegramChatEntrySurface;
	readonly attachment?: TelegramChatOutgoingScreenshot | null;
};

export type TelegramChatSendTextInput = TelegramChatSendBaseInput & {
	readonly kind: "message";
	readonly messageText: string;
};

export type TelegramChatSendBugReportInput = TelegramChatSendBaseInput & {
	readonly kind: "bug_report";
	readonly bugReport: TelegramChatBugReportPayload;
};

export type TelegramChatSendInput =
	| TelegramChatSendTextInput
	| TelegramChatSendBugReportInput;

export type TelegramChatClient = {
	readonly loadThread: () => Promise<TelegramChatThreadState>;
	readonly sendMessage: (
		input: TelegramChatSendInput,
	) => Promise<TelegramChatThreadState>;
};

export type TelegramChatRealtimeState =
	| {
			readonly status: "unavailable";
	  }
	| {
			readonly status: "loading";
	  }
	| {
			readonly status: "ready";
			readonly threadState: TelegramChatThreadState;
	  }
	| {
			readonly status: "error";
			readonly errorMessage: string;
	  };
