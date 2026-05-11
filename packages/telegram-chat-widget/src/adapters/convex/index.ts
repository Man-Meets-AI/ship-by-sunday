export const CONVEX_TELEGRAM_CHAT_CLIENT_RESERVED_MESSAGE =
	"createConvexTelegramChatClient is reserved for the Convex Realtime Adapter slice.";

export type ConvexTelegramChatClientOptions = {
	readonly deploymentUrl?: string;
};

export function createConvexTelegramChatClient(
	_options?: ConvexTelegramChatClientOptions,
): never {
	throw new Error(CONVEX_TELEGRAM_CHAT_CLIENT_RESERVED_MESSAGE);
}
