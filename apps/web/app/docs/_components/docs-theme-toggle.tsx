"use client";

import { useTheme } from "next-themes";
import { useEffect, useCallback } from "react";

import { ThemeToggleButton } from "@/app/_components/theme-toggle-button";
import {
	DOCS_THEME_STORAGE_KEY,
	getDocsThemeCookieString,
	isDocsTheme,
} from "@/app/docs/_lib/theme-preferences";

const NEXT_THEMES_STORAGE_KEY = "theme";

export function DocsThemeToggle() {
	const { setTheme } = useTheme();

	useEffect(() => {
		const legacyDocsTheme = window.localStorage.getItem(DOCS_THEME_STORAGE_KEY);
		const appTheme = window.localStorage.getItem(NEXT_THEMES_STORAGE_KEY);

		if (isDocsTheme(legacyDocsTheme) && !isDocsTheme(appTheme)) {
			setTheme(legacyDocsTheme);
		}

		window.localStorage.removeItem(DOCS_THEME_STORAGE_KEY);
	}, [setTheme]);

	const persistDocsTheme = useCallback((theme: "dark" | "light") => {
		document.cookie = getDocsThemeCookieString(theme);
	}, []);

	return (
		<ThemeToggleButton
			syncProductTheme
			onResolvedThemeChange={persistDocsTheme}
			className="size-9 border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
		/>
	);
}
