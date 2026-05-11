"use client";

import { ExternalLink, X } from "lucide-react";

import type { TelegramChatContent } from "../core/telegram-chat-content";
import type {
	TelegramChatBugReportDraft,
	TelegramChatMode,
	TelegramChatStatus,
	TelegramChatThreadState,
} from "../core/telegram-chat-types";
import { TelegramChatComposer } from "./telegram-chat-composer";
import { TelegramChatTranscript } from "./telegram-chat-messages";

export function TelegramChatPanel({
	attachmentErrorMessage,
	attachmentFile,
	bugReportDraft,
	canSend,
	chatMode,
	content,
	draftMessage,
	errorMessage,
	fallbackHref,
	onClose,
	onDraftMessageChange,
	onFallbackClick,
	onSend,
	onSetAttachmentFile,
	onSetBugReportDraft,
	onSetChatMode,
	status,
	threadState,
}: {
	readonly attachmentErrorMessage: string | null;
	readonly attachmentFile: File | null;
	readonly bugReportDraft: TelegramChatBugReportDraft;
	readonly canSend: boolean;
	readonly chatMode: TelegramChatMode;
	readonly content: TelegramChatContent;
	readonly draftMessage: string;
	readonly errorMessage: string | null;
	readonly fallbackHref: string;
	readonly onClose: () => void;
	readonly onDraftMessageChange: (value: string) => void;
	readonly onFallbackClick: () => void;
	readonly onSend: () => void;
	readonly onSetAttachmentFile: (file: File | null) => void;
	readonly onSetBugReportDraft: (value: TelegramChatBugReportDraft) => void;
	readonly onSetChatMode: (value: TelegramChatMode) => void;
	readonly status: TelegramChatStatus;
	readonly threadState: TelegramChatThreadState;
}) {
	return (
		<section
			aria-label={content.panelTitle}
			className="sbs-telegram-chat-panel"
		>
			<header className="sbs-telegram-chat-panel-header">
				<div className="sbs-telegram-chat-panel-title-block">
					<div className="sbs-telegram-chat-panel-title-row">
						<span className="sbs-telegram-chat-online-dot" aria-hidden />
						<p className="sbs-telegram-chat-panel-title">
							{content.panelTitle}
						</p>
					</div>
					<p className="sbs-telegram-chat-panel-subtitle">
						{content.panelSubtitle}
					</p>
				</div>
				<div className="sbs-telegram-chat-panel-actions">
					<a
						href={threadState.fallbackHref || fallbackHref}
						target="_blank"
						rel="noreferrer"
						onClick={onFallbackClick}
						aria-label={content.fallbackLabel}
						className="sbs-telegram-chat-icon-button"
					>
						<ExternalLink className="sbs-telegram-chat-icon" aria-hidden />
					</a>
					<button
						type="button"
						aria-label={content.closeLabel}
						className="sbs-telegram-chat-icon-button"
						onClick={onClose}
					>
						<X className="sbs-telegram-chat-icon" aria-hidden />
					</button>
				</div>
			</header>

			<TelegramChatTranscript
				content={content}
				status={status}
				threadState={threadState}
			/>

			<TelegramChatComposer
				attachmentErrorMessage={attachmentErrorMessage}
				attachmentFile={attachmentFile}
				bugReportDraft={bugReportDraft}
				canSend={canSend}
				chatMode={chatMode}
				content={content}
				draftMessage={draftMessage}
				errorMessage={errorMessage}
				onDraftMessageChange={onDraftMessageChange}
				onSend={onSend}
				onSetAttachmentFile={onSetAttachmentFile}
				onSetBugReportDraft={onSetBugReportDraft}
				onSetChatMode={onSetChatMode}
				status={status}
				threadState={threadState}
			/>
		</section>
	);
}
