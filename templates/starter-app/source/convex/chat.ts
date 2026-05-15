import { v } from "convex/values";
import {
  actionGeneric as action,
  internalMutationGeneric as internalMutation,
  mutationGeneric as mutation,
  queryGeneric as query,
} from "convex/server";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { requireCurrentWorkspace } from "./auth";
import { getEntitlement } from "./entitlements";
import type { ChatConversationDoc, ChatMessageDoc } from "./types";
import {
  assertAssistantMessageAllowed,
  getDefaultChatModelKey,
  getFreePlanAssistantMessageLimit,
  normalizeChatPrompt,
  normalizeConversationTitle,
  resolveRequestedChatModel,
  titleFromPrompt,
} from "../src/lib/chat/rules";
import { getChatModelLabel } from "../src/lib/chat/models";
import {
  applyOpenAIStreamEvent,
  createOpenAIStreamState,
  extractOutputTextFromOpenAIResponse,
  getCompletedOpenAIStreamResponse,
  parseServerSentEventFrame,
} from "../src/lib/chat/openai-stream";
import { getOpenAIEnvIfConfigured } from "../src/lib/env/server";

const chatModelKeyValidator = v.union(
  v.literal("auto"),
  v.literal("instant"),
  v.literal("thinking"),
);

const assistantResponseRequestValidator = {
  modelKey: chatModelKeyValidator,
  prompt: v.string(),
  conversationId: v.optional(v.id("chatConversations")),
};

type AssistantResponseRequest = {
  assistantMessageId: Id<"chatMessages">;
  conversationId: Id<"chatConversations">;
  modelId: string;
  previousResponseId?: string;
  prompt: string;
  reasoningEffort: string;
  verbosity: string;
};

function chatConversationId(value: string) {
  return value as Id<"chatConversations">;
}

function chatMessageId(value: string) {
  return value as Id<"chatMessages">;
}

function requireConversation(
  conversation: ChatConversationDoc | null,
): ChatConversationDoc {
  if (!conversation || conversation.archivedAt) {
    throw new Error("Conversation not found.");
  }

  return conversation;
}

function assertConversationAccess(args: {
  conversation: ChatConversationDoc;
  workspaceId: string;
}) {
  if (args.conversation.workspaceId !== args.workspaceId) {
    throw new Error("You do not have access to this conversation.");
  }
}

async function getConversationForWorkspace(
  ctx: unknown,
  args: {
    conversationId: string;
    workspaceId: string;
  },
) {
  const typedCtx = ctx as {
    db: {
      get: (id: string) => Promise<ChatConversationDoc | null>;
    };
  };
  const conversation = requireConversation(
    await typedCtx.db.get(args.conversationId),
  );

  assertConversationAccess({
    conversation,
    workspaceId: args.workspaceId,
  });

  return conversation;
}

async function assertNoStreamingAssistantMessage(
  ctx: unknown,
  conversationId: string,
) {
  const typedCtx = ctx as {
    db: {
      query: (table: "chatMessages") => {
        withIndex: (
          indexName: "by_conversation_status_created_at",
          cb: (query: {
            eq: (field: string, value: unknown) => {
              eq: (field: string, value: unknown) => unknown;
            };
          }) => unknown,
        ) => {
          take: (count: number) => Promise<ChatMessageDoc[]>;
        };
      };
    };
  };
  const streamingMessages = await typedCtx.db
    .query("chatMessages")
    .withIndex("by_conversation_status_created_at", (query) =>
      query.eq("conversationId", conversationId).eq("status", "streaming"),
    )
    .take(1);

  if (streamingMessages.length > 0) {
    throw new Error("Wait for the current assistant response to finish.");
  }
}

async function assertAssistantLimit(
  ctx: unknown,
  args: {
    workspaceId: string;
  },
) {
  const chatUnlimited = await getEntitlement(
    ctx,
    args.workspaceId,
    "chat_unlimited",
  );

  if (chatUnlimited?.enabled) {
    return;
  }

  const typedCtx = ctx as {
    db: {
      query: (table: "chatMessages") => {
        withIndex: (
          indexName: "by_workspace_role_status_created_at",
          cb: (query: {
            eq: (field: string, value: unknown) => {
              eq: (field: string, value: unknown) => {
                eq: (field: string, value: unknown) => unknown;
              };
            };
          }) => unknown,
        ) => {
          take: (count: number) => Promise<ChatMessageDoc[]>;
        };
      };
    };
  };
  const completedAssistantMessages = await typedCtx.db
    .query("chatMessages")
    .withIndex("by_workspace_role_status_created_at", (query) =>
      query
        .eq("workspaceId", args.workspaceId)
        .eq("role", "assistant")
        .eq("status", "complete"),
    )
    .take(getFreePlanAssistantMessageLimit() + 1);

  assertAssistantMessageAllowed({
    completedAssistantMessageCount: completedAssistantMessages.length,
    hasUnlimitedChat: false,
  });
}

function toSafeOpenAIErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.slice(0, 280);
  }

  return "The assistant response failed.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function readOpenAIError(response: Response) {
  const body = await response.text();

  try {
    const parsedBody = JSON.parse(body) as unknown;
    if (
      isRecord(parsedBody) &&
      isRecord(parsedBody.error) &&
      typeof parsedBody.error.message === "string"
    ) {
      return `OpenAI request failed (${response.status}): ${parsedBody.error.message}`;
    }
  } catch {
    // Fall through to the generic HTTP error below.
  }

  return `OpenAI request failed with status ${response.status}.`;
}

async function streamOpenAIResponse(args: {
  apiKey: string;
  modelId: string;
  onDelta: (delta: string) => Promise<void>;
  previousResponseId?: string;
  prompt: string;
  reasoningEffort: string;
  verbosity: string;
}) {
  const requestPayload: Record<string, unknown> = {
    model: args.modelId,
    instructions:
      "You are the helpful assistant inside this customer's Starter app. Be concise, practical, and clear. Ask a brief follow-up only when the user's request cannot be answered safely from the available context.",
    input: args.prompt,
    reasoning: { effort: args.reasoningEffort },
    text: { verbosity: args.verbosity },
    store: true,
    stream: true,
  };

  if (args.previousResponseId) {
    requestPayload.previous_response_id = args.previousResponseId;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${args.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    throw new Error(await readOpenAIError(response));
  }

  if (!response.body) {
    const parsedResponse = (await response.json()) as unknown;
    const content = extractOutputTextFromOpenAIResponse(parsedResponse);
    const responseId = isRecord(parsedResponse)
      ? typeof parsedResponse.id === "string"
        ? parsedResponse.id
        : undefined
      : undefined;

    if (content) {
      await args.onDelta(content);
    }

    return { responseId };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const streamState = createOpenAIStreamState();

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      buffer += decoder.decode();
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    buffer = buffer.replace(/\r\n/g, "\n");
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const event = parseServerSentEventFrame(frame);

      if (!event) {
        continue;
      }

      await applyOpenAIStreamEvent({
        event,
        onDelta: args.onDelta,
        state: streamState,
      });
    }
  }

  buffer = buffer.replace(/\r\n/g, "\n");

  if (buffer.trim()) {
    const event = parseServerSentEventFrame(buffer);

    if (event) {
      await applyOpenAIStreamEvent({
        event,
        onDelta: args.onDelta,
        state: streamState,
      });
    }
  }

  return getCompletedOpenAIStreamResponse(streamState);
}

export const openAIStatus = query({
  args: {},
  handler: async (ctx) => {
    await requireCurrentWorkspace(ctx);

    return {
      configured: Boolean(getOpenAIEnvIfConfigured()),
    };
  },
});

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const { workspace } = await requireCurrentWorkspace(ctx);
    const conversations = (await ctx.db
      .query("chatConversations")
      .withIndex("by_workspace_updated_at", (query) =>
        query.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(50)) as ChatConversationDoc[];

    return conversations
      .filter((conversation) => !conversation.archivedAt)
      .slice(0, 25)
      .map((conversation) => ({
        _id: conversation._id,
        title: conversation.title,
        selectedModelKey: conversation.selectedModelKey,
        selectedModelLabel: getChatModelLabel(conversation.selectedModelKey),
        updatedAt: conversation.updatedAt,
      }));
  },
});

