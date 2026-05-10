"use client";

import {
	ArrowUp,
	Bug,
	ExternalLink,
	Image as ImageIcon,
	Loader2,
	Paperclip,
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
			className="pointer-events-auto flex max-h-[calc(100dvh-1rem)] min-h-[32rem] w-full flex-col overflow-hidden rounded-[22px] border border-white/[0.1] bg-[#1b1b1b]/98 text-white shadow-2xl shadow-black/35 backdrop-blur-xl sm:w-[27rem]"
		>
			<header className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-4 py-3">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span
							className="size-2 rounded-full bg-[#D8FF76] shadow-[0_0_0_3px_rgba(216,255,118,0.08)]"
							aria-hidden
						/>
						<p className="truncate text-sm font-medium">{content.panelTitle}</p>
					</div>
					<p className="mt-0.5 truncate text-xs leading-5 text-white/52">
						{content.panelSubtitle}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<a
						href={threadState.fallbackHref || fallbackHref}
						target="_blank"
						rel="noreferrer"
						onClick={onFallbackClick}
						aria-label={content.fallbackLabel}
						className="grid size-8 place-items-center rounded-lg text-white/54 transition hover:bg-white/[0.08] hover:text-white"
					>
						<ExternalLink className="size-4" aria-hidden="true" />
					</a>
					<button
						type="button"
						aria-label={content.closeLabel}
						className="grid size-8 place-items-center rounded-lg text-white/54 transition hover:bg-white/[0.08] hover:text-white"
						onClick={onClose}
					>
						<X className="size-4" aria-hidden="true" />
					</button>
				</div>
			</header>

			<div
				className="ph-no-capture ph-sensitive flex-1 overflow-y-auto px-4 py-5"
				data-ph-no-capture
				role="log"
				aria-live="polite"
			>
				{messages.length === 0 ? (
					<AssistantIntroMessage content={content} />
				) : (
					<div className="space-y-5">
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

			<div className="border-t border-white/[0.08] bg-[#1b1b1b] px-3 py-3">
				{threadState.status === "closed" ? (
					<p className="mb-3 px-1 text-xs text-white/60">
						{content.closedLabel}
					</p>
				) : null}
				{errorMessage || attachmentErrorMessage ? (
					<p className="mb-3 px-1 text-xs leading-5 text-[#ffb4a8]">
						{errorMessage ?? attachmentErrorMessage}
					</p>
				) : null}
				<form
					className="rounded-[20px] border border-white/[0.09] bg-[#2a2a2a] p-2 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
					onSubmit={(event) => {
						event.preventDefault();
						onSend();
					}}
				>
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

					<div className="mt-2 flex items-center gap-2">
						<div className="flex min-w-0 flex-1 items-center gap-1">
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
							<button
								type="button"
								className="ml-1 inline-flex size-8 items-center justify-center rounded-full text-white/58 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:text-white/24"
								aria-label={content.attachScreenshotLabel}
								onClick={() => fileInputRef.current?.click()}
								disabled={threadState.status === "closed"}
							>
								<Paperclip className="size-4" aria-hidden />
							</button>
						</div>
						<button
							type="submit"
							aria-label={content.sendLabel}
							disabled={!canSend}
							className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#151912] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/35"
						>
							{status === "sending" ? (
								<Loader2 className="size-4 animate-spin" aria-hidden="true" />
							) : (
								<ArrowUp className="size-4" aria-hidden="true" />
							)}
						</button>
					</div>
				</form>
			</div>
		</section>
	);
}

function AssistantIntroMessage({
	content,
}: {
	readonly content: SupportWidgetContent;
}) {
	return (
		<div className="flex items-start gap-3">
			<div
				className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-[#1b1b1b]"
				aria-hidden
			>
				P
			</div>
			<p className="max-w-[20rem] pt-0.5 text-sm leading-6 text-white/76">
				{content.starterMessage}
			</p>
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
			className={cn(
				"inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition",
				isActive
					? "bg-white/[0.12] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
					: "text-white/54 hover:bg-white/[0.08] hover:text-white",
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
	readonly content: SupportWidgetContent;
	readonly draftMessage: string;
	readonly onDraftMessageChange: (value: string) => void;
	readonly onSend: () => void;
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
				className="ph-mask ph-sensitive min-h-16 w-full resize-none border-0 bg-transparent px-2 py-1 text-sm leading-6 text-white outline-none placeholder:text-white/34"
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
				className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 text-xs text-white outline-none transition focus:border-white/30"
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
			className="ph-mask ph-sensitive min-h-11 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm leading-5 text-white outline-none transition placeholder:text-white/34 focus:border-white/30"
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
		<div className="mt-2 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-xs text-white/70">
			<ImageIcon className="size-4 shrink-0 text-white/55" aria-hidden />
			<span className="min-w-0 flex-1 truncate">
				{file.name} - {formatSupportAttachmentSize(file.size)}
			</span>
			<button
				type="button"
				aria-label={content.removeAttachmentLabel}
				onClick={onRemove}
				className="grid size-7 shrink-0 place-items-center rounded-full text-white/55 transition hover:bg-white/[0.08] hover:text-white"
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
			<div className="px-7 text-center text-xs leading-5 text-white/38">
				{message.body}
			</div>
		);
	}

	const isVisitor = message.source === "visitor";
	return (
		<div className={cn("flex", isVisitor ? "justify-end" : "justify-start")}>
			{isVisitor ? null : (
				<div
					className="mr-3 grid size-7 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-[#1b1b1b]"
					aria-hidden
				>
					P
				</div>
			)}
			<div
				className={cn(
					"max-w-[84%] overflow-hidden text-sm leading-6",
					isVisitor
						? "rounded-[18px] bg-[#303030] px-3.5 py-2.5 text-white"
						: "pt-0.5 text-white/82",
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
								? "border-white/[0.08] bg-black/10"
								: "border-white/[0.08] bg-white/[0.04]",
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
					<p className="mt-1 text-right text-[11px] leading-4 text-white/38">
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
