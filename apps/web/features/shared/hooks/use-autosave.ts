"use client";

import { useEffect, useEffectEvent } from "react";

export function useAutosave({
	shouldAutosave,
	delayMs,
	onAutosave,
}: {
	shouldAutosave: boolean;
	delayMs: number;
	onAutosave: () => void | Promise<void>;
}) {
	const handleAutosave = useEffectEvent(() => {
		void onAutosave();
	});

	useEffect(() => {
		if (!shouldAutosave) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			handleAutosave();
		}, delayMs);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [delayMs, shouldAutosave]);
}
