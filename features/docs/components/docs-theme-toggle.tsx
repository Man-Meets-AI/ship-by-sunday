"use client";

import { MoonIcon, SunIcon } from "nextra/icons";
import { useTheme } from "nextra-theme-docs";
import { useEffect, useState } from "react";

import {
	getProductThemeCookieString,
	isProductTheme,
	PRODUCT_THEME_STORAGE_KEY,
} from "@/features/course/shared/utils/product-theme";

const buttonClassName =
	"inline-flex items-center gap-2 rounded-full border border-product-border/60 bg-product-surface/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-product-text transition-colors hover:bg-product-surface-alt";

export function DocsThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!isProductTheme(resolvedTheme)) {
			return;
		}

		document.documentElement.dataset.productTheme = resolvedTheme;
		document.documentElement.classList.remove("light", "dark");
		document.documentElement.classList.add(resolvedTheme);
		window.localStorage.setItem(PRODUCT_THEME_STORAGE_KEY, resolvedTheme);
		document.cookie = getProductThemeCookieString(resolvedTheme);
	}, [resolvedTheme]);

	const isDark = mounted ? resolvedTheme === "dark" : false;
	const nextTheme = isDark ? "light" : "dark";
	const label = mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme";
	const Icon = isDark ? SunIcon : MoonIcon;

	return (
		<button
			type="button"
			onClick={() => setTheme(nextTheme)}
			className={buttonClassName}
			aria-label={`Switch to ${nextTheme} theme`}
			title={`Switch to ${nextTheme} theme`}
		>
			<Icon height="14" width="14" />
			<span>{label}</span>
		</button>
	);
}
