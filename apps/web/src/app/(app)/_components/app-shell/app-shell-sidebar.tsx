"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Bot,
	ChevronDown,
	ChevronRight,
	Code2,
	Columns2,
	House,
	ListChecks,
	Map,
	Settings,
	Square,
} from "lucide-react";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { buildCodebaseStageNavItems } from "@/lib/codebase-flow/codebase-stage-nav-model";
import type { LessonLayoutMode } from "@/lib/course/lesson/model/manifest";
import { cn } from "@/lib/utils";
import { routeConfig } from "@/config/product";

import type {
	AppShellLocalNav,
	AppShellPrimaryNav,
	AppShellProgressSummary,
} from "./app-shell-props";
import { AppShellCommandMenu } from "./app-shell-command-menu";
import { AppShellThemeToggle } from "./app-shell-theme-toggle";
import { AppShellUserMenu } from "./app-shell-user-menu";
import { workspaceMenuLinks } from "./app-shell-user-menu-helpers";

const APP_SHELL_SIDEBAR_WIDTH_STORAGE_KEY =
	"ship-by-sunday:app-shell-sidebar-width";
const APP_SHELL_SIDEBAR_MIN_WIDTH = 14 * 16;
const APP_SHELL_MAIN_CONTENT_MIN_WIDTH = 40 * 16;

const workspaceLinkIcons = {
	[routeConfig.appHome]: House,
	[routeConfig.starterHome]: Code2,
	[routeConfig.workspaceSetup]: Bot,
	[routeConfig.settings]: Settings,
} as const;

function handleControlledNavigation(
	event: { defaultPrevented: boolean; preventDefault: () => void },
	href: string,
	onNavigate?: (href: string) => void,
) {
	if (event.defaultPrevented || !onNavigate) {
		return;
	}

	event.preventDefault();
	onNavigate(href);
}

function getLocalNavLabel(kind: AppShellLocalNav["kind"]) {
	switch (kind) {
		case "codebase":
			return "Codebase";
		case "review":
			return "Review";
		case "workspace":
			return "Workers";
	}
}

