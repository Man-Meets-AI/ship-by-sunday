/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	Collapsible,
	CollapsibleContent,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Toggle, toggleVariants } from "@/components/ui/toggle";
import {
	ToggleGroup,
	ToggleGroupItem,
	ToggleGroupSeparator,
} from "@/components/ui/toggle-group";

const scrollAreaSource = readFileSync(
	join(process.cwd(), "src/components/ui/scroll-area.tsx"),
	"utf8",
);

const collapsibleSource = readFileSync(
	join(process.cwd(), "src/components/ui/collapsible.tsx"),
	"utf8",
);

const toggleSource = readFileSync(
	join(process.cwd(), "src/components/ui/toggle.tsx"),
	"utf8",
);

const toggleGroupSource = readFileSync(
	join(process.cwd(), "src/components/ui/toggle-group.tsx"),
	"utf8",
);

const emptySource = readFileSync(
	join(process.cwd(), "src/components/ui/empty.tsx"),
	"utf8",
);

describe("T3 Code utility primitive recipes", () => {
	afterEach(() => {
		cleanup();
	});

	it("keeps compatibility exports while adding T3 aliases", () => {
		expect(Collapsible).toBeTypeOf("function");
		expect(CollapsibleTrigger).toBeTypeOf("function");
		expect(CollapsiblePanel).toBeTypeOf("function");
		expect(CollapsibleContent).toBe(CollapsiblePanel);
		expect(Toggle).toBeTypeOf("function");
		expect(toggleVariants).toBeTypeOf("function");
		expect(ToggleGroup).toBeTypeOf("function");
		expect(ToggleGroupItem).toBeTypeOf("function");
		expect(ToggleGroupSeparator).toBeTypeOf("function");
		expect(Spinner).toBeTypeOf("function");
	});

	it("renders ScrollArea with T3 viewport controls and optional hidden scrollbars", () => {
		const { rerender } = render(
			<ScrollArea chainVerticalScroll hideScrollbars scrollbarGutter scrollFade>
				<div>Scrollable content</div>
			</ScrollArea>,
		);

		const viewport = document.querySelector(
			'[data-slot="scroll-area-viewport"]',
		);
		expect(viewport?.className).toContain("overscroll-y-auto");
		expect(viewport?.className).toContain("mask-t-from");
		expect(viewport?.className).toContain("[scrollbar-gutter:stable]");
		expect(viewport?.className).toContain("[scrollbar-width:none]");
		expect(
			document.querySelector('[data-slot="scroll-area-scrollbar"]'),
		).toBeNull();

		rerender(
			<ScrollArea>
				<div>Scrollable content</div>
			</ScrollArea>,
		);

		expect(scrollAreaSource).toContain('<ScrollBar orientation="vertical" />');
		expect(scrollAreaSource).toContain(
			'<ScrollBar orientation="horizontal" />',
		);
	});

	it("maps Collapsible panel animation to Radix data-state output", async () => {
		const user = userEvent.setup();
		render(
			<Collapsible defaultOpen>
				<CollapsibleTrigger>Advanced options</CollapsibleTrigger>
				<CollapsibleContent>Details</CollapsibleContent>
			</Collapsible>,
		);

		const trigger = screen.getByRole("button", { name: "Advanced options" });
		const panel = screen.getByText("Details").closest("[data-slot]");

		expect(trigger.className).toContain("cursor-pointer");
		expect(panel?.getAttribute("data-slot")).toBe("collapsible-panel");
		expect(panel?.getAttribute("data-state")).toBe("open");
		expect(panel?.className).toContain(
			"data-[state=open]:h-(--radix-collapsible-content-height)",
		);
		expect(collapsibleSource).not.toContain("data-open");

		await user.click(trigger);
		expect(panel?.getAttribute("data-state")).toBe("closed");
	});

	it("uses Radix data-state for Toggle and ToggleGroup pressed state", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn();
		render(
			<>
				<Toggle defaultPressed variant="outline" size="xs">
					Bold
				</Toggle>
				<ToggleGroup
					aria-label="Package manager"
					onValueChange={onValueChange}
					size="sm"
					type="single"
					value="bun"
					variant="outline"
				>
					<ToggleGroupItem value="bun">Bun</ToggleGroupItem>
					<ToggleGroupSeparator />
					<ToggleGroupItem value="npm">npm</ToggleGroupItem>
				</ToggleGroup>
			</>,
		);

		const toggle = screen.getByRole("button", { name: "Bold" });
		const bun = screen.getByRole("radio", { name: "Bun" });
		const npm = screen.getByRole("radio", { name: "npm" });
		const separator = document.querySelector('[data-slot="separator"]');

		expect(toggle.getAttribute("data-state")).toBe("on");
		expect(toggle.className).toContain("data-[state=on]:bg-input/64");
		expect(toggle.className).toContain("not-dark:bg-clip-padding");
		expect(bun.getAttribute("data-state")).toBe("on");
		expect(bun.className).toContain("data-[state=on]:bg-input/64");
		expect(separator?.className).toContain("dark:before:bg-input/32");

		await user.click(npm);
		expect(onValueChange).toHaveBeenCalledWith("npm");
	});

	it("renders Empty and Spinner with T3 utility surface tokens", () => {
		const handleMediaClick = vi.fn();

		render(
			<>
				<Empty>
					<EmptyHeader>
						<EmptyMedia
							data-testid="empty-media-click-target"
							onClick={handleMediaClick}
							variant="icon"
						>
							!
						</EmptyMedia>
						<EmptyTitle>No runs yet</EmptyTitle>
						<EmptyDescription>Start a worker run.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>Pick a setup path.</EmptyContent>
				</Empty>
				<Spinner data-testid="loading" />
			</>,
		);

		const empty = screen
			.getByText("No runs yet")
			.closest('[data-slot="empty"]');
		const media = document.querySelector('[data-slot="empty-media"]');
		const iconLayers = media?.querySelectorAll("div");

		expect(empty?.className).toContain("gap-6");
		expect(media?.className).toContain("mb-6");
		expect(iconLayers?.length).toBe(3);
		expect(iconLayers?.[2]?.className).toContain("bg-card");
		expect(screen.getAllByTestId("empty-media-click-target")).toHaveLength(1);
		screen.getByTestId("empty-media-click-target").click();
		expect(handleMediaClick).toHaveBeenCalledTimes(1);
		expect(screen.getByText("No runs yet").className).toContain("font-heading");
		expect(screen.getByText("Start a worker run.").className).toContain(
			"text-muted-foreground",
		);
		expect(
			screen.getByRole("status", { name: "Loading" }).getAttribute("class"),
		).toContain("animate-spin");
	});

	it("copies T3 utility tokens without adding Base UI", () => {
		expect(scrollAreaSource).toContain("scrollFade = false");
		expect(scrollAreaSource).toContain("hideScrollbars");
		expect(scrollAreaSource).toContain("data-[orientation=vertical]:w-1.5");
		expect(scrollAreaSource).toContain("bg-foreground/20");

		expect(collapsibleSource).toContain(
			"CollapsiblePanel as CollapsibleContent",
		);
		expect(collapsibleSource).toContain("data-[state=closed]:h-0");
		expect(collapsibleSource).toContain("--radix-collapsible-content-height");

		expect(toggleSource).toContain("data-[state=on]:bg-input/64");
		expect(toggleSource).toContain("not-dark:bg-clip-padding");
		expect(toggleSource).not.toContain("data-pressed");

		expect(toggleGroupSource).toContain("ToggleGroupSeparator");
		expect(toggleGroupSource).toContain("data-state=on");

		expect(emptySource).toContain('data-slot="empty-media"');
		expect(emptySource).toContain("before:shadow-[0_1px_--theme");
		expect(emptySource).toContain("font-heading font-semibold text-xl");

		expect(
			[
				scrollAreaSource,
				collapsibleSource,
				toggleSource,
				toggleGroupSource,
				emptySource,
			].join("\n"),
		).not.toContain("@base-ui/react");
	});
});
