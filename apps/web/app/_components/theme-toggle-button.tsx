"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResolvedTheme = "dark" | "light";

type ThemeToggleButtonProps = {
	className?: string;
	syncProductTheme?: boolean;
	onResolvedThemeChange?: (theme: ResolvedTheme) => void;
};

function normalizeResolvedTheme(theme: string | undefined): ResolvedTheme {
	return theme === "dark" ? "dark" : "light";
}

export function ThemeToggleButton({
	className,
	syncProductTheme = false,
	onResolvedThemeChange,
}: ThemeToggleButtonProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const currentTheme = normalizeResolvedTheme(resolvedTheme);
	const nextTheme = currentTheme === "dark" ? "light" : "dark";
	const Icon = currentTheme === "dark" ? SunIcon : MoonIcon;

	useEffect(() => {
		if (!mounted) {
			return;
		}

		if (syncProductTheme) {
			document.documentElement.dataset.productTheme = currentTheme;
		}

		onResolvedThemeChange?.(currentTheme);

		return () => {
			if (syncProductTheme) {
				delete document.documentElement.dataset.productTheme;
			}
		};
	}, [currentTheme, mounted, onResolvedThemeChange, syncProductTheme]);

	if (!mounted) {
		return (
			<span
				aria-hidden="true"
				className={cn("inline-flex min-h-11 min-w-11 shrink-0", className)}
			/>
		);
	}

	return (
		<Button
			type="button"
			onClick={() => setTheme(nextTheme)}
			variant="outline"
			size="icon-sm"
			className={cn("min-h-11 min-w-11 shrink-0 rounded-full", className)}
			aria-label={`Switch to ${nextTheme} mode`}
			title={`Switch to ${nextTheme} mode`}
		>
			<Icon aria-hidden="true" className="size-4" />
		</Button>
	);
}
