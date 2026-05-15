export const DEFAULT_CHAT_MODEL_KEY = "auto";

export const chatModelOptions = [
  {
    key: "auto",
    label: "Auto",
    modelId: "gpt-5.5",
    reasoningEffort: "low",
    verbosity: "medium",
    description: "Default balanced routing for everyday product chat.",
  },
  {
    key: "instant",
    label: "Instant",
    modelId: "gpt-5.5",
    reasoningEffort: "low",
    verbosity: "low",
    description: "Shorter answers when speed matters more than depth.",
  },
  {
    key: "thinking",
    label: "Thinking",
    modelId: "gpt-5.5",
    reasoningEffort: "medium",
    verbosity: "medium",
    description: "More deliberate answers for harder prompts.",
  },
] as const;

export type ChatModelKey = (typeof chatModelOptions)[number]["key"];
export type ChatModelOption = (typeof chatModelOptions)[number];

const chatModelOptionByKey = new Map(
  chatModelOptions.map((option) => [option.key, option]),
);

export function isChatModelKey(value: string): value is ChatModelKey {
  return chatModelOptionByKey.has(value as ChatModelKey);
}

export function resolveChatModel(key: string): ChatModelOption {
  const option = chatModelOptionByKey.get(key as ChatModelKey);

  if (!option) {
    throw new Error("Unsupported chat model selection.");
  }

  return option;
}

export function getChatModelLabel(key: string) {
  return resolveChatModel(key).label;
}
