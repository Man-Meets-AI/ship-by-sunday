import type { LessonLayoutMode } from "@/lib/course/lesson/model/manifest";

export type AppShellPreferences = {
	layoutMode: LessonLayoutMode;
	localNavCollapsed: boolean;
};

export const APP_SHELL_PREFERENCES_KEY = "ship-by-sunday:app-shell-preferences";

export const APP_SHELL_PREFERENCES_DEFAULT: AppShellPreferences = {
	layoutMode: "split",
	localNavCollapsed: false,
};

type Listener = () => void;

let cachedSnapshot: AppShellPreferences = APP_SHELL_PREFERENCES_DEFAULT;
let isHydrated = false;
const listeners = new Set<Listener>();

function isAppShellPreferences(
	value: Partial<AppShellPreferences> | null,
): value is AppShellPreferences {
	if (!value || typeof value !== "object") {
		return false;
	}
	const candidate = value as Partial<AppShellPreferences>;
	return (
		(candidate.layoutMode === "split" || candidate.layoutMode === "focus") &&
		typeof candidate.localNavCollapsed === "boolean"
	);
}

function readFromStorage(): AppShellPreferences {
	if (typeof window === "undefined") {
		return APP_SHELL_PREFERENCES_DEFAULT;
	}
	try {
		const raw = window.localStorage.getItem(APP_SHELL_PREFERENCES_KEY);
		if (!raw) {
			return APP_SHELL_PREFERENCES_DEFAULT;
		}
		const parsed = JSON.parse(raw) as Partial<AppShellPreferences> | null;
		if (isAppShellPreferences(parsed)) {
			return parsed;
		}
	} catch {
		// Fall through to default.
	}
	return APP_SHELL_PREFERENCES_DEFAULT;
}

function writeToStorage(next: AppShellPreferences) {
	if (typeof window === "undefined") {
		return;
	}
	try {
		window.localStorage.setItem(
			APP_SHELL_PREFERENCES_KEY,
			JSON.stringify(next),
		);
	} catch {
		// Storage is unavailable (private mode, quota); the in-memory snapshot
		// still reflects the change for this tab.
	}
}

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

export function getAppShellPreferences(): AppShellPreferences {
	if (typeof window === "undefined") {
		return APP_SHELL_PREFERENCES_DEFAULT;
	}
	if (!isHydrated) {
		cachedSnapshot = readFromStorage();
		isHydrated = true;
	}
	return cachedSnapshot;
}

export function getServerAppShellPreferences(): AppShellPreferences {
	return APP_SHELL_PREFERENCES_DEFAULT;
}

export function setAppShellPreferences(partial: Partial<AppShellPreferences>) {
	const current = getAppShellPreferences();
	const next: AppShellPreferences = { ...current, ...partial };
	if (
		next.layoutMode === current.layoutMode &&
		next.localNavCollapsed === current.localNavCollapsed
	) {
		return;
	}
	cachedSnapshot = next;
	isHydrated = true;
	writeToStorage(next);
	emitChange();
}

export function subscribeAppShellPreferences(listener: Listener) {
	listeners.add(listener);
	if (typeof window !== "undefined") {
		const onStorage = (event: StorageEvent) => {
			if (event.key !== APP_SHELL_PREFERENCES_KEY) {
				return;
			}
			cachedSnapshot = readFromStorage();
			isHydrated = true;
			emitChange();
		};
		window.addEventListener("storage", onStorage);
		return () => {
			listeners.delete(listener);
			window.removeEventListener("storage", onStorage);
		};
	}
	return () => {
		listeners.delete(listener);
	};
}

export function resetAppShellPreferencesForTests() {
	cachedSnapshot = APP_SHELL_PREFERENCES_DEFAULT;
	isHydrated = false;
	listeners.clear();
}
