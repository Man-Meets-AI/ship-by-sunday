"use client";

import { Command, CommandEmpty, CommandInput, CommandList } from "cmdk";
import { Search } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { capturePostHogProductEvent } from "@/lib/observability/posthog-client";
import { cn } from "@/lib/utils";

import { AppShellCommandMenuItems } from "./app-shell-command-menu-items";
import type { AppShellPrimaryNav } from "./app-shell-props";

const triggerClassName =
	"hidden shrink-0 items-center gap-1.5 rounded-full border-border/70 bg-background/70 px-2 text-xs font-medium text-muted-foreground hover:bg-background/90 hover:text-foreground motion-reduce:transition-none sm:inline-flex sm:h-8";

const overlayClassName =
	"fixed inset-0 z-50 bg-black/40 supports-[backdrop-filter]:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:duration-0 motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none";

const contentClassName =
	"fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none sm:max-w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:duration-0 motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none";

const inputWrapperClassName =
	"flex items-center gap-2 border-b border-border/60 px-3 py-2";

const inputClassName =
	"flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none";

const listClassName =
	"max-h-72 overflow-y-auto p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-item]]:flex [&_[cmdk-item]]:min-w-0 [&_[cmdk-item]]:items-start [&_[cmdk-item]]:gap-2 [&_[cmdk-item]]:rounded-md [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-1.5 [&_[cmdk-item]]:text-sm [&_[cmdk-item]]:text-foreground [&_[cmdk-item][data-selected=true]]:bg-accent [&_[cmdk-item][data-selected=true]]:text-accent-foreground [&_[cmdk-item][data-disabled=true]]:opacity-50 [&_[cmdk-item][data-disabled=true]]:cursor-not-allowed [&_[cmdk-item]_svg]:mt-0.5";

type AppShellCommandMenuProps = {
	primaryNav: AppShellPrimaryNav | undefined;
};

function captureOpenedEvent(source: "keyboard" | "click") {
	capturePostHogProductEvent({
		event: "app_shell_command_menu_opened",
		properties: { source },
	});
}

export function AppShellCommandMenu({ primaryNav }: AppShellCommandMenuProps) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		const handler = (event: KeyboardEvent) => {
			const isCommandK =
				(event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
			if (!isCommandK) {
				return;
			}
			event.preventDefault();
			setOpen((previous) => {
				const next = !previous;
				if (next) {
					captureOpenedEvent("keyboard");
				}
				return next;
			});
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const handleClick = useCallback(() => {
		setOpen(true);
		captureOpenedEvent("click");
	}, []);

	const handleSelect = useCallback(() => {
		setOpen(false);
	}, []);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				onClick={handleClick}
				data-testid="app-shell-command-menu-trigger"
				className={cn("size-8 rounded-full p-0 sm:w-auto", triggerClassName)}
				aria-label="Open command menu"
			>
				<Search className="size-3.5" aria-hidden />
				<kbd className="hidden text-[10px] font-medium tracking-wider sm:inline">
					⌘K
				</kbd>
			</Button>
			<DialogPrimitive.Root open={open} onOpenChange={setOpen}>
				<DialogPrimitive.Portal>
					<DialogPrimitive.Overlay className={overlayClassName} />
					<DialogPrimitive.Content
						className={contentClassName}
						aria-label="Command menu"
					>
						<DialogPrimitive.Title className="sr-only">
							Command menu
						</DialogPrimitive.Title>
						<DialogPrimitive.Description className="sr-only">
							Search the workspace and run quick actions.
						</DialogPrimitive.Description>
						<Command label="Command menu" loop>
							<div className={inputWrapperClassName}>
								<Search
									className="size-4 shrink-0 text-muted-foreground"
									aria-hidden
								/>
								<CommandInput
									placeholder="Search workspace…"
									className={inputClassName}
								/>
							</div>
							<CommandList className={listClassName}>
								<CommandEmpty className="px-2 py-6 text-center text-sm text-muted-foreground">
									No matches.
								</CommandEmpty>
								<AppShellCommandMenuItems
									primaryNav={primaryNav}
									onSelect={handleSelect}
								/>
							</CommandList>
						</Command>
					</DialogPrimitive.Content>
				</DialogPrimitive.Portal>
			</DialogPrimitive.Root>
		</>
	);
}
