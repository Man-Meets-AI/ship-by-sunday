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

export function SupportWidget({
	analyticsSurface,
	content,
	entrySurface,
	fallbackHref,
}: {
	readonly analyticsSurface: SupportWidgetAnalyticsSurface;
	readonly content: SupportWidgetContent;
	readonly entrySurface: SupportWidgetEntrySurface;
	readonly fallbackHref: string;
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
					canSend={supportChat.canSend}
					content={content}
					draftMessage={supportChat.draftMessage}
					errorMessage={supportChat.errorMessage}
					fallbackHref={fallbackHref}
					isBusy={supportChat.isBusy}
					onClose={supportChat.closeChat}
					onDraftMessageChange={supportChat.setDraftMessage}
					onFallbackClick={supportChat.recordFallbackClick}
					onRefresh={supportChat.refreshThread}
					onSend={supportChat.sendMessage}
					status={supportChat.status}
					threadState={supportChat.threadState}
				/>
			) : (
				<button
					type="button"
					onClick={supportChat.openChat}
					className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#111418] px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[#1a1f25] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8FF76]"
				>
					<MessageCircle className="size-4" aria-hidden="true" />
					<span>{content.launcherLabel}</span>
				</button>
			)}
		</div>
	);
}
