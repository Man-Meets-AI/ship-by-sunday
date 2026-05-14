/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	Command,
	CommandDialog,
	CommandDialogBackdrop,
	CommandDialogDescription,
	CommandDialogPopup,
	CommandDialogTitle,
	CommandDialogViewport,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPanel,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	Menu,
	MenuItem,
	MenuPopup,
	MenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const dropdownMenuSource = readFileSync(
	join(process.cwd(), "src/components/ui/dropdown-menu.tsx"),
	"utf8",
);

const navigationMenuSource = readFileSync(
	join(process.cwd(), "src/components/ui/navigation-menu.tsx"),
	"utf8",
);

const commandSource = readFileSync(
	join(process.cwd(), "src/components/ui/command.tsx"),
	"utf8",
);

describe("T3 Code Menu and Command primitive recipes", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"ResizeObserver",
			class ResizeObserverStub {
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		);
		Element.prototype.scrollIntoView = vi.fn();
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
	});

	it("keeps DropdownMenu exports and adds honest Menu aliases", () => {
		expect(DropdownMenu).toBeTypeOf("function");
		expect(Menu).toBe(DropdownMenu);
		expect(DropdownMenuContent).toBeTypeOf("function");
		expect(MenuPopup).toBe(DropdownMenuContent);
		expect(DropdownMenuItem).toBeTypeOf("function");
		expect(MenuItem).toBe(DropdownMenuItem);
		expect(DropdownMenuShortcut).toBeTypeOf("function");
		expect(MenuShortcut).toBe(DropdownMenuShortcut);
	});

	it("renders DropdownMenu content with the T3 popup viewport", async () => {
		render(
			<DropdownMenu open>
				<DropdownMenuContent>
					<DropdownMenuItem>Account</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		);

		const menu = await screen.findByRole("menu");
		const item = screen.getByRole("menuitem", { name: "Account" });
		const viewport = document.querySelector('[data-slot="menu-viewport"]');

		expect(menu.getAttribute("data-slot")).toBe("dropdown-menu-content");
		expect(menu.className).toContain("not-dark:bg-clip-padding");
		expect(menu.className).toContain("before:shadow");
		expect(viewport?.className).toContain("overflow-y-auto");
		expect(item.className).toContain("min-h-8");
	});

	it("renders Command through cmdk with T3 panel and item slots", () => {
		render(
			<Command label="Command menu" loop>
				<CommandInput placeholder="Search actions..." />
				<CommandPanel>
					<CommandList>
						<CommandEmpty>No matches.</CommandEmpty>
						<CommandGroup heading="App">
							<CommandItem value="Open starter">Open starter</CommandItem>
						</CommandGroup>
						<CommandSeparator />
					</CommandList>
				</CommandPanel>
				<CommandFooter>
					<CommandShortcut>⌘K</CommandShortcut>
				</CommandFooter>
			</Command>,
		);

		expect(screen.getByPlaceholderText("Search actions...")).toBeTruthy();
		const option = screen.getByRole("option", { name: "Open starter" });
		const panel = document.querySelector('[data-slot="command-panel"]');
		const shortcut = document.querySelector('[data-slot="command-shortcut"]');

		expect(panel?.className).toContain("rounded-t-xl");
		expect(panel?.className).toContain("bg-popover");
		expect(option.getAttribute("data-slot")).toBe("command-item");
		expect(option.className).toContain("data-[selected=true]:bg-accent");
		expect(shortcut?.textContent).toBe("⌘K");
	});

	it("exposes the command dialog shell aliases", () => {
		expect(CommandDialog).toBeTypeOf("function");
		expect(CommandDialogBackdrop).toBeTypeOf("function");
		expect(CommandDialogViewport).toBeTypeOf("function");
		expect(CommandDialogPopup).toBeTypeOf("function");
		expect(CommandDialogTitle).toBeTypeOf("function");
		expect(CommandDialogDescription).toBeTypeOf("function");
	});

	it("keeps NavigationMenu viewport-less overlay compatibility", () => {
		render(
			<NavigationMenu viewport={false}>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Bonus</NavigationMenuTrigger>
						<NavigationMenuContent forceMount>
							<NavigationMenuLink>Product lessons</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>,
		);

		const root = document.querySelector('[data-slot="navigation-menu"]');
		const trigger = screen.getByRole("button", { name: /Bonus/ });
		const content = document.querySelector(
			'[data-slot="navigation-menu-content"]',
		);
		const link = document.querySelector('[data-slot="navigation-menu-link"]');
		const chevronClassName =
			trigger.querySelector("svg")?.getAttribute("class") ?? "";

		expect(root?.getAttribute("data-viewport")).toBe("false");
		expect(trigger.getAttribute("data-state")).toBe("closed");
		expect(trigger.className).toContain("data-[state=open]:bg-accent");
		expect(trigger.className).not.toContain("data-open:");
		expect(trigger.className).not.toContain("data-popup-open:");
		expect(chevronClassName).toContain(
			"group-data-[state=open]/navigation-menu-trigger:rotate-180",
		);
		expect(content?.className).toContain(
			"group-data-[viewport=false]/navigation-menu:absolute",
		);
		expect(content?.className).toContain(
			"group-data-[viewport=false]/navigation-menu:not-dark:bg-clip-padding",
		);
		expect(content?.className).toContain(
			"group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in",
		);
		expect(content?.className).not.toContain("data-open:");
		expect(content?.className).not.toContain("data-closed:");
		expect(link?.className).toContain("min-h-8");
	});

	it("copies T3 menu and command surface tokens onto the sources", () => {
		for (const source of [dropdownMenuSource, navigationMenuSource]) {
			expect(source).toContain("bg-popover");
			expect(source).toContain("text-popover-foreground");
			expect(source).toContain("not-dark:bg-clip-padding");
			expect(source).toContain(
				"before:shadow-[0_1px_--theme(--color-black/4%)]",
			);
		}

		expect(dropdownMenuSource).toContain("DropdownMenuContent as MenuPopup");
		expect(dropdownMenuSource).toContain('data-slot="menu-viewport"');
		expect(dropdownMenuSource).toContain('variant?: "default" | "switch"');
		expect(navigationMenuSource).toContain("navigationMenuTriggerStyle");
		expect(navigationMenuSource).toContain("data-viewport={viewport}");
		expect(navigationMenuSource).toContain("data-[state=open]:bg-accent");
		expect(navigationMenuSource).not.toContain("data-popup-open");

		expect(commandSource).toContain('data-slot="command-dialog-popup"');
		expect(commandSource).toContain('data-slot="command-panel"');
		expect(commandSource).toContain('data-slot="command-footer"');
		expect(commandSource).toContain("CommandPrimitive");
		expect(commandSource).not.toContain("CommandCreateHandle");
	});
});
