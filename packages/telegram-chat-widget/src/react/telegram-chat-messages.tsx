"use client";

import { Image as ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatTelegramChatAttachmentSize } from "../core/attachment-policy";
import type { TelegramChatContent } from "../core/telegram-chat-content";
import { TELEGRAM_CHAT_TRANSCRIPT_PRIVACY_CLASS_NAME } from "../core/privacy-dom";
import type {
	TelegramChatMessage,
	TelegramChatStatus,
	TelegramChatThreadState,
} from "../core/telegram-chat-types";
import { joinClassNames } from "./react-utils";

export function TelegramChatTranscript({
	content,
	status,
	threadState,
}: {
	readonly content: TelegramChatContent;
	readonly status: TelegramChatStatus;
	readonly threadState: TelegramChatThreadState;
}) {
	const transcriptEndRef = useRef<HTMLDivElement>(null);
	const messages = threadState.messages;

	useEffect(() => {
		transcriptEndRef.current?.scrollIntoView({ block: "end" });
	}, [messages.length, status]);

	return (
		<div
			className={joinClassNames(
				"sbs-telegram-chat-transcript",
				TELEGRAM_CHAT_TRANSCRIPT_PRIVACY_CLASS_NAME,
			)}
			data-ph-no-capture
			role="log"
			aria-live="polite"
		>
			{messages.length === 0 ? (
				<AssistantIntroMessage content={content} />
			) : (
				<div className="sbs-telegram-chat-message-list">
					{messages.map((message) => (
						<TelegramChatMessageBubble
							key={message.id}
							content={content}
							message={message}
						/>
					))}
				</div>
			)}
			<div ref={transcriptEndRef} />
		</div>
	);
}

function AssistantIntroMessage({
	content,
}: {
	readonly content: TelegramChatContent;
}) {
	return (
		<div className="sbs-telegram-chat-assistant-intro">
			<div className="sbs-telegram-chat-avatar" aria-hidden>
				P
			</div>
			<p className="sbs-telegram-chat-assistant-copy">
				{content.starterMessage}
			</p>
		</div>
	);
}

function TelegramChatMessageBubble({
	content,
	message,
}: {
	readonly content: TelegramChatContent;
	readonly message: TelegramChatMessage;
}) {
	if (message.source === "system") {
		return (
			<div className="sbs-telegram-chat-system-message">{message.body}</div>
		);
	}

	const isVisitor = message.source === "visitor";
	const deliveryLabel = getDeliveryLabel(message.deliveryStatus, content);
	return (
		<div
			className={joinClassNames(
				"sbs-telegram-chat-message-row",
				isVisitor && "sbs-telegram-chat-message-row--visitor",
			)}
		>
			{isVisitor ? null : (
				<div className="sbs-telegram-chat-avatar" aria-hidden>
					P
				</div>
			)}
			<div
				className={joinClassNames(
					"sbs-telegram-chat-message-bubble",
					isVisitor
						? "sbs-telegram-chat-message-bubble--visitor"
						: "sbs-telegram-chat-message-bubble--operator",
				)}
			>
				{message.body ? (
					<p className="sbs-telegram-chat-message-body">
						{isVisitor ? message.body : <ProgressiveText text={message.body} />}
					</p>
				) : null}
				{message.attachment ? (
					<div className="sbs-telegram-chat-message-attachment">
						{message.attachment.url ? (
							<img
								src={message.attachment.url}
								alt={message.attachment.fileName}
								className="sbs-telegram-chat-message-attachment-image"
							/>
						) : null}
						<div className="sbs-telegram-chat-message-attachment-meta">
							<ImageIcon className="sbs-telegram-chat-small-icon" aria-hidden />
							<span className="sbs-telegram-chat-attachment-name">
								{message.attachment.fileName} -{" "}
								{formatTelegramChatAttachmentSize(message.attachment.size)}
							</span>
						</div>
					</div>
				) : null}
				{isVisitor && deliveryLabel ? (
					<p className="sbs-telegram-chat-delivery-label">{deliveryLabel}</p>
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
	deliveryStatus: TelegramChatMessage["deliveryStatus"],
	content: TelegramChatContent,
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
