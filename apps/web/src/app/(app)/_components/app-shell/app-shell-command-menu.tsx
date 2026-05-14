"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandDialog,
	CommandDialogDescription,
	CommandDialogPopup,
	CommandDialogTitle,
	CommandEmpty,
	CommandInput,
	CommandList,
	CommandPanel,
} from "@/components/ui/command";
import { capturePostHogProductEvent } from "@/lib/observability/posthog-client";
import { cn } from "@/lib/utils";

import { AppShellCommandMenuItems } from "./app-shell-command-menu-items";
import type { AppShellPrimaryNav } from "./app-shell-props";

const triggerClassName =
	"hidden shrink-0 items-center gap-1.5 rounded-full border-border/70 bg-background/70 px-2 text-xs font-medium text-muted-foreground hover:bg-background/90 hover:text-foreground motion-reduce:transition-none sm:inline-flex sm:h-8";

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

	const openCommandMenu = useCallback(() => {
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
				onClick={openCommandMenu}
				data-testid="app-shell-command-menu-trigger"
				className={cn("size-8 rounded-full p-0 sm:w-auto", triggerClassName)}
				aria-label="Open command menu"
			>
				<Search className="size-3.5" aria-hidden />
				<kbd className="hidden text-[10px] font-medium tracking-wider sm:inline">
					⌘K
				</kbd>
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandDialogPopup aria-label="Command menu">
					<CommandDialogTitle className="sr-only">
						Command menu
					</CommandDialogTitle>
					<CommandDialogDescription className="sr-only">
						Search product pages and run quick actions.
					</CommandDialogDescription>
					<Command label="Command menu" loop>
						<CommandInput placeholder="Search actions..." />
						<CommandPanel>
							<CommandList>
								<CommandEmpty>No matches.</CommandEmpty>
								<AppShellCommandMenuItems
									primaryNav={primaryNav}
									onSelect={handleSelect}
								/>
							</CommandList>
						</CommandPanel>
					</Command>
				</CommandDialogPopup>
			</CommandDialog>
		</>
	);
}
