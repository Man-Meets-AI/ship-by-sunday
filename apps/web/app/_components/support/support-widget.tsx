"use client";

import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { type SupportWidgetEntrySurface } from "./support-api-client";
import {
	SupportWidgetPanel,
	type SupportWidgetContent,
} from "./support-widget-panel";
import {
	type SupportWidgetAnalyticsSurface,
	useSupportChat,
} from "./use-support-chat";

type SupportWidgetLauncherMotion = "standard" | "squishy";

export function SupportWidget({
	analyticsSurface,
	content,
	entrySurface,
	fallbackHref,
	launcherMotion,
}: {
	readonly analyticsSurface: SupportWidgetAnalyticsSurface;
	readonly content: SupportWidgetContent;
	readonly entrySurface: SupportWidgetEntrySurface;
	readonly fallbackHref: string;
	readonly launcherMotion: SupportWidgetLauncherMotion;
}) {
	const supportChat = useSupportChat({
		analyticsSurface,
		entrySurface,
		fallbackHref,
	});

	return (
		<div
			className={cn(
				"fixed z-50",
				supportChat.isOpen
					? "inset-x-3 bottom-3 sm:inset-auto sm:right-6 sm:bottom-6"
					: "right-4 bottom-4 sm:right-6 sm:bottom-6",
			)}
		>
			{supportChat.isOpen ? (
				<SupportWidgetPanel
					attachmentErrorMessage={supportChat.attachmentErrorMessage}
					attachmentFile={supportChat.attachmentFile}
					bugReportDraft={supportChat.bugReportDraft}
					canSend={supportChat.canSend}
					chatMode={supportChat.chatMode}
					content={content}
					draftMessage={supportChat.draftMessage}
					errorMessage={supportChat.errorMessage}
					fallbackHref={fallbackHref}
					onClose={supportChat.closeChat}
					onDraftMessageChange={supportChat.setDraftMessage}
					onFallbackClick={supportChat.recordFallbackClick}
					onSend={supportChat.sendMessage}
					onSetAttachmentFile={supportChat.setAttachmentFile}
					onSetBugReportDraft={supportChat.setBugReportDraft}
					onSetChatMode={supportChat.setChatMode}
					status={supportChat.status}
					threadState={supportChat.threadState}
				/>
			) : (
				<button
					type="button"
					onClick={supportChat.openChat}
					className={cn(
						"pointer-events-auto group inline-flex origin-bottom-right items-center gap-2 rounded-full border border-white/15 bg-[#111418] px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/25 outline-none transition-[transform,background-color,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#D8FF76] motion-reduce:transition-none",
						launcherMotion === "squishy"
							? "hover:-translate-y-1 hover:scale-[1.03] hover:bg-[#1a1f25] hover:shadow-black/35 active:translate-y-0.5 active:scale-x-[1.06] active:scale-y-[0.94]"
							: "hover:-translate-y-0.5 hover:bg-[#1a1f25] active:translate-y-px",
					)}
				>
					<MessageCircle
						className={cn(
							"size-4",
							launcherMotion === "squishy" &&
								"transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110 group-active:scale-95 motion-reduce:transition-none",
						)}
						aria-hidden="true"
					/>
					<span>{content.launcherLabel}</span>
				</button>
			)}
		</div>
	);
}
