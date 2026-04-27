"use client";

import { cn } from "@/lib/utils";
import type { AppShellLocalNav } from "./app-shell-props";

function getLocalNavLabel(kind: AppShellLocalNav["kind"]) {
	switch (kind) {
		case "blueprint":
			return "Blueprint local navigation";
		case "review":
			return "Review local navigation";
		case "workspace":
			return "Workspace local navigation";
	}
}

export function AppShellLocalNavRail({
	localNav,
}: {
	localNav: AppShellLocalNav;
}) {
	return (
		<nav
			aria-label={getLocalNavLabel(localNav.kind)}
			data-shell-local-nav-kind={localNav.kind}
			className="w-full min-w-0"
		>
			{localNav.compact ? (
				<div className="xl:hidden">{localNav.compact}</div>
			) : null}
			<aside
				className={cn(
					"hidden min-h-0 min-w-0 xl:sticky xl:top-3 xl:block xl:self-start",
					"xl:border-r xl:border-border/60 xl:pr-6",
				)}
			>
				{localNav.desktop}
			</aside>
		</nav>
	);
}
