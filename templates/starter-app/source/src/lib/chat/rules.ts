import {
  DEFAULT_CHAT_MODEL_KEY,
  resolveChatModel,
  type ChatModelKey,
} from "@/lib/chat/models";

const FREE_PLAN_ASSISTANT_MESSAGE_LIMIT = 25;
const MAX_PROMPT_LENGTH = 8000;
const MAX_CONVERSATION_TITLE_LENGTH = 64;

export function getDefaultChatModelKey(): ChatModelKey {
  return DEFAULT_CHAT_MODEL_KEY;
}

export function getFreePlanAssistantMessageLimit() {
  return FREE_PLAN_ASSISTANT_MESSAGE_LIMIT;
}

export function normalizeChatPrompt(args: { prompt: string }) {
  const prompt = args.prompt.trim();

  if (!prompt) {
    throw new Error("A message is required.");
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(
      `Messages are limited to ${MAX_PROMPT_LENGTH.toLocaleString()} characters.`,
    );
  }

  return prompt;
}

export function normalizeConversationTitle(args: { title: string }) {
  const title = args.title.replace(/\s+/g, " ").trim();

  if (!title) {
    throw new Error("A conversation title is required.");
  }

  return title.slice(0, MAX_CONVERSATION_TITLE_LENGTH);
}

export function titleFromPrompt(prompt: string) {
  const normalizedPrompt = prompt.replace(/\s+/g, " ").trim();

  if (!normalizedPrompt) {
    return "New chat";
  }

  if (normalizedPrompt.length <= MAX_CONVERSATION_TITLE_LENGTH) {
    return normalizedPrompt;
  }

  return `${normalizedPrompt.slice(0, MAX_CONVERSATION_TITLE_LENGTH - 3)}...`;
}

export function resolveRequestedChatModel(modelKey: string) {
  return resolveChatModel(modelKey);
}

export function assertAssistantMessageAllowed(args: {
  completedAssistantMessageCount: number;
  hasUnlimitedChat: boolean;
}) {
  if (
    !args.hasUnlimitedChat &&
    args.completedAssistantMessageCount >= FREE_PLAN_ASSISTANT_MESSAGE_LIMIT
  ) {
    throw new Error(
      `Free workspaces are limited to ${FREE_PLAN_ASSISTANT_MESSAGE_LIMIT} assistant messages.`,
    );
  }
}
