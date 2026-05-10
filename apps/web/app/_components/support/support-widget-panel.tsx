"use client";

import {
	Bug,
	ExternalLink,
	Image as ImageIcon,
	Loader2,
	Paperclip,
	SendHorizontal,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { formatSupportAttachmentSize } from "@/lib/support/support-attachment-policy";
import type {
	SupportBugImpact,
	SupportBugReportDraft,
	SupportChatMode,
} from "./use-support-chat";
import type { SupportMessage, SupportThreadState } from "./support-api-client";

export type SupportWidgetContent = {
	readonly launcherLabel: string;
	readonly panelTitle: string;
	readonly panelSubtitle: string;
	readonly starterMessage: string;
	readonly messagePlaceholder: string;
	readonly bugReportLabel: string;
	readonly bugSummaryPlaceholder: string;
	readonly bugStepsPlaceholder: string;
	readonly bugExpectedPlaceholder: string;
	readonly bugImpactLabel: string;
	readonly attachScreenshotLabel: string;
	readonly removeAttachmentLabel: string;
	readonly sendLabel: string;
	readonly closeLabel: string;
	readonly fallbackLabel: string;
	readonly directTelegramLabel: string;
	readonly loadingLabel: string;
	readonly sendingLabel: string;
	readonly deliveredLabel: string;
	readonly failedLabel: string;
	readonly closedLabel: string;
};

export function SupportWidgetPanel({
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
	readonly bugReportDraft: SupportBugReportDraft;
	readonly canSend: boolean;
	readonly chatMode: SupportChatMode;
	readonly content: SupportWidgetContent;
	readonly draftMessage: string;
	readonly errorMessage: string | null;
	readonly fallbackHref: string;
	readonly onClose: () => void;
	readonly onDraftMessageChange: (value: string) => void;
	readonly onFallbackClick: () => void;
	readonly onSend: () => void;
	readonly onSetAttachmentFile: (file: File | null) => void;
	readonly onSetBugReportDraft: (value: SupportBugReportDraft) => void;
	readonly onSetChatMode: (value: SupportChatMode) => void;
	readonly status: "idle" | "loading" | "sending" | "error";
	readonly threadState: SupportThreadState;
}) {
	const transcriptEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const messages = threadState.messages;

	useEffect(() => {
		transcriptEndRef.current?.scrollIntoView({ block: "end" });
	}, [messages.length, status]);

	return (
		<section
			aria-label={content.panelTitle}
			className="pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] min-h-[30rem] w-full flex-col overflow-hidden rounded-[14px] border border-white/12 bg-[#101316]/96 text-white shadow-2xl shadow-black/35 backdrop-blur-xl sm:w-[26rem]"
		>
			<header className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span className="size-2 rounded-full bg-[#D8FF76]" aria-hidden />
						<p className="text-sm font-semibold">{content.panelTitle}</p>
					</div>
					<p className="mt-1 text-xs leading-5 text-white/62">
						{content.panelSubtitle}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<button
						type="button"
						aria-label={content.closeLabel}
						className="grid size-8 place-items-center rounded-lg text-white/62 transition hover:bg-white/10 hover:text-white"
						onClick={onClose}
					>
						<X className="size-4" aria-hidden="true" />
					</button>
				</div>
			</header>

			<div
				className="ph-no-capture ph-sensitive flex-1 overflow-y-auto px-4 py-4"
				data-ph-no-capture
				role="log"
				aria-live="polite"
			>
				{messages.length === 0 ? (
					<div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-sm leading-6 text-white/72">
						{content.starterMessage}
					</div>
				) : (
					<div className="space-y-3">
						{messages.map((message) => (
							<SupportMessageBubble
								key={message.id}
								content={content}
								message={message}
							/>
						))}
					</div>
				)}
				<div ref={transcriptEndRef} />
			</div>

			<div className="border-t border-white/10 px-4 py-3">
				{threadState.status === "closed" ? (
					<p className="mb-3 text-xs text-white/65">{content.closedLabel}</p>
				) : null}
				{errorMessage || attachmentErrorMessage ? (
					<p className="mb-3 text-xs leading-5 text-[#ffb4a8]">
						{errorMessage ?? attachmentErrorMessage}
					</p>
				) : null}
				<form
					className="space-y-3"
					onSubmit={(event) => {
						event.preventDefault();
						onSend();
					}}
				>
					<div className="flex items-center justify-between gap-2">
						<div className="flex rounded-lg border border-white/10 bg-white/[0.04] p-1">
							<ModeButton
								isActive={chatMode === "message"}
								label="Chat"
								onClick={() => onSetChatMode("message")}
							/>
							<ModeButton
								icon={<Bug className="size-3.5" aria-hidden />}
								isActive={chatMode === "bug_report"}
								label={content.bugReportLabel}
								onClick={() => onSetChatMode("bug_report")}
							/>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/png,image/jpeg,image/webp"
							className="hidden"
							onChange={(event) => {
								onSetAttachmentFile(event.currentTarget.files?.[0] ?? null);
								event.currentTarget.value = "";
							}}
						/>
						<button
							type="button"
							className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/10 hover:text-white"
							aria-label={content.attachScreenshotLabel}
							onClick={() => fileInputRef.current?.click()}
							disabled={threadState.status === "closed"}
						>
							<Paperclip className="size-4" aria-hidden />
						</button>
					</div>

					{chatMode === "bug_report" ? (
						<BugReportFields
							bugReportDraft={bugReportDraft}
							content={content}
							onSetBugReportDraft={onSetBugReportDraft}
						/>
					) : (
						<MessageTextarea
							content={content}
							draftMessage={draftMessage}
							onDraftMessageChange={onDraftMessageChange}
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

					<div className="flex items-center gap-2">
						<button
							type="submit"
							aria-label={content.sendLabel}
							disabled={!canSend}
							className="grid size-10 shrink-0 place-items-center rounded-full bg-[#D8FF76] text-[#151912] transition hover:bg-[#ecffb2] disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/35"
						>
							{status === "sending" ? (
								<Loader2 className="size-4 animate-spin" aria-hidden="true" />
							) : (
								<SendHorizontal className="size-4" aria-hidden="true" />
							)}
						</button>
						<p className="min-w-0 flex-1 text-[11px] text-white/45">
							{status === "sending"
								? content.sendingLabel
								: getStatusLabel(threadState)}
						</p>
						<a
							href={threadState.fallbackHref || fallbackHref}
							target="_blank"
							rel="noreferrer"
							onClick={onFallbackClick}
							className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-white/70 transition hover:text-white"
						>
							{content.fallbackLabel}
							<ExternalLink className="size-3.5" aria-hidden="true" />
						</a>
					</div>
				</form>
			</div>
		</section>
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
			className={cn(
				"inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition",
				isActive
					? "bg-white text-[#101316]"
					: "text-white/62 hover:bg-white/10 hover:text-white",
			)}
		>
			{icon}
			{label}
		</button>
	);
}

function MessageTextarea({
	content,
	draftMessage,
	onDraftMessageChange,
	threadState,
}: {
	readonly content: SupportWidgetContent;
	readonly draftMessage: string;
	readonly onDraftMessageChange: (value: string) => void;
	readonly threadState: SupportThreadState;
}) {
	return (
		<div>
			<label className="sr-only" htmlFor="support-widget-message">
				{content.messagePlaceholder}
			</label>
			<textarea
				id="support-widget-message"
				value={draftMessage}
				onChange={(event) => onDraftMessageChange(event.target.value)}
				placeholder={content.messagePlaceholder}
				rows={2}
				maxLength={2000}
				disabled={
					threadState.status === "closed" || threadState.status === "disabled"
				}
				className="ph-mask ph-sensitive min-h-11 w-full resize-none rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2 text-sm leading-5 text-white outline-none transition placeholder:text-white/38 focus:border-[#D8FF76]/70"
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
	readonly bugReportDraft: SupportBugReportDraft;
	readonly content: SupportWidgetContent;
	readonly onSetBugReportDraft: (value: SupportBugReportDraft) => void;
}) {
	return (
		<div className="space-y-2">
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
			<label className="sr-only" htmlFor="support-bug-impact">
				{content.bugImpactLabel}
			</label>
			<select
				id="support-bug-impact"
				value={bugReportDraft.impact}
				onChange={(event) =>
					onSetBugReportDraft({
						...bugReportDraft,
						impact: event.target.value as SupportBugImpact,
					})
				}
				className="h-9 w-full rounded-lg border border-white/10 bg-[#191d21] px-3 text-xs text-white outline-none transition focus:border-[#D8FF76]/70"
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
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder={placeholder}
			rows={2}
			maxLength={700}
			className="ph-mask ph-sensitive min-h-10 w-full resize-none rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2 text-sm leading-5 text-white outline-none transition placeholder:text-white/38 focus:border-[#D8FF76]/70"
			data-ph-mask
		/>
	);
}

function AttachmentChip({
	content,
	file,
	onRemove,
}: {
	readonly content: SupportWidgetContent;
	readonly file: File;
	readonly onRemove: () => void;
}) {
	return (
		<div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
			<ImageIcon className="size-4 shrink-0 text-white/55" aria-hidden />
			<span className="min-w-0 flex-1 truncate">
				{file.name} - {formatSupportAttachmentSize(file.size)}
			</span>
			<button
				type="button"
				aria-label={content.removeAttachmentLabel}
				onClick={onRemove}
				className="grid size-7 shrink-0 place-items-center rounded-md text-white/55 transition hover:bg-white/10 hover:text-white"
			>
				<Trash2 className="size-3.5" aria-hidden />
			</button>
		</div>
	);
}

function SupportMessageBubble({
	content,
	message,
}: {
	readonly content: SupportWidgetContent;
	readonly message: SupportMessage;
}) {
	if (message.source === "system") {
		return (
			<div className="px-5 text-center text-xs leading-5 text-white/45">
				{message.body}
			</div>
		);
	}

	const isVisitor = message.source === "visitor";
	return (
		<div className={cn("flex", isVisitor ? "justify-end" : "justify-start")}>
			<div
				className={cn(
					"max-w-[84%] overflow-hidden rounded-[12px] px-3 py-2 text-sm leading-6",
					isVisitor
						? "bg-[#D8FF76] text-[#151912]"
						: "border border-white/10 bg-white/[0.06] text-white",
				)}
			>
				{message.body ? (
					<p className="whitespace-pre-wrap break-words">
						{isVisitor ? message.body : <ProgressiveText text={message.body} />}
					</p>
				) : null}
				{message.attachment ? (
					<div
						className={cn(
							"mt-2 overflow-hidden rounded-lg border",
							isVisitor
								? "border-[#151912]/12 bg-[#151912]/5"
								: "border-white/10 bg-black/10",
						)}
					>
						{message.attachment.url ? (
							<img
								src={message.attachment.url}
								alt={message.attachment.fileName}
								className="max-h-40 w-full object-cover"
							/>
						) : null}
						<div className="flex items-center gap-2 px-2.5 py-2 text-[11px] leading-4 opacity-70">
							<ImageIcon className="size-3.5 shrink-0" aria-hidden />
							<span className="min-w-0 truncate">
								{message.attachment.fileName} -{" "}
								{formatSupportAttachmentSize(message.attachment.size)}
							</span>
						</div>
					</div>
				) : null}
				{isVisitor ? (
					<p className="mt-1 text-[11px] leading-4 text-[#151912]/60">
						{getDeliveryLabel(message.deliveryStatus, content)}
					</p>
				) : null}
			</div>
		</div>
	);
}

function ProgressiveText({ text }: { readonly text: string }) {
	const [visibleCharacterCount, setVisibleCharacterCount] = useState(0);

	useEffect(() => {
		if (
			typeof window.matchMedia === "function" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			setVisibleCharacterCount(text.length);
			return;
		}

		setVisibleCharacterCount(0);
		const intervalId = window.setInterval(() => {
			setVisibleCharacterCount((currentCount) => {
				const nextCount = Math.min(text.length, currentCount + 4);
				if (nextCount >= text.length) {
					window.clearInterval(intervalId);
				}
				return nextCount;
			});
		}, 18);

		return () => window.clearInterval(intervalId);
	}, [text]);

	return <>{text.slice(0, visibleCharacterCount)}</>;
}

function getDeliveryLabel(
	deliveryStatus: SupportThreadState["messages"][number]["deliveryStatus"],
	content: SupportWidgetContent,
) {
	switch (deliveryStatus) {
		case "delivered_to_parker":
			return content.deliveredLabel;
		case "delivery_failed":
			return content.failedLabel;
		case "sending":
			return content.sendingLabel;
		case "not_required":
			return "";
	}
}

function getStatusLabel(threadState: SupportThreadState) {
	if (threadState.supportId) {
		return threadState.supportId;
	}
	if (threadState.status === "disabled") {
		return "Support fallback available";
	}
	return "Replies stay in this thread";
}