export const listMessages = query({
  args: {
    conversationId: v.id("chatConversations"),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireCurrentWorkspace(ctx);
    await getConversationForWorkspace(ctx, {
      conversationId: args.conversationId,
      workspaceId: workspace._id,
    });

    const messages = (await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_created_at", (query) =>
        query.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .take(100)) as ChatMessageDoc[];

    return messages.map((message) => ({
      _id: message._id,
      role: message.role,
      content: message.content,
      status: message.status,
      errorMessage: message.errorMessage,
      modelLabel: message.modelKey ? getChatModelLabel(message.modelKey) : null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));
  },
});

export const createConversation = mutation({
  args: {
    modelKey: chatModelKeyValidator,
  },
  handler: async (ctx, args) => {
    const { user, workspace } = await requireCurrentWorkspace(ctx);
    const selectedModel = resolveRequestedChatModel(args.modelKey);
    const now = Date.now();

    return ctx.db.insert("chatConversations", {
      workspaceId: workspace._id,
      createdByUserId: user._id,
      title: "New chat",
      selectedModelKey: selectedModel.key,
      latestOpenAIResponseId: undefined,
      archivedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const renameConversation = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireCurrentWorkspace(ctx);
    const conversation = await getConversationForWorkspace(ctx, {
      conversationId: args.conversationId,
      workspaceId: workspace._id,
    });

    await ctx.db.patch(chatConversationId(conversation._id), {
      title: normalizeConversationTitle({ title: args.title }),
      updatedAt: Date.now(),
    });
  },
});

export const deleteConversation = mutation({
  args: {
    conversationId: v.id("chatConversations"),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireCurrentWorkspace(ctx);
    const conversation = await getConversationForWorkspace(ctx, {
      conversationId: args.conversationId,
      workspaceId: workspace._id,
    });
    const now = Date.now();

    await ctx.db.patch(chatConversationId(conversation._id), {
      archivedAt: now,
      updatedAt: now,
    });
  },
});

export const updateConversationModel = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    modelKey: chatModelKeyValidator,
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireCurrentWorkspace(ctx);
    const conversation = await getConversationForWorkspace(ctx, {
      conversationId: args.conversationId,
      workspaceId: workspace._id,
    });
    const selectedModel = resolveRequestedChatModel(args.modelKey);

    await ctx.db.patch(chatConversationId(conversation._id), {
      selectedModelKey: selectedModel.key,
      updatedAt: Date.now(),
    });
  },
});

export const beginAssistantResponse = internalMutation({
  args: assistantResponseRequestValidator,
  handler: async (ctx, args): Promise<AssistantResponseRequest> => {
    const { user, workspace } = await requireCurrentWorkspace(ctx);
    const prompt = normalizeChatPrompt({ prompt: args.prompt });
    const selectedModel = resolveRequestedChatModel(args.modelKey);
    const now = Date.now();
    const existingConversation = args.conversationId
      ? await getConversationForWorkspace(ctx, {
          conversationId: args.conversationId,
          workspaceId: workspace._id,
        })
      : null;
    if (existingConversation) {
      await assertNoStreamingAssistantMessage(ctx, existingConversation._id);
    }

    await assertAssistantLimit(ctx, { workspaceId: workspace._id });

    const conversationId =
      existingConversation?._id ??
      (await ctx.db.insert("chatConversations", {
        workspaceId: workspace._id,
        createdByUserId: user._id,
        title: titleFromPrompt(prompt),
        selectedModelKey: selectedModel.key,
        latestOpenAIResponseId: undefined,
        archivedAt: undefined,
        createdAt: now,
        updatedAt: now,
      }));
    const conversation =
      existingConversation ??
      requireConversation(
        (await ctx.db.get(chatConversationId(conversationId))) as ChatConversationDoc | null,
      );

    if (conversation.title === "New chat") {
      await ctx.db.patch(chatConversationId(conversation._id), {
        title: titleFromPrompt(prompt),
        updatedAt: now,
      });
    }

    await ctx.db.patch(chatConversationId(conversation._id), {
      selectedModelKey: selectedModel.key,
      updatedAt: now,
    });

    const userMessageId = await ctx.db.insert("chatMessages", {
      workspaceId: workspace._id,
      conversationId: chatConversationId(conversationId),
      role: "user",
      content: prompt,
      status: "complete",
      sourceUserMessageId: undefined,
      modelKey: undefined,
      modelId: undefined,
      reasoningEffort: undefined,
      verbosity: undefined,
      openAIResponseId: undefined,
      previousResponseId: undefined,
      errorMessage: undefined,
      attemptCount: 1,
      createdAt: now,
      updatedAt: now,
    });
    const assistantMessageId = await ctx.db.insert("chatMessages", {
      workspaceId: workspace._id,
      conversationId: chatConversationId(conversationId),
      role: "assistant",
      content: "",
      status: "streaming",
      sourceUserMessageId: userMessageId,
      modelKey: selectedModel.key,
      modelId: selectedModel.modelId,
      reasoningEffort: selectedModel.reasoningEffort,
      verbosity: selectedModel.verbosity,
      openAIResponseId: undefined,
      previousResponseId: conversation.latestOpenAIResponseId,
      errorMessage: undefined,
      attemptCount: 1,
      createdAt: now + 1,
      updatedAt: now + 1,
    });

    return {
      assistantMessageId: chatMessageId(assistantMessageId),
      conversationId: chatConversationId(conversationId),
      modelId: selectedModel.modelId,
      previousResponseId: conversation.latestOpenAIResponseId,
      prompt,
      reasoningEffort: selectedModel.reasoningEffort,
      verbosity: selectedModel.verbosity,
    };
  },
});

