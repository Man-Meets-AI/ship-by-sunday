"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppShellLocalNav } from "./app-shell-props";

function getLocalNavLabel(kind: AppShellLocalNav["kind"]) {
	switch (kind) {
		case "codebase":
			return "Codebase local navigation";
		case "review":
			return "Review local navigation";
		case "workspace":
			return "Worker local navigation";
	}
}

type AppShellLocalNavRailProps = {
	localNav: AppShellLocalNav;
	collapsed: boolean;
	onToggleCollapsed: () => void;
};

export function AppShellLocalNavRail({
	localNav,
	collapsed,
	onToggleCollapsed,
}: AppShellLocalNavRailProps) {
	const navLabel = getLocalNavLabel(localNav.kind);
	const compactDisclosure = localNav.compact ?? (
		<details className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm">
			<summary className="cursor-pointer select-none text-sm font-medium text-foreground">
				{navLabel}
			</summary>
			<div className="mt-3">{localNav.desktop}</div>
		</details>
	);

	return (
		<nav
			aria-label={navLabel}
			data-shell-local-nav-kind={localNav.kind}
			className="w-full min-w-0"
		>
			<div className="xl:hidden">{compactDisclosure}</div>
			<aside
				className={cn(
					"hidden min-h-0 min-w-0 xl:sticky xl:top-3 xl:block xl:self-start xl:pr-2",
				)}
			>
				<div
					className={cn(
						"mb-3 hidden xl:flex",
						collapsed ? "xl:justify-center" : "xl:justify-end",
					)}
				>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						data-testid="app-shell-local-nav-collapse"
						aria-label={
							collapsed
								? "Expand local navigation"
								: "Collapse local navigation"
						}
						aria-expanded={!collapsed}
						aria-controls="app-shell-local-nav-content"
						onClick={onToggleCollapsed}
						className="size-6 shrink-0 rounded-md text-muted-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground motion-reduce:transition-none"
					>
						{collapsed ? (
							<ChevronRight className="size-3.5" aria-hidden />
						) : (
							<ChevronLeft className="size-3.5" aria-hidden />
						)}
					</Button>
				</div>
				<div
					id="app-shell-local-nav-content"
					className={cn(collapsed ? "hidden" : "block")}
				>
					{localNav.desktop}
				</div>
			</aside>
		</nav>
	);
}
