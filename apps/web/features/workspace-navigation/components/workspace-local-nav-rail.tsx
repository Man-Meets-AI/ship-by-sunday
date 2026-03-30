"use client";

import Link from "next/link";
import { SidebarGroupLabel, SidebarSeparator } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { WorkspacePrimaryNavState } from "@/features/workspace-navigation/lib/build-primary-nav-model";
import type {
	WorkspaceLocalNavItem,
	WorkspaceLocalNavModel,
} from "../lib/build-secondary-nav-model";

function getStateClassName(state: WorkspacePrimaryNavState) {
	switch (state) {
		case "active":
			return "bg-muted/70 font-semibold text-foreground";
		case "complete":
			return "text-foreground/80 hover:bg-muted/60 hover:text-foreground";
		case "disabled":
			return "cursor-not-allowed text-muted-foreground/35";
		default:
			return "text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground";
	}
}

function LocalNavItem({ item }: { item: WorkspaceLocalNavItem }) {
	const itemClassName = cn(
		"flex h-8 w-full min-w-0 items-center rounded-md px-2 text-left text-sm transition-colors",
		getStateClassName(item.state),
	);

	return item.state === "disabled" ? (
		<span className={itemClassName}>
			<span className="truncate">{item.label}</span>
		</span>
	) : (
		<Link
			href={item.href}
			aria-current={item.state === "active" ? "page" : undefined}
			className={itemClassName}
		>
			<span className="truncate">{item.label}</span>
		</Link>
	);
}

export function WorkspaceLocalNavRail({
	model,
}: {
	model: WorkspaceLocalNavModel;
}) {
	return (
		<div className="space-y-3">
			{model.sections.map((section, index) => (
				<section key={section.id} className="space-y-1">
					<div className="space-y-0.5">
						<SidebarGroupLabel className="px-2">
							{section.label}
						</SidebarGroupLabel>
						{section.description ? (
							<p className="px-2 text-xs leading-5 text-muted-foreground/60">
								{section.description}
							</p>
						) : null}
					</div>
					<div className="grid gap-1">
						{section.items.map((item) => (
							<LocalNavItem key={item.id} item={item} />
						))}
					</div>
					{index < model.sections.length - 1 ? (
						<SidebarSeparator className="my-1" />
					) : null}
				</section>
			))}
		</div>
	);
}
