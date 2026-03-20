"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function HomeHeroThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted && resolvedTheme === "dark";
	const nextTheme = isDark ? "light" : "dark";
	const Icon = isDark ? Sun : Moon;

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className="size-7 p-0"
			onClick={() => setTheme(nextTheme)}
			aria-label={`Switch to ${nextTheme} mode`}
			title={`Switch to ${nextTheme} mode`}
		>
			<Icon className="size-3.5 shrink-0" aria-hidden />
		</Button>
	);
}
