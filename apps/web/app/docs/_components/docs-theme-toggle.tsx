"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DOCS_THEME_STORAGE_KEY,
	getDocsThemeCookieString,
	isDocsTheme,
} from "@/app/docs/_lib/theme-preferences";

function getInitialDocsTheme() {
	const storedTheme = window.localStorage.getItem(DOCS_THEME_STORAGE_KEY);
	if (isDocsTheme(storedTheme)) {
		return storedTheme;
	}

	if (document.documentElement.classList.contains("dark")) {
		return "dark";
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function applyDocsTheme(theme: "dark" | "light") {
	document.documentElement.dataset.productTheme = theme;
	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(theme);
	window.localStorage.setItem(DOCS_THEME_STORAGE_KEY, theme);
	document.cookie = getDocsThemeCookieString(theme);
}

export function DocsThemeToggle() {
	const [theme, setTheme] = useState<"dark" | "light">("light");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const initialTheme = getInitialDocsTheme();
		setTheme(initialTheme);
		applyDocsTheme(initialTheme);
		setMounted(true);
	}, []);

	const isDark = mounted ? theme === "dark" : false;
	const nextTheme = isDark ? "light" : "dark";
	const label = mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme";
	const Icon = isDark ? SunIcon : MoonIcon;

	function handleThemeToggle() {
		setTheme(nextTheme);
		applyDocsTheme(nextTheme);
	}

	return (
		<Button
			type="button"
			onClick={handleThemeToggle}
			variant="outline"
			size="sm"
			className="items-center gap-2 rounded-full border-product-border/60 bg-product-surface/70 px-3 py-1.5 text-xs font-bold tracking-[0.16em]"
			aria-label={`Switch to ${nextTheme} theme`}
			title={`Switch to ${nextTheme} theme`}
		>
			<Icon aria-hidden="true" size={14} />
			<span>{label}</span>
		</Button>
	);
}
