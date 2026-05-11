"use client";

import {
	ArrowUp,
	Bug,
	Image as ImageIcon,
	Loader2,
	Paperclip,
	Trash2,
} from "lucide-react";
import { useRef, type ReactNode } from "react";

import { formatTelegramChatAttachmentSize } from "../core/attachment-policy";
import type { TelegramChatContent } from "../core/telegram-chat-content";
import { TELEGRAM_CHAT_INPUT_PRIVACY_CLASS_NAME } from "../core/privacy-dom";
import type {
	TelegramChatBugReportDraft,
	TelegramChatMode,
	TelegramChatStatus,
	TelegramChatThreadState,
} from "../core/telegram-chat-types";
import { joinClassNames } from "./react-utils";

export function TelegramChatComposer({
	attachmentErrorMessage,
	attachmentFile,
	bugReportDraft,
	canSend,
	chatMode,
	content,
	draftMessage,
	errorMessage,
	onDraftMessageChange,
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
	readonly onDraftMessageChange: (value: string) => void;
	readonly onSend: () => void;
	readonly onSetAttachmentFile: (file: File | null) => void;
	readonly onSetBugReportDraft: (value: TelegramChatBugReportDraft) => void;
	readonly onSetChatMode: (value: TelegramChatMode) => void;
	readonly status: TelegramChatStatus;
	readonly threadState: TelegramChatThreadState;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<div className="sbs-telegram-chat-composer-shell">
			{threadState.status === "closed" ? (
				<p className="sbs-telegram-chat-closed-message">
					{content.closedLabel}
				</p>
			) : null}
			{errorMessage || attachmentErrorMessage ? (
				<p className="sbs-telegram-chat-error-message">
					{errorMessage ?? attachmentErrorMessage}
				</p>
			) : null}
			<form
				className="sbs-telegram-chat-composer"
				onSubmit={(event) => {
					event.preventDefault();
					onSend();
				}}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/png,image/jpeg,image/webp"
					className="sbs-telegram-chat-file-input"
					onChange={(event) => {
						onSetAttachmentFile(event.currentTarget.files?.[0] ?? null);
						event.currentTarget.value = "";
					}}
				/>

				{chatMode === "bug_report" ? (
					<BugReportFields
						bugReportDraft={bugReportDraft}
						content={content}
						onSetBugReportDraft={onSetBugReportDraft}
					/>
				) : (
					<MessageTextarea
						canSend={canSend}
						content={content}
						draftMessage={draftMessage}
						onDraftMessageChange={onDraftMessageChange}
						onSend={onSend}
						threadState={threadState}
					/>
				)}

				{attachmentFile ? (
					<AttachmentChip
						content={content}
						file={attachmentFile}
						onRemove={() => onSetAttachmentFile(null)}
					/>
				) : null}

				<div className="sbs-telegram-chat-composer-toolbar">
					<div className="sbs-telegram-chat-composer-tools">
						<ModeButton
							isActive={chatMode === "message"}
							label="Chat"
							onClick={() => onSetChatMode("message")}
						/>
						<ModeButton
							icon={
								<Bug className="sbs-telegram-chat-small-icon" aria-hidden />
							}
							isActive={chatMode === "bug_report"}
							label={content.bugReportLabel}
							onClick={() => onSetChatMode("bug_report")}
						/>
						<button
							type="button"
							className="sbs-telegram-chat-attach-button"
							aria-label={content.attachScreenshotLabel}
							onClick={() => fileInputRef.current?.click()}
							disabled={threadState.status === "closed"}
						>
							<Paperclip className="sbs-telegram-chat-icon" aria-hidden />
						</button>
					</div>
					<button
						type="submit"
						aria-label={content.sendLabel}
						disabled={!canSend}
						className="sbs-telegram-chat-send-button"
					>
						{status === "sending" ? (
							<Loader2
								className="sbs-telegram-chat-icon sbs-telegram-chat-spin"
								aria-hidden="true"
							/>
						) : (
							<ArrowUp className="sbs-telegram-chat-icon" aria-hidden="true" />
						)}
					</button>
				</div>
			</form>
		</div>
	);
}

function ModeButton({
	icon,
	isActive,
	label,
	onClick,
}: {
	readonly icon?: ReactNode;
	readonly isActive: boolean;
	readonly label: string;
	readonly onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={isActive}
			onClick={onClick}
			className={joinClassNames(
				"sbs-telegram-chat-mode-button",
				isActive && "sbs-telegram-chat-mode-button--active",
			)}
		>
			{icon}
			{label}
		</button>
	);
}