function AppShellSidebarWorkspaceLinks() {
	const pathname = usePathname() ?? "/";
	const links = workspaceMenuLinks(pathname);

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Workspace</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{links.map((link) => {
						const Icon =
							workspaceLinkIcons[link.href as keyof typeof workspaceLinkIcons];
						return (
							<SidebarMenuItem key={link.href}>
								<SidebarMenuButton
									asChild
									isActive={link.active}
									tooltip={link.label}
								>
									<Link
										href={link.href}
										aria-current={link.active ? "page" : undefined}
									>
										<Icon aria-hidden />
										<span>{link.label}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function AppShellSidebarCodebaseNav({
	primaryNav,
}: {
	primaryNav: AppShellPrimaryNav;
}) {
	const items = buildCodebaseStageNavItems({
		currentStageId: primaryNav.currentCodebaseStageId,
		stageStatuses: primaryNav.stageStatuses,
	});

	if (items.length === 0) {
		return null;
	}

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Codebase</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.id}>
							{item.state === "locked" ? (
								<SidebarMenuButton disabled tooltip={item.label}>
									<ListChecks aria-hidden />
									<span>{item.label}</span>
								</SidebarMenuButton>
							) : (
								<SidebarMenuButton
									asChild
									isActive={item.state === "active"}
									tooltip={item.label}
								>
									<Link
										href={item.route}
										aria-current={item.state === "active" ? "page" : undefined}
										onNavigate={(event) =>
											primaryNav.onLinkNavigate?.(event, item.route)
										}
										onClick={(event) =>
											handleControlledNavigation(
												event,
												item.route,
												primaryNav.onNavigate,
											)
										}
									>
										<ListChecks aria-hidden />
										<span>{item.label}</span>
									</Link>
								</SidebarMenuButton>
							)}
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function AppShellSidebarPostReviewNav({
	primaryNav,
}: {
	primaryNav: AppShellPrimaryNav;
}) {
	const items = primaryNav.postReviewItems;

	if (items.length === 0) {
		return null;
	}

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Lessons</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) =>
						item.kind === "link" ? (
							<SidebarMenuItem key={item.id}>
								{item.state === "disabled" ? (
									<SidebarMenuButton disabled tooltip={item.label}>
										<Map aria-hidden />
										<span>{item.label}</span>
									</SidebarMenuButton>
								) : (
									<SidebarMenuButton
										asChild
										isActive={item.state === "active"}
										tooltip={item.label}
									>
										<Link
											href={item.href}
											aria-current={
												item.state === "active" ? "page" : undefined
											}
											onNavigate={(event) =>
												primaryNav.onLinkNavigate?.(event, item.href)
											}
											onClick={(event) =>
												handleControlledNavigation(
													event,
													item.href,
													primaryNav.onNavigate,
												)
											}
										>
											<Map aria-hidden />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								)}
							</SidebarMenuItem>
						) : (
							<SidebarMenuItem key={item.id}>
								<SidebarMenuButton
									isActive={item.state === "active"}
									tooltip={item.label}
								>
									<Map aria-hidden />
									<span>{item.label}</span>
								</SidebarMenuButton>
								<SidebarMenuSub>
									{item.items.map((entry) => (
										<SidebarMenuSubItem key={entry.id}>
											{entry.kind === "action" ? (
												<SidebarMenuSubButton
													asChild
													isActive={entry.state === "active"}
												>
													<button
														type="button"
														disabled={entry.state === "disabled"}
														onClick={() =>
															primaryNav.onAction?.(entry.actionId)
														}
													>
														<span>{entry.label}</span>
													</button>
												</SidebarMenuSubButton>
											) : entry.state === "disabled" ? (
												<SidebarMenuSubButton
													asChild={false}
													isActive={false}
													aria-disabled="true"
												>
													<span>{entry.label}</span>
												</SidebarMenuSubButton>
											) : (
												<SidebarMenuSubButton
													asChild
													isActive={entry.state === "active"}
												>
													<Link
														href={entry.href}
														aria-current={
															entry.state === "active" ? "page" : undefined
														}
														onNavigate={(event) =>
															primaryNav.onLinkNavigate?.(event, entry.href)
														}
														onClick={(event) =>
															handleControlledNavigation(
																event,
																entry.href,
																primaryNav.onNavigate,
															)
														}
													>
														<span>{entry.label}</span>
													</Link>
												</SidebarMenuSubButton>
											)}
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</SidebarMenuItem>
						),
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function AppShellSidebarLocalNav({
	collapsed,
	localNav,
	onToggleCollapsed,
}: {
	collapsed: boolean;
	localNav: AppShellLocalNav | undefined;
	onToggleCollapsed: () => void;
}) {
	if (!localNav) {
		return null;
	}

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{getLocalNavLabel(localNav.kind)}</SidebarGroupLabel>
			<SidebarGroupAction
				type="button"
				aria-label={
					collapsed ? "Expand local navigation" : "Collapse local navigation"
				}
				aria-expanded={!collapsed}
				onClick={onToggleCollapsed}
			>
				{collapsed ? <ChevronRight aria-hidden /> : <ChevronDown aria-hidden />}
			</SidebarGroupAction>
			{collapsed ? null : (
				<SidebarGroupContent className="px-1">
					{localNav.desktop}
				</SidebarGroupContent>
			)}
		</SidebarGroup>
	);
}

function AppShellSidebarLayoutControls({
	layoutMode,
	onLayoutModeChange,
}: {
	layoutMode: LessonLayoutMode | undefined;
	onLayoutModeChange: ((mode: LessonLayoutMode) => void) | undefined;
}) {
	if (!onLayoutModeChange) {
		return null;
	}

	return (
		<div className="grid grid-cols-2 gap-1">
			<Button
				type="button"
				title="Split view - coach and workbench side by side"
				aria-label="Switch to split view"
				aria-pressed={layoutMode === "split"}
				onClick={() => onLayoutModeChange("split")}
				variant={layoutMode === "split" ? "secondary" : "ghost"}
				size="sm"
				className="justify-start"
			>
				<Columns2 aria-hidden />
				Split
			</Button>
			<Button
				type="button"
				title="Focus view - full-width workbench"
				aria-label="Switch to focus view"
				aria-pressed={layoutMode === "focus"}
				onClick={() => onLayoutModeChange("focus")}
				variant={layoutMode === "focus" ? "secondary" : "ghost"}
				size="sm"
				className="justify-start"
			>
				<Square aria-hidden />
				Focus
			</Button>
		</div>
	);
}

function AppShellSidebarFooter({
	layoutMode,
	onLayoutModeChange,
	progressSummary,
	primaryNav,
}: {
	layoutMode: LessonLayoutMode | undefined;
	onLayoutModeChange: ((mode: LessonLayoutMode) => void) | undefined;
	progressSummary: AppShellProgressSummary | undefined;
	primaryNav: AppShellPrimaryNav | undefined;
}) {
	const progressVerb = progressSummary?.progressLabel ?? "lessons completed";

	return (
		<SidebarFooter>
			<AppShellSidebarLayoutControls
				layoutMode={layoutMode}
				onLayoutModeChange={onLayoutModeChange}
			/>
			{progressSummary ? (
				<div
					className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-2 text-xs text-sidebar-foreground"
					title={`${progressSummary.progressCount} of ${progressSummary.totalLessons} ${progressVerb}`}
				>
					<span className="font-number font-medium">
						{progressSummary.progressCount}/{progressSummary.totalLessons}
					</span>{" "}
					<span className="text-sidebar-foreground/70">{progressVerb}</span>
				</div>
			) : null}
			<SidebarSeparator />
			<div className="flex items-center gap-1">
				<AppShellCommandMenu primaryNav={primaryNav} />
				<AppShellThemeToggle />
				<AppShellUserMenu />
			</div>
		</SidebarFooter>
	);
}

export function AppShellSidebar({
	layoutMode,
	localNav,
	localNavCollapsed,
	onLayoutModeChange,
	onToggleLocalNavCollapsed,
	primaryNav,
	progressSummary,
}: {
	layoutMode: LessonLayoutMode | undefined;
	localNav: AppShellLocalNav | undefined;
	localNavCollapsed: boolean;
	onLayoutModeChange: ((mode: LessonLayoutMode) => void) | undefined;
	onToggleLocalNavCollapsed: () => void;
	primaryNav: AppShellPrimaryNav | undefined;
	progressSummary: AppShellProgressSummary | undefined;
}) {
	return (
		<Sidebar
			side="left"
			collapsible="offcanvas"
			className="border-r border-border bg-card text-foreground"
			resizable={{
				minWidth: APP_SHELL_SIDEBAR_MIN_WIDTH,
				shouldAcceptWidth: ({ nextWidth, wrapper }) =>
					wrapper.clientWidth - nextWidth >= APP_SHELL_MAIN_CONTENT_MIN_WIDTH,
				storageKey: APP_SHELL_SIDEBAR_WIDTH_STORAGE_KEY,
			}}
		>
			<SidebarHeader>
				<div className="flex items-center gap-2">
					<ProductBrand
						href={routeConfig.appHome}
						labelClassName={cn(productWordmarkClassName, "text-sm")}
					/>
					<SidebarTrigger
						className="ml-auto md:hidden"
						aria-label="Toggle app sidebar"
					/>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<AppShellSidebarWorkspaceLinks />
				{primaryNav ? (
					<>
						<SidebarSeparator />
						<AppShellSidebarCodebaseNav primaryNav={primaryNav} />
						<AppShellSidebarPostReviewNav primaryNav={primaryNav} />
					</>
				) : null}
				{localNav ? (
					<>
						<SidebarSeparator />
						<AppShellSidebarLocalNav
							localNav={localNav}
							collapsed={localNavCollapsed}
							onToggleCollapsed={onToggleLocalNavCollapsed}
						/>
					</>
				) : null}
			</SidebarContent>
			<AppShellSidebarFooter
				layoutMode={layoutMode}
				onLayoutModeChange={onLayoutModeChange}
				primaryNav={primaryNav}
				progressSummary={progressSummary}
			/>
			<SidebarRail />
		</Sidebar>
	);
}

export function AppShellMobileHeader({
	primaryNav,
}: {
	primaryNav: AppShellPrimaryNav | undefined;
}) {
	return (
		<header className="sticky top-0 z-20 flex min-h-12 items-center gap-2 border-b border-border/60 bg-background/95 px-2 py-2 backdrop-blur md:hidden">
			<SidebarTrigger aria-label="Open app sidebar" />
			<ProductBrand
				href={routeConfig.appHome}
				labelClassName={cn(productWordmarkClassName, "text-sm")}
			/>
			<div className="ml-auto flex items-center gap-1">
				<AppShellCommandMenu primaryNav={primaryNav} />
				<AppShellThemeToggle />
				<AppShellUserMenu />
			</div>
		</header>
	);
}