export const beginAssistantRetry = internalMutation({
  args: {
    assistantMessageId: v.id("chatMessages"),
  },
  handler: async (ctx, args): Promise<AssistantResponseRequest> => {
    const { workspace } = await requireCurrentWorkspace(ctx);
    const assistantMessage = (await ctx.db.get(
      args.assistantMessageId,
    )) as ChatMessageDoc | null;

    if (
      !assistantMessage ||
      assistantMessage.workspaceId !== workspace._id ||
      assistantMessage.role !== "assistant" ||
      assistantMessage.status !== "failed" ||
      !assistantMessage.sourceUserMessageId
    ) {
      throw new Error("Failed assistant message not found.");
    }

    const conversation = await getConversationForWorkspace(ctx, {
      conversationId: assistantMessage.conversationId,
      workspaceId: workspace._id,
    });
    const userMessage = (await ctx.db.get(
      assistantMessage.sourceUserMessageId,
    )) as ChatMessageDoc | null;

    if (!userMessage || userMessage.role !== "user") {
      throw new Error("Original user message not found.");
    }

    await assertNoStreamingAssistantMessage(ctx, conversation._id);
    await assertAssistantLimit(ctx, { workspaceId: workspace._id });

    const selectedModel = resolveRequestedChatModel(
      conversation.selectedModelKey ?? getDefaultChatModelKey(),
    );
    const now = Date.now();

    await ctx.db.patch(chatMessageId(assistantMessage._id), {
      content: "",
      status: "streaming",
      modelKey: selectedModel.key,
      modelId: selectedModel.modelId,
      reasoningEffort: selectedModel.reasoningEffort,
      verbosity: selectedModel.verbosity,
      errorMessage: undefined,
      attemptCount: (assistantMessage.attemptCount ?? 1) + 1,
      updatedAt: now,
    });
    await ctx.db.patch(chatConversationId(conversation._id), {
      updatedAt: now,
    });

    return {
      assistantMessageId: chatMessageId(assistantMessage._id),
      conversationId: chatConversationId(conversation._id),
      modelId: selectedModel.modelId,
      previousResponseId: assistantMessage.previousResponseId,
      prompt: userMessage.content,
      reasoningEffort: selectedModel.reasoningEffort,
      verbosity: selectedModel.verbosity,
    };
  },
});

export const appendAssistantDelta = internalMutation({
  args: {
    assistantMessageId: v.id("chatMessages"),
    delta: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.delta) {
      return;
    }

    const assistantMessage = (await ctx.db.get(
      args.assistantMessageId,
    )) as ChatMessageDoc | null;

    if (!assistantMessage || assistantMessage.status !== "streaming") {
      return;
    }

    await ctx.db.patch(chatMessageId(assistantMessage._id), {
      content: `${assistantMessage.content}${args.delta}`,
      updatedAt: Date.now(),
    });
  },
});

export const completeAssistantResponse = internalMutation({
  args: {
    assistantMessageId: v.id("chatMessages"),
    content: v.string(),
    openAIResponseId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const assistantMessage = (await ctx.db.get(
      args.assistantMessageId,
    )) as ChatMessageDoc | null;

    if (!assistantMessage || assistantMessage.status !== "streaming") {
      return;
    }

    const now = Date.now();

    await ctx.db.patch(chatMessageId(assistantMessage._id), {
      content: args.content,
      status: "complete",
      openAIResponseId: args.openAIResponseId,
      errorMessage: undefined,
      updatedAt: now,
    });
    await ctx.db.patch(assistantMessage.conversationId, {
      ...(args.openAIResponseId
        ? { latestOpenAIResponseId: args.openAIResponseId }
        : {}),
      updatedAt: now,
    });
  },
});

