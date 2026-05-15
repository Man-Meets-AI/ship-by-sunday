"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  Bot,
  Check,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { ConvexReadyGate } from "@/components/app/convex-ready-gate";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { captureClientEvent } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";
import {
  chatModelOptions,
  DEFAULT_CHAT_MODEL_KEY,
  type ChatModelKey,
} from "@/lib/chat/models";
import { cn, formatDate } from "@/lib/utils";

type ChatConversation = {
  _id: Id<"chatConversations">;
  title: string;
  selectedModelKey: ChatModelKey;
  selectedModelLabel: string;
  updatedAt: number;
};

type ChatMessage = {
  _id: Id<"chatMessages">;
  role: "user" | "assistant";
  content: string;
  status: "streaming" | "complete" | "failed";
  errorMessage?: string;
  modelLabel?: string | null;
  createdAt: number;
  updatedAt: number;
};

export function ChatWorkbench() {
  return (
    <ConvexReadyGate loadingMessage="Loading the chat workspace...">
      <ChatWorkbenchContent />
    </ConvexReadyGate>
  );
}

function ChatWorkbenchContent() {
  const conversations = useQuery(api.chat.listConversations) as
    | ChatConversation[]
    | undefined;
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"chatConversations"> | null>(null);
  const [draftModelKey, setDraftModelKey] = useState<ChatModelKey>(
    DEFAULT_CHAT_MODEL_KEY,
  );
  const selectedConversation = useMemo(
    () =>
      conversations?.find(
        (conversation) => conversation._id === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );
  const modelKey = selectedConversation?.selectedModelKey ?? draftModelKey;
  const messages = useQuery(
    api.chat.listMessages,
    selectedConversationId
      ? { conversationId: selectedConversationId }
      : "skip",
  ) as ChatMessage[] | undefined;
  const openAIStatus = useQuery(api.chat.openAIStatus) as
    | { configured: boolean }
    | undefined;
  const createConversation = useMutation(api.chat.createConversation);
  const renameConversation = useMutation(api.chat.renameConversation);
  const deleteConversation = useMutation(api.chat.deleteConversation);
  const updateConversationModel = useMutation(api.chat.updateConversationModel);
  const sendMessage = useAction(api.chat.sendMessage);
  const retryAssistantMessage = useAction(api.chat.retryAssistantMessage);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  useEffect(() => {
    if (selectedConversationId || !conversations?.length) {
      return;
    }

    setSelectedConversationId(conversations[0]._id);
  }, [conversations, selectedConversationId]);

  const isAssistantStreaming = Boolean(
    messages?.some((message) => message.status === "streaming"),
  );
  const openAIConfigured = openAIStatus?.configured ?? false;

  async function handleNewChat() {
    setIsCreatingConversation(true);

    try {
      const conversationId = (await createConversation({
        modelKey: draftModelKey,
      })) as Id<"chatConversations">;
      setSelectedConversationId(conversationId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't create a new conversation",
      );
    } finally {
      setIsCreatingConversation(false);
    }
  }

  async function handleModelChange(nextModelKey: ChatModelKey) {
    if (!selectedConversationId) {
      setDraftModelKey(nextModelKey);
      return;
    }

    try {
      await updateConversationModel({
        conversationId: selectedConversationId,
        modelKey: nextModelKey,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't update the model",
      );
    }
  }

  async function handleSendMessage(prompt: string) {
    try {
      const result = (await sendMessage({
        conversationId: selectedConversationId ?? undefined,
        modelKey,
        prompt,
      })) as unknown as { conversationId: Id<"chatConversations"> };
      setSelectedConversationId(result.conversationId);
      captureClientEvent(analyticsEvents.chatMessageSent, {
        model: modelKey,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't send the message",
      );
    }
  }

  async function handleRetry(assistantMessageId: Id<"chatMessages">) {
    try {
      await retryAssistantMessage({ assistantMessageId });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't retry the assistant response",
      );
    }
  }

  return (
    <div className="grid min-h-[680px] overflow-hidden rounded-lg border bg-card text-card-foreground lg:grid-cols-[280px_minmax(0,1fr)]">
      <ConversationSidebar
        conversations={conversations}
        isCreatingConversation={isCreatingConversation}
        onDeleteConversation={async (conversationId) => {
          await deleteConversation({ conversationId });
          if (selectedConversationId === conversationId) {
            setSelectedConversationId(null);
          }
        }}
        onNewChat={handleNewChat}
        onRenameConversation={async (conversationId, title) => {
          await renameConversation({ conversationId, title });
        }}
        onSelectConversation={setSelectedConversationId}
        selectedConversationId={selectedConversationId}
      />
      <section className="flex min-h-0 flex-col">
        <ChatToolbar
          isAssistantStreaming={isAssistantStreaming}
          modelKey={modelKey}
          onModelChange={handleModelChange}
          selectedConversation={selectedConversation}
        />
        {!openAIConfigured && openAIStatus !== undefined ? (
          <OpenAISetupNotice />
        ) : null}
        <MessageTimeline
          isAssistantStreaming={isAssistantStreaming}
          messages={messages}
          onRetry={handleRetry}
          selectedConversationId={selectedConversationId}
        />
        <ChatComposer
          disabled={!openAIConfigured || isAssistantStreaming}
          disabledReason={
            !openAIConfigured
              ? "Add OPENAI_API_KEY to the Convex environment before sending messages."
              : isAssistantStreaming
                ? "Wait for the assistant to finish before sending again."
                : undefined
          }
          onSendMessage={handleSendMessage}
        />
      </section>
    </div>
  );
}

function ConversationSidebar({
  conversations,
  isCreatingConversation,
  onDeleteConversation,
  onNewChat,
  onRenameConversation,
  onSelectConversation,
  selectedConversationId,
}: {
  conversations: ChatConversation[] | undefined;
  isCreatingConversation: boolean;
  onDeleteConversation: (
    conversationId: Id<"chatConversations">,
  ) => Promise<void>;
  onNewChat: () => Promise<void>;
  onRenameConversation: (
    conversationId: Id<"chatConversations">,
    title: string,
  ) => Promise<void>;
  onSelectConversation: (conversationId: Id<"chatConversations">) => void;
  selectedConversationId: Id<"chatConversations"> | null;
}) {
  const [renamingConversationId, setRenamingConversationId] =
    useState<Id<"chatConversations"> | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  return (
    <aside className="flex min-h-0 flex-col border-b bg-muted/40 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Conversations
          </p>
          <p className="text-xs text-muted-foreground">Workspace history</p>
        </div>
        <Button
          aria-label="New chat"
          disabled={isCreatingConversation}
          onClick={onNewChat}
          size="icon"
          type="button"
          variant="outline"
        >
          {isCreatingConversation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {conversations === undefined ? (
          <p className="px-2 py-6 text-sm text-muted-foreground">
            Loading conversations...
          </p>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-6 text-sm leading-6 text-muted-foreground">
            Start with a prompt and the first conversation will appear here.
          </p>
        ) : (
          conversations.map((conversation) => {
            const isSelected = conversation._id === selectedConversationId;
            const isRenaming = conversation._id === renamingConversationId;

            return (
              <div
                key={conversation._id}
                className={cn(
                  "rounded-md border border-transparent p-2 transition-colors",
                  isSelected
                    ? "border-input bg-card"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {isRenaming ? (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      await onRenameConversation(conversation._id, renameTitle);
                      setRenamingConversationId(null);
                    }}
                  >
                    <input
                      autoFocus
                      className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                      value={renameTitle}
                      onChange={(event) => setRenameTitle(event.target.value)}
                    />
                    <Button aria-label="Save title" size="icon" type="submit">
                      <Check className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-start gap-2">
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => onSelectConversation(conversation._id)}
                      type="button"
                    >
                      <span className="block truncate text-sm font-medium text-foreground">
                        {conversation.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatDate(conversation.updatedAt)}
                      </span>
                    </button>
                    <Button
                      aria-label="Rename conversation"
                      onClick={() => {
                        setRenamingConversationId(conversation._id);
                        setRenameTitle(conversation.title);
                      }}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      aria-label="Delete conversation"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Delete this conversation from the sidebar?",
                          )
                        ) {
                          await onDeleteConversation(conversation._id);
                        }
                      }}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

function ChatToolbar({
  isAssistantStreaming,
  modelKey,
  onModelChange,
  selectedConversation,
}: {
  isAssistantStreaming: boolean;
  modelKey: ChatModelKey;
  onModelChange: (modelKey: ChatModelKey) => Promise<void>;
  selectedConversation: ChatConversation | null;
}) {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h2 className="truncate text-sm font-semibold text-foreground">
            {selectedConversation?.title ?? "New chat"}
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {isAssistantStreaming
            ? "Assistant is responding"
            : "One active response per conversation"}
        </p>
      </div>
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        Model
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus:ring-2 focus:ring-ring"
          value={modelKey}
          onChange={(event) =>
            void onModelChange(event.target.value as ChatModelKey)
          }
        >
          {chatModelOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function OpenAISetupNotice() {
  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-700 dark:text-amber-400">
      OpenAI is not configured for Convex yet. Set `OPENAI_API_KEY` in the
      Convex environment before using live assistant responses.
    </div>
  );
}

function MessageTimeline({
  isAssistantStreaming,
  messages,
  onRetry,
  selectedConversationId,
}: {
  isAssistantStreaming: boolean;
  messages: ChatMessage[] | undefined;
  onRetry: (assistantMessageId: Id<"chatMessages">) => Promise<void>;
  selectedConversationId: Id<"chatConversations"> | null;
}) {
  if (!selectedConversationId) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <EmptyState
          title="Start a new chat"
          description="Send the first prompt to create a workspace-scoped conversation with model history and billing-aware limits."
        />
      </div>
    );
  }

  if (messages === undefined) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <EmptyState
          title="No messages yet"
          description="Use the composer to start this conversation."
        />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-muted/30 p-4">
      {messages.map((message) => (
        <MessageBubble key={message._id} message={message} onRetry={onRetry} />
      ))}
      {isAssistantStreaming ? (
        <div className="flex items-center gap-2 pl-11 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Streaming from OpenAI
        </div>
      ) : null}
    </div>
  );
}

function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry: (assistantMessageId: Id<"chatMessages">) => Promise<void>;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser ? (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}
      <Card
        className={cn(
          "max-w-[min(760px,100%)] shadow-none",
          isUser
            ? "border-transparent bg-primary text-primary-foreground"
            : "bg-card",
        )}
      >
        <CardContent className="space-y-3 p-4">
          <p className="whitespace-pre-wrap text-sm leading-6">
            {message.content ||
              (message.status === "streaming" ? "Thinking..." : "")}
          </p>
          {!isUser ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {message.modelLabel ? (
                <Badge variant="secondary">{message.modelLabel}</Badge>
              ) : null}
              {message.status === "failed" ? (
                <>
                  <span className="text-destructive">
                    {message.errorMessage ?? "Assistant response failed."}
                  </span>
                  <Button
                    onClick={() => void onRetry(message._id)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
      {isUser ? (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <User className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}

function ChatComposer({
  disabled,
  disabledReason,
  onSendMessage,
}: {
  disabled: boolean;
  disabledReason?: string;
  onSendMessage: (prompt: string) => Promise<void>;
}) {
  const [prompt, setPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    setIsSending(true);

    try {
      await onSendMessage(prompt);
      setPrompt("");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form
      className="border-t bg-card p-4"
      onSubmit={handleSubmit}
    >
      <div className="flex items-end gap-3 rounded-lg border bg-muted/40 p-2">
        <Textarea
          className="min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          disabled={disabled || isSending}
          placeholder="Message the assistant..."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <Button
          aria-label="Send message"
          disabled={disabled || isSending || !prompt.trim()}
          size="icon"
          type="submit"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      {disabledReason ? (
        <p className="mt-2 text-xs text-muted-foreground">{disabledReason}</p>
      ) : null}
    </form>
  );
}
