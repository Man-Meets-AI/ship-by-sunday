"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function AppShellThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="size-8" />;
	}

	const toggleTheme = () => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	};

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="size-8 shrink-0 rounded-full"
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
