"use client";

import { useClerk } from "@clerk/nextjs";
import { CommandGroup, CommandItem, CommandSeparator } from "cmdk";
import {
	Bot,
	Compass,
	Code2,
	House,
	LogOut,
	Map,
	Moon,
	PanelLeft,
	Settings,
	Sun,
	SunMoon,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";

import { useAppShellPreferences } from "@/app/(protected)/_hooks/app-shell/use-app-shell-preferences";
import { buildCodebaseStageNavItems } from "@/lib/codebase-flow/codebase-stage-nav-model";
import { startThemeTransition } from "@/lib/theme/start-theme-transition";
import { routeConfig } from "@/config/product";

import type {
	WorkspacePrimaryNavItem,
	WorkspacePrimaryNavMenuEntry,
} from "@/lib/workspace-navigation/build-primary-nav-model";

import type { AppShellPrimaryNav } from "./app-shell-props";
import { workspaceMenuLinks } from "./app-shell-user-menu-helpers";

type AppShellCommandMenuItemsProps = {
	primaryNav: AppShellPrimaryNav | undefined;
	onSelect: () => void;
};

const workspaceLinkIcons = {
	[routeConfig.appHome]: House,
	[routeConfig.starterHome]: Code2,
	[routeConfig.workspaceSetup]: Bot,
	[routeConfig.settings]: Settings,
} as const;

const commandMenuItemLabelClassName =
	"min-w-0 flex-1 break-words text-left leading-snug";

function isVisible<TState extends "active" | "available" | string>(
	state: TState,
): boolean {
	return state === "active" || state === "available";
}

function flattenPostReviewLinks(
	items: WorkspacePrimaryNavItem[],
): { id: string; label: string; href: string }[] {
	const out: { id: string; label: string; href: string }[] = [];
	for (const item of items) {
		if (item.kind === "link" && isVisible(item.state) && item.href !== "#") {
			out.push({ id: item.id, label: item.label, href: item.href });
			continue;
		}
		if (item.kind === "menu" && isVisible(item.state)) {
			for (const child of item.items) {
				if (
					child.kind === "link" &&
					isVisible(child.state) &&
					child.href !== "#"
				) {
					out.push({
						id: `${item.id}.${child.id}`,
						label: `${item.label}: ${child.label}`,
						href: child.href,
					});
				}
			}
		}
	}
	return out;
}

function flattenPostReviewActions(
	items: WorkspacePrimaryNavItem[],
): Extract<WorkspacePrimaryNavMenuEntry, { kind: "action" }>[] {
	const out: Extract<WorkspacePrimaryNavMenuEntry, { kind: "action" }>[] = [];
	for (const item of items) {
		if (item.kind === "menu" && isVisible(item.state)) {
			for (const child of item.items) {
				if (child.kind === "action" && isVisible(child.state)) {
					out.push(child);
				}
			}
		}
	}
	return out;
}

export function AppShellCommandMenuItems({
	primaryNav,
	onSelect,
}: AppShellCommandMenuItemsProps) {
	const { push } = useRouter();
	const pathname = usePathname();
	const { setTheme } = useTheme();
	const prefersReducedMotion = useReducedMotion();
	const { preferences, toggleLocalNavCollapsed } = useAppShellPreferences();
	const clerk = useClerk();

	const navigateTo = (href: string) => {
		onSelect();
		if (primaryNav?.onNavigate) {
			primaryNav.onNavigate(href);
			return;
		}
		push(href);
	};

	const setThemeWithTransition = (theme: "light" | "dark" | "system") => {
		onSelect();
		startThemeTransition({
			apply: () => setTheme(theme),
			allowAnimation: !prefersReducedMotion,
		});
	};

	const codebaseItems = primaryNav
		? buildCodebaseStageNavItems({
				currentStageId: primaryNav.currentCodebaseStageId,
				stageStatuses: primaryNav.stageStatuses,
			}).filter((item) => isVisible(item.state))
		: [];

	const postReviewLinks = primaryNav
		? flattenPostReviewLinks(primaryNav.postReviewItems)
		: [];
	const postReviewActions = primaryNav
		? flattenPostReviewActions(primaryNav.postReviewItems)
		: [];

	const workspaceLinks = workspaceMenuLinks(pathname ?? "/");

	return (
		<>
			{codebaseItems.length > 0 ? (
				<CommandGroup heading="Codebase stages">
					{codebaseItems.map((item) => (
						<CommandItem
							key={`codebase:${item.id}`}
							value={`Codebase ${item.label}`}
							onSelect={() => navigateTo(item.route)}
						>
							<Compass className="size-4 shrink-0 text-muted-foreground" />
							<span className={commandMenuItemLabelClassName}>
								{item.label}
							</span>
						</CommandItem>
					))}
				</CommandGroup>
			) : null}
			{postReviewLinks.length > 0 ? (
				<CommandGroup heading="Lessons">
					{postReviewLinks.map((entry) => (
						<CommandItem
							key={`postreview:${entry.id}`}
							value={`Lesson ${entry.label}`}
							onSelect={() => navigateTo(entry.href)}
						>
							<Compass className="size-4 shrink-0 text-muted-foreground" />
							<span className={commandMenuItemLabelClassName}>
								{entry.label}
							</span>
						</CommandItem>
					))}
					{postReviewActions.map((action) => (
						<CommandItem
							key={`postreview-action:${action.id}`}
							value={`Action ${action.label}`}
							onSelect={() => {
								if (action.actionId === "showLessonMap") {
									navigateTo(`${routeConfig.review}?showLessonMap=1`);
								}
							}}
						>
							<Map className="size-4 shrink-0 text-muted-foreground" />
							<span className={commandMenuItemLabelClassName}>
								{action.label}
							</span>
						</CommandItem>
					))}
				</CommandGroup>
			) : null}
			<CommandGroup heading="App">
				{workspaceLinks.map((link) => {
					const Icon =
						workspaceLinkIcons[link.href as keyof typeof workspaceLinkIcons];
					return (
						<CommandItem
							key={`workspace:${link.href}`}
							value={`App ${link.label}`}
							onSelect={() => navigateTo(link.href)}
						>
							<Icon className="size-4 shrink-0 text-muted-foreground" />
							<span className={commandMenuItemLabelClassName}>
								{link.label}
							</span>
						</CommandItem>
					);
				})}
				<CommandItem
					value="Toggle local navigation"
					onSelect={() => {
						onSelect();
						toggleLocalNavCollapsed();
					}}
				>
					<PanelLeft className="size-4 shrink-0 text-muted-foreground" />
					<span className={commandMenuItemLabelClassName}>
						{preferences.localNavCollapsed
							? "Expand local navigation"
							: "Collapse local navigation"}
					</span>
				</CommandItem>
			</CommandGroup>
			<CommandSeparator className="my-1 h-px bg-border" />
			<CommandGroup heading="Theme">
				<CommandItem
					value="Theme light"
					onSelect={() => setThemeWithTransition("light")}
				>
					<Sun className="size-4 shrink-0 text-muted-foreground" />
					<span className={commandMenuItemLabelClassName}>Light</span>
				</CommandItem>
				<CommandItem
					value="Theme dark"
					onSelect={() => setThemeWithTransition("dark")}
				>
					<Moon className="size-4 shrink-0 text-muted-foreground" />
					<span className={commandMenuItemLabelClassName}>Dark</span>
				</CommandItem>
				<CommandItem
					value="Theme system"
					onSelect={() => setThemeWithTransition("system")}
				>
					<SunMoon className="size-4 shrink-0 text-muted-foreground" />
					<span className={commandMenuItemLabelClassName}>System</span>
				</CommandItem>
			</CommandGroup>
			<CommandSeparator className="my-1 h-px bg-border" />
			<CommandGroup heading="Account">
				<CommandItem
					value="Sign out"
					onSelect={() => {
						onSelect();
						void clerk.signOut({ redirectUrl: routeConfig.home });
					}}
				>
					<LogOut className="size-4 shrink-0 text-muted-foreground" />
					<span className={commandMenuItemLabelClassName}>Sign out</span>
				</CommandItem>
			</CommandGroup>
		</>
	);
}