export const failAssistantResponse = internalMutation({
  args: {
    assistantMessageId: v.id("chatMessages"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const assistantMessage = (await ctx.db.get(
      args.assistantMessageId,
    )) as ChatMessageDoc | null;

    if (!assistantMessage || assistantMessage.status !== "streaming") {
      return;
    }

    const now = Date.now();

    await ctx.db.patch(chatMessageId(assistantMessage._id), {
      status: "failed",
      errorMessage: args.errorMessage,
      updatedAt: now,
    });
    await ctx.db.patch(assistantMessage.conversationId, {
      updatedAt: now,
    });
  },
});

async function runAssistantResponse(args: {
  appendAssistantDelta: (delta: string) => Promise<void>;
  completeAssistantResponse: (
    content: string,
    openAIResponseId?: string,
  ) => Promise<void>;
  failAssistantResponse: (errorMessage: string) => Promise<void>;
  request: AssistantResponseRequest;
}) {
  let streamedContent = "";
  let pendingDelta = "";
  let lastFlushAt = Date.now();

  async function flushDelta(force: boolean) {
    if (
      !pendingDelta ||
      (!force && pendingDelta.length < 240 && Date.now() - lastFlushAt < 250)
    ) {
      return;
    }

    const delta = pendingDelta;
    pendingDelta = "";
    lastFlushAt = Date.now();
    await args.appendAssistantDelta(delta);
  }

  try {
    const openAIEnv = getOpenAIEnvIfConfigured();

    if (!openAIEnv) {
      throw new Error(
        "OPENAI_API_KEY is not configured in the Convex environment.",
      );
    }

    const result = await streamOpenAIResponse({
      apiKey: openAIEnv.OPENAI_API_KEY,
      modelId: args.request.modelId,
      previousResponseId: args.request.previousResponseId,
      prompt: args.request.prompt,
      reasoningEffort: args.request.reasoningEffort,
      verbosity: args.request.verbosity,
      onDelta: async (delta) => {
        streamedContent += delta;
        pendingDelta += delta;
        await flushDelta(false);
      },
    });

    await flushDelta(true);
    await args.completeAssistantResponse(streamedContent, result.responseId);
  } catch (error) {
    await flushDelta(true);
    await args.failAssistantResponse(toSafeOpenAIErrorMessage(error));
    throw error;
  }
}

export const sendMessage = action({
  args: assistantResponseRequestValidator,
  handler: async (ctx, args) => {
    const request = (await ctx.runMutation(
      internal.chat.beginAssistantResponse,
      args,
    )) as AssistantResponseRequest;

    await runAssistantResponse({
      request,
      appendAssistantDelta: async (delta) => {
        await ctx.runMutation(internal.chat.appendAssistantDelta, {
          assistantMessageId: request.assistantMessageId,
          delta,
        });
      },
      completeAssistantResponse: async (content, openAIResponseId) => {
        await ctx.runMutation(internal.chat.completeAssistantResponse, {
          assistantMessageId: request.assistantMessageId,
          content,
          openAIResponseId,
        });
      },
      failAssistantResponse: async (errorMessage) => {
        await ctx.runMutation(internal.chat.failAssistantResponse, {
          assistantMessageId: request.assistantMessageId,
          errorMessage,
        });
      },
    });

    return {
      assistantMessageId: request.assistantMessageId,
      conversationId: request.conversationId,
    };
  },
});

export const retryAssistantMessage = action({
  args: {
    assistantMessageId: v.id("chatMessages"),
  },
  handler: async (ctx, args) => {
    const request = (await ctx.runMutation(
      internal.chat.beginAssistantRetry,
      args,
    )) as AssistantResponseRequest;

    await runAssistantResponse({
      request,
      appendAssistantDelta: async (delta) => {
        await ctx.runMutation(internal.chat.appendAssistantDelta, {
          assistantMessageId: request.assistantMessageId,
          delta,
        });
      },
      completeAssistantResponse: async (content, openAIResponseId) => {
        await ctx.runMutation(internal.chat.completeAssistantResponse, {
          assistantMessageId: request.assistantMessageId,
          content,
          openAIResponseId,
        });
      },
      failAssistantResponse: async (errorMessage) => {
        await ctx.runMutation(internal.chat.failAssistantResponse, {
          assistantMessageId: request.assistantMessageId,
          errorMessage,
        });
      },
    });

    return {
      assistantMessageId: request.assistantMessageId,
      conversationId: request.conversationId,
    };
  },
});
