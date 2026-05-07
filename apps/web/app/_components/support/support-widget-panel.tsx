"use client";

import {
	ExternalLink,
	Loader2,
	RefreshCw,
	SendHorizontal,
	X,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { SupportThreadState } from "./support-api-client";

export type SupportWidgetContent = {
	readonly launcherLabel: string;
	readonly panelTitle: string;
	readonly panelSubtitle: string;
	readonly starterMessage: string;
	readonly messagePlaceholder: string;
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
	canSend,
	content,
	draftMessage,
	errorMessage,
	fallbackHref,
	isBusy,
	onClose,
	onDraftMessageChange,
	onFallbackClick,
	onRefresh,
	onSend,
	status,
	threadState,
}: {
	readonly canSend: boolean;
	readonly content: SupportWidgetContent;
	readonly draftMessage: string;
	readonly errorMessage: string | null;
	readonly fallbackHref: string;
	readonly isBusy: boolean;
	readonly onClose: () => void;
	readonly onDraftMessageChange: (value: string) => void;
	readonly onFallbackClick: () => void;
	readonly onRefresh: () => void;
	readonly onSend: () => void;
	readonly status: "idle" | "loading" | "sending" | "error";
	readonly threadState: SupportThreadState;
}) {
	const transcriptEndRef = useRef<HTMLDivElement>(null);
	const messages = threadState.messages;

	useEffect(() => {
		transcriptEndRef.current?.scrollIntoView({ block: "end" });
	}, [messages.length, status]);

	return (
		<section
			aria-label={content.panelTitle}
			className="pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] min-h-[28rem] w-full flex-col overflow-hidden rounded-[8px] border border-white/15 bg-[#111418]/95 text-white shadow-2xl shadow-black/30 backdrop-blur-xl sm:w-[24rem]"
		>
			<header className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3">
				<div className="min-w-0">
					<p className="text-sm font-semibold">{content.panelTitle}</p>
					<p className="mt-0.5 text-xs leading-5 text-white/65">
						{content.panelSubtitle}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<button
						type="button"
						aria-label="Refresh support thread"
						className="grid size-8 place-items-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
						onClick={onRefresh}
						disabled={isBusy}
					>
						<RefreshCw
							className={cn("size-4", status === "loading" && "animate-spin")}
							aria-hidden="true"
						/>
					</button>
					<button
						type="button"
						aria-label={content.closeLabel}
						className="grid size-8 place-items-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
						onClick={onClose}
					>
						<X className="size-4" aria-hidden="true" />
					</button>
				</div>
			</header>

			<div
				className="ph-no-capture ph-sensitive flex-1 space-y-3 overflow-y-auto px-4 py-4"
				data-ph-no-capture
				role="log"
				aria-live="polite"
			>
				{messages.length === 0 ? (
					<div className="rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm leading-6 text-white/72">
						{content.starterMessage}
					</div>
				) : null}
				{messages.map((message) => (
					<div
						key={message.id}
						className={cn(
							"flex",
							message.source === "visitor" ? "justify-end" : "justify-start",
						)}
					>
						<div
							className={cn(
								"max-w-[82%] overflow-hidden rounded-[8px] px-3 py-2 text-sm leading-6",
								message.source === "visitor"
									? "bg-[#D8FF76] text-[#151912]"
									: "border border-white/10 bg-white/[0.06] text-white",
							)}
						>
							<p className="whitespace-pre-wrap break-words">
								{message.body ?? ""}
							</p>
							{message.source === "visitor" ? (
								<p className="mt-1 text-[11px] leading-4 text-[#151912]/60">
									{getDeliveryLabel(message.deliveryStatus, content)}
								</p>
							) : null}
						</div>
					</div>
				))}
				<div ref={transcriptEndRef} />
			</div>

			<div className="border-t border-white/10 px-4 py-3">
				{threadState.status === "closed" ? (
					<p className="mb-3 text-xs text-white/65">{content.closedLabel}</p>
				) : null}
				{errorMessage ? (
					<p className="mb-3 text-xs leading-5 text-[#ffb4a8]">
						{errorMessage}
					</p>
				) : null}
				<form
					className="flex items-end gap-2"
					onSubmit={(event) => {
						event.preventDefault();
						onSend();
					}}
				>
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
							threadState.status === "closed" ||
							threadState.status === "disabled"
						}
						className="ph-mask ph-sensitive min-h-11 flex-1 resize-none rounded-[8px] border border-white/10 bg-white/[0.07] px-3 py-2 text-sm leading-5 text-white outline-none transition placeholder:text-white/38 focus:border-[#D8FF76]/70"
						data-ph-mask
					/>
					<button
						type="submit"
						aria-label={content.sendLabel}
						disabled={!canSend}
						className="grid size-11 shrink-0 place-items-center rounded-full bg-[#D8FF76] text-[#151912] transition hover:bg-[#ecffb2] disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/35"
					>
						{status === "sending" ? (
							<Loader2 className="size-4 animate-spin" aria-hidden="true" />
						) : (
							<SendHorizontal className="size-4" aria-hidden="true" />
						)}
					</button>
				</form>
				<div className="mt-3 flex items-center justify-between gap-3">
					<p className="pl-8 text-[11px] text-white/45 sm:pl-0">
						{status === "sending"
							? content.sendingLabel
							: getStatusLabel(threadState)}
					</p>
					<a
						href={threadState.fallbackHref || fallbackHref}
						target="_blank"
						rel="noreferrer"
						onClick={onFallbackClick}
						className="inline-flex items-center gap-1 text-xs font-medium text-white/70 transition hover:text-white"
					>
						{content.fallbackLabel}
						<ExternalLink className="size-3.5" aria-hidden="true" />
					</a>
				</div>
			</div>
		</section>
	);
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
