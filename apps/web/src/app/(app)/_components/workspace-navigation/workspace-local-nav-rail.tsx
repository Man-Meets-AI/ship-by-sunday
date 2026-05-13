"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { WorkspacePrimaryNavState } from "@/lib/workspace-navigation/build-primary-nav-model";
import type {
	WorkspaceLocalNavItem,
	WorkspaceLocalNavModel,
} from "@/lib/workspace-navigation/build-secondary-nav-model";

function getStateClassName(state: WorkspacePrimaryNavState) {
	switch (state) {
		case "active":
			return "bg-foreground/[0.06] font-medium text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-[2px] before:rounded-full before:bg-foreground/70";
		case "complete":
			return "text-foreground/85 hover:bg-foreground/[0.04] hover:text-foreground";
		case "disabled":
			return "cursor-not-allowed text-muted-foreground/40";
		default:
			return "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground";
	}
}

function LocalNavItem({ item }: { item: WorkspaceLocalNavItem }) {
	const itemClassName = cn(
		"relative flex h-8 w-full min-w-0 items-center rounded-md px-2.5 text-left text-sm transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
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
		<div className="space-y-6">
			{model.sections.map((section) => (
				<section key={section.id} className="space-y-2">
					<div className="space-y-1 px-2.5">
						<h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
							{section.label}
						</h3>
						{section.description ? (
							<p className="text-xs leading-5 text-muted-foreground/80">
								{section.description}
							</p>
						) : null}
					</div>
					<div className="grid gap-0.5">
						{section.items.map((item) => (
							<LocalNavItem key={item.id} item={item} />
						))}
					</div>
				</section>
			))}
		</div>
	);
}
