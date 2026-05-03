"use client";

import { useEffect, useState } from "react";

const TICK_INTERVAL_MS = 30_000;

function formatRelativeTime(lastSavedAt: number, now: number): string {
	const elapsedSeconds = Math.max(0, Math.round((now - lastSavedAt) / 1000));
	if (elapsedSeconds < 10) {
		return "Saved just now";
	}
	if (elapsedSeconds < 60) {
		return `Saved ${elapsedSeconds}s ago`;
	}
	const elapsedMinutes = Math.round(elapsedSeconds / 60);
	if (elapsedMinutes < 60) {
		return `Saved ${elapsedMinutes}m ago`;
	}
	const elapsedHours = Math.round(elapsedMinutes / 60);
	if (elapsedHours < 24) {
		return `Saved ${elapsedHours}h ago`;
	}
	const formatted = new Date(lastSavedAt).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
	return `Saved on ${formatted}`;
}

export function useBlueprintSavedRelativeTime(
	lastSavedAt: number | null,
): string | null {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (lastSavedAt === null) {
			return;
		}
		setNow(Date.now());
		const interval = window.setInterval(() => {
			setNow(Date.now());
		}, TICK_INTERVAL_MS);
		return () => window.clearInterval(interval);
	}, [lastSavedAt]);

	if (lastSavedAt === null) {
		return null;
	}
	return formatRelativeTime(lastSavedAt, now);
}
