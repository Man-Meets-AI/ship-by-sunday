import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
	APP_SHELL_PREFERENCES_DEFAULT,
	APP_SHELL_PREFERENCES_KEY,
	getAppShellPreferences,
	resetAppShellPreferencesForTests,
	setAppShellPreferences,
} from "@/app/(workspace)/_components/app-shell/app-shell-preferences-store";
import { useAppShellPreferences } from "@/app/(workspace)/_hooks/app-shell/use-app-shell-preferences";

beforeEach(() => {
	resetAppShellPreferencesForTests();
	window.localStorage.clear();
});

afterEach(() => {
	resetAppShellPreferencesForTests();
	window.localStorage.clear();
});

describe("useAppShellPreferences", () => {
	it("returns the default preferences when localStorage is empty", () => {
		const { result } = renderHook(() => useAppShellPreferences());
		expect(result.current.preferences).toEqual(APP_SHELL_PREFERENCES_DEFAULT);
	});

	it("hydrates from localStorage when a valid value is present", () => {
		window.localStorage.setItem(
			APP_SHELL_PREFERENCES_KEY,
			JSON.stringify({ layoutMode: "focus", localNavCollapsed: true }),
		);

		const { result } = renderHook(() => useAppShellPreferences());
		expect(result.current.preferences.layoutMode).toBe("focus");
		expect(result.current.preferences.localNavCollapsed).toBe(true);
	});

	it("falls back to the default when the stored value is malformed", () => {
		window.localStorage.setItem(APP_SHELL_PREFERENCES_KEY, "not-json");

		const { result } = renderHook(() => useAppShellPreferences());
		expect(result.current.preferences).toEqual(APP_SHELL_PREFERENCES_DEFAULT);
	});

	it("writes through to localStorage when setPreferences is called", () => {
		const { result } = renderHook(() => useAppShellPreferences());
		act(() => {
			result.current.setPreferences({ localNavCollapsed: true });
		});
		expect(result.current.preferences.localNavCollapsed).toBe(true);
		expect(
			JSON.parse(
				window.localStorage.getItem(APP_SHELL_PREFERENCES_KEY) ?? "null",
			),
		).toEqual({ layoutMode: "split", localNavCollapsed: true });
	});

	it("toggles localNavCollapsed via the helper", () => {
		const { result } = renderHook(() => useAppShellPreferences());
		expect(result.current.preferences.localNavCollapsed).toBe(false);
		act(() => {
			result.current.toggleLocalNavCollapsed();
		});
		expect(result.current.preferences.localNavCollapsed).toBe(true);
		act(() => {
			result.current.toggleLocalNavCollapsed();
		});
		expect(result.current.preferences.localNavCollapsed).toBe(false);
	});

	it("propagates updates between mounted hooks via the subscribe seam", () => {
		const first = renderHook(() => useAppShellPreferences());
		const second = renderHook(() => useAppShellPreferences());

		expect(first.result.current.preferences.localNavCollapsed).toBe(false);
		expect(second.result.current.preferences.localNavCollapsed).toBe(false);

		act(() => {
			setAppShellPreferences({ localNavCollapsed: true });
		});

		expect(first.result.current.preferences.localNavCollapsed).toBe(true);
		expect(second.result.current.preferences.localNavCollapsed).toBe(true);
	});

	it("returns the SSR-safe default snapshot when read directly without a window touch", () => {
		expect(getAppShellPreferences()).toEqual(APP_SHELL_PREFERENCES_DEFAULT);
	});
});
