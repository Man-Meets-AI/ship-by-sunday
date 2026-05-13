"use client";

import { Moon, Sun } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { startThemeTransition } from "@/lib/theme/start-theme-transition";

export function AppShellThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const prefersReducedMotion = useReducedMotion();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="size-8" />;
	}

	const toggleTheme = () => {
		const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
		startThemeTransition({
			apply: () => setTheme(nextTheme),
			allowAnimation: !prefersReducedMotion,
		});
	};

	return (
		<Button
			type="button"
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			className="size-8 shrink-0 rounded-full border-border/70 bg-background/70 text-foreground hover:bg-background/90 motion-reduce:transition-none"
			aria-label="Toggle theme"
		>
			{resolvedTheme === "dark" ? (
				<Moon className="size-4" />
			) : (
				<Sun className="size-4" />
			)}
		</Button>
	);
}