function MessageTextarea({
	canSend,
	content,
	draftMessage,
	onDraftMessageChange,
	onSend,
	threadState,
}: {
	readonly canSend: boolean;
	readonly content: TelegramChatContent;
	readonly draftMessage: string;
	readonly onDraftMessageChange: (value: string) => void;
	readonly onSend: () => void;
	readonly threadState: TelegramChatThreadState;
}) {
	return (
		<div>
			<label
				className="sbs-telegram-chat-sr-only"
				htmlFor="support-widget-message"
			>
				{content.messagePlaceholder}
			</label>
			<textarea
				id="support-widget-message"
				value={draftMessage}
				onChange={(event) => onDraftMessageChange(event.target.value)}
				onKeyDown={(event) => {
					if (event.key !== "Enter" || event.shiftKey || !canSend) {
						return;
					}

					event.preventDefault();
					onSend();
				}}
				placeholder={content.messagePlaceholder}
				rows={2}
				maxLength={2000}
				disabled={
					threadState.status === "closed" || threadState.status === "disabled"
				}
				className={joinClassNames(
					"sbs-telegram-chat-message-textarea",
					TELEGRAM_CHAT_INPUT_PRIVACY_CLASS_NAME,
				)}
				data-ph-mask
			/>
		</div>
	);
}

function BugReportFields({
	bugReportDraft,
	content,
	onSetBugReportDraft,
}: {
	readonly bugReportDraft: TelegramChatBugReportDraft;
	readonly content: TelegramChatContent;
	readonly onSetBugReportDraft: (value: TelegramChatBugReportDraft) => void;
}) {
	return (
		<div className="sbs-telegram-chat-bug-fields">
			<BugTextarea
				id="support-bug-summary"
				placeholder={content.bugSummaryPlaceholder}
				value={bugReportDraft.summary}
				onChange={(summary) =>
					onSetBugReportDraft({ ...bugReportDraft, summary })
				}
			/>
			<BugTextarea
				id="support-bug-steps"
				placeholder={content.bugStepsPlaceholder}
				value={bugReportDraft.steps}
				onChange={(steps) => onSetBugReportDraft({ ...bugReportDraft, steps })}
			/>
			<BugTextarea
				id="support-bug-expected"
				placeholder={content.bugExpectedPlaceholder}
				value={bugReportDraft.expected}
				onChange={(expected) =>
					onSetBugReportDraft({ ...bugReportDraft, expected })
				}
			/>
			<label className="sbs-telegram-chat-sr-only" htmlFor="support-bug-impact">
				{content.bugImpactLabel}
			</label>
			<select
				id="support-bug-impact"
				value={bugReportDraft.impact}
				onChange={(event) =>
					onSetBugReportDraft({
						...bugReportDraft,
						impact: event.target.value as TelegramChatBugReportDraft["impact"],
					})
				}
				className="sbs-telegram-chat-bug-impact"
			>
				<option value="blocked">Blocking me</option>
				<option value="not_blocked">Not blocked</option>
				<option value="question">Not sure if this is a bug</option>
			</select>
		</div>
	);
}

function BugTextarea({
	id,
	onChange,
	placeholder,
	value,
}: {
	readonly id: string;
	readonly onChange: (value: string) => void;
	readonly placeholder: string;
	readonly value: string;
}) {
	return (
		<textarea
			id={id}
			aria-label={placeholder}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder={placeholder}
			rows={2}
			maxLength={700}
			className={joinClassNames(
				"sbs-telegram-chat-bug-textarea",
				TELEGRAM_CHAT_INPUT_PRIVACY_CLASS_NAME,
			)}
			data-ph-mask
		/>
	);
}

function AttachmentChip({
	content,
	file,
	onRemove,
}: {
	readonly content: TelegramChatContent;
	readonly file: File;
	readonly onRemove: () => void;
}) {
	return (
		<div className="sbs-telegram-chat-attachment-chip">
			<ImageIcon className="sbs-telegram-chat-icon" aria-hidden />
			<span className="sbs-telegram-chat-attachment-name">
				{file.name} - {formatTelegramChatAttachmentSize(file.size)}
			</span>
			<button
				type="button"
				aria-label={content.removeAttachmentLabel}
				onClick={onRemove}
				className="sbs-telegram-chat-remove-attachment"
			>
				<Trash2 className="sbs-telegram-chat-small-icon" aria-hidden />
			</button>
		</div>
	);
}
