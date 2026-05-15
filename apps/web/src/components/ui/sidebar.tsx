"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "calc(100vw - 0.75rem)";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SIDEBAR_RESIZE_DEFAULT_MIN_WIDTH = 16 * 16;

type SidebarContextProps = {
	state: "expanded" | "collapsed";
	open: boolean;
	setOpen: (open: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
};

type SidebarResizableOptions = {
	maxWidth?: number;
	minWidth?: number;
	onResize?: (width: number) => void;
	shouldAcceptWidth?: (context: {
		currentWidth: number;
		nextWidth: number;
		rail: HTMLButtonElement;
		side: "left" | "right";
		sidebarRoot: HTMLElement;
		wrapper: HTMLElement;
	}) => boolean;
	storageKey?: string;
};

type SidebarResolvedResizableOptions = {
	maxWidth: number;
	minWidth: number;
	onResize?: (width: number) => void;
	shouldAcceptWidth?: (context: {
		currentWidth: number;
		nextWidth: number;
		rail: HTMLButtonElement;
		side: "left" | "right";
		sidebarRoot: HTMLElement;
		wrapper: HTMLElement;
	}) => boolean;
	storageKey: string | null;
};

type SidebarInstanceContextProps = {
	resizable: SidebarResolvedResizableOptions | null;
	side: "left" | "right";
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);
const SidebarInstanceContext =
	React.createContext<SidebarInstanceContextProps | null>(null);

function useSidebar() {
	const context = React.use(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider.");
	}

	return context;
}

function readStoredSidebarWidth(storageKey: string): number | null {
	if (typeof window === "undefined") {
		return null;
	}
	try {
		const raw = window.localStorage.getItem(storageKey);
		if (!raw) {
			return null;
		}
		const parsed = Number(raw);
		return Number.isFinite(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

function writeStoredSidebarWidth(storageKey: string, width: number) {
	if (typeof window === "undefined") {
		return;
	}
	try {
		window.localStorage.setItem(storageKey, String(width));
	} catch {
		// Keep the visual resize even when storage is unavailable.
	}
}

function SidebarProvider({
	defaultOpen = true,
	open: openProp,
	onOpenChange: setOpenProp,
	className,
	style,
	children,
	...props
}: React.ComponentProps<"div"> & {
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = React.useState(false);

	// This is the internal state of the sidebar.
	// We use openProp and setOpenProp for control from outside the component.
	const [_open, _setOpen] = React.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = React.useCallback(
		(value: boolean | ((value: boolean) => boolean)) => {
			const openState = typeof value === "function" ? value(open) : value;
			if (setOpenProp) {
				setOpenProp(openState);
			} else {
				_setOpen(openState);
			}

			// This sets the cookie to keep the sidebar state.
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		},
		[setOpenProp, open],
	);

	// Helper to toggle the sidebar.
	const toggleSidebar = React.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [isMobile, setOpen, setOpenMobile]);

	// Adds a keyboard shortcut to toggle the sidebar.
	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault();
				toggleSidebar();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleSidebar]);

	// We add a state so that we can do data-state="expanded" or "collapsed".
	// This makes it easier to style the sidebar with Tailwind classes.
	const state = open ? "expanded" : "collapsed";

	const contextValue = React.useMemo<SidebarContextProps>(
		() => ({
			state,
			open,
			setOpen,
			isMobile,
			openMobile,
			setOpenMobile,
			toggleSidebar,
		}),
		[state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
	);

	return (
		<TooltipProvider delayDuration={0}>
			<SidebarContext.Provider value={contextValue}>
				<div
					data-slot="sidebar-wrapper"
					style={
						{
							"--sidebar-width": SIDEBAR_WIDTH,
							"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
							...style,
						} as React.CSSProperties
					}
					className={cn(
						"group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
						className,
					)}
					{...props}
				>
					{children}
				</div>
			</SidebarContext.Provider>
		</TooltipProvider>
	);
}

function Sidebar({
	side = "left",
	variant = "sidebar",
	collapsible = "offcanvas",
	resizable = false,
	className,
	children,
	dir,
	...props
}: React.ComponentProps<"div"> & {
	side?: "left" | "right";
	variant?: "sidebar" | "floating" | "inset";
	collapsible?: "offcanvas" | "icon" | "none";
	resizable?: boolean | SidebarResizableOptions;
}) {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
	const resolvedResizable =
		React.useMemo<SidebarResolvedResizableOptions | null>(() => {
			if (isMobile || collapsible === "none" || !resizable) {
				return null;
			}

			const options = typeof resizable === "boolean" ? {} : resizable;
			return {
				maxWidth: options.maxWidth ?? Number.POSITIVE_INFINITY,
				minWidth: options.minWidth ?? SIDEBAR_RESIZE_DEFAULT_MIN_WIDTH,
				storageKey: options.storageKey ?? null,
				...(options.onResize ? { onResize: options.onResize } : {}),
				...(options.shouldAcceptWidth
					? { shouldAcceptWidth: options.shouldAcceptWidth }
					: {}),
			};
		}, [collapsible, isMobile, resizable]);
	const instanceContextValue = React.useMemo<SidebarInstanceContextProps>(
		() => ({ resizable: resolvedResizable, side }),
		[resolvedResizable, side],
	);

	if (collapsible === "none") {
		return (
			<SidebarInstanceContext.Provider value={instanceContextValue}>
				<div
					data-slot="sidebar"
					className={cn(
						"flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
						className,
					)}
					{...props}
				>
					{children}
				</div>
			</SidebarInstanceContext.Provider>
		);
	}

	if (isMobile) {
		return (
			<SidebarInstanceContext.Provider value={instanceContextValue}>
				<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
					<SheetContent
						dir={dir}
						data-sidebar="sidebar"
						data-slot="sidebar"
						data-mobile="true"
						className={cn(
							"w-(--sidebar-width) max-w-none bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
							className,
						)}
						style={
							{
								"--sidebar-width": SIDEBAR_WIDTH_MOBILE,
							} as React.CSSProperties
						}
						side={side}
					>
						<SheetHeader className="sr-only">
							<SheetTitle>Sidebar</SheetTitle>
							<SheetDescription>Displays the mobile sidebar.</SheetDescription>
						</SheetHeader>
						<div className="flex h-full w-full flex-col">{children}</div>
					</SheetContent>
				</Sheet>
			</SidebarInstanceContext.Provider>
		);
	}

	return (
		<SidebarInstanceContext.Provider value={instanceContextValue}>
			<div
				className="group peer hidden text-sidebar-foreground md:block"
				data-state={state}
				data-collapsible={state === "collapsed" ? collapsible : ""}
				data-variant={variant}
				data-side={side}
				data-slot="sidebar"
			>
				{/* This is what handles the sidebar gap on desktop */}
				<div
					data-slot="sidebar-gap"
					className={cn(
						"relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
						"group-data-[collapsible=offcanvas]:w-0",
						"group-data-[side=right]:rotate-180",
						variant === "floating" || variant === "inset"
							? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
							: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
					)}
				/>
				<div
					data-slot="sidebar-container"
					data-side={side}
					className={cn(
						"fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
						// Adjust the padding for floating and inset variants.
						variant === "floating" || variant === "inset"
							? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
							: "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
						className,
					)}
					{...props}
				>
					<div
						data-sidebar="sidebar"
						data-slot="sidebar-inner"
						className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm/5"
					>
						{children}
					</div>
				</div>
			</div>
		</SidebarInstanceContext.Provider>
	);
}

function SidebarTrigger({
	className,
	onClick,
	...props
}: React.ComponentProps<typeof Button>) {
	const { openMobile, toggleSidebar } = useSidebar();

	return (
		<Button
			data-sidebar="trigger"
			data-slot="sidebar-trigger"
			variant="ghost"
			size="icon"
			className={cn("size-7", className)}
			onClick={(event) => {
				onClick?.(event);
				toggleSidebar();
			}}
			{...props}
		>
			{openMobile ? <PanelLeftCloseIcon /> : <PanelLeftIcon />}
			<span className="sr-only">Toggle Sidebar</span>
		</Button>
	);
}

function clampSidebarWidth(
	width: number,
	options: SidebarResolvedResizableOptions,
): number {
	return Math.max(options.minWidth, Math.min(width, options.maxWidth));
}

function SidebarRail({
	className,
	onClick,
	onPointerCancel,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	...props
}: React.ComponentProps<"button">) {
	const { open, toggleSidebar } = useSidebar();
	const sidebarInstance = React.use(SidebarInstanceContext);
	const railRef = React.useRef<HTMLButtonElement | null>(null);
	const suppressClickRef = React.useRef(false);
	const resizeStateRef = React.useRef<{
		moved: boolean;
		pointerId: number;
		pendingWidth: number;
		rail: HTMLButtonElement;
		rafId: number | null;
		sidebarRoot: HTMLElement;
		side: "left" | "right";
		startWidth: number;
		startX: number;
		transitionTargets: HTMLElement[];
		width: number;
		wrapper: HTMLElement;
	} | null>(null);
	const resolvedResizable = sidebarInstance?.resizable ?? null;
	const canResize = resolvedResizable !== null && open;
	const railLabel = canResize ? "Resize Sidebar" : "Toggle Sidebar";
	const railTitle = canResize ? "Drag to resize sidebar" : "Toggle Sidebar";

	const applyPendingResizeState = React.useCallback(
		(resizeState: NonNullable<typeof resizeStateRef.current>) => {
			if (!resolvedResizable) {
				return;
			}
			const nextWidth = resizeState.pendingWidth;
			const accepted =
				resolvedResizable.shouldAcceptWidth?.({
					currentWidth: resizeState.width,
					nextWidth,
					rail: resizeState.rail,
					side: resizeState.side,
					sidebarRoot: resizeState.sidebarRoot,
					wrapper: resizeState.wrapper,
				}) ?? true;
			if (!accepted) {
				return;
			}

			resizeState.wrapper.style.setProperty(
				"--sidebar-width",
				`${nextWidth}px`,
			);
			resizeState.width = nextWidth;
		},
		[resolvedResizable],
	);

	const stopResize = React.useCallback(
		(pointerId: number) => {
			const resizeState = resizeStateRef.current;
			if (!resizeState) {
				return;
			}
			if (resizeState.rafId !== null) {
				window.cancelAnimationFrame(resizeState.rafId);
				resizeState.rafId = null;
			}
			applyPendingResizeState(resizeState);
			resizeState.transitionTargets.forEach((element) => {
				element.style.removeProperty("transition-duration");
			});
			if (resolvedResizable?.storageKey) {
				writeStoredSidebarWidth(
					resolvedResizable.storageKey,
					resizeState.width,
				);
			}
			resolvedResizable?.onResize?.(resizeState.width);
			resizeStateRef.current = null;
			if (resizeState.rail.hasPointerCapture(pointerId)) {
				resizeState.rail.releasePointerCapture(pointerId);
			}
			document.body.style.removeProperty("cursor");
			document.body.style.removeProperty("user-select");
		},
		[applyPendingResizeState, resolvedResizable],
	);

	const handlePointerDown = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			onPointerDown?.(event);
			if (event.defaultPrevented) {
				return;
			}
			if (!resolvedResizable || !open || event.button !== 0) {
				return;
			}

			const wrapper = event.currentTarget.closest<HTMLElement>(
				"[data-slot='sidebar-wrapper']",
			);
			const sidebarRoot = event.currentTarget.closest<HTMLElement>(
				"[data-slot='sidebar']",
			);
			if (!wrapper || !sidebarRoot) {
				return;
			}

			const sidebarContainer = sidebarRoot.querySelector<HTMLElement>(
				"[data-slot='sidebar-container']",
			);
			if (!sidebarContainer) {
				return;
			}

			const startWidth = sidebarContainer.getBoundingClientRect().width;
			const initialWidth = clampSidebarWidth(startWidth, resolvedResizable);
			const transitionTargets = [
				sidebarRoot.querySelector<HTMLElement>("[data-slot='sidebar-gap']"),
				sidebarRoot.querySelector<HTMLElement>(
					"[data-slot='sidebar-container']",
				),
			].filter((element): element is HTMLElement => element !== null);
			transitionTargets.forEach((element) => {
				element.style.setProperty("transition-duration", "0ms");
			});

			event.preventDefault();
			event.stopPropagation();
			resizeStateRef.current = {
				moved: false,
				pointerId: event.pointerId,
				pendingWidth: initialWidth,
				rail: event.currentTarget,
				rafId: null,
				sidebarRoot,
				side: sidebarInstance?.side ?? "left",
				startWidth: initialWidth,
				startX: event.clientX,
				transitionTargets,
				width: initialWidth,
				wrapper,
			};
			wrapper.style.setProperty("--sidebar-width", `${initialWidth}px`);
			event.currentTarget.setPointerCapture(event.pointerId);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
		},
		[onPointerDown, open, resolvedResizable, sidebarInstance?.side],
	);

	const handlePointerMove = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			onPointerMove?.(event);
			if (event.defaultPrevented) {
				return;
			}
			const resizeState = resizeStateRef.current;
			if (
				!resizeState ||
				resizeState.pointerId !== event.pointerId ||
				!resolvedResizable
			) {
				return;
			}

			event.preventDefault();
			const delta =
				resizeState.side === "right"
					? resizeState.startX - event.clientX
					: event.clientX - resizeState.startX;
			if (Math.abs(delta) > 2) {
				resizeState.moved = true;
			}
			resizeState.pendingWidth = clampSidebarWidth(
				resizeState.startWidth + delta,
				resolvedResizable,
			);
			if (resizeState.rafId !== null) {
				return;
			}

			resizeState.rafId = window.requestAnimationFrame(() => {
				const activeResizeState = resizeStateRef.current;
				if (!activeResizeState || !resolvedResizable) {
					return;
				}

				activeResizeState.rafId = null;
				applyPendingResizeState(activeResizeState);
			});
		},
		[applyPendingResizeState, onPointerMove, resolvedResizable],
	);

	const endResizeInteraction = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			const resizeState = resizeStateRef.current;
			if (!resizeState || resizeState.pointerId !== event.pointerId) {
				return;
			}

			event.preventDefault();
			suppressClickRef.current = resizeState.moved;
			stopResize(event.pointerId);
		},
		[stopResize],
	);

	const handlePointerUp = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			onPointerUp?.(event);
			if (event.defaultPrevented) {
				return;
			}
			endResizeInteraction(event);
		},
		[endResizeInteraction, onPointerUp],
	);

	const handlePointerCancel = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			onPointerCancel?.(event);
			if (event.defaultPrevented) {
				return;
			}
			endResizeInteraction(event);
		},
		[endResizeInteraction, onPointerCancel],
	);

	const handleClick = React.useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			if (suppressClickRef.current) {
				suppressClickRef.current = false;
				event.preventDefault();
				return;
			}
			onClick?.(event);
			if (event.defaultPrevented) {
				return;
			}
			if (resolvedResizable && open) {
				event.preventDefault();
				return;
			}
			toggleSidebar();
		},
		[onClick, open, resolvedResizable, toggleSidebar],
	);

	React.useEffect(() => {
		if (!resolvedResizable?.storageKey) {
			return;
		}
		const rail = railRef.current;
		if (!rail) {
			return;
		}
		const wrapper = rail.closest<HTMLElement>("[data-slot='sidebar-wrapper']");
		if (!wrapper) {
			return;
		}

		const storedWidth = readStoredSidebarWidth(resolvedResizable.storageKey);
		if (storedWidth === null) {
			return;
		}
		const clampedWidth = clampSidebarWidth(storedWidth, resolvedResizable);
		wrapper.style.setProperty("--sidebar-width", `${clampedWidth}px`);
		resolvedResizable.onResize?.(clampedWidth);
	}, [resolvedResizable]);

	React.useEffect(() => {
		return () => {
			const resizeState = resizeStateRef.current;
			if (resizeState?.rafId != null) {
				window.cancelAnimationFrame(resizeState.rafId);
			}
			resizeState?.transitionTargets.forEach((element) => {
				element.style.removeProperty("transition-duration");
			});
			document.body.style.removeProperty("cursor");
			document.body.style.removeProperty("user-select");
		};
	}, []);

	return (
		<button
			data-sidebar="rail"
			data-slot="sidebar-rail"
			aria-label={railLabel}
			tabIndex={-1}
			onClick={handleClick}
			onPointerCancel={handlePointerCancel}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			ref={railRef}
			title={railTitle}
			type="button"
			className={cn(
				"-translate-x-1/2 group-data-[side=left]:-right-4 absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=right]:left-0 md:flex [[data-collapsible=offcanvas][data-state=collapsed]_&]:pointer-events-none",
				"in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
				"[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
				"group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
				"[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
				"[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
	return (
		<main
			data-slot="sidebar-inset"
			className={cn(
				"relative flex min-w-0 w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ms-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm/5 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ms-2",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarInput({
	className,
	inputClassName,
	...props
}: React.ComponentProps<typeof Input>) {
	return (
		<Input
			data-slot="sidebar-input"
			data-sidebar="input"
			className={cn("h-8 w-full bg-background shadow-none", className)}
			inputClassName={cn("h-8 leading-8 sm:h-8 sm:leading-8", inputClassName)}
			{...props}
		/>
	);
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-header"
			data-sidebar="header"
			className={cn("flex flex-col gap-2 p-2", className)}
			{...props}
		/>
	);
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-footer"
			data-sidebar="footer"
			className={cn("flex flex-col gap-2 p-2", className)}
			{...props}
		/>
	);
}

function SidebarSeparator({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot="sidebar-separator"
			data-sidebar="separator"
			className={cn("mx-2 w-auto bg-sidebar-border", className)}
			{...props}
		/>
	);
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<ScrollArea hideScrollbars scrollFade className="h-auto min-h-0 flex-1">
			<div
				data-slot="sidebar-content"
				data-sidebar="content"
				className={cn(
					"flex w-full min-w-0 flex-col gap-2 group-data-[collapsible=icon]:overflow-hidden",
					className,
				)}
				{...props}
			/>
		</ScrollArea>
	);
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-group"
			data-sidebar="group"
			className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
			{...props}
		/>
	);
}

function SidebarGroupLabel({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "div";

	return (
		<Comp
			data-slot="sidebar-group-label"
			data-sidebar="group-label"
			className={cn(
				"flex h-8 shrink-0 items-center rounded-lg px-2 font-medium text-sidebar-foreground text-xs outline-hidden ring-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 [&>svg]:size-4 [&>svg]:shrink-0",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroupAction({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="sidebar-group-action"
			data-sidebar="group-action"
			className={cn(
				"absolute top-3.5 right-3 flex aspect-square w-5 cursor-pointer items-center justify-center rounded-lg p-0 text-sidebar-foreground outline-hidden ring-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 after:absolute after:-inset-2 md:after:hidden group-data-[collapsible=icon]:hidden [&>svg:not([class*='size-'])]:size-4 [&>svg]:shrink-0",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroupContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-group-content"
			data-sidebar="group-content"
			className={cn("w-full text-sm", className)}
			{...props}
		/>
	);
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot="sidebar-menu"
			data-sidebar="menu"
			className={cn("flex w-full min-w-0 flex-col gap-1", className)}
			{...props}
		/>
	);
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
	return (
		<li
			data-slot="sidebar-menu-item"
			data-sidebar="menu-item"
			className={cn("group/menu-item relative", className)}
			{...props}
		/>
	);
}

const sidebarMenuButtonVariants = cva(
	"peer/menu-button group/menu-button flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg p-2 text-left text-sm outline-hidden ring-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pe-8 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg:not([class*='size-'])]:size-4 [&>svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				outline:
					"bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
			},
			size: {
				default: "h-8 text-sm",
				sm: "h-7 text-xs",
				lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function SidebarMenuButton({
	asChild = false,
	isActive = false,
	variant = "default",
	size = "default",
	tooltip,
	className,
	...props
}: React.ComponentProps<"button"> & {
	asChild?: boolean;
	isActive?: boolean;
	tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
	const Comp = asChild ? Slot.Root : "button";
	const { isMobile, state } = useSidebar();

	const button = (
		<Comp
			data-slot="sidebar-menu-button"
			data-sidebar="menu-button"
			data-size={size}
			data-active={isActive}
			className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
			{...props}
		/>
	);

	if (!tooltip) {
		return button;
	}

	if (typeof tooltip === "string") {
		tooltip = {
			children: tooltip,
		};
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent
				side="right"
				align="center"
				hidden={state !== "collapsed" || isMobile}
				{...tooltip}
			/>
		</Tooltip>
	);
}

function SidebarMenuAction({
	className,
	asChild = false,
	showOnHover = false,
	...props
}: React.ComponentProps<"button"> & {
	asChild?: boolean;
	showOnHover?: boolean;
}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="sidebar-menu-action"
			data-sidebar="menu-action"
			className={cn(
				"absolute top-1.5 right-1 flex aspect-square w-5 cursor-pointer items-center justify-center rounded-lg p-0 text-sidebar-foreground outline-hidden ring-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 peer-hover/menu-button:text-sidebar-accent-foreground after:absolute after:-inset-2 md:after:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 group-data-[collapsible=icon]:hidden [&>svg:not([class*='size-'])]:size-4 [&>svg]:shrink-0",
				showOnHover &&
					"group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground data-[state=open]:opacity-100 aria-expanded:opacity-100 md:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuBadge({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sidebar-menu-badge"
			data-sidebar="menu-badge"
			className={cn(
				"pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-lg px-1 font-medium text-sidebar-foreground text-xs tabular-nums peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuSkeleton({
	className,
	showIcon = false,
	...props
}: React.ComponentProps<"div"> & {
	showIcon?: boolean;
}) {
	// Random width between 50 to 90%. Memoizing avoids changing width on every render.
	const width = React.useMemo(() => {
		return `${Math.floor(Math.random() * 40) + 50}%`;
	}, []);

	return (
		<div
			data-slot="sidebar-menu-skeleton"
			data-sidebar="menu-skeleton"
			className={cn("flex h-8 items-center gap-2 rounded-lg px-2", className)}
			{...props}
		>
			{showIcon && (
				<Skeleton
					data-sidebar="menu-skeleton-icon"
					className="size-4 rounded-lg"
				/>
			)}
			<Skeleton
				className="h-4 max-w-(--skeleton-width) flex-1"
				data-sidebar="menu-skeleton-text"
				style={
					{
						"--skeleton-width": width,
					} as React.CSSProperties
				}
			/>
		</div>
	);
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot="sidebar-menu-sub"
			data-sidebar="menu-sub"
			className={cn(
				"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-sidebar-border border-l px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuSubItem({
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<li
			data-slot="sidebar-menu-sub-item"
			data-sidebar="menu-sub-item"
			className={cn("group/menu-sub-item relative", className)}
			{...props}
		/>
	);
}

function SidebarMenuSubButton({
	asChild = false,
	size = "md",
	isActive = false,
	className,
	...props
}: React.ComponentProps<"a"> & {
	asChild?: boolean;
	size?: "sm" | "md";
	isActive?: boolean;
}) {
	const Comp = asChild ? Slot.Root : "a";

	return (
		<Comp
			data-slot="sidebar-menu-sub-button"
			data-sidebar="menu-sub-button"
			data-size={size}
			data-active={isActive}
			className={cn(
				"-translate-x-px flex h-7 min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 text-sidebar-foreground outline-hidden ring-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden [&>span:last-child]:truncate [&>svg:not([class*='size-'])]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
};
