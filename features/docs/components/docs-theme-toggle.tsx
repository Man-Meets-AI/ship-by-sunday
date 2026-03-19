"use client";

import { MoonIcon, SunIcon } from "nextra/icons";
import { useTheme } from "nextra-theme-docs";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DOCS_THEME_STORAGE_KEY,
	getDocsThemeCookieString,
	isDocsTheme,
} from "@/features/docs/lib/theme-preferences";

export function DocsThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!isDocsTheme(resolvedTheme)) {
			return;
		}

		document.documentElement.dataset.productTheme = resolvedTheme;
		document.documentElement.classList.remove("light", "dark");
		document.documentElement.classList.add(resolvedTheme);
		window.localStorage.setItem(DOCS_THEME_STORAGE_KEY, resolvedTheme);
		document.cookie = getDocsThemeCookieString(resolvedTheme);
	}, [resolvedTheme]);

	const isDark = mounted ? resolvedTheme === "dark" : false;
	const nextTheme = isDark ? "light" : "dark";
	const label = mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme";
	const Icon = isDark ? SunIcon : MoonIcon;

	return (
		<Button
			type="button"
			onClick={() => setTheme(nextTheme)}
			variant="outline"
			size="sm"
			className="items-center gap-2 rounded-full border-product-border/60 bg-product-surface/70 px-3 py-1.5 text-xs font-bold tracking-[0.16em]"
			aria-label={`Switch to ${nextTheme} theme`}
			title={`Switch to ${nextTheme} theme`}
		>
			<Icon height="14" width="14" />
			<span>{label}</span>
		</Button>
	);
}
