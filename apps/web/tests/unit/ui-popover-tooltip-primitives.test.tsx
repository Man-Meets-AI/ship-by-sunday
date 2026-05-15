/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import "../setup/jsdom";

import {
	Popover,
	PopoverAnchor,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	PopoverPopup,
	PopoverPortal,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipPopup,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

describe("T3 Code Popover and Tooltip primitive recipes", () => {
	it("keeps Radix-compatible Tooltip exports and adds TooltipPopup", () => {
		expect(Tooltip).toBeTypeOf("function");
		expect(TooltipContent).toBeTypeOf("function");
		expect(TooltipPopup).toBeTypeOf("function");
		expect(TooltipContent).toBe(TooltipPopup);
		expect(TooltipProvider).toBeTypeOf("function");
		expect(TooltipTrigger).toBeTypeOf("function");
	});

	it("exposes the shared Popover wrapper and T3 popup alias", () => {
		expect(Popover).toBeTypeOf("function");
		expect(PopoverAnchor).toBeTypeOf("function");
		expect(PopoverClose).toBeTypeOf("function");
		expect(PopoverContent).toBeTypeOf("function");
		expect(PopoverPopup).toBeTypeOf("function");
		expect(PopoverContent).toBe(PopoverPopup);
		expect(PopoverPortal).toBeTypeOf("function");
		expect(PopoverTitle).toBeTypeOf("function");
		expect(PopoverDescription).toBeTypeOf("function");
		expect(PopoverTrigger).toBeTypeOf("function");
	});

	it("renders Popover title and description helpers with T3 typography", () => {
		const markup = renderToStaticMarkup(
			<>
				<PopoverTitle className="tracking-normal">Model</PopoverTitle>
				<PopoverDescription>Choose an option.</PopoverDescription>
			</>,
		);

		expect(markup).toContain('data-slot="popover-title"');
		expect(markup).toContain("font-semibold");
		expect(markup).toContain("text-lg");
		expect(markup).toContain("tracking-normal");
		expect(markup).toContain('data-slot="popover-description"');
		expect(markup).toContain("text-muted-foreground");
	});

	it("opens Popover through an asChild trigger and lets className control viewport spacing", async () => {
		render(
			<Popover>
				<PopoverTrigger asChild>
					<button type="button">Open popover</button>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					alignOffset={3}
					className="w-80 p-0 custom-popover"
					side="left"
					sideOffset={8}
				>
					<span>Popover body</span>
				</PopoverContent>
			</Popover>,
		);

		const trigger = screen.getByRole("button", { name: "Open popover" });
		expect(trigger.getAttribute("data-slot")).toBe("popover-trigger");

		fireEvent.click(trigger);

		await waitFor(() => {
			expect(
				document.querySelector('[data-slot="popover-popup"]'),
			).toBeTruthy();
		});

		const popup = document.querySelector('[data-slot="popover-popup"]');
		const viewport = document.querySelector('[data-slot="popover-viewport"]');
		const popupClassName = popup?.getAttribute("class") ?? "";
		const viewportClassName = viewport?.getAttribute("class") ?? "";

		expect(popup?.getAttribute("data-state")).toBe("open");
		expect(popup?.getAttribute("data-side")).toBe("left");
		expect(popup?.getAttribute("data-align")).toBe("end");
		expect(popupClassName).toContain("bg-popover");
		expect(popupClassName).toContain("text-popover-foreground");
		expect(popupClassName).toContain("not-dark:bg-clip-padding");
		expect(popupClassName).toContain(
			"before:shadow-[0_1px_--theme(--color-black/4%)]",
		);
		expect(popupClassName).toContain("data-[state=open]:animate-in");
		expect(popupClassName).toContain("w-80");
		expect(viewportClassName).toContain("p-0");
		expect(viewportClassName).toContain("custom-popover");
		expect(viewport?.textContent).toBe("Popover body");
	});

	it("keeps force-mounted closed Popover content in the DOM", async () => {
		render(
			<Popover open={false}>
				<PopoverTrigger>Closed popover</PopoverTrigger>
				<PopoverContent forceMount>Persistent body</PopoverContent>
			</Popover>,
		);

		await waitFor(() => {
			expect(
				document.querySelector('[data-slot="popover-popup"]'),
			).toBeTruthy();
		});

		const popup = document.querySelector('[data-slot="popover-popup"]');
		const viewport = document.querySelector('[data-slot="popover-viewport"]');

		expect(popup?.getAttribute("data-state")).toBe("closed");
		expect(viewport?.textContent).toBe("Persistent body");
	});

	it("keeps Tooltip asChild, hidden, and T3 popup surface behavior", async () => {
		render(
			<TooltipProvider>
				<Tooltip open>
					<TooltipTrigger asChild>
						<button type="button">Collapsed item</button>
					</TooltipTrigger>
					<TooltipContent
						align="center"
						className="custom-tooltip"
						hidden
						side="right"
					>
						Tooltip copy
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		);

		const trigger = screen.getByRole("button", { name: "Collapsed item" });
		expect(trigger.getAttribute("data-slot")).toBe("tooltip-trigger");

		await waitFor(() => {
			expect(
				document.querySelector('[data-slot="tooltip-popup"]'),
			).toBeTruthy();
		});

		const popup = document.querySelector('[data-slot="tooltip-popup"]');
		const popupClassName = popup?.getAttribute("class") ?? "";

		expect(popup?.getAttribute("data-side")).toBe("right");
		expect(popup?.getAttribute("data-state")).toBe("instant-open");
		expect(popup?.hasAttribute("hidden")).toBe(true);
		expect(popupClassName).toContain("relative");
		expect(popupClassName).toContain("bg-popover");
		expect(popupClassName).toContain("text-popover-foreground");
		expect(popupClassName).toContain("not-dark:bg-clip-padding");
		expect(popupClassName).toContain(
			"before:shadow-[0_1px_--theme(--color-black/4%)]",
		);
		expect(popupClassName).toContain("data-[state=delayed-open]:animate-in");
		expect(popupClassName).toContain("data-[state=instant-open]:animate-in");
		expect(popupClassName).not.toContain("data-open:");
		expect(popupClassName).toContain("custom-tooltip");
		expect(popup?.textContent).toContain("Tooltip copy");
	});
});
