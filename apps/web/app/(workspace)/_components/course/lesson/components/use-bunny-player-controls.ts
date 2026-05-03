"use client";

import type { KeyboardEvent, RefObject } from "react";
import { useCallback, useRef } from "react";

function postCommand(
	iframe: HTMLIFrameElement,
	method: string,
	value?: unknown,
	uuid?: string,
) {
	const payload: Record<string, unknown> = {
		context: "player.js",
		version: "1",
		method,
	};
	if (value !== undefined) payload.value = value;
	if (uuid) payload.uuid = uuid;
	const json = JSON.stringify(payload);
	iframe.contentWindow?.postMessage(json, "*");
}

async function rpc(
	iframe: HTMLIFrameElement,
	method: string,
	value?: unknown,
): Promise<unknown> {
	return new Promise((resolve) => {
		const uuid =
			typeof crypto !== "undefined" && "randomUUID" in crypto
				? crypto.randomUUID()
				: `rpc-${Date.now()}`;
		const timer = setTimeout(() => {
			window.removeEventListener("message", onMsg);
			resolve(null);
		}, 220);
		const onMsg = (event: MessageEvent) => {
			if (event.source !== iframe.contentWindow) return;
			let data: { uuid?: string; value?: unknown; event?: string };
			try {
				data =
					typeof event.data === "string"
						? (JSON.parse(event.data) as typeof data)
						: (event.data as typeof data);
			} catch {
				return;
			}
			if (
				data?.uuid === uuid &&
				(data?.event === "methodResponse" || data?.event === "response")
			) {
				clearTimeout(timer);
				window.removeEventListener("message", onMsg);
				resolve(data.value);
			}
		};
		window.addEventListener("message", onMsg);
		postCommand(iframe, method, value, uuid);
	});
}

export function useBunnyPlayerKeyboard(
	iframeRef: RefObject<HTMLIFrameElement | null>,
	enabled: boolean,
) {
	// Dedupe overlapping Space toggles when RPC is slow
	const togglingRef = useRef(false);

	const onKeyDown = useCallback(
		async (event: KeyboardEvent<HTMLElement>) => {
			if (!enabled) return;
			const iframe = iframeRef.current;
			if (!iframe?.contentWindow) return;

			const key = event.key;
			const isSpace = key === " " || key === "Spacebar";
			const isSeek = key === "ArrowLeft" || key === "ArrowRight";
			const isFs = key === "f" || key === "F";

			if (!isSpace && !isSeek && !isFs) return;

			event.preventDefault();

			if (isFs) {
				const target = iframe as HTMLIFrameElement & {
					webkitRequestFullscreen?: () => Promise<void>;
				};
				const go =
					target.requestFullscreen?.bind(target) ??
					target.webkitRequestFullscreen?.bind(target);
				if (go) void go();
				return;
			}

			if (isSpace) {
				if (togglingRef.current) return;
				togglingRef.current = true;
				try {
					const paused = (await rpc(iframe, "getPaused")) as boolean | null;
					if (paused === true) postCommand(iframe, "play");
					else if (paused === false) postCommand(iframe, "pause");
					else postCommand(iframe, "pause");
				} finally {
					togglingRef.current = false;
				}
				return;
			}

			const delta = key === "ArrowLeft" ? -5 : 5;
			const current = (await rpc(iframe, "getCurrentTime")) as number | null;
			if (typeof current === "number" && Number.isFinite(current)) {
				postCommand(iframe, "setCurrentTime", current + delta);
			}
		},
		[enabled, iframeRef],
	);

	return { onKeyDown };
}
