"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
	type AppShellPreferences,
	getAppShellPreferences,
	getServerAppShellPreferences,
	setAppShellPreferences,
	subscribeAppShellPreferences,
} from "@/app/(app)/_components/app-shell/app-shell-preferences-store";

export type UseAppShellPreferencesResult = {
	preferences: AppShellPreferences;
	setPreferences: (partial: Partial<AppShellPreferences>) => void;
	toggleLocalNavCollapsed: () => void;
};

export function useAppShellPreferences(): UseAppShellPreferencesResult {
	const preferences = useSyncExternalStore(
		subscribeAppShellPreferences,
		getAppShellPreferences,
		getServerAppShellPreferences,
	);

	const setPreferences = useCallback(
		(partial: Partial<AppShellPreferences>) => {
			setAppShellPreferences(partial);
		},
		[],
	);

	const toggleLocalNavCollapsed = useCallback(() => {
		setAppShellPreferences({
			localNavCollapsed: !getAppShellPreferences().localNavCollapsed,
		});
	}, []);

	return { preferences, setPreferences, toggleLocalNavCollapsed };
}
