import { describe, expect, it } from "vitest";

import {
  assertAssistantMessageAllowed,
  getDefaultChatModelKey,
  getFreePlanAssistantMessageLimit,
  normalizeChatPrompt,
  normalizeConversationTitle,
  resolveRequestedChatModel,
  titleFromPrompt,
} from "@/lib/chat/rules";

describe("chat rules", () => {
  it("normalizes prompts and titles", () => {
    expect(normalizeChatPrompt({ prompt: "  build me a launch plan  " })).toBe(
      "build me a launch plan",
    );
    expect(normalizeConversationTitle({ title: "  Launch   plan  " })).toBe(
      "Launch plan",
    );
  });

  it("rejects empty prompts and titles", () => {
    expect(() => normalizeChatPrompt({ prompt: "   " })).toThrow(
      /message is required/i,
    );
    expect(() => normalizeConversationTitle({ title: "   " })).toThrow(
      /title is required/i,
    );
  });

  it("creates bounded titles from the first prompt", () => {
    expect(titleFromPrompt("What should I build next?")).toBe(
      "What should I build next?",
    );
    expect(titleFromPrompt("a".repeat(120))).toHaveLength(64);
  });

  it("uses an app-owned model allowlist", () => {
    expect(getDefaultChatModelKey()).toBe("auto");
    expect(resolveRequestedChatModel("auto")).toMatchObject({
      label: "Auto",
      modelId: "gpt-5.5",
    });
    expect(() => resolveRequestedChatModel("custom-model")).toThrow(
      /unsupported chat model/i,
    );
  });

  it("enforces the free assistant message limit", () => {
    expect(getFreePlanAssistantMessageLimit()).toBe(25);
    expect(() =>
      assertAssistantMessageAllowed({
        completedAssistantMessageCount: 24,
        hasUnlimitedChat: false,
      }),
    ).not.toThrow();
    expect(() =>
      assertAssistantMessageAllowed({
        completedAssistantMessageCount: 25,
        hasUnlimitedChat: false,
      }),
    ).toThrow(/limited to 25 assistant messages/i);
    expect(() =>
      assertAssistantMessageAllowed({
        completedAssistantMessageCount: 25,
        hasUnlimitedChat: true,
      }),
    ).not.toThrow();
  });
});
